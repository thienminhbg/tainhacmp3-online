#!/bin/bash
set -e
cd "$(dirname "$0")"

echo '[1/5] Pulling latest source...'
git pull --ff-only origin main

echo '[2/5] Updating Python dependencies...'
cd vps_backend
source .venv/bin/activate
python -m pip install -r requirements.txt

echo '[3/5] Checking Python syntax...'
python -m py_compile app/main.py

echo '[4/5] Restarting API...'
sudo systemctl restart tainhacmp3-api
sudo systemctl enable tainhacmp3-api >/dev/null

echo '[5/5] Health check...'
sleep 2
curl -fsS http://127.0.0.1:8080/health
echo
echo 'VPS deploy completed.'
