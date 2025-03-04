const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const app     = express();

// Statischer Ordner für die Website und Bilder
app.use(express.static(path.join(__dirname, 'public')));

// Multer Storage-Konfiguration für lokale Speicherung der Bilder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Bilder im Ordner "public/uploads" speichern
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: (req, file, cb) => {
    // eindeutigen Dateinamen erstellen: z.B. timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const safeName = file.originalname.replace(/\s+/g, '_'); // Leerzeichen entfernen
    cb(null, uniqueSuffix + '-' + safeName);
  }
});
const upload = multer({ storage: storage });

// Route zum Empfangen des Datei-Uploads (POST)
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Datei erfolgreich gespeichert – Dateinamen zurückgeben
  return res.json({ filename: req.file.filename });
});

// Route zum Löschen einer Datei (DELETE)
app.delete('/upload/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename) {
    return res.status(400).json({ error: 'No filename provided' });
  }
  // Sichere den Pfad (keine Directory-Traversal erlauben)
  if (filename.includes('..')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filePath = path.join(__dirname, 'public/uploads', filename);
  fs.unlink(filePath, err => {
    if (err) {
      console.error("Fehler beim Löschen der Datei:", err);
      return res.status(500).json({ error: 'File deletion failed' });
    }
    return res.json({ success: true });
  });
});

// Server starten (Port anpassen, falls nötig)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});