<?php
/**
 * Application Bootstrap
 * 
 * Initializes the application environment, loads configuration,
 * and sets up autoloading for classes.
 */

// Define the application root path
define('APP_PATH', realpath(__DIR__));

// Load composer autoloader if available
if (file_exists(APP_PATH . '/vendor/autoload.php')) {
    require_once APP_PATH . '/vendor/autoload.php';
}

// Load main configuration file
if (file_exists(APP_PATH . '/config/app.php')) {
    require_once APP_PATH . '/config/app.php';
} else {
    // Fallback basic configuration if app.php is missing
    define('APP_NAME', 'Mannar');
    define('APP_VERSION', '1.0.0');
    define('DEBUG_MODE', true);
    define('SRC_PATH', APP_PATH . '/src');
    define('TEMPLATES_PATH', SRC_PATH . '/templates');
    define('PUBLIC_PATH', APP_PATH . '/public');
    define('UPLOAD_DIR', PUBLIC_PATH . '/uploads');
    define('ASSET_PATH', './assets');
    define('BASE_URL', 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
}

// Simple class autoloader
spl_autoload_register(function ($class) {
    // Define the class map for commonly used classes
    $classMap = [
        'Database' => 'core/database.php',
        'Controller' => 'core/controller.php',
        'Router' => 'core/router.php',
        'AuthService' => 'services/authservice.php',
        'ContentService' => 'services/contentservice.php',
        'UploadService' => 'services/uploadservice.php'
    ];
    
    // Check if the class is in the map
    if (isset($classMap[$class])) {
        $file = SRC_PATH . '/' . $classMap[$class];
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
    
    // Convert class name to file path
    $class = str_replace('\\', '/', $class);
    
    // Check in services directory
    $file = SRC_PATH . '/services/' . strtolower($class) . '.php';
    if (file_exists($file)) {
        require_once $file;
        return;
    }
    
    // Check in core directory
    $file = SRC_PATH . '/core/' . strtolower($class) . '.php';
    if (file_exists($file)) {
        require_once $file;
        return;
    }
    
    // Check in utils directory
    $file = SRC_PATH . '/utils/' . strtolower($class) . '.php';
    if (file_exists($file)) {
        require_once $file;
        return;
    }
});

// Set error handling based on environment
if (defined('DEBUG_MODE') && DEBUG_MODE) {
    // Show all errors in development
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    // Hide errors in production
    error_reporting(E_ERROR | E_PARSE);
    ini_set('display_errors', 0);
}

// Ensure log directory exists
$logDir = APP_PATH . '/data/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// Set error log path
ini_set('log_errors', 1);
ini_set('error_log', $logDir . '/app-' . date('Y-m-d') . '.log');

// Initialize session with secure settings
if (session_status() === PHP_SESSION_NONE) {
    $session_options = [
        'cookie_httponly' => true,
        'cookie_secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'use_strict_mode' => true,
        'cookie_samesite' => 'Lax'
    ];
    
    session_start($session_options);
}

// Load utility functions
require_once SRC_PATH . '/utils/security.php';
require_once SRC_PATH . '/utils/formatting.php';
require_once SRC_PATH . '/utils/filesystem.php';

// Set security headers
if (function_exists('set_security_headers')) {
    set_security_headers();
}

// Initialize database connection if database config exists
if (file_exists(APP_PATH . '/config/database.php') && defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER')) {
    $db = Database::getInstance();
}

// Return the bootstrap status
return true;