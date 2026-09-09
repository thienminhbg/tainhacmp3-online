import json, os, re, shutil, subprocess, threading, uuid
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

BASE = Path(__file__).resolve().parent.parent
DOWNLOADS = BASE / 'downloads'
DOWNLOADS.mkdir(exist_ok=True)
WEB_ORIGINS = {
    os.getenv('WEB_ORIGIN', 'https://tainhacmp3.online'),
    'https://tainhacmp3.online',
    'https://www.tainhacmp3.online',
}
MAX_SOURCE_SECONDS = 4 * 60 * 60
MAX_CLIP_SECONDS = 30 * 60
INFO_TIMEOUT = 45
CUT_TIMEOUT = 900
jobs = {}

# Use the YouTube client that was verified to work on the VPS with Deno/EJS.
YOUTUBE_EXTRACTOR_ARGS = 'youtube:player_client=web_embedded'

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


def worker(jid: str, url: str, start: float, end: float, output_format: str, title: str):
    d = DOWNLOADS / jid
    d.mkdir(exist_ok=True)
    jobs[jid]['status'] = 'processing'
    try:
        duration = end - start
        if start < 0 or end <= start:
            raise RuntimeError('End time must be greater than start time')
        if duration > MAX_CLIP_SECONDS:
            raise RuntimeError('A clip can be at most 30 minutes long')

        if output_format == 'mp3':
            template = str(d / 'clip.%(ext)s')
            args = [
                '--download-sections', f'*{fmt_time(start)}-{fmt_time(end)}',
                '-x', '--audio-format', 'mp3', '--audio-quality', '192K',
                '-o', template, url,
            ]
        else:
            template = str(d / 'clip.%(ext)s')
            args = [
                '--download-sections', f'*{fmt_time(start)}-{fmt_time(end)}',
                '-f', 'bv*+ba/b', '--merge-output-format', 'mp4',
                '-o', template, url,
            ]

        r = run_yt_dlp(args, CUT_TIMEOUT)
        if r.returncode:
            raise RuntimeError((r.stderr or r.stdout or 'Cut failed')[-3000:])

        ext = '.mp3' if output_format == 'mp3' else '.mp4'
        candidates = [p for p in d.glob('*') if p.is_file() and p.suffix.lower() == ext]
        if not candidates:
            raise RuntimeError('No output file was produced')
        source = max(candidates, key=lambda p: p.stat().st_mtime)
        final_name = safe_name(f'{title} [{fmt_time(start)}-{fmt_time(end)}]') + ext
        target = d / final_name
        source.rename(target)
        jobs[jid].update(
            status='done',
            filename=target.name,
            title=title,
            format=output_format,
            download_url=f'/api/file/{jid}/{target.name}',
        )
    except Exception as e:
        jobs[jid].update(status='error', error=str(e))


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
    jobs[jid] = {
        'status': 'queued',
        'title': metadata['title'],
        'format': output_format,
        'start': body.start,
        'end': body.end,
    }
    threading.Thread(
        target=worker,
        args=(jid, url, body.start, body.end, output_format, metadata['title']),
        daemon=True,
    ).start()
    return {'job_id': jid, 'status': 'queued'}


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
