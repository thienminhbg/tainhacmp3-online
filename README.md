# TaiNhacMP3.online

YouTube video cutter with a PHP frontend and FastAPI processing backend.

## Features
- Paste a public YouTube URL and fetch video metadata.
- Preview the video with a privacy-enhanced YouTube embed.
- Choose start and end time for a clip.
- Export the selected section as MP4 or MP3.
- FFmpeg processing runs on the Ubuntu VPS.
- Multi-language frontend with Cloudflare country detection.

## Structure
- `web_cpanel/` — PHP frontend for cPanel hosting.
- `vps_backend/` — FastAPI YouTube cutter for an Ubuntu VPS.

## Deployment
1. Upload `web_cpanel` contents to cPanel `public_html` or pull the repository into the web root.
2. Deploy `vps_backend` to Ubuntu VPS.
3. Install `ffmpeg`, Python, the requirements, and `yt-dlp` using `install.sh`.
4. Point `api.tainhacmp3.online` to the VPS and reverse proxy to the FastAPI service.
5. Keep only content that you are authorized to download or reuse, and follow applicable laws and platform terms.

## Server limits
- Source video: up to 4 hours.
- Output clip: up to 30 minutes.
- Formats: MP4 and MP3.
