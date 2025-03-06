 <?php
/**
 * cloudinary-upload.php
 * Handles image uploads to Cloudinary cloud service
 */

// Set content type
header('Content-Type: application/json');

// Enable CORS for same origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Handle options request (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
    exit;
}

// Check if a file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error_msg = isset($_FILES['image']) ? 'Upload error: ' . $_FILES['image']['error'] : 'No image uploaded';
    sendError($error_msg, 400);
    exit;
}

// Cloudinary configuration
// In a production environment, store these in environment variables
$cloudinary_config = [
    'cloud_name' => 'your_cloud_name',
    'api_key' => 'your_api_key',
    'api_secret' => 'your_api_secret'
];

// Configuration
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
$max_file_size = 5 * 1024 * 1024; // 5MB

// Verify file type
$file = $_FILES['image'];
$file_type = $file['type'];
$file_size = $file['size'];
$file_tmp = $file['tmp_name'];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$file_mime = $finfo->file($file_tmp);
if (!in_array($file_mime, $allowed_types)) {
    sendError('Unsupported file type. Only JPEG, PNG, GIF, and SVG are allowed.', 400);
    exit;
}

// Check file size
if ($file_size > $max_file_size) {
    sendError('File is too large. Maximum size: 5MB.', 400);
    exit;
}

// Try to load Cloudinary SDK if available
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    
    try {
        // Configure Cloudinary SDK
        \Cloudinary\Configuration\Configuration::instance([
            'cloud' => [
                'cloud_name' => $cloudinary_config['cloud_name'],
                'api_key' => $cloudinary_config['api_key'],
                'api_secret' => $cloudinary_config['api_secret']
            ]
        ]);
        
        // Upload using SDK
        $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
        $result = $uploadApi->upload($file_tmp, [
            'folder' => 'mannar',
            'resource_type' => 'image'
        ]);
        
        // Return success response
        sendResponse([
            'success' => true,
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
            'width' => $result['width'],
            'height' => $result['height'],
            'format' => $result['format']
        ]);
    } catch (Exception $e) {
        // If SDK fails, fall back to API
        handleCloudinaryApiUpload($file_tmp, $cloudinary_config);
    }
} else {
    // If SDK not available, use direct API
    handleCloudinaryApiUpload($file_tmp, $cloudinary_config);
}

/**
 * Upload directly to Cloudinary API
 * @param string $file_path Path to the temporary file
 * @param array $config Cloudinary configuration
 */
function handleCloudinaryApiUpload($file_path, $config) {
    try {
        $timestamp = time();
        $data = [
            'timestamp' => $timestamp,
            'api_key' => $config['api_key']
        ];
        
        // Generate signature
        $signature = generateCloudinarySignature($data, $config['api_secret']);
        
        // Create form data
        $post_data = [
            'file' => new CURLFile($file_path),
            'timestamp' => $timestamp,
            'api_key' => $config['api_key'],
            'signature' => $signature,
            'folder' => 'mannar'
        ];
        
        // Send to Cloudinary
        $ch = curl_init("https://api.cloudinary.com/v1_1/{$config['cloud_name']}/image/upload");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch) || $http_code !== 200) {
            $error = curl_error($ch) ?: "HTTP Error: $http_code";
            curl_close($ch);
            
            // Fall back to local upload
            fallbackToLocalUpload($file_path);
            return;
        }
        
        curl_close($ch);
        $result = json_decode($response, true);
        
        if (!$result || !isset($result['secure_url'])) {
            // Fall back to local upload
            fallbackToLocalUpload($file_path);
            return;
        }
        
        // Return success response
        sendResponse([
            'success' => true,
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
            'width' => $result['width'],
            'height' => $result['height'],
            'format' => $result['format']
        ]);
    } catch (Exception $e) {
        // Fall back to local upload
        fallbackToLocalUpload($file_path);
    }
}

/**
 * Generate Cloudinary signature
 * @param array $params Parameters to sign
 * @param string $secret Cloudinary API secret
 * @return string Signature
 */
function generateCloudinarySignature($params, $secret) {
    $to_sign = [];
    foreach ($params as $key => $value) {
        $to_sign[] = "$key=$value";
    }
    sort($to_sign);
    $to_sign = implode('&', $to_sign);
    
    return sha1($to_sign . $secret);
}

/**
 * Fall back to local upload if Cloudinary fails
 * @param string $file_path Path to the temporary file
 */
function fallbackToLocalUpload($file_path) {
    // Configuration
    $upload_dir = __DIR__ . '/uploads/';
    
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
    $original_name = pathinfo($_FILES['image']['name'], PATHINFO_FILENAME);
    $extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    
    // Sanitize filename
    $original_name = preg_replace('/[^a-zA-Z0-9_-]/', '', $original_name);
    $original_name = str_replace(' ', '_', $original_name);
    $original_name = substr($original_name, 0, 50); // Limit length
    
    // Create final filename
    $filename = $timestamp . '_' . $random . '_' . $original_name . '.' . $extension;
    $destination = $upload_dir . $filename;
    
    // Move and secure the file
    if (move_uploaded_file($file_path, $destination)) {
        chmod($destination, 0644); // Set proper permissions
        
        // Generate URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $file_url = $protocol . '://' . $host . '/uploads/' . $filename;
        
        // Return success response with fallback notice
        sendResponse([
            'success' => true,
            'url' => $file_url,
            'filename' => $filename,
            'fallback' => true,
            'message' => 'Cloudinary upload failed, image saved locally'
        ]);
    } else {
        sendError('Error saving the file locally', 500);
    }
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
?>