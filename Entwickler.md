 # Entwicklerdokumentation - Mannar Website

Diese Dokumentation bietet detaillierte Informationen für Entwickler, die an der Wartung, Erweiterung oder Anpassung der Mannar-Website arbeiten.

## Architektur

Die Website folgt einer modularen MVC-ähnlichen Architektur:

- **Model:** Die Daten werden in Firebase Firestore gespeichert und über Service-Klassen abgerufen
- **View:** Templates in `src/templates/` stellen die Daten dar
- **Controller:** PHP-Skripte in `public/` und `src/core/` verarbeiten Anfragen und koordinieren die Anwendungslogik

### Hauptkomponenten

1. **Bootstrap-Mechanismus:** `bootstrap.php` lädt Konfigurationen und initialisiert die Anwendung
2. **Routing-System:** `src/core/router.php` und `.htaccess` verarbeiten URL-Routing
3. **Template-System:** `src/templates/` enthält alle Vorlagen für die Darstellung
4. **Service-Layer:** `src/services/` enthält Klassen für externe Dienste wie Firebase und Cloudinary
5. **Admin-Panel:** Verwaltet Inhalte und Einstellungen über eine benutzerfreundliche Oberfläche

## Kernklassen und -funktionen

### core/init.php

Initialisiert die Anwendung, lädt Konfigurationen und richtet globale Funktionen ein.

Wichtige Funktionen:
- `render_template($template, $data = [], $return = false)`: Rendert eine Vorlage mit Daten
- `render_component($component, $data = [], $return = false)`: Rendert eine Komponente mit Daten
- `json_response($data, $status = 200)`: Gibt eine JSON-Antwort zurück

### core/database.php

Stellt eine Datenbankverbindungsschicht bereit, die PDO für sichere SQL-Operationen verwendet.

Hauptfunktionen:
- `query($sql, $params = [])`: Führt eine SQL-Abfrage aus
- `fetch($sql, $params = [], $fetchMode = null)`: Holt eine einzelne Zeile
- `fetchAll($sql, $params = [], $fetchMode = null)`: Holt alle Zeilen
- `insert($table, $data)`: Fügt Daten in eine Tabelle ein
- `update($table, $data, $where, $params = [])`: Aktualisiert Daten in einer Tabelle
- `delete($table, $where, $params = [])`: Löscht Daten aus einer Tabelle

### services/contentservice.php

Verwaltet Inhalte mit Firebase Firestore.

Hauptfunktionen:
- `loadMainContent($isDraft = false, $useCache = true)`: Lädt Hauptinhalt
- `loadPage($pageId, $useCache = true)`: Lädt eine Seite nach ID
- `loadAllPages($options = [], $useCache = false)`: Lädt alle Seiten
- `savePage($pageId, $data)`: Speichert eine Seite
- `loadWordCloud($useCache = true)`: Lädt Word-Cloud-Daten

### utils/security.php

Bietet Sicherheitsfunktionen für die Anwendung.

Hauptfunktionen:
- `generate_csrf_token($expiry = 3600)`: Generiert ein CSRF-Token
- `verify_csrf_token($token)`: Überprüft ein CSRF-Token
- `sanitize_input($input)`: Bereinigt Benutzereingaben
- `set_security_headers()`: Setzt HTTP-Sicherheitsheader

## Frontend-Architektur

### CSS-Struktur

- **Basis-Styles:** Variablen, Reset und Typografie
- **Komponenten:** Wiederverwendbare UI-Elemente
- **Layout:** Strukturelle Stile für den Seitenaufbau
- **Seiten:** Spezifische Stile für bestimmte Seiten
- **Utilities:** Hilfsklassen für allgemeine Aufgaben

CSS-Variablen in `assets/css/base/variables.css` definieren das Designsystem.

### JavaScript-Module

- **app.js:** Hauptanwendungsinitialisierer
- **services/:** Servicemodule für externe APIs
- **components/:** UI-Komponenten wie WordCloud, Gallery, Navigation
- **utils/:** Hilfsfunktionen für UI-Operationen, Fehlerbehandlung usw.
- **admin/:** Admin-spezifische Funktionen

## Datenmodell

Die Firebase Firestore-Datenbank verwendet folgende Hauptkollektionen:

### Sammlung: content

- **Dokument: main**
  - Hauptinhalt der Website
  - Beinhaltet Abschnitte wie about, offerings, contact

- **Dokument: draft**
  - Entwurfsversion des Hauptinhalts
  - Gleiche Struktur wie 'main'

- **Dokument: wordCloud**
  - Array von Wörtern für die Word Cloud
  - Jedes Wort hat: text, weight, link (optional)

### Sammlung: pages

- **Dokumente: [page-id]**
  - Titel, Beschreibung, Meta-Informationen
  - Template-Typ (basic, text-image, gallery, usw.)
  - Inhaltsfelder basierend auf Template
  - Erstellungs- und Aktualisierungszeitstempel

### Sammlung: settings

- **Dokument: global**
  - Designeinstellungen (Farben, Typografie, usw.)
  - Globale Konfigurationsoptionen
  - Kontaktinformationen

## Erweitern der Website

### Hinzufügen einer neuen Seitenvorlage

1. Definieren Sie die Vorlage in `config/constants.php` unter `PAGE_TEMPLATES`
2. Erstellen Sie die Rendering-Funktion in `src/templates/pages/page.php`
3. Fügen Sie spezifische Stile in `assets/css/pages/templates.css` hinzu
4. Aktualisieren Sie das Admin-Panel-Formular in `assets/js/admin/page-editor.js`

### Hinzufügen einer neuen Komponente

1. Erstellen Sie die Komponente in `src/templates/components/`
2. Fügen Sie spezifische Stile in `assets/css/components/` hinzu
3. Bei Bedarf JavaScript-Funktionalität in `assets/js/components/` hinzufügen
4. Verwendung in Templates: `render_component('komponenten-name', $data)`

### Hinzufügen einer neuen API-Route

1. Erstellen Sie einen neuen Endpunkt in `public/api/`
2. Aktualisieren Sie `.htaccess` für saubere URLs bei Bedarf
3. Implementieren Sie die Logik unter Verwendung der vorhandenen Services
4. Achten Sie auf ordnungsgemäße Fehlerbehandlung und Validierung

## Performance-Optimierung

### Serverseitig

- **Caching:** Verwenden Sie die `ContentService`-Caching-Funktionen
- **Datenbankabfragen:** Minimieren Sie Firestore-Lesevorgänge und verwenden Sie Indizes
- **PHP-Speicher:** Vermeiden Sie das Laden unnötiger Bibliotheken

### Clientseitig

- **Asset-Optimierung:** Minimieren Sie CSS- und JavaScript-Dateien für die Produktion
- **Bildoptimierung:** Verwenden Sie responsive Bilder und Lazy-Loading
- **HTTP-Caching:** Stellen Sie sicher, dass Cache-Header richtig konfiguriert sind

## Fehlerbehandlung und Debugging

### Serverseite

- Fehler werden in `data/logs/` protokolliert
- In `config/app.php` kann `DEBUG_MODE` aktiviert werden
- Verwenden Sie `try-catch`-Blöcke für kritischen Code

### Clientseite

- Das `ErrorHandler`-Modul in `assets/js/utils/error-handler.js` verwaltet JS-Fehler
- Fehler werden in der Browser-Konsole protokolliert
- Sichtbare Fehler werden Benutzern nur im Debug-Modus angezeigt

## Sicherheitspraktiken

- **Authentifizierung:** Verwenden Sie immer Firebase Auth für gesicherte Bereiche
- **Eingabevalidierung:** Validieren und bereinigen Sie alle Benutzereingaben
- **CSRF-Schutz:** Verwenden Sie CSRF-Token für alle Formulare
- **XSS-Prävention:** Maskieren Sie alle Ausgaben mit `htmlspecialchars()`
- **Dateisicherheit:** Validieren Sie Uploads und speichern Sie sie sicher

## Deployment

### Staging-Umgebung

1. Klonen Sie das Repository auf dem Staging-Server
2. Konfigurieren Sie `config/app.php` für die Staging-Umgebung
3. Führen Sie `composer install` aus
4. Setzen Sie die Verzeichnisberechtigungen
5. Testen Sie alle Funktionen vor dem Produktions-Deployment

### Produktionsumgebung

1. Optimieren Sie Assets: `npm run build`
2. Kopieren Sie Dateien auf den Produktionsserver (außer Entwicklungsdateien)
3. Konfigurieren Sie `config/app.php` für die Produktionsumgebung
4. Setzen Sie `DEBUG_MODE` auf `false`
5. Überprüfen Sie Berechtigungen und Sicherheitseinstellungen

## Bekannte Probleme und Lösungen

### Problem: Fehler beim Laden von Firebase

**Symptom:** Inhalte werden nicht geladen, Fehler in der Konsole bezüglich Firebase-Initialisierung.

**Lösung:** 
1. Überprüfen Sie die Firebase-Konfiguration in `config/firebase.php`
2. Stellen Sie sicher, dass die Domain zu Ihrem Firebase-Projekt hinzugefügt wurde
3. Überprüfen Sie die Browser-Konsole auf spezifische Firebase-Fehler

### Problem: CORS-Fehler für Cloudinary-Uploads

**Symptom:** Bilder können nicht hochgeladen werden, CORS-Fehler in der Konsole.

**Lösung:**
1. Konfigurieren Sie CORS-Einstellungen in Ihrem Cloudinary-Dashboard
2. Fügen Sie Ihre Domain zur Liste der erlaubten Ursprünge hinzu
3. Verwenden Sie die signierte Upload-Methode

## Kontakt für Entwickler

Bei technischen Fragen wenden Sie sich bitte an:

- **Entwicklungsteam:** development@example.com
- **Lead Developer:** lead@example.com
- **GitHub Repository:** https://github.com/username/mannar-website