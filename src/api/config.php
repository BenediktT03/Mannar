 <?php
/**
 * config.php
 * Shared configuration for API endpoints
 */

// Error reporting and display settings
ini_set('display_errors', 0); // Set to 1 for development
error_reporting(E_ALL);

// Define API version
define('API_VERSION', '1.0.0');

// Set timezone
date_default_timezone_set('Europe/Berlin');

// Database configuration (if needed)
$db_config = [
    'host' => 'localhost',
    'username' => 'dbuser',
    'password' => 'dbpassword',
    'database' => 'mannar_db'
];

// API response types
define('RESPONSE_JSON', 'application/json');
define('RESPONSE_HTML', 'text/html');
define('RESPONSE_TEXT', 'text/plain');

// File upload configuration
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']);
define('UPLOAD_DIR', '../uploads/');

// CORS settings
$cors_allowed_origins = [
    'https://mannar.de',
    'https://www.mannar.de',
    'http://localhost:8080'
];

// Authentication settings
define('AUTH_TOKEN_EXPIRY', 86400); // 24 hours in seconds
define('AUTH_REFRESH_TOKEN_EXPIRY', 2592000); // 30 days in seconds

// Include Firebase configuration
require_once __DIR__ . '/../includes/firebase-config.php';

/**
 * Set CORS headers based on configuration
 */
function setCorsHeaders() {
    global $cors_allowed_origins;
    
    // Check if origin is allowed
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $cors_allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        // Default: only allow same origin
        header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_HOST'] ?? ''));
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400'); // 24 hours
}

/**
 * Set the response content type
 * @param string $type Content type constant
 */
function setResponseType($type = RESPONSE_JSON) {
    header('Content-Type: ' . $type);
}

/**
 * Send a JSON response
 * @param mixed $data Data to encode as JSON
 * @param int $status HTTP status code
 */
function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    setResponseType(RESPONSE_JSON);
    echo json_encode($data);
    exit;
}

/**
 * Send a JSON error response
 * @param string $message Error message
 * @param int $status HTTP status code
 */
function sendJsonError($message, $status = 400) {
    sendJsonResponse([
        'success' => false,
        'error' => $message
    ], $status);
}

/**
 * Sanitize user input
 * @param string $input Input to sanitize
 * @return string Sanitized input
 */
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate required fields in request
 * @param array $required Array of required field names
 * @param array $data Data to validate
 * @return bool|string True if valid, error message otherwise
 */
function validateRequiredFields($required, $data) {
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return "Missing required field: $field";
        }
    }
    return true;
}

// Set default response type
setResponseType();
?>