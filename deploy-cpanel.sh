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

echo '[3/4] Copying frontend...'
mkdir -p "$PUBLIC_DIR"
cp -a "$WEB_DIR/." "$PUBLIC_DIR/"
# Remove legacy local-file/browser-processing scripts from the live page.
sed -i -E 's#<script[^>]+assets/(direct|direct2|editor-enhance|timeline-fix|format-fix)\.js[^>]*></script>##g; s#<link[^>]+assets/editor-enhance\.css[^>]*>##g' "$PUBLIC_DIR/index.php"

echo '[4/4] Checking deployment...'
test -f "$PUBLIC_DIR/index.php"
if grep -qE 'assets/(direct|direct2|editor-enhance|timeline-fix|format-fix)\.js' "$PUBLIC_DIR/index.php"; then
  echo 'ERROR: legacy browser/local-file scripts are still loaded.'
  exit 1
fi
grep -q 'assets/app.js' "$PUBLIC_DIR/index.php"
echo 'cPanel deploy completed.'
