<?php
/**
 * Application Constants
 * 
 * Defines application-wide constants and settings
 * that are used throughout the Mannar website.
 */

// Application information
define('APP_NAME', 'Mannar');
define('APP_DESCRIPTION', 'Peer und Genesungsbegleiter');
define('APP_AUTHOR', 'Mannar');
define('APP_EMAIL', 'kontakt@mannar.example.com');

// Social media links
define('SOCIAL_MEDIA', [
    'facebook' => 'https://facebook.com/mannar',
    'instagram' => 'https://instagram.com/mannar',
    'twitter' => 'https://twitter.com/mannar',
    'linkedin' => 'https://linkedin.com/company/mannar'
]);

// Content templates
define('PAGE_TEMPLATES', [
    'basic' => [
        'name' => 'Grundlegende Seite',
        'description' => 'Einfache Textseite ohne besondere Formatierung',
        'fields' => ['title', 'subtitle', 'content']
    ],
    'text-image' => [
        'name' => 'Text mit Bild',
        'description' => 'Textinhalt mit einem Bild auf der rechten Seite',
        'fields' => ['title', 'subtitle', 'content', 'featuredImage']
    ],
    'image-text' => [
        'name' => 'Bild mit Text',
        'description' => 'Bild auf der linken Seite mit Textinhalt rechts',
        'fields' => ['title', 'subtitle', 'content', 'featuredImage']
    ],
    'gallery' => [
        'name' => 'Bildergalerie',
        'description' => 'Seite mit einer Bildergalerie',
        'fields' => ['title', 'subtitle', 'description', 'images']
    ],
    'landing' => [
        'name' => 'Landingpage',
        'description' => 'Landingpage mit Held-Bereich und Features',
        'fields' => ['title', 'subtitle', 'content', 'heroImage', 'featuresTitle', 'features', 'ctaText', 'ctaButtonText', 'ctaButtonLink']
    ],
    'portfolio' => [
        'name' => 'Portfolio',
        'description' => 'Zeigt eine Sammlung von Projekten oder Angeboten',
        'fields' => ['title', 'subtitle', 'introduction', 'projects']
    ],
    'contact' => [
        'name' => 'Kontaktseite',
        'description' => 'Kontaktinformationen und Formular',
        'fields' => ['title', 'subtitle', 'introduction', 'address', 'email', 'phone', 'contactImage', 'showForm']
    ],
    'blog' => [
        'name' => 'Blogbeitrag',
        'description' => 'Formatierter Blogbeitrag mit Metadaten',
        'fields' => ['title', 'subtitle', 'author', 'date', 'categories', 'featuredImage', 'excerpt', 'content']
    ]
]);

// Error messages
define('ERROR_MESSAGES', [
    'db_connection' => 'Datenbankverbindung fehlgeschlagen. Bitte versuchen Sie es später erneut.',
    'page_not_found' => 'Die angeforderte Seite wurde nicht gefunden.',
    'server_error' => 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    'unauthorized' => 'Sie sind nicht berechtigt, auf diese Ressource zuzugreifen.',
    'invalid_input' => 'Die eingegebenen Daten sind ungültig.',
    'csrf_error' => 'CSRF-Token-Validierung fehlgeschlagen. Bitte laden Sie die Seite neu und versuchen Sie es erneut.',
    'upload_error' => 'Fehler beim Hochladen der Datei.',
    'file_size_error' => 'Die Datei ist zu groß. Die maximale Dateigröße beträgt {size}.',
    'file_type_error' => 'Dateityp nicht unterstützt. Erlaubte Typen: {types}.'
]);

// Admin panel settings
define('ADMIN_SETTINGS', [
    'session_timeout' => 1800, // 30 minutes
    'max_login_attempts' => 5,
    'lockout_time' => 900, // 15 minutes
    'password_reset_expiry' => 86400, // 24 hours
    'items_per_page' => 10
]);

// Validation rules
define('VALIDATION_RULES', [
    'email' => [
        'pattern' => '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
        'message' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
    ],
    'password' => [
        'min_length' => 8,
        'require_uppercase' => true,
        'require_lowercase' => true,
        'require_number' => true,
        'require_special' => true,
        'message' => 'Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.'
    ],
    'phone' => [
        'pattern' => '/^[0-9+\s()-]{8,20}$/',
        'message' => 'Bitte geben Sie eine gültige Telefonnummer ein.'
    ]
]);

// Default SEO settings
define('SEO_DEFAULTS', [
    'title_separator' => ' | ',
    'meta_description' => 'Mannar bietet Begleitung und Unterstützung auf dem Weg zu psychischer Gesundheit und persönlichem Wachstum.',
    'meta_keywords' => 'Peer, Genesungsbegleiter, psychische Gesundheit, Achtsamkeit, Selbstreflexion',
    'og_image' => '/assets/img/og-image.jpg',
    'twitter_card' => 'summary_large_image',
    'author' => 'Mannar'
]);