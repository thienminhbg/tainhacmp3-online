#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$REPO_DIR/web_cpanel"
PUBLIC_DIR="${PUBLIC_DIR:-$HOME/public_html}"

echo '[1/4] Pulling latest source...'
cd "$REPO_DIR"
git pull --ff-only origin main

echo '[2/4] Checking frontend files...'
test -f "$WEB_DIR/index.php"
test -f "$WEB_DIR/assets/app.js"
test -f "$WEB_DIR/assets/style.css"

echo '[3/4] Syncing web_cpanel to public_html...'
mkdir -p "$PUBLIC_DIR"
rsync -av --delete "$WEB_DIR/" "$PUBLIC_DIR/"

echo '[4/4] Checking deployment...'
test -f "$PUBLIC_DIR/index.php"
echo 'cPanel deploy completed.'
