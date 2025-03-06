<?php
/**
 * config.php
 * Gemeinsame Konfiguration für API-Endpunkte mit verbesserten Sicherheitseinstellungen
 */

// Fehlerberichte und Anzeigeeinstellungen
ini_set('display_errors', 0); // Auf 1 für Entwicklung setzen
error_reporting(E_ALL);

// Lade die Umgebungsvariablen
require_once __DIR__ . '/../config/env.php';

// API-Version definieren
define('API_VERSION', '1.0.0');

// Zeitzone setzen
date_default_timezone_set('Europe/Berlin');

// Datenbankkonfiguration (falls erforderlich)
$db_config = [
    'host' => env('DB_HOST', 'localhost'),
    'username' => env('DB_USERNAME', 'dbuser'),
    'password' => env('DB_PASSWORD', 'dbpassword'),
    'database' => env('DB_DATABASE', 'mannar_db')
];

// API-Antworttypen
define('RESPONSE_JSON', 'application/json');
define('RESPONSE_HTML', 'text/html');
define('RESPONSE_TEXT', 'text/plain');

// Datei-Upload-Konfiguration
define('UPLOAD_MAX_SIZE', env('UPLOAD_MAX_SIZE', 5 * 1024 * 1024)); // 5MB
define('UPLOAD_ALLOWED_TYPES', [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/svg+xml'
]);
define('UPLOAD_DIR', env('UPLOAD_DIR', '../uploads/'));

// CORS-Einstellungen - Dynamisch aus Umgebungsvariablen
$cors_allowed_origins_str = env('CORS_ALLOWED_ORIGINS', 'https://mannar.de,https://www.mannar.de,http://localhost:8080');
$cors_allowed_origins = explode(',', $cors_allowed_origins_str);

// Authentifizierungseinstellungen
define('AUTH_TOKEN_EXPIRY', env('AUTH_TOKEN_EXPIRY', 86400)); // 24 Stunden in Sekunden
define('AUTH_REFRESH_TOKEN_EXPIRY', env('AUTH_REFRESH_TOKEN_EXPIRY', 2592000)); // 30 Tage in Sekunden

// CSRF-Schutz-Einstellungen
define('CSRF_TOKEN_EXPIRY', env('CSRF_TOKEN_EXPIRY', 7200)); // 2 Stunden in Sekunden
define('CSRF_COOKIE_NAME', env('CSRF_COOKIE_NAME', 'csrf_token'));

/**
 * CORS-Header basierend auf Konfiguration setzen
 */
function setCorsHeaders() {
    global $cors_allowed_origins;
    
    // Nur HTTPS-Verbindungen in Produktion erzwingen
    if (!DEBUG_MODE && empty($_SERVER['HTTPS']) && $_SERVER['HTTP_HOST'] !== 'localhost') {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['error' => 'HTTPS-Verbindung erforderlich']);
        exit;
    }
    
    // Prüfen, ob Ursprung erlaubt ist
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $cors_allowed_origins) || DEBUG_MODE) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        // Standard: Nur gleichen Ursprung erlauben
        header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_HOST'] ?? ''));
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
    header('Access-Control-Max-Age: 86400'); // 24 Stunden
    
    // Strict-Transport-Security für zusätzliche Sicherheit
    if (!DEBUG_MODE) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }
    
    // Weitere Sicherheitsheader
    header('X-Content-Type-Options: nosniff');
    header('X-XSS-Protection: 1; mode=block');
    header('X-Frame-Options: SAMEORIGIN');
    
    // Einfache Content-Security-Policy
    $cspDirectives = [
        "default-src 'self'",
        "script-src 'self' https://cdnjs.cloudflare.com https://www.gstatic.com",
        "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'",
        "img-src 'self' data: https: http:",
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
        "connect-src 'self' https://*.firebaseio.com https://firestore.googleapis.com",
        "object-src 'none'"
    ];
    
    // Entwicklungsmodus erlaubt mehr Freiheiten
    if (DEBUG_MODE) {
        $cspDirectives[] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com";
    }
    
    header('Content-Security-Policy: ' . implode('; ', $cspDirectives));
}

/**
 * Antwortinhaltstyp setzen
 * @param string $type Inhaltstyp-Konstante
 */
function setResponseType($type = RESPONSE_JSON) {
    header('Content-Type: ' . $type);
}

/**
 * Eine JSON-Antwort senden
 * @param mixed $data Als JSON zu kodierende Daten
 * @param int $status HTTP-Statuscode
 */
function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    setResponseType(RESPONSE_JSON);
    
    // Cache-Header setzen, um Caching zu verhindern
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Cache-Control: post-check=0, pre-check=0', false);
    header('Pragma: no-cache');
    
    echo json_encode($data);
    exit;
}

/**
 * Eine JSON-Fehlerantwort senden
 * @param string $message Fehlermeldung
 * @param int $status HTTP-Statuscode
 */
function sendJsonError($message, $status = 400) {
    // Fehler protokollieren, wenn DEBUG_MODE aktiviert ist
    if (DEBUG_MODE) {
        error_log("API-Fehler ($status): $message");
    }
    
    sendJsonResponse([
        'success' => false,
        'error' => $message,
        'status' => $status
    ], $status);
}

/**
 * Benutzereingabe bereinigen
 * @param string $input Zu bereinigende Eingabe
 * @return string Bereinigte Eingabe
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return $input;
}

/**
 * Erforderliche Felder in Anfrage validieren
 * @param array $required Array mit Namen erforderlicher Felder
 * @param array $data Zu validierende Daten
 * @return bool|string True, wenn gültig, ansonsten Fehlermeldung
 */
function validateRequiredFields($required, $data) {
    if (!is_array($data)) {
        return "Ungültiges Datenformat. Array erwartet.";
    }
    
    foreach ($required as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            return "Erforderliches Feld fehlt: $field";
        }
    }
    return true;
}

/**
 * CSRF-Token generieren
 * @return string Generiertes CSRF-Token
 */
function generateCsrfToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = [
        'token' => $token,
        'expiry' => time() + CSRF_TOKEN_EXPIRY
    ];
    
    // Token auch in einem Cookie setzen (SameSite=Strict für Sicherheit)
    setcookie(
        CSRF_COOKIE_NAME,
        $token,
        [
            'expires' => time() + CSRF_TOKEN_EXPIRY,
            'path' => '/',
            'domain' => '',
            'secure' => !DEBUG_MODE,
            'httponly' => true,
            'samesite' => 'Strict'
        ]
    );
    
    return $token;
}

/**
 * CSRF-Token validieren
 * @param string $token Von Client gesendetes Token
 * @return bool Ob das Token gültig ist
 */
function validateCsrfToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    
    $stored = $_SESSION['csrf_token'];
    
    // Prüfen, ob das Token abgelaufen ist
    if ($stored['expiry'] < time()) {
        unset($_SESSION['csrf_token']);
        return false;
    }
    
    // Zeitlich konstanten Vergleich für Sicherheit
    return hash_equals($stored['token'], $token);
}

/**
 * Prüfen und Validieren von CSRF-Token aus Anfrage
 * @return bool Ob CSRF-Token gültig ist
 */
function checkCsrfToken() {
    $token = null;
    
    // Zuerst aus Header versuchen
    $headers = getallheaders();
    if (isset($headers['X-CSRF-Token'])) {
        $token = $headers['X-CSRF-Token'];
    }
    
    // Als Nächstes aus POST-Daten
    if (!$token && isset($_POST['csrf_token'])) {
        $token = $_POST['csrf_token'];
    }
    
    // Als Letztes aus GET-Parameter
    if (!$token && isset($_GET['csrf_token'])) {
        $token = $_GET['csrf_token'];
    }
    
    // Wenn kein Token gefunden wurde, schlägt die Validierung fehl
    if (!$token) {
        return false;
    }
    
    return validateCsrfToken($token);
}

/**
 * IP-Adresse des Clients sicher erhalten
 * @return string IP-Adresse
 */
function getClientIP() {
    // Trusted Proxies konfigurieren, falls vorhanden
    $trustedProxies = explode(',', env('TRUSTED_PROXIES', ''));
    
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // X-Forwarded-For kann eine Liste von IPs sein
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($ipList[0]);
        
        // Nur akzeptieren, wenn der direkte Client ein vertrauenswürdiger Proxy ist
        if (!in_array($_SERVER['REMOTE_ADDR'], $trustedProxies)) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    
    return filter_var($ip, FILTER_VALIDATE_IP);
}

// Standardantworttyp setzen
setResponseType();