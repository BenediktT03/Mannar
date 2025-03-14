<?php
$htaccessPath = $_SERVER['DOCUMENT_ROOT'] . '/public/htaccess.txt';

if (file_exists($htaccessPath)) {
    echo "✅ Die Datei existiert!<br>";
    echo "📄 Inhalt:<br>";
    echo nl2br(htmlspecialchars(file_get_contents($htaccessPath)));
} else {
    echo "❌ Fehler: Die Datei wurde nicht gefunden.";
}
?>