/**
 * config.js
 * Zentrale Konfiguration für die Anwendung
 */

// Firebase-Konfiguration - wird durch das PHP-Script dynamisch erzeugt
// Diese leere Konfiguration wird überschrieben, wenn das Script geladen wird
// Siehe src/includes/firebase-config.php -> getFirebaseInitScript()
export const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {};

// API-Endpunkte
export const API = {
  UPLOAD: './api/endpoints/upload.php',
  CONTACT: './api/endpoints/contact.php',
  AUTH: './api/endpoints/auth.php',
  CONTENT: './api/endpoints/content.php'
};

// Standard-Editor-Einstellungen
export const EDITOR_CONFIG = {
  height: 300,
  menubar: true,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | formatselect | fontsizeselect | ' +
    'bold italic backcolor forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | link image | help',
  content_style: 'body { font-family: "Lato", sans-serif; font-size: 16px; }',
  font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt',
  // Sicherheitseinstellungen hinzufügen
  convert_urls: true,          // URLs konvertieren, um relative Pfade zu normalisieren
  relative_urls: false,        // Absolute URLs verwenden statt relativer URLs
  remove_script_host: false,   // Host in URLs beibehalten
  valid_elements: '*[*]',      // Erlaubte HTML-Elemente (kann eingeschränkt werden)
  valid_children: '+body[style]', // Erlaubte Kindelemente
  extended_valid_elements: 'script[src|async|defer|type|charset]', // Zusätzliche gültige Elemente
};

// Standard-Theme-Einstellungen
export const DEFAULT_THEME = {
  colors: {
    primary: '#3498db',
    primaryDark: '#2980b9',
    secondary: '#2c3e50',
    accent: '#e74c3c',
    success: '#2ecc71',
    warning: '#f39c12',
    danger: '#e74c3c',
    light: '#ecf0f1',
    dark: '#34495e',
    text: '#333333'
  },
  typography: {
    fontFamily: "'Lato', sans-serif",
    headingFont: "'Lato', sans-serif",
    baseFontSize: 16,
    lineHeight: 1.6,
    titleSize: 2.5,
    subtitleSize: 1.8
  },
  layout: {
    containerWidth: 1170,
    borderRadius: 4,
    buttonStyle: 'rounded',
    enableAnimations: true
  }
};

// Word Cloud Standard-Einstellungen
export const WORD_CLOUD_DEFAULTS = {
  defaultWords: [
    { text: "Mindfulness", weight: 7, link: "#" },
    { text: "Meditation", weight: 9, link: "#" },
    { text: "Bewusstsein", weight: 6, link: "#" },
    { text: "Achtsamkeit", weight: 8, link: "#" },
    { text: "Spiritualität", weight: 5, link: "#" },
    { text: "Heilung", weight: 7, link: "#" },
    { text: "Persönlichkeit", weight: 6, link: "#" },
    { text: "Reflexion", weight: 8, link: "#" },
    { text: "Wachstum", weight: 5, link: "#" },
    { text: "Psychologie", weight: 9, link: "#" }
  ],
  maxWeight: 9,
  minWeight: 1
};

// Seiten-Template-Definitionen
export const PAGE_TEMPLATES = {
  'basic': {
    name: 'Basic Template',
    description: 'Einfache Seite mit Titel und Inhalt',
    fields: [
      { type: 'text', name: 'title', label: 'Seitentitel', required: true },
      { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
      { type: 'textarea', name: 'content', label: 'Hauptinhalt', editor: true, required: false }
    ]
  },
  'text-image': {
    name: 'Text mit Bild',
    description: 'Text links, Bild rechts',
    fields: [
      { type: 'text', name: 'title', label: 'Seitentitel', required: true },
      { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
      { type: 'textarea', name: 'content', label: 'Hauptinhalt', editor: true, required: false },
      { type: 'image', name: 'featuredImage', label: 'Ausgewähltes Bild', required: false }
    ]
  },
  'image-text': {
    name: 'Bild mit Text',
    description: 'Bild links, Text rechts',
    fields: [
      { type: 'text', name: 'title', label: 'Seitentitel', required: true },
      { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
      { type: 'image', name: 'featuredImage', label: 'Ausgewähltes Bild', required: false },
      { type: 'textarea', name: 'content', label: 'Hauptinhalt', editor: true, required: false }
    ]
  },
  'gallery': {
    name: 'Galerieseite',
    description: 'Zeige eine Sammlung von Bildern im Galerieformat an',
    fields: [
      { type: 'text', name: 'title', label: 'Galerietitel', required: true },
      { type: 'text', name: 'subtitle', label: 'Galerieuntertitel', required: false },
      { type: 'textarea', name: 'description', label: 'Galeriebeschreibung', editor: true, required: false },
      { type: 'gallery', name: 'images', label: 'Galeriebilder', required: false }
    ]
  },
  'contact': {
    name: 'Kontaktseite',
    description: 'Kontaktinformationen mit einem Kontaktformular',
    fields: [
      { type: 'text', name: 'title', label: 'Kontaktseitentitel', required: true },
      { type: 'text', name: 'subtitle', label: 'Kontaktseitenuntertitel', required: false },
      { type: 'textarea', name: 'introduction', label: 'Einführungstext', editor: true, required: false },
      { type: 'text', name: 'address', label: 'Adresse', required: false },
      { type: 'text', name: 'email', label: 'E-Mail-Adresse', required: false },
      { type: 'text', name: 'phone', label: 'Telefonnummer', required: false },
      { type: 'checkbox', name: 'showForm', label: 'Kontaktformular anzeigen', required: false },
      { type: 'image', name: 'contactImage', label: 'Kontaktbild/Karte', required: false }
    ]
  }
};

// Admin-Panel-Tabs-Konfiguration
export const ADMIN_TABS = [
  { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
  { id: 'pages', icon: 'fas fa-file-alt', label: 'Seiten' },
  { id: 'wordcloud', icon: 'fas fa-cloud', label: 'Word Cloud' },
  { id: 'preview', icon: 'fas fa-eye', label: 'Vorschau' },
  { id: 'settings', icon: 'fas fa-cog', label: 'Globale Einstellungen' }
];

// API-Endpunkte-Konfiguration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API.AUTH}?action=login`,
    LOGOUT: `${API.AUTH}?action=logout`,
    VALIDATE: `${API.AUTH}?action=validate`,
    REFRESH: `${API.AUTH}?action=refresh`
  },
  CONTENT: {
    GET: (type, id = '') => `${API.CONTENT}?action=get&type=${type}${id ? '&id=' + id : ''}`,
    LIST: (type) => `${API.CONTENT}?action=list&type=${type}`,
    UPDATE: (type, id = '') => `${API.CONTENT}?action=update&type=${type}${id ? '&id=' + id : ''}`,
    DELETE: (type, id) => `${API.CONTENT}?action=delete&type=${type}&id=${id}`,
    PUBLISH: `${API.CONTENT}?action=publish`
  },
  UPLOAD: API.UPLOAD
};

// Sicherheitseinstellungen
export const SECURITY_CONFIG = {
  tokenRefreshInterval: 1800000, // 30 Minuten in Millisekunden
  sessionTimeout: 3600000, // 1 Stunde in Millisekunden
  maxLoginAttempts: 5,
  lockoutTime: 300000 // 5 Minuten in Millisekunden
};