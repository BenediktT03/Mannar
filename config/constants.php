 <?php
/**
 * Application Constants
 * Central configuration file for application-wide constants
 *
 * This file defines constants used throughout the application to maintain
 * consistency and allow for easy configuration changes in one place.
 */

// Prevent direct access to this file
if (!defined('APP_PATH')) {
    exit('Direct script access is not allowed.');
}

//===========================================
// APPLICATION SETTINGS
//===========================================

// Application environment ('development', 'staging', 'production')
define('APP_ENV', 'development');

// Debug mode (enables detailed error messages, etc.)
define('APP_DEBUG', APP_ENV === 'development');

// Application version (update with each release for cache busting)
define('APP_VERSION', '1.0.3');

// Asset version for cache busting
define('ASSET_VERSION', APP_VERSION);

// Default timezone
date_default_timezone_set('Europe/Berlin');

//===========================================
// PATH SETTINGS
//===========================================

// Base URLs
define('BASE_URL', 'https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
define('ASSETS_URL', BASE_URL . '/assets');
define('API_URL', BASE_URL . '/api');

// Application paths
define('CORE_PATH', APP_PATH . '/core');
define('TEMPLATES_PATH', APP_PATH . '/templates');
define('ASSETS_PATH', APP_PATH . '/assets');
define('CACHE_PATH', APP_PATH . '/data/cache');
define('LOGS_PATH', APP_PATH . '/data/logs');
define('UPLOADS_PATH', APP_PATH . '/data/uploads');
define('MESSAGES_PATH', APP_PATH . '/data/messages');

//===========================================
// FEATURE FLAGS
//===========================================

// Enable specific features
define('ENABLE_WORD_CLOUD', true);
define('ENABLE_CONTACT_FORM', true);
define('ENABLE_CACHING', APP_ENV === 'production');
define('ENABLE_MINIFICATION', APP_ENV === 'production');
define('ENABLE_ANALYTICS', APP_ENV === 'production');
define('ENABLE_DYNAMIC_PAGES', true);

//===========================================
// CONTENT SETTINGS
//===========================================

// Default metadata
define('DEFAULT_META', [
    'title' => 'Mannar - Peer, Genesungsbegeleiter',
    'description' => 'Mannar - Peer und Genesungsbegleiter für psychische Gesundheit.',
    'keywords' => 'Peer, Genesungsbegleiter, psychische Gesundheit, Achtsamkeit, Selbstreflexion',
    'author' => 'Mannar',
    'og_image' => ASSETS_URL . '/img/og-image.jpg'
]);

// Allowed HTML tags for content sanitization
define('ALLOWED_HTML_TAGS', '<p><h1><h2><h3><h4><h5><h6><ul><ol><li><a><strong><em><blockquote><br><div><span><img><figure><figcaption><table><tr><td><th><thead><tbody>');

//===========================================
// EMAIL SETTINGS
//===========================================

// Email configuration
define('EMAIL_CONFIG', [
    'from_email' => 'noreply@example.com',
    'from_name' => 'Mannar Website',
    'contact_email' => 'kontakt@beispiel.de', // Where contact form submissions go
    'reply_to' => 'kontakt@beispiel.de',
    'smtp_host' => 'smtp.example.com',
    'smtp_port' => 587,
    'smtp_user' => 'smtp_username',
    'smtp_pass' => 'smtp_password',
    'smtp_encryption' => 'tls',
]);

//===========================================
// SECURITY SETTINGS
//===========================================

// Security constants
define('CSRF_TOKEN_EXPIRY', 3600); // 1 hour in seconds
define('SESSION_LIFETIME', 86400); // 24 hours in seconds
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_TIMEOUT', 1800); // 30 minutes in seconds

// Security headers
define('SECURITY_HEADERS', [
    'X-Frame-Options' => 'SAMEORIGIN',
    'X-XSS-Protection' => '1; mode=block',
    'X-Content-Type-Options' => 'nosniff',
    'Referrer-Policy' => 'strict-origin-when-cross-origin',
    'Permissions-Policy' => 'camera=(), microphone=(), geolocation=()'
]);

//===========================================
// UPLOAD SETTINGS
//===========================================

// File upload settings
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_UPLOAD_TYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml'
]);

// Cloudinary configuration (if used)
define('CLOUDINARY_CONFIG', [
    'cloud_name' => 'dlegnsmho',
    'api_key' => '811453586293945',
    'api_secret' => 'ygiBwVjmJJNsPmmVJ9lhAUDz9lQ',
    'upload_preset' => 'ml_default'
]);

//===========================================
// VISUALIZATION SETTINGS
//===========================================

// Default styles
define('DEFAULT_STYLES', [
    'colors' => [
        'primary' => '#3498db',
        'primary_dark' => '#2980b9',
        'secondary' => '#2c3e50',
        'accent' => '#e74c3c',
        'text' => '#333333',
        'background' => '#f5f7f9'
    ],
    'typography' => [
        'font_family' => "'Lato', 'Segoe UI', sans-serif",
        'heading_font' => "'Lato', 'Segoe UI', sans-serif",
        'base_font_size' => '16px',
        'line_height' => '1.6'
    ],
    'layout' => [
        'container_width' => '1170px',
        'border_radius' => '4px'
    ]
]);

/**
 * Configure application constants on specific environments
 */
if (APP_ENV === 'development') {
    // Development-specific constants
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    // Production-specific constants
    ini_set('display_errors', 0);
    error_reporting(0);
}