#!/usr/bin/env bash
set -e
sudo apt update
sudo apt install -y python3 python3-venv python3-pip ffmpeg git
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install -r requirements.txt
python -m pip install -U yt-dlp

echo 'Install complete. TaiNhacMP3 is now a YouTube video cutter.'
echo 'Supported output: MP4 and MP3.'
echo 'Run ./run.sh'
