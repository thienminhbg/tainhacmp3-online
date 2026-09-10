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
test -f "$WEB_DIR/assets/format-fix.js"

echo '[3/4] Copying frontend and enabling format UI...'
mkdir -p "$PUBLIC_DIR"
cp -a "$WEB_DIR/." "$PUBLIC_DIR/"
# Keep the stable core frontend. Only the small format UI helper is injected here.
sed -i -E 's#<script[^>]+assets/(direct2|editor-enhance|timeline-fix|format-fix)\.js[^>]*></script>##g; s#<link[^>]+assets/editor-enhance\.css[^>]*>##g' "$PUBLIC_DIR/index.php"
if ! grep -q 'assets/format-fix.js' "$PUBLIC_DIR/index.php"; then
  sed -i 's#</body>#<script src="assets/format-fix.js?v=4"></script></body>#' "$PUBLIC_DIR/index.php"
fi

echo '[4/4] Checking deployment...'
test -f "$PUBLIC_DIR/index.php"
test -f "$PUBLIC_DIR/assets/format-fix.js"
grep -q 'assets/format-fix.js' "$PUBLIC_DIR/index.php"
echo 'cPanel deploy completed.'
