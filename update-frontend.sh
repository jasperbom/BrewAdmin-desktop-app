#!/bin/bash
# Update frontend van de HA addon naar de desktop app
# Gebruik: ./update-frontend.sh

set -e

ADDON_REPO="https://raw.githubusercontent.com/jasperbom/Brew-admin-HA-App/main/Brew-admin-HA-App/static/index.html"
TARGET="static/index.html"

echo "📥 Nieuwe index.html ophalen van HA addon..."
curl -fsSL "$ADDON_REPO" -o "$TARGET"

echo "✅ Frontend bijgewerkt: $TARGET"
echo ""
echo "Volgende stappen:"
echo "  git add static/index.html"
echo "  git commit -m 'feat: frontend bijgewerkt van HA addon'"
echo "  git tag v<nieuw-versienummer>"
echo "  git push origin main --tags"
echo ""
echo "GitHub Actions bouwt daarna automatisch nieuwe installers."
