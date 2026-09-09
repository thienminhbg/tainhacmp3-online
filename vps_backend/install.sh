#!/usr/bin/env bash
set -e
sudo apt update
sudo apt install -y python3 python3-venv python3-pip ffmpeg git golang
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
mkdir -p bin
if [ ! -f bin/mp3 ]; then git clone https://github.com/und3fined/zingmp3 /tmp/zingmp3; cp /tmp/zingmp3/mp3 bin/mp3; chmod +x bin/mp3; fi
if ! command -v pum >/dev/null 2>&1; then go install github.com/dangkaka/pum@latest || true; [ -f "$HOME/go/bin/pum" ] && cp "$HOME/go/bin/pum" bin/pum || true; fi
pip install -U scdl
echo 'Install complete. Run ./run.sh'
