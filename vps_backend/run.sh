#!/usr/bin/env bash
set -e
source .venv/bin/activate
set -a
[ -f .env ] && source .env
set +a
exec uvicorn app.main:app --host 127.0.0.1 --port 8080
