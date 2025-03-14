 <?php
/**
 * Bootstrap File
 * Main entry point for application initialization
 * 
 * This file:
 * - Sets up error handling and reporting
 * - Defines constants and environment settings
 * - Loads configuration files
 * - Initializes core components
 * - Sets up security headers
 * - Prepares the application environment
 */

// Prevent direct access
if (basename($_SERVER['PHP_SELF']) === 'bootstrap.php') {
    header('HTTP/1.0 403 Forbidden');
    exit('Direct access to this file is forbidden.');
}

// Define application root path (parent of this file)
define('APP_PATH', realpath(dirname(__FILE__)));

// Define public path
define('PUBLIC_PATH', APP_PATH . '/public');

// Start output buffering for better control
ob_start();

// Set default timezone
date_default_timezone_set('Europe/Berlin');

/**
 * Load environment configuration
 * Check if running in production, development, or testing
 */
if (file_exists(APP_PATH . '/.env')) {
    $env_vars = parse_ini_file(APP_PATH . '/.env');
    if ($env_vars && isset($env_vars['APP_ENV'])) {
        define('APP_ENV', $env_vars['APP_ENV']);
    } else {
        define('APP_ENV', 'production'); // Default to production
    }
} else {
    // Default environment if .env isn't found
    define('APP_ENV', isset($_SERVER['APP_ENV']) ? $_SERVER['APP_ENV'] : 'production');
}

// Set debug mode based on environment
define('DEBUG_MODE', APP_ENV !== 'production');

// Configure error reporting
if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);
}

// Define application directories
define('CONFIG_PATH', APP_PATH . '/config');
define('SRC_PATH', APP_PATH . '/src');
define('CORE_PATH', SRC_PATH . '/core');
define('UTILS_PATH', SRC_PATH . '/utils');
define('TEMPLATES_PATH', SRC_PATH . '/templates');
define('ASSETS_PATH', APP_PATH . '/assets');
define('DATA_PATH', APP_PATH . '/data');
define('SERVICES_PATH', SRC_PATH . '/services');

// Ensure data directory exists and is writable
if (!is_dir(DATA_PATH)) {
    if (!mkdir(DATA_PATH, 0755, true) && !is_dir(DATA_PATH)) {
        throw new RuntimeException('Unable to create data directory: ' . DATA_PATH);
    }
}

// Create log directory if it doesn't exist
if (!is_dir(DATA_PATH . '/logs')) {
    if (!mkdir(DATA_PATH . '/logs', 0755, true) && !is_dir(DATA_PATH . '/logs')) {
        throw new RuntimeException('Unable to create logs directory: ' . DATA_PATH . '/logs');
    }
}

// Set up custom error handler
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        // Error is suppressed with @
        return false;
    }
    
    $error_message = sprintf(
        "Error: [%s] %s in %s on line %d",
        $severity,
        $message,
        $file,
        $line
    );
    
    if (DEBUG_MODE) {
        // In debug mode, we'll also display errors
        echo '<div style="padding: 10px; margin: 10px 0; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px;">';
        echo '<h3>Error Occurred</h3>';
        echo '<p>' . htmlspecialchars($error_message) . '</p>';
        echo '</div>';
    }
    
    // Log the error
    error_log($error_message, 3, DATA_PATH . '/logs/error.log');
    
    return true; // Don't execute PHP internal error handler
});

// Set up custom exception handler
set_exception_handler(function($exception) {
    $error_message = sprintf(
        "Exception: [%s] %s in %s on line %d\n%s",
        get_class($exception),
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine(),
        $exception->getTraceAsString()
    );
    
    if (DEBUG_MODE) {
        // In debug mode, we'll also display the exception
        echo '<div style="padding: 10px; margin: 10px 0; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px;">';
        echo '<h3>Exception Occurred</h3>';
        echo '<p>' . htmlspecialchars($exception->getMessage()) . '</p>';
        echo '<p>in ' . htmlspecialchars($exception->getFile()) . ' on line ' . $exception->getLine() . '</p>';
        echo '<h4>Stack Trace:</h4>';
        echo '<pre>' . htmlspecialchars($exception->getTraceAsString()) . '</pre>';
        echo '</div>';
    } else {
        // In production, show a user-friendly error
        if (ob_get_level() > 0) {
            ob_clean(); // Clear any buffered output
        }
        
        if (file_exists(TEMPLATES_PATH . '/error.php')) {
            include TEMPLATES_PATH . '/error.php';
        } else {
            echo '<h1>An error occurred</h1>';
            echo '<p>We apologize for the inconvenience. Please try again later.</p>';
        }
    }
    
    // Log the exception
    error_log($error_message, 3, DATA_PATH . '/logs/exception.log');
    
    exit(1);
});

// Register shutdown function to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        $error_message = sprintf(
            "Fatal Error: [%s] %s in %s on line %d",
            $error['type'],
            $error['message'],
            $error['file'],
            $error['line']
        );
        
        // Log the error
        error_log($error_message, 3, DATA_PATH . '/logs/fatal.log');
        
        if (DEBUG_MODE) {
            if (ob_get_level() > 0) {
                ob_clean(); // Clear any buffered output
            }
            
            // In debug mode, we'll display detailed error info
            echo '<div style="padding: 10px; margin: 10px 0; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px;">';
            echo '<h3>Fatal Error Occurred</h3>';
            echo '<p>' . htmlspecialchars($error['message']) . '</p>';
            echo '<p>in ' . htmlspecialchars($error['file']) . ' on line ' . $error['line'] . '</p>';
            echo '</div>';
        } else {
            // In production, show a user-friendly error
            if (ob_get_level() > 0) {
                ob_clean(); // Clear any buffered output
            }
            
            if (file_exists(TEMPLATES_PATH . '/error.php')) {
                include TEMPLATES_PATH . '/error.php';
            } else {
                echo '<h1>An error occurred</h1>';
                echo '<p>We apologize for the inconvenience. Please try again later.</p>';
            }
        }
    }
});

// Load configuration files
$config_files = [
    'constants.php',  // Application constants
    'app.php',        // Main application configuration
    'database.php',   // Database configuration
    'firebase.php'    // Firebase configuration
];

foreach ($config_files as $config_file) {
    $file_path = CONFIG_PATH . '/' . $config_file;
    if (file_exists($file_path)) {
        require_once $file_path;
    } else {
        if (DEBUG_MODE) {
            echo "<p>Warning: Configuration file {$config_file} not found.</p>";
        }
        error_log("Warning: Configuration file {$config_file} not found.", 3, DATA_PATH . '/logs/error.log');
    }
}

// Load essential utility functions
require_once UTILS_PATH . '/security.php';  // Security utilities
require_once UTILS_PATH . '/formatting.php'; // Formatting utilities
require_once UTILS_PATH . '/filesystem.php'; // Filesystem utilities

// Load core components
require_once CORE_PATH . '/version.php';     // Version information
require_once CORE_PATH . '/init.php';        // Application initialization

// Set secure HTTP headers
if (function_exists('set_security_headers')) {
    set_security_headers();
}

// Ensure session is started with secure settings
if (session_status() === PHP_SESSION_NONE) {
    $session_options = [
        'cookie_httponly' => true,                       // Prevent JavaScript access to session cookie
        'cookie_secure' => isset($_SERVER['HTTPS']),     // Only send cookie over HTTPS if available
        'use_strict_mode' => true,                       // Only accept session IDs generated by the server
        'cookie_samesite' => 'Lax',                     // Control cross-site request forgery
        'gc_maxlifetime' => SESSION_LIFETIME ?? 86400,   // Session timeout (default: 24 hours)
        'cookie_lifetime' => 0                          // Cookie disappears when browser is closed
    ];
    
    session_start($session_options);
}

/**
 * Generate absolute URL for an asset
 * 
 * @param string $path Relative path to the asset
 * @return string Absolute URL to the asset with cache busting
 */
function asset_url($path) {
    $version = defined('ASSET_VERSION') ? ASSET_VERSION : '1.0.0';
    $base_url = defined('ASSETS_URL') ? ASSETS_URL : (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/assets';
    
    return $base_url . '/' . ltrim($path, '/') . '?v=' . $version;
}

/**
 * Get base URL of the application
 * 
 * @param string $path Optional path to append
 * @return string Base URL with optional path
 */
function base_url($path = '') {
    $base_url = defined('BASE_URL') ? BASE_URL : (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
    
    return $base_url . '/' . ltrim($path, '/');
}

/**
 * End script execution with a JSON response
 * 
 * @param mixed $data Data to encode as JSON
 * @param int $status HTTP status code
 * @return void
 */
function json_response($data, $status = 200) {
    if (ob_get_level() > 0) {
        ob_clean(); // Clear any buffered output
    }
    
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode($data);
    exit;
}

/**
 * Render a template with data
 * 
 * @param string $template Template name (without extension)
 * @param array $data Data to pass to the template
 * @param bool $return Whether to return or output the result
 * @return string|null Template output if $return is true
 */
function render_template($template, $data = [], $return = false) {
    $template_file = TEMPLATES_PATH . '/' . $template . '.php';
    
    if (!file_exists($template_file)) {
        throw new RuntimeException("Template not found: {$template}");
    }
    
    if ($return) {
        ob_start();
    }
    
    // Extract data to make it available in template scope
    extract($data);
    
    include $template_file;
    
    if ($return) {
        return ob_get_clean();
    }
    
    return null;
}

/**
 * Render a component with data
 * 
 * @param string $component Component name (without extension)
 * @param array $data Data to pass to the component
 * @param bool $return Whether to return or output the result
 * @return string|null Component output if $return is true
 */
function render_component($component, $data = [], $return = false) {
    $component_file = TEMPLATES_PATH . '/components/' . $component . '.php';
    
    if (!file_exists($component_file)) {
        throw new RuntimeException("Component not found: {$component}");
    }
    
    if ($return) {
        ob_start();
    }
    
    // Extract data to make it available in component scope
    extract($data);
    
    include $component_file;
    
    if ($return) {
        return ob_get_clean();
    }
    
    return null;
}

/**
 * Check if request is AJAX
 * 
 * @return bool True if request is AJAX
 */
function is_ajax_request() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Redirect to another URL
 * 
 * @param string $url URL to redirect to
 * @param int $status HTTP status code
 * @return void
 */
function redirect($url, $status = 302) {
    if (ob_get_level() > 0) {
        ob_clean(); // Clear any buffered output
    }
    
    header('Location: ' . $url, true, $status);
    exit;
}

// Bootstrap complete
define('BOOTSTRAP_COMPLETE', true);