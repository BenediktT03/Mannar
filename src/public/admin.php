<?php
/**
 * Admin Entry Point
 * 
 * Entry point for the admin panel of the Mannar website.
 * Handles authentication and renders the admin interface.
 */

// Load the bootstrap file
require_once __DIR__ . '/../bootstrap.php';

// Include core initialization
require_once SRC_PATH . '/core/init.php';

// Initialize authentication service
$authService = AuthService::getInstance();

// Check if user is authenticated
if (!$authService->isAuthenticated()) {
    // If not authenticated, redirect to login page
    if (isset($_GET['action']) && $_GET['action'] === 'login') {
        // Process login request
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Validate CSRF token
            if (!isset($_POST['csrf_token']) || !verify_csrf_token($_POST['csrf_token'])) {
                // CSRF validation failed
                echo json_encode([
                    'success' => false,
                    'error' => 'CSRF-Token-Validierung fehlgeschlagen. Bitte laden Sie die Seite neu und versuchen Sie es erneut.'
                ]);
                exit;
            }
            
            // Get login credentials
            $email = isset($_POST['email']) ? trim($_POST['email']) : '';
            $password = isset($_POST['password']) ? $_POST['password'] : '';
            
            // Attempt to login
            $result = $authService->login($email, $password);
            
            // Return JSON response
            echo json_encode($result);
            exit;
        }
    }
    
    // Render login page
    render_template('pages/admin-login');
    exit;
}

// Check if user is an admin
if (!$authService->isAdmin()) {
    // If not admin, show unauthorized page
    http_response_code(403);
    render_template('pages/unauthorized');
    exit;
}

// Handle admin actions
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'logout':
        // Logout the user
        $authService->logout();
        // Redirect to login page
        header('Location: admin.php');
        exit;
        break;
        
    case 'api':
        // Handle API requests
        $endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
        handle_admin_api($endpoint);
        exit;
        break;
        
    case 'upload':
        // Handle file uploads
        handle_file_upload();
        exit;
        break;
        
    default:
        // Render admin panel
        render_template('pages/admin-panel');
        break;
}

/**
 * Handle admin API requests
 * 
 * @param string $endpoint API endpoint
 * @return void
 */
function handle_admin_api($endpoint) {
    // Check for CSRF token in POST/PUT requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        if (!isset($_POST['csrf_token']) && !isset($input['csrf_token'])) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'CSRF token missing'
            ]);
            exit;
        }
        
        $csrf_token = $_POST['csrf_token'] ?? $input['csrf_token'] ?? '';
        if (!verify_csrf_token($csrf_token)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'CSRF validation failed'
            ]);
            exit;
        }
    }
    
    // Process the API request based on endpoint
    switch ($endpoint) {
        case 'content':
            // Content management endpoints
            handle_content_api();
            break;
            
        case 'pages':
            // Pages management endpoints
            handle_pages_api();
            break;
            
        case 'wordcloud':
            // Word cloud management endpoints
            handle_wordcloud_api();
            break;
            
        case 'settings':
            // Settings management endpoints
            handle_settings_api();
            break;
            
        default:
            // Unknown endpoint
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Unknown API endpoint'
            ]);
            break;
    }
}

/**
 * Handle content API requests
 * 
 * @return void
 */
function handle_content_api() {
    $contentService = ContentService::getInstance();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $is_draft = isset($_GET['draft']) && $_GET['draft'] === 'true';
    
    switch ($method) {
        case 'GET':
            // Get content
            $content = $contentService->loadMainContent($is_draft);
            echo json_encode([
                'success' => true,
                'data' => $content
            ]);
            break;
            
        case 'POST':
        case 'PUT':
            // Update content
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data) {
                $result = $contentService->saveMainContent($data, $is_draft);
                echo json_encode([
                    'success' => $result,
                    'message' => $result ? 'Content saved successfully' : 'Failed to save content'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid data format'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
            break;
    }
}

/**
 * Handle pages API requests
 * 
 * @return void
 */
function handle_pages_api() {
    $contentService = ContentService::getInstance();
    $method = $_SERVER['REQUEST_METHOD'];
    $page_id = isset($_GET['id']) ? $_GET['id'] : '';
    
    switch ($method) {
        case 'GET':
            if ($page_id) {
                // Get a specific page
                $page = $contentService->loadPage($page_id);
                echo json_encode([
                    'success' => true,
                    'data' => $page
                ]);
            } else {
                // Get all pages
                $pages = $contentService->loadAllPages();
                echo json_encode([
                    'success' => true,
                    'data' => $pages
                ]);
            }
            break;
            
        case 'POST':
            // Create or update a page
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && $page_id) {
                $result = $contentService->savePage($page_id, $data);
                echo json_encode([
                    'success' => $result,
                    'message' => $result ? 'Page saved successfully' : 'Failed to save page'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid data format or missing page ID'
                ]);
            }
            break;
            
        case 'DELETE':
            // Delete a page
            if ($page_id) {
                $result = $contentService->deletePage($page_id);
                echo json_encode([
                    'success' => $result,
                    'message' => $result ? 'Page deleted successfully' : 'Failed to delete page'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Missing page ID'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
            break;
    }
}

/**
 * Handle word cloud API requests
 * 
 * @return void
 */
function handle_wordcloud_api() {
    $contentService = ContentService::getInstance();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get word cloud data
            $words = $contentService->loadWordCloud();
            echo json_encode([
                'success' => true,
                'data' => $words
            ]);
            break;
            
        case 'POST':
            // Update word cloud data
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data) {
                $result = $contentService->saveWordCloud($data);
                echo json_encode([
                    'success' => $result,
                    'message' => $result ? 'Word cloud saved successfully' : 'Failed to save word cloud'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid data format'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
            break;
    }
}

/**
 * Handle settings API requests
 * 
 * @return void
 */
function handle_settings_api() {
    $contentService = ContentService::getInstance();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get settings
            $settings = $contentService->getGlobalSettings();
            echo json_encode([
                'success' => true,
                'data' => $settings
            ]);
            break;
            
        case 'POST':
            // Update settings
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data) {
                $result = $contentService->saveGlobalSettings($data);
                echo json_encode([
                    'success' => $result,
                    'message' => $result ? 'Settings saved successfully' : 'Failed to save settings'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid data format'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
            break;
    }
}

/**
 * Handle file uploads
 * 
 * @return void
 */
function handle_file_upload() {
    // Initialize the upload service
    $uploadService = new UploadService();
    
    // Check if a file was uploaded
    if (isset($_FILES['file'])) {
        // Handle the upload
        $result = $uploadService->handleUpload('file', $_POST);
        
        // Return JSON response
        echo json_encode($result);
    } else {
        // No file uploaded
        echo json_encode([
            'success' => false,
            'error' => 'No file uploaded'
        ]);
    }
}