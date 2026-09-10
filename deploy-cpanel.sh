#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$REPO_DIR/web_cpanel"
PUBLIC_DIR="${PUBLIC_DIR:-$HOME/public_html}"

echo '[1/5] Pulling latest source...'
cd "$REPO_DIR"
git pull --ff-only origin main

echo '[2/5] Checking frontend files...'
test -f "$WEB_DIR/index.php"
test -f "$WEB_DIR/assets/app.js"
test -f "$WEB_DIR/assets/style.css"
test -f "$WEB_DIR/assets/direct2.js"

echo '[3/5] Copying web_cpanel to public_html...'
mkdir -p "$PUBLIC_DIR"
cp -a "$WEB_DIR/." "$PUBLIC_DIR/"

echo '[4/5] Enabling fixed Direct Browser module...'
if ! grep -q 'assets/direct2.js' "$PUBLIC_DIR/index.php"; then
  sed -i 's#</body>#<script src="assets/direct2.js?v=1"></script></body>#' "$PUBLIC_DIR/index.php"
fi

echo '[5/5] Checking deployment...'
test -f "$PUBLIC_DIR/index.php"
test -f "$PUBLIC_DIR/assets/direct2.js"
grep -q 'assets/direct2.js' "$PUBLIC_DIR/index.php"
echo 'cPanel deploy completed.'
