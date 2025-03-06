 <?php
/**
 * api.php
 * Unified API router for handling different types of requests
 */

// Include necessary files
require_once 'includes/firebase-config.php';

// Set content type
header('Content-Type: application/json');

// Enable CORS for same origin
header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Router
try {
    switch ($action) {
        case 'upload':
            handleUpload();
            break;
            
        case 'contact':
            handleContact();
            break;
            
        case 'auth':
            handleAuth();
            break;
            
        case 'content':
            handleContent();
            break;
            
        default:
            throw new Exception('Unknown action');
    }
} catch (Exception $e) {
    sendError('Error: ' . $e->getMessage(), 500);
}

/**
 * Handle file uploads
 */
function handleUpload() {
    // Check if this is a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
        return;
    }
    
    // Check if a file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $error_msg = isset($_FILES['image']) ? 'Upload error: ' . $_FILES['image']['error'] : 'No image uploaded';
        sendError($error_msg, 400);
        return;
    }
    
    // Configuration
    $upload_dir = '../uploads/';
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    $max_file_size = 5 * 1024 * 1024; // 5MB
    
    // Verify MIME type
    $file = $_FILES['image'];
    $file_type = $file['type'];
    $file_size = $file['size'];
    $file_tmp = $file['tmp_name'];
    
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $file_mime = $finfo->file($file_tmp);
    if (!in_array($file_mime, $allowed_types)) {
        sendError('Unsupported file type. Only JPEG, PNG, GIF, and SVG are allowed.', 400);
        return;
    }
    
    // Size check
    if ($file_size > $max_file_size) {
        sendError('File is too large. Maximum size: 5MB.', 400);
        return;
    }
    
    // Create upload directory if it doesn't exist
    if (!file_exists($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            sendError('Failed to create uploads directory', 500);
            return;
        }
    }
    
    // Generate secure filename
    $timestamp = time();
    $random = mt_rand(1000, 9999);
    $original_name = pathinfo($file['name'], PATHINFO_FILENAME);
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Sanitize filename
    $original_name = preg_replace('/[^a-zA-Z0-9_-]/', '', $original_name);
    $original_name = str_replace(' ', '_', $original_name);
    $original_name = substr($original_name, 0, 50); // Limit length
    
    // Create final filename
    $filename = $timestamp . '_' . $random . '_' . $original_name . '.' . $extension;
    $destination = $upload_dir . $filename;
    
    // Move and secure the file
    if (move_uploaded_file($file_tmp, $destination)) {
        chmod($destination, 0644); // Set proper permissions
        
        // Generate URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $file_url = $protocol . '://' . $host . '/uploads/' . $filename;
        
        // Return success response
        sendResponse([
            'success' => true,
            'filename' => $filename,
            'url' => $file_url
        ]);
    } else {
        sendError('Error saving the file. Please try again.', 500);
    }
}

/**
 * Handle contact form submissions
 */
function handleContact() {
    // Check if this is a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
        return;
    }
    
    // Get form data
    $name = isset($_POST['Name']) ? sanitizeInput($_POST['Name']) : '';
    $email = isset($_POST['Email']) ? sanitizeInput($_POST['Email']) : '';
    $message = isset($_POST['Message']) ? sanitizeInput($_POST['Message']) : '';
    
    // Validate inputs
    if (empty($name) || empty($email) || empty($message)) {
        sendError('All fields are required', 400);
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email address', 400);
        return;
    }
    
    // In a production environment, you would:
    // 1. Save to a database
    // 2. Send email notification
    // 3. Add spam protection
    
    // For demonstration, we'll just return success
    // In a real application, send an email or save to database
    
    sendResponse([
        'success' => true,
        'message' => 'Your message has been sent. We will contact you soon!'
    ]);
}

/**
 * Handle authentication requests
 */
function handleAuth() {
    // Get request details
    $method = $_SERVER['REQUEST_METHOD'];
    $auth_action = isset($_GET['auth_action']) ? $_GET['auth_action'] : '';
    
    switch ($auth_action) {
        case 'validate':
            validateAuth();
            break;
            
        default:
            sendError('Unknown auth action', 400);
    }
}

/**
 * Validate authentication token
 */
function validateAuth() {
    // Get authorization header
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Extract token
    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        $token = $matches[1];
    }
    
    // Validate token
    if (validateAdminToken($token)) {
        sendResponse([
            'valid' => true,
            'role' => 'admin'
        ]);
    } else {
        sendError('Invalid authentication token', 401);
    }
}

/**
 * Handle content operations
 */
function handleContent() {
    // Get request details
    $method = $_SERVER['REQUEST_METHOD'];
    $content_type = isset($_GET['type']) ? $_GET['type'] : '';
    
    // Check authentication for non-GET requests
    if ($method !== 'GET') {
        $headers = getallheaders();
        $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        // Extract token
        $token = '';
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
        }
        
        // Validate token
        if (!validateAdminToken($token)) {
            sendError('Unauthorized', 401);
            return;
        }
    }
    
    // Handle based on method
    switch ($method) {
        case 'GET':
            getContent($content_type);
            break;
            
        case 'POST':
        case 'PUT':
            updateContent($content_type);
            break;
            
        case 'DELETE':
            deleteContent($content_type);
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}

/**
 * Get content
 * @param string $content_type Type of content to get
 */
function getContent($content_type) {
    // In a real implementation, this would fetch from a database
    // For demonstration, we'll create mock responses
    
    switch ($content_type) {
        case 'main':
            // Mock main content data
            $data = [
                'aboutTitle' => 'ÜBER MICH',
                'aboutSubtitle' => 'Peer und Genesungsbegleiter',
                'aboutText' => '<p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum.</p>',
                'offeringsTitle' => 'MEINE ANGEBOTE',
                'offeringsSubtitle' => 'Hier sind einige meiner Leistungen und Angebote',
                // ... more content ...
            ];
            sendResponse($data);
            break;
            
        case 'wordcloud':
            // Mock word cloud data
            $data = [
                'words' => [
                    ['text' => 'Mindfulness', 'weight' => 7, 'link' => '#'],
                    ['text' => 'Meditation', 'weight' => 9, 'link' => '#'],
                    ['text' => 'Bewusstsein', 'weight' => 6, 'link' => '#'],
                    // ... more words ...
                ]
            ];
            sendResponse($data);
            break;
            
        default:
            sendError('Unknown content type', 400);
    }
}

/**
 * Update content
 * @param string $content_type Type of content to update
 */
function updateContent($content_type) {
    // Get request body
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);
    
    if (!$data) {
        sendError('Invalid request data', 400);
        return;
    }
    
    // In a real implementation, this would save to a database
    // For demonstration, we'll just return success
    
    sendResponse([
        'success' => true,
        'message' => 'Content updated successfully',
        'content_type' => $content_type
    ]);
}

/**
 * Delete content
 * @param string $content_type Type of content to delete
 */
function deleteContent($content_type) {
    // In a real implementation, this would delete from a database
    // For demonstration, we'll just return success
    
    sendResponse([
        'success' => true,
        'message' => 'Content deleted successfully',
        'content_type' => $content_type
    ]);
}

/**
 * Sanitize user input
 * @param string $input Input to sanitize
 * @return string Sanitized input
 */
function sanitizeInput($input) {
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return $input;
}

/**
 * Send error response
 * @param string $message Error message
 * @param int $status HTTP status code
 */
function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
}

/**
 * Send success response
 * @param mixed $data Response data
 */
function sendResponse($data) {
    echo json_encode($data);
    exit;
}