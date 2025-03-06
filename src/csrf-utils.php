 <?php
/**
 * Einfache CSRF-Schutzfunktionen ohne Session-Abhängigkeit
 */

// Generiere ein Token für einen bestimmten Zeitraum (24h)
function generateCsrfToken() {
    $salt = 'mannar-csrf-protection'; // Ändere diesen Wert für jede Website
    $today = date('Y-m-d'); // Tag als Basis
    $token = hash('sha256', $salt . $today);
    return $token;
}

// Prüfe ob ein Token gültig ist
function verifyCsrfToken($token) {
    $validToken = generateCsrfToken();
    return hash_equals($validToken, $token);
}
?>