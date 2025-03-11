<?php
/**
 * Enhanced File Upload Endpoint
 * Handles secure file uploads to Cloudinary with proper validation and error handling
 */

// Initialize the application
require_once __DIR__ . '/../../core/init.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response([
        'success' => false,
        'error' => 'Only POST requests are allowed'
    ], 405);
}

// Verify CSRF token
if (!isset($_POST['csrf_token']) || !verify_csrf_token($_POST['csrf_token'])) {
    json_response([
        'success' => false,
        'error' => 'Invalid security token. Please refresh the page and try again.'
    ], 403);
}

// Check if a file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error_msg = isset($_FILES['image']) 
        ? 'Upload error: ' . get_upload_error_message($_FILES['image']['error'])
        : 'No file uploaded';
    
    json_response([
        'success' => false,
        'error' => $error_msg
    ], 400);
}

// Get file information
$file = $_FILES['image'];
$file_type = $file['type'];
$file_size = $file['size'];
$file_tmp = $file['tmp_name'];
$file_name = sanitize_input($file['name']);

// Validate file type
if (!in_array($file_type, ALLOWED_UPLOAD_TYPES)) {
    json_response([
        'success' => false,
        'error' => 'Unsupported file type. Allowed formats: JPEG, PNG, GIF, and SVG.'
    ], 400);
}

// Validate file size
if ($file_size > MAX_UPLOAD_SIZE) {
    json_response([
        'success' => false,
        'error' => 'File is too large. Maximum size allowed is ' . format_file_size(MAX_UPLOAD_SIZE) . '.'
    ], 400);
}

// Additional security check: verify the file is actually an image
if (!is_valid_image($file_tmp, $file_type)) {
    json_response([
        'success' => false,
        'error' => 'The uploaded file is not a valid image.'
    ], 400);
}

// Try to upload to Cloudinary
try {
    $result = upload_to_cloudinary($file_tmp, $file_type, $file_name, [
        'folder' => sanitize_input($_POST['folder'] ?? ''),
        'public_id' => sanitize_input($_POST['public_id'] ?? '')
    ]);
    
    // Return success response with image details
    json_response([
        'success' => true,
        'url' => $result['secure_url'],
        'public_id' => $result['public_id'],
        'width' => $result['width'],
        'height' => $result['height'],
        'format' => $result['format'],
        'filename' => $result['original_filename'],
        'size' => $result['bytes']
    ]);
    
} catch (Exception $e) {
    // Log the error
    error_log('Cloudinary upload error: ' . $e->getMessage());
    
    // Return error response
    json_response([
        'success' => false,
        'error' => 'Upload failed: ' . $e->getMessage()
    ], 500);
}

/**
 * Upload file to Cloudinary
 * 
 * @param string $file_path Temporary file path
 * @param string $file_type File MIME type
 * @param string $file_name Original file name
 * @param array $options Additional options
 * @return array Cloudinary response
 */
function upload_to_cloudinary($file_path, $file_type, $file_name, $options = []) {
    $cloudinary = CLOUDINARY_CONFIG;
    
    // Generate timestamp and signature
    $timestamp = time();
    $params = [
        'timestamp' => $timestamp,
        'upload_preset' => $cloudinary['upload_preset']
    ];
    
    // Add optional parameters
    if (!empty($options['folder'])) {
        $params['folder'] = $options['folder'];
    }
    
    if (!empty($options['public_id'])) {
        $params['public_id'] = $options['public_id'];
    }
    
    // Sort parameters alphabetically for signature
    ksort($params);
    
    // Generate signature string
    $signature_string = '';
    foreach ($params as $key => $value) {
        $signature_string .= $key . '=' . $value . '&';
    }
    
    // Remove the last '&' and append the API secret
    $signature_string = rtrim($signature_string, '&') . $cloudinary['api_secret'];
    $signature = sha1($signature_string);
    
    // Prepare the request to Cloudinary API
    $post_data = [
        'file' => new CURLFile($file_path, $file_type, $file_name),
        'api_key' => $cloudinary['api_key'],
        'timestamp' => $timestamp,
        'signature' => $signature,
        'upload_preset' => $cloudinary['upload_preset']
    ];
    
    // Add additional parameters
    foreach ($options as $key => $value) {
        if (!empty($value)) {
            $post_data[$key] = $value;
        }
    }
    
    // Initialize cURL session
    $url = "https://api.cloudinary.com/v1_1/{$cloudinary['cloud_name']}/image/upload";
    $ch = curl_init($url);
    
    // Set cURL options
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mannar-Website-Upload/1.0');
    
    // Execute request and get response
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // Check for errors
    if (curl_errno($ch)) {
        throw new Exception('cURL error: ' . curl_error($ch));
    }
    
    if ($http_code != 200) {
        throw new Exception('Cloudinary API returned HTTP code ' . $http_code);
    }
    
    // Close cURL session
    curl_close($ch);
    
    // Parse response from Cloudinary
    $result = json_decode($response, true);
    
    if ($result === null) {
        throw new Exception('Failed to parse Cloudinary response: ' . $response);
    }
    
    if (isset($result['error'])) {
        throw new Exception('Cloudinary error: ' . $result['error']['message']);
    }
    
    return $result;
}

/**
 * Verify if the file is a valid image
 * 
 * @param string $file_path File path
 * @param string $file_type MIME type
 * @return bool True if valid, false otherwise
 */
function is_valid_image($file_path, $file_type) {
    // For SVG files, check for XML declaration and SVG tag
    if ($file_type === 'image/svg+xml') {
        $content = file_get_contents($file_path);
        return strpos($content, '<svg') !== false;
    }
    
    // For other image types, check with getimagesize()
    $image_info = @getimagesize($file_path);
    
    if ($image_info === false) {
        return false;
    }
    
    // Check if image type matches the claimed MIME type
    $detected_type = $image_info['mime'];
    return $detected_type === $file_type;
}

/**
 * Get human-readable error message for upload errors
 * 
 * @param int $error_code PHP upload error code
 * @return string Error message
 */
function get_upload_error_message($error_code) {
    switch ($error_code) {
        case UPLOAD_ERR_INI_SIZE:
            return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
        case UPLOAD_ERR_FORM_SIZE:
            return 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form';
        case UPLOAD_ERR_PARTIAL:
            return 'The uploaded file was only partially uploaded';
        case UPLOAD_ERR_NO_FILE:
            return 'No file was uploaded';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Missing a temporary folder';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Failed to write file to disk';
        case UPLOAD_ERR_EXTENSION:
            return 'A PHP extension stopped the file upload';
        default:
            return 'Unknown upload error';
    }
}

/**
 * Format file size to human-readable format
 * 
 * @param int $bytes Size in bytes
 * @return string Formatted size
 */
function format_file_size($bytes) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $i = 0;
    
    while ($bytes >= 1024 && $i < count($units) - 1) {
        $bytes /= 1024;
        $i++;
    }
    
    return round($bytes, 2) . ' ' . $units[$i];
}