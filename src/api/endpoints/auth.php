<?php
/**
 * auth.php
 * Behandelt authentifizierungsbezogene API-Endpunkte mit verbesserten Sicherheitsmaßnahmen
 */

// Erforderliche Dateien einbinden
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../../config/env.php';

// CORS-Header setzen
setCorsHeaders();

// Anfragemethode und Aktion abrufen
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : 'login';

// OPTIONS Preflight-Anfrage behandeln
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Basierend auf Aktion verarbeiten
try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
            
        case 'logout':
            handleLogout();
            break;
            
        case 'validate':
            validateToken();
            break;
            
        case 'refresh':
            refreshToken();
            break;
            
        case 'reset-password':
            handlePasswordReset();
            break;
            
        default:
            sendJsonError('Unbekannte Auth-Aktion', 400);
    }
} catch (Exception $e) {
    sendJsonError('Fehler: ' . $e->getMessage(), 500);
}

/**
 * Behandelt Benutzeranmeldung mit Rate-Limiting
 */
function handleLogin() {
    // Nur POST-Methode für Login erlaubt
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Methode nicht erlaubt', 405);
    }
    
    // Request-Body abrufen
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Erforderliche Felder prüfen
    $validation = validateRequiredFields(['email', 'password'], $data);
    if ($validation !== true) {
        sendJsonError($validation, 400);
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    
    // E-Mail-Format validieren
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJsonError('Ungültiges E-Mail-Format', 400);
    }
    
    // Rate-Limiting implementieren
    $clientIp = $_SERVER['REMOTE_ADDR'];
    $now = time();
    $rateLimitKey = 'login_attempts_' . md5($clientIp . '_' . $email);
    
    // Bestehende Anmeldeversuche abrufen
    $attempts = getLoginAttempts($rateLimitKey);
    
    // Maximale Anmeldeversuche prüfen (5 Versuche innerhalb von 5 Minuten)
    if ($attempts['count'] >= 5 && ($now - $attempts['last_attempt']) < 300) {
        $timeLeft = 300 - ($now - $attempts['last_attempt']);
        sendJsonError('Zu viele Anmeldeversuche. Bitte versuchen Sie es in ' . ceil($timeLeft / 60) . ' Minuten erneut.', 429);
    }
    
    // Anmeldeversuch aktualisieren
    updateLoginAttempts($rateLimitKey, $now, ($attempts['count'] + 1));
    
    // In einer echten Anwendung Firebase Admin SDK zur Authentifizierung verwenden
    // Hier verwenden wir ein vereinfachtes Beispiel mit Umgebungsvariablen
    
    // Admin-Benutzer aus Umgebungsvariablen (in Produktion Firebase Admin SDK verwenden)
    $adminEmail = env('ADMIN_EMAIL', 'admin@example.com');
    $adminPasswordHash = env('ADMIN_PASSWORD_HASH', password_hash('admin123', PASSWORD_DEFAULT));
    
    // Anmeldung prüfen
    if ($email === $adminEmail && password_verify($password, $adminPasswordHash)) {
        // Token generieren
        $token = generateJWT([
            'email' => $email,
            'role' => 'admin',
            'exp' => time() + 3600, // 1 Stunde Gültigkeit
            'iat' => time()
        ]);
        
        // Refresh-Token generieren
        $refreshToken = bin2hex(random_bytes(32));
        
        // In Produktion: Refresh-Token in der Datenbank speichern
        // storeRefreshToken($email, $refreshToken, time() + 86400); // 24 Stunden Gültigkeit
        
        // Anmeldeversuche zurücksetzen
        resetLoginAttempts($rateLimitKey);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Anmeldung erfolgreich',
            'token' => $token,
            'refreshToken' => $refreshToken,
            'user' => [
                'email' => $email,
                'role' => 'admin'
            ]
        ]);
    } else {
        // Fehlgeschlagener Anmeldeversuch
        sendJsonError('Ungültige Anmeldedaten', 401);
    }
}

/**
 * Behandelt Benutzerabmeldung
 */
function handleLogout() {
    // Nur POST-Methode für Abmeldung erlaubt
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Methode nicht erlaubt', 405);
    }
    
    // Autorisierungs-Header abrufen
    $token = getBearerToken();
    
    if (!$token) {
        sendJsonError('Kein Auth-Token bereitgestellt', 401);
    }
    
    // In einer echten App: Token im Token-Store ungültig machen
    // Hier geben wir einfach eine Erfolgsmeldung zurück
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Abmeldung erfolgreich'
    ]);
}

/**
 * Authentifizierungstoken validieren
 */
function validateToken() {
    // Autorisierungs-Header abrufen
    $token = getBearerToken();
    
    if (!$token) {
        sendJsonError('Kein Auth-Token bereitgestellt', 401);
    }
    
    // Token validieren
    try {
        $decoded = verifyJWT($token);
        
        if ($decoded) {
            sendJsonResponse([
                'success' => true,
                'valid' => true,
                'role' => $decoded['role'] ?? 'user',
                'email' => $decoded['email'] ?? '',
                'exp' => $decoded['exp'] ?? 0
            ]);
        } else {
            sendJsonError('Ungültiges Token', 401);
        }
    } catch (Exception $e) {
        sendJsonError('Token-Validierungsfehler: ' . $e->getMessage(), 401);
    }
}

/**
 * Authentifizierungstoken aktualisieren
 */
function refreshToken() {
    // Nur POST-Methode für Token-Aktualisierung erlaubt
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Methode nicht erlaubt', 405);
    }
    
    // Request-Body abrufen
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Erforderliche Felder prüfen
    if (!isset($data['refreshToken']) || empty($data['refreshToken'])) {
        sendJsonError('Refresh-Token ist erforderlich', 400);
    }
    
    $refreshToken = $data['refreshToken'];
    
    // In einer echten Anwendung: Refresh-Token validieren und neues Auth-Token generieren
    
    // Für Demo: Ein neues Token für den Admin zurückgeben
    // In Produktion: Validierung gegen Datenbank
    if (strlen($refreshToken) === 64) {
        $adminEmail = env('ADMIN_EMAIL', 'admin@example.com');
        
        $token = generateJWT([
            'email' => $adminEmail,
            'role' => 'admin',
            'exp' => time() + 3600, // 1 Stunde Gültigkeit
            'iat' => time()
        ]);
        
        sendJsonResponse([
            'success' => true,
            'token' => $token
        ]);
    } else {
        sendJsonError('Ungültiges Refresh-Token', 401);
    }
}

/**
 * Passwort-Zurücksetzung behandeln
 */
function handlePasswordReset() {
    // Nur POST-Methode für Passwort-Zurücksetzung erlaubt
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Methode nicht erlaubt', 405);
    }
    
    // Request-Body abrufen
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Erforderliche Felder prüfen
    if (!isset($data['email']) || empty($data['email'])) {
        sendJsonError('E-Mail ist erforderlich', 400);
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    
    // E-Mail-Format validieren
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJsonError('Ungültiges E-Mail-Format', 400);
    }
    
    // In einer echten Anwendung: Passwort-Zurücksetzungs-E-Mail mit Firebase senden
    // Für Demo: Einfach mit Erfolgsmeldung antworten
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Passwort-Zurücksetzungs-E-Mail gesendet'
    ]);
}

/**
 * Bearer-Token aus Autorisierungs-Header abrufen
 * @return string|null Das Token oder null, wenn nicht gefunden
 */
function getBearerToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Token extrahieren
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}

/**
 * Anmeldeversuche aus dem Session-Speicher abrufen
 * @param string $key Schlüssel für Anmeldeversuche
 * @return array Anmeldeversuche (count und last_attempt)
 */
function getLoginAttempts($key) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION[$key])) {
        return ['count' => 0, 'last_attempt' => 0];
    }
    
    return $_SESSION[$key];
}

/**
 * Anmeldeversuche im Session-Speicher aktualisieren
 * @param string $key Schlüssel für Anmeldeversuche
 * @param int $timestamp Zeitstempel des letzten Versuchs
 * @param int $count Anzahl der Versuche
 */
function updateLoginAttempts($key, $timestamp, $count) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $_SESSION[$key] = [
        'count' => $count,
        'last_attempt' => $timestamp
    ];
}

/**
 * Anmeldeversuche zurücksetzen
 * @param string $key Schlüssel für Anmeldeversuche
 */
function resetLoginAttempts($key) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (isset($_SESSION[$key])) {
        unset($_SESSION[$key]);
    }
}

/**
 * Ein JWT (JSON Web Token) generieren
 * @param array $payload Token-Payload
 * @return string Generiertes Token
 */
function generateJWT($payload) {
    $secret = ADMIN_SECRET;
    
    // Header
    $header = json_encode([
        'alg' => 'HS256',
        'typ' => 'JWT'
    ]);
    
    // Payload
    $payload = json_encode($payload);
    
    // Base64Url-Kodierung
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    // Signatur erstellen
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // JWT zusammensetzen
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * JWT (JSON Web Token) verifizieren
 * @param string $token JWT-Token
 * @return array|false Decodierter Payload oder false bei ungültigem Token
 */
function verifyJWT($token) {
    $secret = ADMIN_SECRET;
    
    // Token aufteilen
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) {
        return false;
    }
    
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $tokenParts;
    
    // Signatur überprüfen
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }
    
    // Payload decodieren
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    
    // Ablaufzeit überprüfen
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false; // Token ist abgelaufen
    }
    
    return $payload;
}