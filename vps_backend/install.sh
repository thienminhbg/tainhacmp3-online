#!/usr/bin/env bash
set -e
sudo apt update
sudo apt install -y python3 python3-venv python3-pip ffmpeg git golang
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
mkdir -p bin
if ! command -v pum >/dev/null 2>&1 && [ ! -f bin/pum ]; then
  go install github.com/dangkaka/pum@latest || true
  [ -f "$HOME/go/bin/pum" ] && cp "$HOME/go/bin/pum" bin/pum || true
fi
if [ -f bin/pum ]; then chmod +x bin/pum; fi
pip install -U scdl
echo 'Install complete. Zing uses the built-in API worker; NCT uses pum; SoundCloud uses scdl.'
echo 'Run ./run.sh'
