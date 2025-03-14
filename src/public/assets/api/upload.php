<?php
/**
 * File Upload Handler
 * 
 * Handles file uploads for the website, including images for content.
 * Validates files, processes uploads, and returns upload information.
 */

// Load bootstrap
require_once __DIR__ . '/../../bootstrap.php';

// Include core initialization
require_once SRC_PATH . '/core/init.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit;
}

// Check if uploads are enabled
if (!defined('FEATURES') || 
    (!isset(FEATURES['enable_cloudinary']) && !isset(FEATURES['enable_firebase_storage']))) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'File uploads are disabled'
    ]);
    exit;
}

// Validate CSRF token (if not using direct upload widgets)
if (!isset($_POST['csrf_token']) && !isset($_GET['csrf_token'])) {
    // Check if using direct upload widget
    if (!isset($_GET['direct_upload']) || $_GET['direct_upload'] !== 'true') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'CSRF validation failed'
        ]);
        exit;
    }
}

if (isset($_POST['csrf_token']) && !verify_csrf_token($_POST['csrf_token'])) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'CSRF validation failed'
    ]);
    exit;
}

if (isset($_GET['csrf_token']) && !verify_csrf_token($_GET['csrf_token'])) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'CSRF validation failed'
    ]);
    exit;
}

// Check if an authenticated user is making the request
$authService = AuthService::getInstance();
if (!$authService->isAuthenticated()) {
    // If using direct upload widget, check for API key
    if (!isset($_GET['direct_upload']) || $_GET['direct_upload'] !== 'true' || 
        !isset($_GET['api_key']) || !verify_api_key($_GET['api_key'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Unauthorized'
        ]);
        exit;
    }
}

// Get upload options
$options = $_POST;

// Check if folder is specified
if (!isset($options['folder'])) {
    $options['folder'] = 'general';
}

// Initialize the upload service
require_once SRC_PATH . '/services/uploadservice.php';
$uploadService = new UploadService([
    'use_cloudinary' => defined('FEATURES') && isset(FEATURES['enable_cloudinary']) && FEATURES['enable_cloudinary'],
    'secure_uploads' => true
]);

// Handle the file upload
$fileKey = isset($_GET['file_key']) ? $_GET['file_key'] : 'file';
$result = $uploadService->handleUpload($fileKey, $options);

// Return JSON response
echo json_encode($result);

/**
 * Verify API key for direct uploads
 * 
 * @param string $apiKey API key to verify
 * @return bool True if valid
 */
function verify_api_key($apiKey) {
    // In a real application, you would validate against a stored secure key
    // This is a simple example
    $validKey = defined('UPLOAD_API_KEY') ? UPLOAD_API_KEY : 'your_secure_upload_api_key';
    
    return hash_equals($validKey, $apiKey);
}