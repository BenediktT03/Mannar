 <?php
/**
 * CsrfProtection.php
 * Implementiert CSRF-Schutz für Formulare und AJAX-Anfragen
 */

class CsrfProtection {
    // Token-Aufbewahrungszeit in Sekunden (2 Stunden)
    const TOKEN_EXPIRY = 7200;
    
    // Name des CSRF-Tokens in Session und Cookies
    const TOKEN_NAME = 'csrf_token';
    
    /**
     * Generiert ein neues CSRF-Token und speichert es in der Session
     *
     * @return string Das generierte Token
     */
    public static function generateToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Sicheres zufälliges Token generieren
        $token = bin2hex(random_bytes(32));
        
        // Token in Session speichern mit Ablaufzeit
        $_SESSION[self::TOKEN_NAME] = [
            'token' => $token,
            'expiry' => time() + self::TOKEN_EXPIRY
        ];
        
        return $token;
    }
    
    /**
     * Generiert ein verstecktes Formularfeld mit dem CSRF-Token
     *
     * @return string HTML für das versteckte Formularfeld
     */
    public static function tokenField() {
        $token = self::getToken();
        return '<input type="hidden" name="' . self::TOKEN_NAME . '" value="' . htmlspecialchars($token) . '">';
    }
    
    /**
     * Generiert ein CSRF-Meta-Tag für AJAX-Anfragen
     *
     * @return string HTML für das Meta-Tag
     */
    public static function metaTag() {
        $token = self::getToken();
        return '<meta name="csrf-token" content="' . htmlspecialchars($token) . '">';
    }
    
    /**
     * Gibt das aktuelle Token zurück oder generiert ein neues, wenn keines existiert
     *
     * @return string Das aktuelle CSRF-Token
     */
    public static function getToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Prüfen, ob ein gültiges Token existiert
        if (self::hasValidToken()) {
            return $_SESSION[self::TOKEN_NAME]['token'];
        }
        
        // Neues Token generieren, wenn keines existiert oder abgelaufen ist
        return self::generateToken();
    }
    
    /**
     * Prüft, ob ein gültiges Token in der Session existiert
     *
     * @return bool True, wenn ein gültiges Token existiert
     */
    public static function hasValidToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION[self::TOKEN_NAME])) {
            return false;
        }
        
        $stored = $_SESSION[self::TOKEN_NAME];
        
        // Prüfen, ob das Token abgelaufen ist
        if (!isset($stored['expiry']) || $stored['expiry'] < time()) {
            unset($_SESSION[self::TOKEN_NAME]);
            return false;
        }
        
        return true;
    }
    
    /**
     * Validiert ein gesendetes Token gegen das in der Session gespeicherte
     *
     * @param string|null $token Das zu validierende Token (oder null, um aus $_POST oder $_GET zu lesen)
     * @return bool True, wenn das Token gültig ist
     */
    public static function validateToken($token = null) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Wenn kein Token übergeben wurde, aus POST, GET oder Header lesen
        if ($token === null) {
            $token = self::getSubmittedToken();
        }
        
        if (!$token || !self::hasValidToken()) {
            return false;
        }
        
        // Zeitlich konstanter Vergleich für Sicherheit
        return hash_equals($_SESSION[self::TOKEN_NAME]['token'], $token);
    }
    
    /**
     * Holt das gesendete Token aus verschiedenen Quellen
     *
     * @return string|null Das gesendete Token oder null
     */
    public static function getSubmittedToken() {
        // Aus POST-Daten
        if (isset($_POST[self::TOKEN_NAME])) {
            return $_POST[self::TOKEN_NAME];
        }
        
        // Aus GET-Parameter
        if (isset($_GET[self::TOKEN_NAME])) {
            return $_GET[self::TOKEN_NAME];
        }
        
        // Aus HTTP-Header für AJAX-Anfragen
        $headers = getallheaders();
        if (isset($headers['X-CSRF-Token'])) {
            return $headers['X-CSRF-Token'];
        }
        
        // Aus Cookie (als Fallback)
        if (isset($_COOKIE[self::TOKEN_NAME])) {
            return $_COOKIE[self::TOKEN_NAME];
        }
        
        return null;
    }
    
    /**
     * Setzt ein CSRF-Token-Cookie für JavaScript-Zugriff
     *
     * @param bool $httpOnly Ob das Cookie nur über HTTP zugänglich sein soll
     * @return bool Erfolgsstatus
     */
    public static function setCookie($httpOnly = false) {
        $token = self::getToken();
        
        // Sichere Cookie-Einstellungen
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        
        // Cookie setzen
        return setcookie(
            self::TOKEN_NAME,
            $token,
            [
                'expires' => time() + self::TOKEN_EXPIRY,
                'path' => '/',
                'domain' => '',
                'secure' => $secure,
                'httponly' => $httpOnly,
                'samesite' => 'Lax' // 'Strict' für strengere Sicherheit, aber weniger benutzerfreundlich
            ]
        );
    }
    
    /**
     * Fügt CSRF-Schutz zu einem Formular hinzu
     *
     * @param string $formHtml Das HTML des Formulars
     * @return string Das modifizierte Formular-HTML mit CSRF-Token
     */
    public static function protectForm($formHtml) {
        // Das Token-Feld direkt nach dem öffnenden <form>-Tag einfügen
        $pattern = '/(<form[^>]*>)/i';
        $replacement = '$1' . self::tokenField();
        
        return preg_replace($pattern, $replacement, $formHtml);
    }
}