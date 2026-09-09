import os,uuid,subprocess,threading,shutil
from pathlib import Path
from urllib.parse import urlparse
from fastapi import FastAPI,HTTPException,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
BASE=Path(__file__).resolve().parent.parent; DOWNLOADS=BASE/'downloads'; DOWNLOADS.mkdir(exist_ok=True); WEB_ORIGIN=os.getenv('WEB_ORIGIN','https://tainhacmp3.online'); jobs={}
app=FastAPI(title='TaiNhacMP3 Worker'); app.add_middleware(CORSMiddleware,allow_origins=[WEB_ORIGIN],allow_methods=['GET','POST'],allow_headers=['Content-Type'])
class Req(BaseModel): url:str
def platform(u):
 h=(urlparse(u).hostname or '').lower()
 if 'zingmp3.vn' in h or 'mp3.zing.vn' in h:return 'Zing MP3'
 if 'nhaccuatui.com' in h:return 'NhacCuaTui'
 if 'soundcloud.com' in h:return 'SoundCloud'
 return None
def valid(u):
 try:return urlparse(u).scheme in ('http','https') and platform(u) is not None
 except:return False
def worker(jid,url):
 p=platform(url); d=DOWNLOADS/jid; d.mkdir(exist_ok=True); jobs[jid]['status']='processing'
 try:
  if p=='Zing MP3':
   exe=shutil.which('mp3') or str(BASE/'bin/mp3'); cmd=[exe,url,'320']
  elif p=='NhacCuaTui':
   exe=shutil.which('pum') or str(BASE/'bin/pum'); cmd=[exe,url]
  else:
   exe=shutil.which('scdl'); cmd=[exe,'-l',url,'--path',str(d),'--onlymp3','--no-playlist']
  if not shutil.which(exe) and not Path(exe).exists(): raise RuntimeError(f'Downloader for {p} is not installed')
  r=subprocess.run(cmd,cwd=d,text=True,capture_output=True,timeout=300)
  if r.returncode: raise RuntimeError((r.stderr or r.stdout or 'Downloader failed')[-2000:])
  fs=[x for x in d.rglob('*') if x.is_file() and x.suffix.lower() in ('.mp3','.m4a','.opus','.flac')]
  if not fs: raise RuntimeError('No output file found')
  f=fs[0]; jobs[jid].update(status='done',filename=f.name,title=f.stem,platform=p,download_url=f'/api/file/{jid}/{f.name}')
 except Exception as e: jobs[jid].update(status='error',error=str(e))
@app.get('/health')
def health(): return {'ok':True}
@app.post('/api/download')
def create(req:Request,body:Req):
 if req.headers.get('origin') not in (None,WEB_ORIGIN): raise HTTPException(403,'Origin not allowed')
 if not valid(body.url): raise HTTPException(400,'URL not supported')
 jid=uuid.uuid4().hex; jobs[jid]={'status':'queued','platform':platform(body.url)}; threading.Thread(target=worker,args=(jid,body.url),daemon=True).start(); return {'job_id':jid,'status':'queued'}
@app.get('/api/status/{jid}')
def status(req:Request,jid:str):
 if req.headers.get('origin') not in (None,WEB_ORIGIN): raise HTTPException(403,'Origin not allowed')
 if jid not in jobs: raise HTTPException(404,'Job not found')
 return jobs[jid]
@app.get('/api/file/{jid}/{filename}')
def file(req:Request,jid:str,filename:str):
 if req.headers.get('origin') not in (None,WEB_ORIGIN): raise HTTPException(403,'Origin not allowed')
 if jid not in jobs or jobs[jid].get('status')!='done': raise HTTPException(404,'File not ready')
 if Path(filename).name!=filename: raise HTTPException(400,'Invalid filename')
 p=DOWNLOADS/jid/filename
 if not p.exists(): raise HTTPException(404,'File not found')
 return FileResponse(p,filename=filename,media_type='audio/mpeg')
