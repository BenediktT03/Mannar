# Mannar Website

## Übersicht

Diese Website wurde für Mannar, einen Peer- und Genesungsbegleiter, entwickelt. Sie bietet eine Plattform, um Informationen über Angebote bereitzustellen und Kontaktmöglichkeiten anzubieten. Die Website basiert auf PHP mit Firebase als Backend und nutzt eine modulare Architektur für leichte Erweiterbarkeit und Wartung.

## Technologien

- **Backend:** PHP 7.4+
- **Datenbank:** Firebase Firestore
- **Authentifizierung:** Firebase Authentication
- **Speicher:** Firebase Storage und Cloudinary
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **CSS-Framework:** W3.CSS mit eigenen Erweiterungen
- **Bibliotheken:** FontAwesome, Sortable.js, Quill Editor

## Projektstruktur

```
mannar/
├── assets/                  # Quell-Assets (unoptimiert)
│   ├── css/                 # CSS-Dateien
│   ├── js/                  # JavaScript-Dateien
│   └── img/                 # Quellbilder
├── bootstrap.php            # Anwendungs-Bootstrap
├── config/                  # Konfigurationsdateien
│   ├── app.php              # Hauptkonfiguration
│   ├── database.php         # Datenbankkonfiguration
│   ├── firebase.php         # Firebase-Konfiguration
│   └── constants.php        # Anwendungskonstanten
├── data/                    # Datenspeicher
│   ├── cache/               # Cache-Dateien
│   ├── logs/                # Log-Dateien
│   └── messages/            # Kontaktformular-Nachrichten
├── public/                  # Webroot für öffentlichen Zugriff
│   ├── index.php            # Haupteinstiegspunkt
│   ├── admin.php            # Admin-Bereich-Einstiegspunkt
│   ├── assets/              # Kompilierte Assets
│   ├── api/                 # API-Endpunkte
│   └── .htaccess            # Server-Konfiguration
└── src/                     # Quellcode der Anwendung
    ├── core/                # Kernfunktionalität
    ├── services/            # Service-Klassen
    ├── templates/           # Template-Dateien
    │   ├── components/      # Wiederverwendbare Komponenten
    │   ├── layouts/         # Seitenlayouts
    │   └── pages/           # Seitenspezifische Templates
    └── utils/               # Hilfsfunktionen
```

## Funktionen

- **Responsive Design:** Optimiert für alle Geräte (Mobiltelefone, Tablets, Desktops)
- **Content Management:** Admin-Bereich zur Verwaltung von Inhalten
- **Dynamische Seiten:** Erstellung verschiedener Seitentypen mit verschiedenen Vorlagen
- **Word Cloud:** Interaktive Darstellung relevanter Begriffe
- **Kontaktformular:** Einfache Kontaktaufnahme für Besucher
- **Bildverwaltung:** Upload und Verwaltung von Bildern via Cloudinary
- **SEO-Optimiert:** Meta-Tags, strukturierte URLs und Barrierefreiheit

## Installation

### Voraussetzungen

- PHP 7.4 oder höher
- Composer (für Abhängigkeiten)
- Firebase-Projekt
- Cloudinary-Konto (optional)

### Installation

1. Repository klonen:
   ```bash
   git clone https://github.com/username/mannar-website.git
   cd mannar-website
   ```

2. Abhängigkeiten installieren:
   ```bash
   composer install
   ```

3. Konfigurationsdateien einrichten:
   - `config/app.php`: Allgemeine Anwendungseinstellungen
   - `config/firebase.php`: Firebase-Konfiguration
   - `config/constants.php`: Anwendungskonstanten

4. Verzeichnisberechtigungen einrichten:
   ```bash
   chmod -R 755 public/
   chmod -R 775 data/
   ```

5. Einen Webserver mit der `public/`-Verzeichnis als Document Root konfigurieren.

### Entwicklungsumgebung einrichten

1. Entwicklungsserver starten:
   ```bash
   php -S localhost:8000 -t public/
   ```

2. Frontend-Assets während der Entwicklung beobachten und kompilieren:
   ```bash
   # Diese Schritte erfordern Node.js und npm
   npm install
   npm run watch
   ```

## Verwendung

### Admin-Bereich

Der Admin-Bereich ist unter `/admin.php` verfügbar. Anmeldeinformationen werden während der Installation festgelegt.

Der Admin-Bereich ermöglicht:

- Verwaltung von Inhalten für die Homepage
- Erstellung und Bearbeitung von dynamischen Seiten
- Verwaltung der Word Cloud
- Vorschau von Änderungen vor der Veröffentlichung
- Anpassung von globalen Einstellungen

### Dynamische Seiten

Die Website unterstützt verschiedene Seitenvorlagen:

- **Basic:** Einfache Textseite
- **Text-Image:** Text mit Bild auf der rechten Seite
- **Image-Text:** Bild auf der linken Seite mit Text rechts
- **Gallery:** Bildergalerie
- **Landing:** Landingpage mit Hero-Bereich und Features
- **Portfolio:** Sammlung von Projekten oder Angeboten
- **Contact:** Kontaktinformationen und Formular
- **Blog:** Blogbeitrag mit Metadaten

## Wartung und Updates

### Caching

Die Website verwendet Caching für eine bessere Performance:

- Firestore-Daten werden im Speicher gecached
- Browser-Caching für statische Assets wird über HTTP-Header konfiguriert
- Die Caching-Einstellungen können in `config/app.php` angepasst werden

### Versionierung

Die Dateien `src/core/version.php` und `assets/js/main.js` enthalten Versionsinformationen. Bei Updates bitte diese Versionsnummern erhöhen, um Browser-Caching zu umgehen.

### Fehlerprotokollierung

Fehler werden in `data/logs/` protokolliert. Überprüfen Sie dieses Verzeichnis bei Problemen.

## Sicherheit

Die Website enthält verschiedene Sicherheitsmaßnahmen:

- CSRF-Schutz für alle Formulare
- Input-Validierung und -Bereinigung
- Firebase-Authentifizierung für den Admin-Bereich
- Sichere HTTP-Header (.htaccess)
- Schutz vor XSS und SQL-Injection

## Autor

Entwickelt für Mannar von Ihrem Entwicklungsteam.

## Lizenz

Dieses Projekt ist urheberrechtlich geschützt. Alle Rechte vorbehalten.