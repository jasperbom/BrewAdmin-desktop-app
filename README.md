# 🍺 Brouwerij Admin — Desktop App

Electron-wrapper voor de Brouwerij Admin Home Assistant app.  
Draait als standalone `.exe` (Windows) of `.dmg` (macOS) **zonder Home Assistant nodig te hebben**.

---

## Projectstructuur

```
brew-electron/
├── main.js              ← Electron hoofdproces (start backend, maakt venster)
├── preload.js           ← Beveiligingslaag tussen Electron en browser
├── package.json         ← Dependencies en build config
├── backend/
│   └── server.py        ← Python HTTP server (data opslag)
├── static/
│   └── index.html       ← De volledige React frontend
└── assets/
    ├── icon.png         ← App icoon (512x512 PNG)
    ├── icon.ico         ← Windows icoon
    ├── icon.icns        ← macOS icoon
    └── dmg-background.png ← Achtergrond voor macOS DMG installer
```

---

## Stap 1 — Vereisten installeren

Je hebt nodig:
- **Node.js** (v18 of hoger): https://nodejs.org
- **Python 3.10+**: https://python.org (voor development/testen)
- **npm** (wordt meegeleverd met Node.js)

```bash
# Controleer versies
node --version   # moet v18+ zijn
python3 --version
```

---

## Stap 2 — Dependencies installeren

```bash
cd brew-electron
npm install
```

Dit installeert automatisch:
- `electron` — de app-shell
- `electron-builder` — voor het bouwen van .exe en .dmg

---

## Stap 3 — Testen (development mode)

```bash
npm start
```

De app opent een venster, start de Python server op `localhost:8099` en laadt de frontend.

---

## Stap 4 — App iconen maken

Voordat je bouwt, heb je iconen nodig in de `assets/` map:

| Bestand            | Formaat  | Gebruik       |
|--------------------|----------|---------------|
| `icon.png`         | 512×512  | Linux / tray  |
| `icon.ico`         | 256×256  | Windows       |
| `icon.icns`        | 512×512  | macOS         |
| `dmg-background.png` | 660×400 | macOS DMG    |

**Tip:** Gebruik https://www.electron.build/icons of `electron-icon-maker` om automatisch alle formaten te genereren vanuit één PNG:

```bash
npx electron-icon-maker --input=mijn-logo.png --output=assets
```

---

## Stap 5 — Bouwen voor productie

### Windows (.exe installer)
> **Moet gebouwd worden op Windows** (of via GitHub Actions)

```bash
npm run build:win
```

Output: `dist/Brouwerij Admin Setup 1.2.0.exe`

### macOS (.dmg)
> **Moet gebouwd worden op macOS**

```bash
npm run build:mac
```

Output: `dist/Brouwerij Admin-1.2.0.dmg`

### Beide platforms via GitHub Actions
Zie hieronder voor de CI/CD workflow.

---

## Stap 6 — Python bundelen met PyInstaller

Voor de uiteindelijke distributie wil je Python meebundelen zodat gebruikers het **niet zelf hoeven te installeren**.

```bash
# Installeer PyInstaller
pip install pyinstaller

# Bundel de server
pyinstaller --onefile --name server backend/server.py

# Verplaats de binary
mkdir -p backend-dist
cp dist/server backend-dist/     # Linux/Mac
# of: copy dist\server.exe backend-dist\  # Windows
```

Pas daarna in `package.json` de `extraResources` aan:
```json
{
  "from": "backend-dist/",
  "to": "backend/",
  "filter": ["**/*"]
}
```

En in `main.js` wijst `getPythonExecutable()` al automatisch naar de gebundelde binary.

---

## GitHub Actions — Automatisch bouwen

Maak `.github/workflows/build.yml` aan voor automatische builds op push:

```yaml
name: Build Electron App

on:
  push:
    tags: ['v*']

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install
      - run: npm run build:win
      - uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: dist/*.exe

  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install
      - run: npm run build:mac
      - uses: actions/upload-artifact@v4
        with:
          name: mac-dmg
          path: dist/*.dmg
```

Push een tag (`git tag v1.2.0 && git push --tags`) en GitHub bouwt automatisch beide installers.

---

## Data opslag

Data wordt opgeslagen in de gebruikers-appdata map:

| Platform | Locatie |
|----------|---------|
| Windows  | `%APPDATA%\brouwerij-admin\data\` |
| macOS    | `~/Library/Application Support/brouwerij-admin/data/` |

Via het menu **Bestand → Data map openen** kun je de map direct openen.

---

## Veelgestelde vragen

**Werkt de app nog steeds als Home Assistant addon?**  
Ja! De originele `Dockerfile` en `config.yaml` zijn ongewijzigd. De desktop-app is een aparte wrapper.

**Moeten gebruikers Python installeren?**  
Nee, als je PyInstaller gebruikt om de backend te bundelen (zie Stap 6).

**Kan ik de app codesignen?**  
Ja, via `electron-builder` met een Apple Developer certificate (macOS) of een code signing certificate (Windows). Zie: https://www.electron.build/code-signing
