<?php
/**
 * Application Initialization
 * Bootstraps the Mannar website application and loads required components
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

// Load configuration
require_once __DIR__ . '/config.php';

// Load utility functions
require_once __DIR__ . '/utils/security.php';
require_once __DIR__ . '/utils/formatting.php';
require_once __DIR__ . '/utils/filesystem.php';

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
    $template_path = TEMPLATE_PATH . '/' . $template . '.php';
    
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
    $component_path = TEMPLATE_PATH . '/components/' . $component . '.php';
    
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

// Register error handler
register_shutdown_function('fatal_error_handler');

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