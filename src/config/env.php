 <?php
/**
 * env.php
 * Lädt Umgebungsvariablen aus .env-Datei
 */

// Prüfe, ob dotenv installiert ist und lade die Umgebungsvariablen
if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
    
    // Lade .env Datei, wenn vorhanden
    if (class_exists('\\Dotenv\\Dotenv')) {
        $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->safeLoad();
    }
}

/**
 * Sichere Methode zum Abrufen von Umgebungsvariablen mit Fallback
 * 
 * @param string $key Name der Umgebungsvariable
 * @param mixed $default Standardwert, falls die Variable nicht existiert
 * @return mixed Wert der Umgebungsvariable oder Standardwert
 */
function env($key, $default = null) {
    $value = getenv($key);
    
    if ($value === false) {
        // Prüfe, ob die Variable in $_ENV oder $_SERVER existiert
        if (isset($_ENV[$key])) {
            $value = $_ENV[$key];
        } elseif (isset($_SERVER[$key])) {
            $value = $_SERVER[$key];
        } else {
            return $default;
        }
    }
    
    // Konvertiere Zeichenketten in ihren entsprechenden Typ
    switch (strtolower($value)) {
        case 'true':
        case '(true)':
            return true;
        case 'false':
        case '(false)':
            return false;
        case 'null':
        case '(null)':
            return null;
        case 'empty':
        case '(empty)':
            return '';
    }
    
    return $value;
}

/**
 * Generiert sichere Firebase-Konfiguration für JavaScript
 * Filtert sensible Daten raus, je nach Umgebung
 * 
 * @param bool $includeServerKeys Ob Server-seitige Keys eingeschlossen werden sollen
 * @return array Firebase-Konfiguration für Client-Side
 */
function getFirebaseConfig($includeServerKeys = false) {
    $config = [
        'apiKey' => env('FIREBASE_API_KEY', ''),
        'authDomain' => env('FIREBASE_AUTH_DOMAIN', ''),
        'projectId' => env('FIREBASE_PROJECT_ID', ''),
        'storageBucket' => env('FIREBASE_STORAGE_BUCKET', ''),
        'messagingSenderId' => env('FIREBASE_MESSAGING_SENDER_ID', ''),
        'appId' => env('FIREBASE_APP_ID', ''),
        'measurementId' => env('FIREBASE_MEASUREMENT_ID', '')
    ];
    
    // Für Produktionsumgebungen: Entferne die apiKey aus Client-seitiger Konfiguration
    // wenn sie nicht benötigt wird (je nach Firebase-Sicherheitsregeln)
    if (!env('DEBUG_MODE', false) && !$includeServerKeys) {
        // In Produktion können wir sensible Daten entfernen, wenn nötig
    }
    
    return $config;
}

/**
 * Gibt Firebase-Konfiguration als JSON-String zurück
 * 
 * @param bool $includeServerKeys Ob Server-seitige Keys eingeschlossen werden sollen
 * @return string JSON-kodierte Firebase-Konfiguration
 */
function getFirebaseConfigJson($includeServerKeys = false) {
    return json_encode(getFirebaseConfig($includeServerKeys));
}

// Setze Admin-Secret für Server-seitige Validierung
define('ADMIN_SECRET', env('ADMIN_SECRET', 'your-secret-admin-key'));

// Debug-Modus basierend auf Umgebungsvariable
define('DEBUG_MODE', env('DEBUG_MODE', false));

// Website-URL
define('SITE_URL', env('SITE_URL', 'http://localhost'));