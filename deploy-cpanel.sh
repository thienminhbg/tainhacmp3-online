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
test -f "$WEB_DIR/assets/editor-enhance.js"
test -f "$WEB_DIR/assets/editor-enhance.css"
test -f "$WEB_DIR/assets/timeline-fix.js"
test -f "$WEB_DIR/assets/format-fix.js"

echo '[3/5] Copying web_cpanel to public_html...'
mkdir -p "$PUBLIC_DIR"
cp -a "$WEB_DIR/." "$PUBLIC_DIR/"

echo '[4/5] Enabling enhanced editor...'
sed -i -E 's#<script[^>]+assets/direct\.js[^>]*></script>##g' "$PUBLIC_DIR/index.php"
if ! grep -q 'assets/direct2.js' "$PUBLIC_DIR/index.php"; then
  sed -i 's#</body>#<script src="assets/direct2.js?v=2"></script></body>#' "$PUBLIC_DIR/index.php"
fi
if ! grep -q 'assets/editor-enhance.css' "$PUBLIC_DIR/index.php"; then
  sed -i 's#</head>#<link rel="stylesheet" href="assets/editor-enhance.css?v=2"></head>#' "$PUBLIC_DIR/index.php"
fi
if ! grep -q 'assets/editor-enhance.js' "$PUBLIC_DIR/index.php"; then
  sed -i 's#</body>#<script src="assets/editor-enhance.js?v=2"></script></body>#' "$PUBLIC_DIR/index.php"
fi
if ! grep -q 'assets/timeline-fix.js' "$PUBLIC_DIR/index.php"; then
  sed -i 's#</body>#<script src="assets/timeline-fix.js?v=1"></script></body>#' "$PUBLIC_DIR/index.php"
fi
if ! grep -q 'assets/format-fix.js' "$PUBLIC_DIR/index.php"; then
  sed -i 's#</body>#<script src="assets/format-fix.js?v=1"></script></body>#' "$PUBLIC_DIR/index.php"
fi

echo '[5/5] Checking deployment...'
test -f "$PUBLIC_DIR/index.php"
test -f "$PUBLIC_DIR/assets/editor-enhance.js"
test -f "$PUBLIC_DIR/assets/editor-enhance.css"
test -f "$PUBLIC_DIR/assets/timeline-fix.js"
test -f "$PUBLIC_DIR/assets/format-fix.js"
grep -q 'assets/editor-enhance.js' "$PUBLIC_DIR/index.php"
grep -q 'assets/timeline-fix.js' "$PUBLIC_DIR/index.php"
grep -q 'assets/format-fix.js' "$PUBLIC_DIR/index.php"
echo 'cPanel deploy completed.'
