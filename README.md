# TaiNhacMP3.online

Music downloader website and VPS processing backend.

## Structure
- `web_cpanel/` — PHP frontend for cPanel hosting.
- `vps_backend/` — FastAPI downloader worker for an Ubuntu VPS.

## Deployment
1. Upload `web_cpanel` contents to cPanel `public_html`.
2. Deploy `vps_backend` to Ubuntu VPS.
3. Point `api.tainhacmp3.online` to the VPS and reverse proxy to the FastAPI service.
4. Keep only authorized/publicly downloadable content within applicable laws and platform terms.
