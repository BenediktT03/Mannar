<?php
/**
 * Application Configuration
 * 
 * Central configuration file for the Mannar website that defines
 * application-wide settings, feature toggles, and environment variables.
 */

// Basic application settings
define('APP_NAME', 'Mannar');
define('APP_VERSION', '1.0.3');
define('DEBUG_MODE', true); // Set to false in production

// Path constants
define('APP_PATH', realpath(__DIR__ . '/../'));
define('SRC_PATH', APP_PATH . '/src');
define('TEMPLATES_PATH', SRC_PATH . '/templates');
define('PUBLIC_PATH', APP_PATH . '/public');
define('UPLOAD_DIR', PUBLIC_PATH . '/uploads');
define('ASSET_PATH', './assets'); // Path for frontend assets

// URL constants
define('BASE_URL', 'https://mannar.example.com'); // Change in production
define('API_URL', BASE_URL . '/api');

// Asset versioning for cache busting
define('ASSET_VERSION', '1.0.3');
define('AUTO_VERSION_INCREMENT', true);

// Timezone setting
date_default_timezone_set('Europe/Berlin');

// Default locale
setlocale(LC_ALL, 'de_DE.UTF-8');

// Error reporting - adjust for production
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ERROR | E_PARSE);
    ini_set('display_errors', 0);
}

// Error logging
ini_set('log_errors', 1);
ini_set('error_log', APP_PATH . '/data/logs/error.log');

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.gc_maxlifetime', 3600); // 1 hour
ini_set('session.use_strict_mode', 1);

// Enable/disable features
define('FEATURES', [
    'enable_contact_form' => true,
    'enable_word_cloud' => true,
    'enable_admin_panel' => true,
    'enable_caching' => true,
    'enable_analytics' => false, // Google Analytics
    'enable_firebase_auth' => true,
    'enable_firebase_storage' => true,
    'enable_cloudinary' => true
]);

// Caching settings
define('CACHE_LIFETIME', 3600); // 1 hour
define('ENABLE_CACHING', FEATURES['enable_caching']);

// Contact form settings
define('EMAIL_CONFIG', [
    'contact_email' => 'kontakt@mannar.example.com',
    'admin_email' => 'admin@mannar.example.com',
    'use_smtp' => true,
    'smtp_host' => 'smtp.example.com',
    'smtp_port' => 587,
    'smtp_username' => 'smtp_user',
    'smtp_password' => 'smtp_password',
    'smtp_secure' => 'tls'
]);

// MIME types allowed for uploads
define('ALLOWED_UPLOAD_TYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'application/pdf'
]);

// Maximum upload size (5MB)
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024);

// Content Security Policy settings
define('CSP_ENABLED', true);

// Allowed origins for CORS
define('ALLOWED_ORIGINS', [
    'https://mannar.example.com',
    'https://www.mannar.example.com',
    'http://localhost:8080'
]);