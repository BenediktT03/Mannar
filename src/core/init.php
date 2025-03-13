<?php
/**
 * Application Initialization
 * 
 * Bootstraps the Mannar website application, loads required components,
 * initializes session, error handling, and provides core helper functions.
 *
 * @package Mannar
 * @subpackage Core
 */

// Start output buffering for better control
ob_start();

// Ensure session is started with secure settings
if (session_status() === PHP_SESSION_NONE) {
    $session_options = [
        'cookie_httponly' => true,
        'cookie_secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'use_strict_mode' => true,
        'cookie_samesite' => 'Lax'
    ];
    
    session_start($session_options);
}

// Define application root path if not defined
if (!defined('APP_PATH')) {
    define('APP_PATH', realpath(__DIR__ . '/../../'));
}

// Load main configuration
require_once APP_PATH . '/config/app.php';

// Load other configuration files
if (file_exists(APP_PATH . '/config/database.php')) {
    require_once APP_PATH . '/config/database.php';
}

if (file_exists(APP_PATH . '/config/firebase.php')) {
    require_once APP_PATH . '/config/firebase.php';
}

// Load utility functions
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/formatting.php';
require_once __DIR__ . '/../utils/filesystem.php';

// Set security headers
set_security_headers();

/**
 * Render a template with data
 * 
 * @param string $template Template name (without extension)
 * @param array $data Data to be passed to the template
 * @param bool $return Whether to return the output or echo it
 * @return string|void Template output if $return is true
 */
function render_template($template, $data = [], $return = false) {
    // Ensure template path is valid
    $template_path = TEMPLATES_PATH . '/' . $template . '.php';
    
    if (!file_exists($template_path)) {
        throw new Exception("Template not found: $template");
    }
    
    // Extract data to make variables accessible in template
    extract($data);
    
    // Capture output
    if ($return) {
        ob_start();
    }
    
    // Include the template
    include $template_path;
    
    // Return or output
    if ($return) {
        return ob_get_clean();
    }
}

/**
 * Render a component with data
 * 
 * @param string $component Component name (without extension)
 * @param array $data Data to be passed to the component
 * @param bool $return Whether to return the output or echo it
 * @return string|void Component output if $return is true
 */
function render_component($component, $data = [], $return = false) {
    // Ensure component path is valid
    $component_path = TEMPLATES_PATH . '/components/' . $component . '.php';
    
    if (!file_exists($component_path)) {
        throw new Exception("Component not found: $component");
    }
    
    // Extract data to make variables accessible in component
    extract($data);
    
    // Capture output
    if ($return) {
        ob_start();
    }
    
    // Include the component
    include $component_path;
    
    // Return or output
    if ($return) {
        return ob_get_clean();
    }
}

/**
 * Return a JSON response
 * 
 * @param array $data Data to be encoded as JSON
 * @param int $status HTTP status code
 * @return void
 */
function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Handle fatal errors
 */
function fatal_error_handler() {
    $error = error_get_last();
    
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_end_clean(); // Clear the output buffer
        
        if (DEBUG_MODE) {
            // Show detailed error in development
            echo '<div style="background-color: #f8d7da; color: #721c24; padding: 20px; margin: 20px; border: 1px solid #f5c6cb; border-radius: 4px;">';
            echo '<h2>Fatal Error</h2>';
            echo '<p>' . htmlspecialchars($error['message']) . '</p>';
            echo '<p>File: ' . htmlspecialchars($error['file']) . ' on line ' . $error['line'] . '</p>';
            echo '</div>';
        } else {
            // Show user-friendly error in production
            render_template('error', [
                'title' => 'An Error Occurred',
                'message' => 'Sorry, something went wrong. Please try again later.'
            ]);
        }
    }
}

/**
 * Handle exceptions
 */
set_exception_handler(function($exception) {
    ob_end_clean(); // Clear the output buffer
    
    if (DEBUG_MODE) {
        // Show detailed exception in development
        echo '<div style="background-color: #f8d7da; color: #721c24; padding: 20px; margin: 20px; border: 1px solid #f5c6cb; border-radius: 4px;">';
        echo '<h2>Exception</h2>';
        echo '<p>' . htmlspecialchars($exception->getMessage()) . '</p>';
        echo '<p>File: ' . htmlspecialchars($exception->getFile()) . ' on line ' . $exception->getLine() . '</p>';
        echo '<pre>' . htmlspecialchars($exception->getTraceAsString()) . '</pre>';
        echo '</div>';
    } else {
        // Show user-friendly exception in production
        render_template('error', [
            'title' => 'An Error Occurred',
            'message' => 'Sorry, something went wrong. Please try again later.'
        ]);
    }
    
    exit(1);
});

// Register error handler
register_shutdown_function('fatal_error_handler');

/**
 * Set security headers for all responses
 */
function set_security_headers() {
    // Prevent clickjacking
    header('X-Frame-Options: SAMEORIGIN');
    
    // Enable XSS protection in browsers
    header('X-XSS-Protection: 1; mode=block');
    
    // Prevent MIME type sniffing
    header('X-Content-Type-Options: nosniff');
    
    // Set referrer policy
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // Set permissions policy
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy - Customize as needed for your application
    if (defined('CSP_ENABLED') && CSP_ENABLED) {
        $csp = "default-src 'self'; " .
               "script-src 'self' https://www.gstatic.com https://cdn.firebase.com https://www.googleapis.com 'unsafe-inline'; " .
               "style-src 'self' https://www.w3schools.com https://fonts.googleapis.com 'unsafe-inline'; " .
               "img-src 'self' https://res.cloudinary.com data:; " .
               "font-src 'self' https://fonts.gstatic.com; " .
               "connect-src 'self' https://*.firebaseio.com https://firestore.googleapis.com; " .
               "frame-src 'self'; " .
               "object-src 'none'";
               
        header("Content-Security-Policy: $csp");
    }
}

/**
 * Get client IP address
 * 
 * @return string IP address
 */
function get_client_ip() {
    $keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($keys as $key) {
        if (!empty($_SERVER[$key])) {
            return filter_var($_SERVER[$key], FILTER_VALIDATE_IP);
        }
    }
    
    return 'UNKNOWN';
}

// Load the Database class if database configuration is defined
if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER')) {
    require_once __DIR__ . '/database.php';
}

// Load Router if available
if (file_exists(__DIR__ . '/router.php')) {
    require_once __DIR__ . '/router.php';
}

// Load base Controller class
require_once __DIR__ . '/controller.php';

// Initialize any services that should be available globally
// This would be a good place to initialize Firebase SDK, etc.