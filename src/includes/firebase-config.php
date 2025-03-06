<?php
/**
 * firebase-config.php
 * Zentralisierte Firebase-Konfiguration für PHP-Komponenten
 */

// Lade Umgebungsvariablen
require_once __DIR__ . '/../config/env.php';

// Firebase-Konfiguration aus Umgebungsvariablen
$firebase_config = getFirebaseConfig(true);

// Erstelle JSON-Version für JavaScript
$firebase_config_json = getFirebaseConfigJson(false);

// PHP Admin Secret (für serverseitige Validierung)
$admin_secret = ADMIN_SECRET; 

/**
 * Erstellt ein JavaScript-Snippet zur Initialisierung von Firebase
 * @return string Der JavaScript-Code
 */
function getFirebaseInitScript() {
    global $firebase_config_json;
    
    return <<<EOT
<script>
  // Zentralisierte Firebase-Konfiguration
  const FIREBASE_CONFIG = {$firebase_config_json};

  // Initialisiere Firebase sicher
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
  } else {
    console.error("Firebase SDK nicht geladen. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.");
  }
</script>
EOT;
}

/**
 * Validiere Authentifizierung und Admin-Berechtigungen
 * Für serverseitige Operationen, die Admin-Rechte erfordern
 * @param string $token Authentifizierungstoken
 * @return bool Ob der Benutzer als Admin authentifiziert ist
 */
function validateAdminToken($token) {
    global $admin_secret;
    
    // In der Produktion gegen Firebase Admin SDK oder Ihr Auth-System validieren
    // Dies ist ein vereinfachtes Beispiel
    if (empty($token)) {
        return false;
    }
    
    // Vergleichen mit Ihrem gespeicherten Admin-Token
    // Diese Methode sollte in einer Produktionsumgebung durch eine sichere
    // Token-Validierung ersetzt werden, vorzugsweise mit Firebase Admin SDK
    try {
        // Vorschlag: JWT-Validierung implementieren
        // $decoded = JWT::decode($token, $admin_secret, ['HS256']);
        // return isset($decoded->role) && $decoded->role === 'admin';
        
        // Vorübergehend den einfachen Vergleich beibehalten
        return $token === $admin_secret;
    } catch (Exception $e) {
        error_log('Token validation error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Hole Firebase-Credentials für serverseitigen API-Zugriff
 * @return array Firebase-Credentials
 */
function getFirebaseServerCredentials() {
    global $firebase_config;
    
    // In der Produktion würden Sie eine Service-Account-JSON-Datei laden
    // Für Service-Account: return json_decode(file_get_contents('path/to/serviceAccountKey.json'), true);
    
    return $firebase_config;
}