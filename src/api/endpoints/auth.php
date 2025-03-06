 <?php
/**
 * auth.php
 * Handles authentication-related API endpoints
 */

// Include required files
require_once __DIR__ . '/../config.php';

// Set CORS headers
setCorsHeaders();

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : 'login';

// Handle OPTIONS preflight request
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Process based on action
try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
            
        case 'logout':
            handleLogout();
            break;
            
        case 'register':
            handleRegister();
            break;
            
        case 'validate':
            validateToken();
            break;
            
        case 'refresh':
            refreshToken();
            break;
            
        case 'reset-password':
            handlePasswordReset();
            break;
            
        default:
            sendJsonError('Unknown auth action', 400);
    }
} catch (Exception $e) {
    sendJsonError('Error: ' . $e->getMessage(), 500);
}

/**
 * Handle user login
 */
function handleLogin() {
    // Only POST method allowed for login
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Method not allowed', 405);
    }
    
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    $validation = validateRequiredFields(['email', 'password'], $data);
    if ($validation !== true) {
        sendJsonError($validation, 400);
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJsonError('Invalid email format', 400);
    }
    
    // In a real application, authenticate using Firebase Admin SDK
    // Here we use a simplified example using firebase_config.php
    
    // For demo/testing purposes (in actual implementation, use Firebase SDK)
    // Assuming this is the admin account
    if ($email === 'admin@example.com' && $password === 'admin123') {
        $token = generateAuthToken($email);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'email' => $email,
                'role' => 'admin'
            ]
        ]);
    } else {
        // Failed login attempt
        sendJsonError('Invalid credentials', 401);
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Only POST method allowed for logout
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Method not allowed', 405);
    }
    
    // Get authorization header
    $token = getBearerToken();
    
    if (!$token) {
        sendJsonError('No auth token provided', 401);
    }
    
    // In a real app, invalidate the token in your token store
    // Here we just return success message
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}

/**
 * Handle user registration
 */
function handleRegister() {
    // Only POST method allowed for registration
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Method not allowed', 405);
    }
    
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    $validation = validateRequiredFields(['email', 'password', 'name'], $data);
    if ($validation !== true) {
        sendJsonError($validation, 400);
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    $name = sanitizeInput($data['name']);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJsonError('Invalid email format', 400);
    }
    
    // Password length check
    if (strlen($password) < 6) {
        sendJsonError('Password must be at least 6 characters', 400);
    }
    
    // In a real app, create the user in Firebase
    // For demo, just return success message
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Registration successful',
        'user' => [
            'email' => $email,
            'name' => $name
        ]
    ]);
}

/**
 * Validate authentication token
 */
function validateToken() {
    // Get authorization header
    $token = getBearerToken();
    
    if (!$token) {
        sendJsonError('No auth token provided', 401);
    }
    
    // Use validateAdminToken from firebase-config.php
    if (validateAdminToken($token)) {
        sendJsonResponse([
            'success' => true,
            'valid' => true,
            'role' => 'admin'
        ]);
    } else {
        sendJsonError('Invalid token', 401);
    }
}

/**
 * Refresh an authentication token
 */
function refreshToken() {
    // Only POST method allowed for token refresh
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Method not allowed', 405);
    }
    
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    if (!isset($data['refresh_token']) || empty($data['refresh_token'])) {
        sendJsonError('Refresh token is required', 400);
    }
    
    $refreshToken = $data['refresh_token'];
    
    // In a real application, validate the refresh token 
    // and generate a new auth token
    
    // For demo, we'll respond with a new token for the admin
    if ($refreshToken === 'valid_refresh_token') {
        $token = generateAuthToken('admin@example.com');
        
        sendJsonResponse([
            'success' => true,
            'token' => $token
        ]);
    } else {
        sendJsonError('Invalid refresh token', 401);
    }
}

/**
 * Handle password reset
 */
function handlePasswordReset() {
    // Only POST method allowed for password reset
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonError('Method not allowed', 405);
    }
    
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    if (!isset($data['email']) || empty($data['email'])) {
        sendJsonError('Email is required', 400);
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJsonError('Invalid email format', 400);
    }
    
    // In a real application, send password reset email using Firebase
    // For demo, we'll just respond with success message
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Password reset email sent'
    ]);
}

/**
 * Get bearer token from authorization header
 * @return string|null The token or null if not found
 */
function getBearerToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Extract token
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}

/**
 * Generate an authentication token
 * @param string $email User email
 * @return string Generated token
 */
function generateAuthToken($email) {
    // In a real application, use a proper JWT library or Firebase
    
    // For demo, create a simple token
    $tokenData = [
        'email' => $email,
        'exp' => time() + AUTH_TOKEN_EXPIRY,
        'iat' => time()
    ];
    
    // Encode token (this is not secure, just for demo)
    return base64_encode(json_encode($tokenData));
}
?>