<?php
/**
 * upload.php
 * Verbesserter und sicherer Datei-Upload-Handler
 */

// Erforderliche Dateien einbinden
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../../config/env.php';

// Inhaltstyp setzen
header('Content-Type: application/json');

// CORS für gleichen Ursprung aktivieren
setCorsHeaders();

// Handle options request (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Authentifizierung prüfen (für Admin-Uploads)
$isAdmin = false;
$token = getBearerToken();
if ($token) {
    // Nur teure Validierung durchführen, wenn ein Token vorhanden ist
    $isAdmin = validateAdminToken($token);
}

// Prüfen, ob dies eine POST-Anfrage ist
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonError('Methode nicht erlaubt', 405);
    exit;
}

// CSRF-Schutz aktivieren
if (!DEBUG_MODE && !$isAdmin && !checkCsrfToken()) {
    sendJsonError('Ungültiges CSRF-Token', 403);
    exit;
}

// Prüfen, ob eine Datei hochgeladen wurde
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error_msg = isset($_FILES['image']) ? 'Upload-Fehler: ' . getUploadErrorMessage($_FILES['image']['error']) : 'Kein Bild hochgeladen';
    sendJsonError($error_msg, 400);
    exit;
}

// Konfiguration
$upload_dir = defined('UPLOAD_DIR') ? UPLOAD_DIR : '../uploads/';
$allowed_types = defined('UPLOAD_ALLOWED_TYPES') ? UPLOAD_ALLOWED_TYPES : ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
$max_file_size = defined('UPLOAD_MAX_SIZE') ? UPLOAD_MAX_SIZE : 5 * 1024 * 1024; // 5MB

// Datei-Informationen
$file = $_FILES['image'];
$file_type = $file['type'];
$file_size = $file['size'];
$file_tmp = $file['tmp_name'];
$file_name = $file['name'];

// Tiefere MIME-Typ-Überprüfung mit finfo
$finfo = new finfo(FILEINFO_MIME_TYPE);
$file_mime = $finfo->file($file_tmp);

// MIME-Typ validieren
if (!in_array($file_mime, $allowed_types)) {
    sendJsonError('Nicht unterstützter Dateityp. Nur JPEG, PNG, GIF und SVG sind erlaubt.', 400);
    exit;
}

// Dateigröße prüfen
if ($file_size > $max_file_size) {
    sendJsonError('Datei ist zu groß. Maximale Größe: ' . formatFileSize($max_file_size) . '.', 400);
    exit;
}

// Prüfen Sie SVG-Dateien auf Sicherheitsrisiken (XSS, JS-Ausführung)
if ($file_mime === 'image/svg+xml') {
    $svg_content = file_get_contents($file_tmp);
    if (isMaliciousSvg($svg_content)) {
        sendJsonError('SVG-Datei enthält potenziell unsicheren Inhalt.', 400);
        exit;
    }
}

// Upload-Verzeichnis erstellen, falls es nicht existiert
if (!file_exists($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        sendJsonError('Fehler beim Erstellen des Upload-Verzeichnisses', 500);
        exit;
    }
}

// Prüfen Sie die Schreibberechtigung
if (!is_writable($upload_dir)) {
    sendJsonError('Keine Schreibberechtigung im Upload-Verzeichnis', 500);
    exit;
}

// Sicheren Dateinamen generieren
$timestamp = time();
$random = mt_rand(1000, 9999);
$original_name = pathinfo($file_name, PATHINFO_FILENAME);
$extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

// Dateinamen bereinigen
$original_name = preg_replace('/[^a-zA-Z0-9_-]/', '', $original_name);
$original_name = str_replace(' ', '_', $original_name);
$original_name = substr($original_name, 0, 50); // Länge begrenzen

// Endgültigen Dateinamen erstellen
$filename = $timestamp . '_' . $random . '_' . $original_name . '.' . $extension;
$destination = $upload_dir . $filename;

// Versuchen Sie, die Datei zu verschieben und zu sichern
if (move_uploaded_file($file_tmp, $destination)) {
    chmod($destination, 0644); // Richtige Berechtigungen setzen
    
    // Bild optimieren, wenn möglich
    optimizeImage($destination, $file_mime);
    
    // URL generieren
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $base_path = dirname($_SERVER['PHP_SELF'], 3); // Pfad zur Basisverzeichnis (3 Ebenen hoch)
    $upload_path = ltrim(str_replace('\\', '/', str_replace(realpath($_SERVER['DOCUMENT_ROOT']), '', realpath($upload_dir))), '/');
    $file_url = $protocol . '://' . $host . '/' . $upload_path . '/' . $filename;
    
    // Erfolgsantwort zurückgeben
    sendJsonResponse([
        'success' => true,
        'filename' => $filename,
        'url' => $file_url,
        'mime_type' => $file_mime,
        'size' => $file_size,
        'uploaded_at' => date('Y-m-d H:i:s')
    ]);
} else {
    sendJsonError('Fehler beim Speichern der Datei. Bitte versuchen Sie es erneut.', 500);
}

/**
 * Upload-Fehlermeldung basierend auf dem Fehlercode erhalten
 * @param int $error_code PHP-Upload-Fehlercode
 * @return string Benutzerfreundliche Fehlermeldung
 */
function getUploadErrorMessage($error_code) {
    switch ($error_code) {
        case UPLOAD_ERR_INI_SIZE:
            return 'Die hochgeladene Datei überschreitet die upload_max_filesize-Direktive in php.ini.';
        case UPLOAD_ERR_FORM_SIZE:
            return 'Die hochgeladene Datei überschreitet die MAX_FILE_SIZE-Direktive im HTML-Formular.';
        case UPLOAD_ERR_PARTIAL:
            return 'Die Datei wurde nur teilweise hochgeladen.';
        case UPLOAD_ERR_NO_FILE:
            return 'Es wurde keine Datei hochgeladen.';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Temporärer Ordner fehlt.';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Fehler beim Schreiben der Datei auf die Festplatte.';
        case UPLOAD_ERR_EXTENSION:
            return 'Eine PHP-Erweiterung hat den Datei-Upload gestoppt.';
        default:
            return 'Unbekannter Upload-Fehler.';
    }
}

/**
 * Dateigröße formatieren
 * @param int $bytes Größe in Bytes
 * @return string Formatierte Größe
 */
function formatFileSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    
    return round($bytes, 2) . ' ' . $units[$pow];
}

/**
 * Prüfen, ob eine SVG-Datei potenziell schädlich ist
 * @param string $content SVG-Dateiinhalt
 * @return bool True, wenn SVG potenziell schädlich ist
 */
function isMaliciousSvg($content) {
    // Liste verbotener Elemente und Attribute
    $dangerous_elements = ['script', 'foreignObject', 'iframe', 'use', 'embed'];
    $dangerous_attributes = ['onload', 'onerror', 'onclick', 'onmouseover', 'eval', 'javascript'];
    
    // Auf schädliche Elemente prüfen
    foreach ($dangerous_elements as $element) {
        if (preg_match('/<\s*' . $element . '[^>]*>/i', $content)) {
            return true;
        }
    }
    
    // Auf schädliche Attribute prüfen
    foreach ($dangerous_attributes as $attribute) {
        if (preg_match('/' . $attribute . '\s*=/i', $content)) {
            return true;
        }
    }
    
    // Auf JavaScript-URLs prüfen
    if (preg_match('/javascript\s*:/i', $content)) {
        return true;
    }
    
    // Auf Data-URLs prüfen
    if (preg_match('/data\s*:[^,]*base64/i', $content)) {
        return true;
    }
    
    return false;
}

/**
 * Bild optimieren, wenn möglich
 * @param string $file_path Dateipfad
 * @param string $mime_type MIME-Typ der Datei
 */
function optimizeImage($file_path, $mime_type) {
    // Nur optimieren, wenn die Erweiterungen verfügbar sind
    if (!extension_loaded('gd') && !extension_loaded('imagick')) {
        return;
    }
    
    // Für JPEG und PNG optimieren
    switch ($mime_type) {
        case 'image/jpeg':
            if (extension_loaded('imagick')) {
                try {
                    $image = new Imagick($file_path);
                    $image->setImageCompression(Imagick::COMPRESSION_JPEG);
                    $image->setImageCompressionQuality(85);
                    $image->stripImage(); // Metadaten entfernen
                    $image->writeImage($file_path);
                    $image->clear();
                } catch (Exception $e) {
                    // Fallback zu GD
                    optimizeWithGd($file_path, $mime_type);
                }
            } else {
                optimizeWithGd($file_path, $mime_type);
            }
            break;
            
        case 'image/png':
            if (extension_loaded('imagick')) {
                try {
                    $image = new Imagick($file_path);
                    $image->setImageCompression(Imagick::COMPRESSION_ZIP);
                    $image->setImageCompressionQuality(95);
                    $image->stripImage(); // Metadaten entfernen
                    $image->writeImage($file_path);
                    $image->clear();
                } catch (Exception $e) {
                    // Fallback zu GD
                    optimizeWithGd($file_path, $mime_type);
                }
            } else {
                optimizeWithGd($file_path, $mime_type);
            }
            break;
    }
}

/**
 * Bild mit GD-Bibliothek optimieren
 * @param string $file_path Dateipfad
 * @param string $mime_type MIME-Typ der Datei
 */
function optimizeWithGd($file_path, $mime_type) {
    if (!extension_loaded('gd')) {
        return;
    }
    
    list($width, $height) = getimagesize($file_path);
    
    // Bild laden basierend auf MIME-Typ
    switch ($mime_type) {
        case 'image/jpeg':
            $image = imagecreatefromjpeg($file_path);
            break;
        case 'image/png':
            $image = imagecreatefrompng($file_path);
            break;
        default:
            return;
    }
    
    if (!$image) {
        return;
    }
    
    // Ausgabebild erstellen
    $output = imagecreatetruecolor($width, $height);
    
    // Transparenz für PNG beibehalten
    if ($mime_type === 'image/png') {
        imagealphablending($output, false);
        imagesavealpha($output, true);
        $transparent = imagecolorallocatealpha($output, 255, 255, 255, 127);
        imagefilledrectangle($output, 0, 0, $width, $height, $transparent);
    }
    
    // Bild kopieren
    imagecopyresampled($output, $image, 0, 0, 0, 0, $width, $height, $width, $height);
    
    // Bild speichern
    switch ($mime_type) {
        case 'image/jpeg':
            imagejpeg($output, $file_path, 85);
            break;
        case 'image/png':
            imagepng($output, $file_path, 6);
            break;
    }
    
    // Speicher freigeben
    imagedestroy($image);
    imagedestroy($output);
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