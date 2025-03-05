<?php
// Einfaches Upload-Script für W3Schools Space
header('Content-Type: application/json');

// Konfiguration
$upload_dir = '../uploads/';
$allowed_types = array('image/jpeg', 'image/png', 'image/gif', 'image/svg+xml');
$max_file_size = 5 * 1024 * 1024; // 5MB

// Prüfen, ob Uploads-Ordner existiert; falls nicht, erstellen
if (!file_exists($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        echo json_encode([
            'success' => false,
            'error' => 'Uploads-Verzeichnis konnte nicht erstellt werden'
        ]);
        exit;
    }
}

// Prüfen, ob ein Bild hochgeladen wurde
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error_msg = isset($_FILES['image']) ? 'Upload-Fehler: ' . $_FILES['image']['error'] : 'Kein Bild hochgeladen';
    echo json_encode([
        'success' => false,
        'error' => $error_msg
    ]);
    exit;
}

// Datei-Informationen
$file = $_FILES['image'];
$file_type = $file['type'];
$file_size = $file['size'];
$file_tmp = $file['tmp_name'];

// Überprüfen des Dateityps
if (!in_array($file_type, $allowed_types)) {
    echo json_encode([
        'success' => false,
        'error' => 'Nicht unterstützter Dateityp. Erlaubt sind nur JPEG, PNG, GIF und SVG.'
    ]);
    exit;
}

// Überprüfen der Dateigröße
if ($file_size > $max_file_size) {
    echo json_encode([
        'success' => false,
        'error' => 'Die Datei ist zu groß. Maximale Größe: 5MB.'
    ]);
    exit;
}

// Eindeutigen Dateinamen generieren
$timestamp = time();
$random = mt_rand(1000, 9999);
$original_name = pathinfo($file['name'], PATHINFO_FILENAME);
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);

// Dateinamen säubern (keine Sonderzeichen, Leerzeichen durch Unterstriche ersetzen)
$original_name = preg_replace('/[^a-zA-Z0-9_-]/', '', $original_name);
$original_name = str_replace(' ', '_', $original_name);

// Finalen Dateinamen erstellen
$filename = $timestamp . '_' . $random . '_' . $original_name . '.' . $extension;
$destination = $upload_dir . $filename;

// Hochgeladene Datei in das Zielverzeichnis verschieben
if (move_uploaded_file($file_tmp, $destination)) {
    // Erfolg - URL zur hochgeladenen Datei zurückgeben
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $base_url = $protocol . '://' . $host;
    $file_url = $base_url . '/uploads/' . $filename;
    
    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'url' => $file_url
    ]);
} else {
    // Fehler beim Verschieben der Datei
    echo json_encode([
        'success' => false,
        'error' => 'Fehler beim Speichern der Datei.'
    ]);
}