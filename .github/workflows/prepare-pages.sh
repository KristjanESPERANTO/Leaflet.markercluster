#!/bin/bash
# Prepare files for GitHub Pages deployment

set -e

echo "Creating _site directory..."
mkdir -p _site

echo "Copying dist files..."
cp -r dist _site/

echo "Copying example files..."
cp -r example _site/

echo "Copying only Leaflet dist files..."
mkdir -p _site/node_modules/leaflet
cp -r node_modules/leaflet/dist _site/node_modules/leaflet/

echo "Creating .nojekyll file..."
touch _site/.nojekyll

echo "Creating root index.html redirect..."
cat > _site/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=example/">
  <title>Leaflet.markercluster Examples</title>
</head>
<body>
  <p>Redirecting to <a href="example/">examples</a>...</p>
</body>
</html>
EOF

echo "GitHub Pages site prepared successfully in _site/"
ls -la _site/
