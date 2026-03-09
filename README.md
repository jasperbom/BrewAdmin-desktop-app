# 🍺 Brouwerij Admin — Desktop App

Standalone desktop applicatie voor nano brouwerij administratie. Beheer batches, ingrediënten, accijns en voorraad — **geen Home Assistant nodig**.

---

## Installatie

### Windows

1. Download **`Brouwerij.Admin.Setup.1.2.0.exe`** via de [Releases pagina](https://github.com/jasperbom/BrewAdmin-desktop-app/releases/latest)
2. Dubbelklik op het gedownloade bestand
3. Klik op **"Meer info"** → **"Toch uitvoeren"** als Windows een waarschuwing toont *(de app is niet gesigneerd)*
4. Volg de installatie-wizard
5. Start de app via het bureaublad-icoon of het Startmenu

### macOS (Apple Silicon — M1/M2/M3/M4)

1. Download **`Brouwerij.Admin-1.2.0-arm64-mac.zip`** via de [Releases pagina](https://github.com/jasperbom/BrewAdmin-desktop-app/releases/latest)
2. Pak het zip-bestand uit (dubbelklik)
3. Sleep **Brouwerij Admin.app** naar je **Programma's** map
4. De eerste keer openen:
   - Klik **niet** gewoon op het icoon — macOS blokkeert dit
   - Klik met de **rechtermuisknop** (of Control+klik) op het icoon
   - Kies **"Openen"** in het menu
   - Klik in het dialoogvenster op **"Openen"**
   - Vanaf nu kun je de app gewoon dubbelklikken

### macOS (Intel)

1. Download **`Brouwerij.Admin-1.2.0-mac.zip`** via de [Releases pagina](https://github.com/jasperbom/BrewAdmin-desktop-app/releases/latest)
2. Volg dezelfde stappen als hierboven bij Apple Silicon

---

## Eerste gebruik

Bij het opstarten start de app automatisch een lokale server op de achtergrond. Dit duurt een paar seconden — je ziet een laadscherm met 🍺.

Daarna opent de volledige Brouwerij Admin interface in een eigen venster.

---

## Data opslag

Alle jouw data (batches, ingrediënten, recepten, etc.) wordt lokaal opgeslagen op je computer:

| Platform | Locatie |
|----------|---------|
| Windows  | `%APPDATA%\brouwerij-admin\data\` |
| macOS    | `~/Library/Application Support/brouwerij-admin/data\` |

Via het menu **Bestand → Data map openen** open je de map direct.

> 💡 **Tip:** Maak regelmatig een backup van deze map, of gebruik de **Export** functie in de app zelf (Instellingen → Export).

---

## Veelgestelde vragen

**Waarom toont Windows een beveiligingswaarschuwing?**  
De app is niet voorzien van een betaald code-signing certificaat. De app is volledig open source en veilig — je kunt de broncode bekijken in deze repository.

**Waarom blokkeert macOS de app?**  
Hetzelfde: geen Apple Developer certificaat. Via rechtermuisknop → Openen omzeil je dit eenmalig.

**Werkt de app ook als Home Assistant addon?**  
Ja! De originele HA addon staat in de [Brew-admin-HA-App](https://github.com/jasperbom/Brew-admin-HA-App) repository.

**Mijn data is weg na een update — hoe kan dat?**  
Data staat in de appdata map (zie boven) en wordt nooit verwijderd bij een update. Controleer of je de juiste map bekijkt.

---

## Licentie

AGPL-3.0 — zie [LICENSE](LICENSE)
