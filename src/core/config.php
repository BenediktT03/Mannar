<?php
/**
 * Application Configuration
 * Central configuration file for application settings
 */

// Prevent direct access
if (!defined('APP_PATH')) {
    exit('Direct script access is not allowed.');
}

// Define application environment
define('APP_ENV', 'development'); // 'development' or 'production'

// Debug mode (enable for development, disable for production)
define('APP_DEBUG', APP_ENV === 'development');

// Base URLs
define('BASE_URL', 'https://' . $_SERVER['HTTP_HOST']);
define('ASSETS_URL', BASE_URL . '/assets');

// Application paths
define('CORE_PATH', APP_PATH . '/core');
define('TEMPLATES_PATH', APP_PATH . '/templates');
define('ASSETS_PATH', APP_PATH . '/assets');
define('API_PATH', APP_PATH . '/api');

// Asset version for cache busting
define('ASSET_VERSION', '1.0.3');

// Database settings (if needed)
define('DB_HOST', 'localhost');
define('DB_NAME', 'mannar_db');
define('DB_USER', 'mannar_user');
define('DB_PASS', 'secure_password');

// Firebase configuration
define('FIREBASE_CONFIG', [
    'apiKey' => "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    'authDomain' => "mannar-129a5.firebaseapp.com",
    'projectId' => "mannar-129a5",
    'storageBucket' => "mannar-129a5.firebasestorage.app",
    'messagingSenderId' => "687710492532",
    'appId' => "1:687710492532:web:c7b675da541271f8d83e21",
    'measurementId' => "G-NXBLYJ5CXL"
]);

// Cloudinary settings
define('CLOUDINARY_CONFIG', [
    'cloud_name' => 'dlegnsmho',
    'api_key' => '811453586293945',
    'api_secret' => 'ygiBwVjmJJNsPmmVJ9lhAUDz9lQ',
    'upload_preset' => 'ml_default'
]);

// Mail settings
define('MAIL_CONFIG', [
    'host' => 'smtp.example.com',
    'port' => 587,
    'username' => 'noreply@example.com',
    'password' => 'mail_password',
    'encryption' => 'tls',
    'from' => 'noreply@example.com',
    'from_name' => 'Mannar Website'
]);

// Default page settings
define('DEFAULT_META', [
    'title' => 'Mannar - Peer, Genesungsbegeleiter',
    'description' => 'Mannar - Peer und Genesungsbegleiter für psychische Gesundheit.',
    'keywords' => 'Peer, Genesungsbegleiter, psychische Gesundheit, Achtsamkeit, Selbstreflexion',
    'author' => 'Mannar',
    'og_image' => ASSETS_URL . '/img/og-image.jpg'
]);

// Content security settings
define('ALLOWED_HTML_TAGS', '<p><h1><h2><h3><h4><h5><h6><ul><ol><li><a><strong><em><blockquote><br><div><span><img><figure><figcaption><table><tr><td><th><thead><tbody>');

// Security settings
define('CSRF_TOKEN_EXPIRY', 3600); // 1 hour in seconds
define('SESSION_LIFETIME', 86400); // 24 hours in seconds
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_TIMEOUT', 1800); // 30 minutes in seconds

// Upload settings
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_UPLOAD_TYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml'
]);

// Feature flags
define('FEATURES', [
    'enable_caching' => true,
    'enable_minification' => APP_ENV === 'production',
    'enable_analytics' => APP_ENV === 'production',
    'enable_word_cloud' => true,
    'enable_dynamic_pages' => true
]);

// Error reporting settings
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set default timezone
date_default_timezone_set('Europe/Berlin');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_lifetime' => SESSION_LIFETIME,
        'cookie_httponly' => true,
        'cookie_secure' => isset($_SERVER['HTTPS']),
        'cookie_samesite' => 'Lax'
    ]);
}