 /**
 * config.js
 * Central configuration for the application
 */

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
  authDomain: "mannar-129a5.firebaseapp.com",
  projectId: "mannar-129a5",
  storageBucket: "mannar-129a5.firebasestorage.app",
  messagingSenderId: "687710492532",
  appId: "1:687710492532:web:c7b675da541271f8d83e21",
  measurementId: "G-NXBLYJ5CXL"
};

// API Endpoints
export const API = {
  UPLOAD: './api/upload.php',
  CONTACT: './api/contact.php'
};

// Default Editor Settings
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
  font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt'
};

// Default Theme Settings
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

// Word Cloud Default Settings
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

// Page Template Definitions
export const PAGE_TEMPLATES = {
  'basic': {
    name: 'Basic Template',
    description: 'Simple page with title and content',
    fields: [
      { type: 'text', name: 'title', label: 'Page Title', required: true },
      { type: 'text', name: 'subtitle', label: 'Subtitle', required: false },
      { type: 'textarea', name: 'content', label: 'Main Content', editor: true, required: false }
    ]
  },
  'text-image': {
    name: 'Text with Image',
    description: 'Text on the left, image on the right',
    fields: [
      { type: 'text', name: 'title', label: 'Page Title', required: true },
      { type: 'text', name: 'subtitle', label: 'Subtitle', required: false },
      { type: 'textarea', name: 'content', label: 'Main Content', editor: true, required: false },
      { type: 'image', name: 'featuredImage', label: 'Featured Image', required: false }
    ]
  },
  'image-text': {
    name: 'Image with Text',
    description: 'Image on the left, text on the right',
    fields: [
      { type: 'text', name: 'title', label: 'Page Title', required: true },
      { type: 'text', name: 'subtitle', label: 'Subtitle', required: false },
      { type: 'image', name: 'featuredImage', label: 'Featured Image', required: false },
      { type: 'textarea', name: 'content', label: 'Main Content', editor: true, required: false }
    ]
  },
  'gallery': {
    name: 'Gallery Page',
    description: 'Display a collection of images in a gallery format',
    fields: [
      { type: 'text', name: 'title', label: 'Gallery Title', required: true },
      { type: 'text', name: 'subtitle', label: 'Gallery Subtitle', required: false },
      { type: 'textarea', name: 'description', label: 'Gallery Description', editor: true, required: false },
      { type: 'gallery', name: 'images', label: 'Gallery Images', required: false }
    ]
  },
  'contact': {
    name: 'Contact Page',
    description: 'Contact information with a contact form',
    fields: [
      { type: 'text', name: 'title', label: 'Contact Page Title', required: true },
      { type: 'text', name: 'subtitle', label: 'Contact Page Subtitle', required: false },
      { type: 'textarea', name: 'introduction', label: 'Introduction Text', editor: true, required: false },
      { type: 'text', name: 'address', label: 'Address', required: false },
      { type: 'text', name: 'email', label: 'Email Address', required: false },
      { type: 'text', name: 'phone', label: 'Phone Number', required: false },
      { type: 'checkbox', name: 'showForm', label: 'Show Contact Form', required: false },
      { type: 'image', name: 'contactImage', label: 'Contact Image/Map', required: false }
    ]
  }
};

// Admin panel tabs configuration
export const ADMIN_TABS = [
  { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
  { id: 'pages', icon: 'fas fa-file-alt', label: 'Pages' },
  { id: 'wordcloud', icon: 'fas fa-cloud', label: 'Word Cloud' },
  { id: 'preview', icon: 'fas fa-eye', label: 'Preview' },
  { id: 'settings', icon: 'fas fa-cog', label: 'Global Settings' }
];

// Define other configuration constants as needed