<?php
// Enhanced Upload Script with improved security
header('Content-Type: application/json');

// Configuration
$upload_dir = '../uploads/';
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
$max_file_size = 5 * 1024 * 1024; // 5MB

// Error response helper
function return_error($message) {
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

// Directory check with proper permissions
if (!file_exists($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        return_error('Failed to create uploads directory');
    }
}

// Basic CSRF protection
if (!isset($_SERVER['HTTP_REFERER']) || parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) !== $_SERVER['HTTP_HOST']) {
    return_error('Invalid request origin');
}

// File upload validation
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error_msg = isset($_FILES['image']) ? 'Upload error: ' . $_FILES['image']['error'] : 'No image uploaded';
    return_error($error_msg);
}

// Enhanced file checking
$file = $_FILES['image'];
$file_type = $file['type'];
$file_size = $file['size'];
$file_tmp = $file['tmp_name'];

// Verify MIME type with fileinfo
$finfo = new finfo(FILEINFO_MIME_TYPE);
$file_mime = $finfo->file($file_tmp);
if (!in_array($file_mime, $allowed_types)) {
    return_error('Unsupported file type. Only JPEG, PNG, GIF, and SVG are allowed.');
}

// Size check
if ($file_size > $max_file_size) {
    return_error('File is too large. Maximum size: 5MB.');
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
    
    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'url' => $file_url
    ]);
} else {
    return_error('Error saving the file. Please try again.');
}