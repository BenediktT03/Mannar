<?php
// Fehlerbehandlung aktivieren
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Initialisierung
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true); // Verzeichnis erstellen, falls nicht existiert
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        // Eindeutigen Dateinamen basierend auf der Zeit erstellen
        $filename = time() . '-' . basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $filename;

        // Datei an den Zielpfad verschieben
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            echo json_encode(['status' => 'success', 'filename' => $filename]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Fehler beim Speichern der Datei']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Keine Datei hochgeladen']);
    }
} else {
    echo json_encode(['error' => 'Ungültige Anfrage']);
}
?>
