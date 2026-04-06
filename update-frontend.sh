#!/bin/bash
# Update frontend van de HA addon naar de desktop app
# Gebruik: ./update-frontend.sh
# Vereiste: Node.js 20+ en git geïnstalleerd

set -e

HA_APP_DIR=$(mktemp -d)
TARGET="static/index.html"

echo "📥 HA App ophalen van GitHub..."
git clone --depth=1 https://github.com/jasperbom/BrewAdmin-HA-App.git "$HA_APP_DIR"

echo "🔨 Frontend bouwen..."
cd "$HA_APP_DIR"
npm ci
npm run build
cd -

echo "📋 Frontend kopiëren naar $TARGET..."
cp "$HA_APP_DIR/dist/index.html" "$TARGET"
rm -rf "$HA_APP_DIR"

echo "✅ Frontend bijgewerkt: $TARGET"
echo ""
echo "Volgende stappen:"
echo "  git add static/index.html"
echo "  git commit -m 'feat: frontend bijgewerkt van HA addon'"
echo "  git tag v<nieuw-versienummer>"
echo "  git push origin main --tags"
echo ""
echo "GitHub Actions bouwt daarna automatisch nieuwe installers."
