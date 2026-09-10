import json, os, re, shutil, subprocess, threading, uuid
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

BASE = Path(__file__).resolve().parent.parent
DOWNLOADS = BASE / 'downloads'
DOWNLOADS.mkdir(exist_ok=True)
UPLOADS = BASE / 'uploads'
UPLOADS.mkdir(exist_ok=True)
WEB_ORIGINS = {
    os.getenv('WEB_ORIGIN', 'https://tainhacmp3.online'),
    'https://tainhacmp3.online',
    'https://www.tainhacmp3.online',
}
MAX_SOURCE_SECONDS = 4 * 60 * 60
MAX_CLIP_SECONDS = 30 * 60
MAX_UPLOAD_BYTES = 500 * 1024 * 1024
INFO_TIMEOUT = 45
CUT_TIMEOUT = 900
UPLOAD_TIMEOUT = 900
jobs = {}

YOUTUBE_EXTRACTOR_ARGS = 'youtube:player_client=web_embedded'
ALLOWED_UPLOAD_EXTS = {'.mp4', '.mkv', '.webm', '.mov', '.m4v', '.avi', '.mpeg', '.mpg'}

app = FastAPI(title='TaiNhacMP3 YouTube Cutter')
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(WEB_ORIGINS),
    allow_methods=['GET', 'POST'],
    allow_headers=['Content-Type'],
)

class URLReq(BaseModel):
    url: str

class CutReq(BaseModel):
    url: str
    start: float = 0
    end: float
    format: str = 'mp4'


def is_youtube(url: str) -> bool:
    try:
        p = urlparse(url.strip())
        host = (p.hostname or '').lower().rstrip('.')
        return p.scheme in ('http', 'https') and host in {
            'youtube.com', 'www.youtube.com', 'm.youtube.com',
            'music.youtube.com', 'youtu.be', 'www.youtu.be'
        }
    except Exception:
        return False


def normalize_youtube_url(url: str) -> str:
    if not is_youtube(url):
        raise HTTPException(400, 'Only public YouTube URLs are supported.')
    p = urlparse(url.strip())
    if p.hostname and p.hostname.lower().endswith('youtu.be'):
        video_id = p.path.strip('/').split('/')[0]
    else:
        video_id = parse_qs(p.query).get('v', [''])[0]
        if not video_id and p.path.startswith('/shorts/'):
            video_id = p.path.split('/shorts/', 1)[1].split('/', 1)[0]
        if not video_id and p.path.startswith('/live/'):
            video_id = p.path.split('/live/', 1)[1].split('/', 1)[0]
    if not re.fullmatch(r'[A-Za-z0-9_-]{6,20}', video_id or ''):
        raise HTTPException(400, 'Invalid YouTube video URL.')
    return f'https://www.youtube.com/watch?v={video_id}'


def run_yt_dlp(args, timeout):
    exe = shutil.which('yt-dlp') or str(BASE / '.venv' / 'bin' / 'yt-dlp')
    if not Path(exe).exists() and not shutil.which('yt-dlp'):
        raise RuntimeError('yt-dlp is not installed. Run: python -m pip install -U yt-dlp')
    return subprocess.run(
        [exe, '--no-playlist', '--no-warnings', '--extractor-args', YOUTUBE_EXTRACTOR_ARGS, *args],
        cwd=BASE,
        text=True,
        capture_output=True,
        timeout=timeout,
    )


def get_info(url: str):
    r = run_yt_dlp(['--dump-single-json', '--skip-download', url], INFO_TIMEOUT)
    if r.returncode:
        raise RuntimeError((r.stderr or r.stdout or 'Unable to read YouTube video')[-2000:])
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError:
        raise RuntimeError('YouTube returned invalid video information')
    duration = float(data.get('duration') or 0)
    if duration <= 0:
        raise RuntimeError('Could not determine video duration')
    if duration > MAX_SOURCE_SECONDS:
        raise RuntimeError('This video is longer than the server limit of 4 hours')
    return {
        'id': data.get('id'),
        'title': data.get('title') or 'YouTube video',
        'duration': duration,
        'thumbnail': data.get('thumbnail') or '',
        'channel': data.get('channel') or data.get('uploader') or '',
        'webpage_url': data.get('webpage_url') or url,
    }


def safe_name(value: str) -> str:
    value = re.sub(r'[\\/:*?"<>|\x00-\x1f]+', '_', value or 'clip')
    value = re.sub(r'\s+', ' ', value).strip('. ')
    return (value[:150] or 'clip')


def fmt_time(seconds: float) -> str:
    seconds = max(0, int(seconds))
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return f'{h:02d}:{m:02d}:{s:02d}' if h else f'{m:02d}:{s:02d}'


def ffprobe_duration(path: Path) -> float:
    r = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=noprint_wrappers=1:nokey=1', str(path)],
        text=True, capture_output=True, timeout=60,
    )
    if r.returncode:
        raise RuntimeError((r.stderr or 'Unable to read video duration')[-1000:])
    try:
        duration = float(r.stdout.strip())
    except ValueError:
        raise RuntimeError('Could not determine video duration')
    if duration <= 0:
        raise RuntimeError('Could not determine video duration')
    if duration > MAX_SOURCE_SECONDS:
        raise RuntimeError('This video is longer than the server limit of 4 hours')
    return duration


def validate_clip(start: float, end: float, duration: float):
    if start < 0 or end <= start:
        raise RuntimeError('End time must be greater than start time')
    if end - start > MAX_CLIP_SECONDS:
        raise RuntimeError('A clip can be at most 30 minutes long')
    if end > duration:
        raise RuntimeError('End time is longer than the video duration')


def worker(jid: str, url: str, start: float, end: float, output_format: str, title: str):
    d = DOWNLOADS / jid
    d.mkdir(exist_ok=True)
    jobs[jid]['status'] = 'processing'
    source = None
    try:
        # Download the source media to the VPS first. Do not pass YouTube's
        # short-lived googlevideo URL directly to FFmpeg; those URLs can return 403.
        source_template = str(d / 'source.%(ext)s')
        if output_format == 'mp3':
            download_args = [
                '-f', 'bestaudio/best',
                '-o', source_template,
                url,
            ]
        else:
            download_args = [
                '-f', 'bv*+ba/b',
                '--merge-output-format', 'mp4',
                '-o', source_template,
                url,
            ]

        r = run_yt_dlp(download_args, CUT_TIMEOUT)
        if r.returncode:
            raise RuntimeError((r.stderr or r.stdout or 'Download failed')[-3000:])

        candidates = [
            p for p in d.glob('source.*')
            if p.is_file() and p.stat().st_size > 0
        ]
        if not candidates:
            raise RuntimeError('No source file was downloaded')
        source = max(candidates, key=lambda p: p.stat().st_mtime)

        duration = ffprobe_duration(source)
        validate_clip(start, end, duration)
        clip_duration = end - start
        out = d / ('clip.mp3' if output_format == 'mp3' else 'clip.mp4')

        if output_format == 'mp3':
            cmd = [
                'ffmpeg', '-y',
                '-ss', str(start),
                '-i', str(source),
                '-t', str(clip_duration),
                '-vn',
                '-c:a', 'libmp3lame',
                '-b:a', '192k',
                str(out),
            ]
        else:
            cmd = [
                'ffmpeg', '-y',
                '-ss', str(start),
                '-i', str(source),
                '-t', str(clip_duration),
                '-c:v', 'libx264',
                '-preset', 'veryfast',
                '-c:a', 'aac',
                '-movflags', '+faststart',
                str(out),
            ]

        r = subprocess.run(
            cmd, cwd=BASE, text=True, capture_output=True, timeout=CUT_TIMEOUT
        )
        if r.returncode:
            raise RuntimeError((r.stderr or r.stdout or 'Cut failed')[-3000:])
        if not out.exists() or out.stat().st_size == 0:
            raise RuntimeError('No output file was produced')

        ext = '.mp3' if output_format == 'mp3' else '.mp4'
        final_name = safe_name(f'{title} [{fmt_time(start)}-{fmt_time(end)}]') + ext
        target = d / final_name
        out.rename(target)
        jobs[jid].update(
            status='done', filename=target.name, title=title,
            format=output_format, download_url=f'/api/file/{jid}/{target.name}'
        )
    except subprocess.TimeoutExpired:
        jobs[jid].update(status='error', error='Processing timed out')
    except Exception as e:
        jobs[jid].update(status='error', error=str(e))
    finally:
        if source:
            try:
                source.unlink(missing_ok=True)
            except Exception:
                pass


def upload_worker(jid: str, source: Path, start: float, end: float, output_format: str, title: str):
    d = DOWNLOADS / jid
    d.mkdir(exist_ok=True)
    jobs[jid]['status'] = 'processing'
    try:
        duration = ffprobe_duration(source)
        validate_clip(start, end, duration)
        out = d / ('clip.mp3' if output_format == 'mp3' else 'clip.mp4')
        clip_duration = end - start
        if output_format == 'mp3':
            cmd = ['ffmpeg', '-y', '-ss', str(start), '-i', str(source), '-t', str(clip_duration),
                   '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', str(out)]
        else:
            cmd = ['ffmpeg', '-y', '-ss', str(start), '-i', str(source), '-t', str(clip_duration),
                   '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-movflags', '+faststart', str(out)]
        r = subprocess.run(cmd, cwd=BASE, text=True, capture_output=True, timeout=UPLOAD_TIMEOUT)
        if r.returncode:
            raise RuntimeError((r.stderr or r.stdout or 'FFmpeg failed')[-3000:])
        if not out.exists() or out.stat().st_size == 0:
            raise RuntimeError('No output file was produced')
        final_name = safe_name(f'{title} [{fmt_time(start)}-{fmt_time(end)}]') + out.suffix
        target = d / final_name
        out.rename(target)
        jobs[jid].update(status='done', filename=target.name, title=title,
                          format=output_format, download_url=f'/api/file/{jid}/{target.name}')
    except Exception as e:
        jobs[jid].update(status='error', error=str(e))
    finally:
        try:
            source.unlink(missing_ok=True)
        except Exception:
            pass


@app.get('/health')
def health():
    return {'ok': True, 'service': 'youtube-cutter'}


@app.post('/api/info')
def info(req: Request, body: URLReq):
    if req.headers.get('origin') not in (None, *WEB_ORIGINS):
        raise HTTPException(403, 'Origin not allowed')
    url = normalize_youtube_url(body.url)
    try:
        return get_info(url)
    except subprocess.TimeoutExpired:
        raise HTTPException(504, 'YouTube information request timed out')
    except Exception as e:
        raise HTTPException(400, str(e))


@app.post('/api/cut')
def create_cut(req: Request, body: CutReq):
    if req.headers.get('origin') not in (None, *WEB_ORIGINS):
        raise HTTPException(403, 'Origin not allowed')
    url = normalize_youtube_url(body.url)
    output_format = body.format.lower().strip()
    if output_format not in {'mp4', 'mp3'}:
        raise HTTPException(400, 'Format must be mp4 or mp3')
    if body.start < 0 or body.end <= body.start:
        raise HTTPException(400, 'End time must be greater than start time')
    if body.end - body.start > MAX_CLIP_SECONDS:
        raise HTTPException(400, 'A clip can be at most 30 minutes long')
    try:
        metadata = get_info(url)
    except subprocess.TimeoutExpired:
        raise HTTPException(504, 'YouTube information request timed out')
    except Exception as e:
        raise HTTPException(400, str(e))
    if body.end > metadata['duration']:
        raise HTTPException(400, 'End time is longer than the video duration')
    jid = uuid.uuid4().hex
    jobs[jid] = {'status': 'queued', 'title': metadata['title'], 'format': output_format,
                 'start': body.start, 'end': body.end}
    threading.Thread(target=worker, args=(jid, url, body.start, body.end, output_format, metadata['title']), daemon=True).start()
    return {'job_id': jid, 'status': 'queued'}


@app.post('/api/upload-info')
async def upload_info(req: Request, file: UploadFile = File(...)):
    if req.headers.get('origin') not in (None, *WEB_ORIGINS):
        raise HTTPException(403, 'Origin not allowed')
    ext = Path(file.filename or '').suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTS:
        raise HTTPException(400, 'Unsupported video format. Use MP4, MKV, WebM, MOV, M4V, AVI, MPEG or MPG.')
    tmp = UPLOADS / f'{uuid.uuid4().hex}{ext}'
    size = 0
    try:
        with tmp.open('wb') as f:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, 'Uploaded file is larger than the 500 MB limit.')
                f.write(chunk)
        duration = ffprobe_duration(tmp)
        return {'filename': file.filename, 'duration': duration}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))
    finally:
        try:
            tmp.unlink(missing_ok=True)
        except Exception:
            pass


@app.post('/api/upload-cut')
async def upload_cut(req: Request, file: UploadFile = File(...), start: float = Form(0), end: float = Form(...), format: str = Form('mp4')):
    if req.headers.get('origin') not in (None, *WEB_ORIGINS):
        raise HTTPException(403, 'Origin not allowed')
    output_format = format.lower().strip()
    if output_format not in {'mp4', 'mp3'}:
        raise HTTPException(400, 'Format must be mp4 or mp3')
    ext = Path(file.filename or '').suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTS:
        raise HTTPException(400, 'Unsupported video format.')
    jid = uuid.uuid4().hex
    source = UPLOADS / f'{jid}{ext}'
    size = 0
    try:
        with source.open('wb') as f:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, 'Uploaded file is larger than the 500 MB limit.')
                f.write(chunk)
        duration = ffprobe_duration(source)
        try:
            validate_clip(float(start), float(end), duration)
        except ValueError:
            raise HTTPException(400, 'Invalid start or end time')
        except RuntimeError as e:
            raise HTTPException(400, str(e))
        title = Path(file.filename or 'uploaded-video').stem
        jobs[jid] = {'status': 'queued', 'title': title, 'format': output_format,
                     'start': float(start), 'end': float(end)}
        threading.Thread(target=upload_worker, args=(jid, source, float(start), float(end), output_format, title), daemon=True).start()
        return {'job_id': jid, 'status': 'queued'}
    except HTTPException:
        try:
            source.unlink(missing_ok=True)
        except Exception:
            pass
        raise
    except subprocess.TimeoutExpired:
        source.unlink(missing_ok=True)
        raise HTTPException(504, 'Video inspection timed out')
    except Exception as e:
        source.unlink(missing_ok=True)
        raise HTTPException(400, str(e))


@app.get('/api/status/{jid}')
def status(req: Request, jid: str):
    if req.headers.get('origin') not in (None, *WEB_ORIGINS):
        raise HTTPException(403, 'Origin not allowed')
    if jid not in jobs:
        raise HTTPException(404, 'Job not found')
    return jobs[jid]


@app.get('/api/file/{jid}/{filename}')
def file(req: Request, jid: str, filename: str):
    if req.headers.get('origin') not in (None, *WEB_ORIGINS):
        raise HTTPException(403, 'Origin not allowed')
    if jid not in jobs or jobs[jid].get('status') != 'done':
        raise HTTPException(404, 'File not ready')
    if Path(filename).name != filename:
        raise HTTPException(400, 'Invalid filename')
    p = DOWNLOADS / jid / filename
    if not p.exists():
        raise HTTPException(404, 'File not found')
    media = 'audio/mpeg' if p.suffix.lower() == '.mp3' else 'video/mp4'
    return FileResponse(p, filename=filename, media_type=media)
