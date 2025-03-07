<?php
/**
 * Enhanced Cloudinary Upload Handler
 * 
 * Provides a secure and efficient way to upload images to Cloudinary
 * with proper error handling and CSRF protection.
 */

// Include CSRF protection utilities
require_once '../csrf-utils.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Configuration
$cloudinary_cloud_name = 'dlegnsmho';
$cloudinary_api_key = '811453586293945';
$cloudinary_api_secret = 'ygiBwVjmJJNsPmmVJ9lhAUDz9lQ';
$cloudinary_upload_preset = 'ml_default';
$max_file_size = 5 * 1024 * 1024; // 5MB
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

// Security check: Validate CSRF token
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !verifyCsrfToken($_POST['csrf_token'])) {
        echo json_encode([
            'success' => false,
            'error' => 'CSRF validation failed. Please refresh the page and try again.'
        ]);
        exit;
    }
}

// Check if a file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error_msg = isset($_FILES['image']) ? 'Upload error code: ' . $_FILES['image']['error'] : 'No image uploaded';
    echo json_encode([
        'success' => false,
        'error' => $error_msg
    ]);
    exit;
}

// Get file information
$file = $_FILES['image'];
$file_type = $file['type'];
$file_size = $file['size'];
$file_tmp = $file['tmp_name'];
$file_name = $file['name'];

// Validate file type
if (!in_array($file_type, $allowed_types)) {
    echo json_encode([
        'success' => false,
        'error' => 'Unsupported file type. Allowed formats: JPEG, PNG, GIF, and SVG.'
    ]);
    exit;
}

// Validate file size
if ($file_size > $max_file_size) {
    echo json_encode([
        'success' => false,
        'error' => 'File is too large. Maximum size allowed is 5MB.'
    ]);
    exit;
}

// Upload to Cloudinary using the API
try {
    // Generate timestamp and signature for Cloudinary
    $timestamp = time();
    $params = [
        'timestamp' => $timestamp,
        'upload_preset' => $cloudinary_upload_preset
    ];
    
    // Sort parameters alphabetically for signature
    ksort($params);
    
    // Generate signature string
    $signature_string = '';
    foreach ($params as $key => $value) {
        $signature_string .= $key . '=' . $value . '&';
    }
    
    // Remove the last '&' and append the API secret
    $signature_string = rtrim($signature_string, '&') . $cloudinary_api_secret;
    $signature = sha1($signature_string);
    
    // Prepare the request to Cloudinary API
    $post_data = [
        'file' => new CURLFile($file_tmp, $file_type, $file_name),
        'api_key' => $cloudinary_api_key,
        'timestamp' => $timestamp,
        'signature' => $signature,
        'upload_preset' => $cloudinary_upload_preset
    ];
    
    // Additional optional parameters
    if (isset($_POST['folder']) && !empty($_POST['folder'])) {
        $post_data['folder'] = $_POST['folder'];
    }
    
    if (isset($_POST['public_id']) && !empty($_POST['public_id'])) {
        $post_data['public_id'] = $_POST['public_id'];
    }
    
    // Initialize cURL session
    $url = "https://api.cloudinary.com/v1_1/{$cloudinary_cloud_name}/image/upload";
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
    
    // Return success response with image details
    echo json_encode([
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
    // Log the error (in a production environment)
    error_log('Cloudinary upload error: ' . $e->getMessage());
    
    // Return error response
    echo json_encode([
        'success' => false,
        'error' => 'Upload failed: ' . $e->getMessage()
    ]);
}
?>