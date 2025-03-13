<?php
/**
 * Security Utilities
 * Provides comprehensive security functions for the Mannar website
 */

// Ensure session is started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Generate CSRF token with configurable expiry
 * 
 * @param int $expiry Token expiry time in seconds (default 3600 = 1 hour)
 * @return string The generated token
 */
function generate_csrf_token($expiry = 3600) {
    $salt = 'mannar-csrf-protection'; // Change for each project
    $timestamp = time();
    $expiry_time = $timestamp + $expiry;
    
    // Generate a secure random string
    $random = bin2hex(random_bytes(16));
    
    // Create the token
    $token = hash('sha256', $salt . $random . $timestamp . session_id());
    
    // Store token and expiry in session
    $_SESSION['csrf_token'] = $token;
    $_SESSION['csrf_expiry'] = $expiry_time;
    
    return $token;
}

/**
 * Verify CSRF token validity
 * 
 * @param string $token Token to verify
 * @return bool True if valid, false otherwise
 */
function verify_csrf_token($token) {
    // Check if token exists and session hasn't expired
    if (empty($token) || empty($_SESSION['csrf_token']) || empty($_SESSION['csrf_expiry'])) {
        return false;
    }
    
    // Check if token is expired
    if (time() > $_SESSION['csrf_expiry']) {
        // Clear expired token
        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_expiry']);
        return false;
    }
    
    // Validate token with constant-time comparison
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Clean user input to prevent XSS
 * 
 * @param string $input User input to sanitize
 * @return string Sanitized input
 */
function sanitize_input($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Sanitize array of inputs
 * 
 * @param array $inputs Array of user inputs
 * @return array Array of sanitized inputs
 */
function sanitize_inputs($inputs) {
    $sanitized = [];
    
    foreach ($inputs as $key => $input) {
        if (is_array($input)) {
            $sanitized[$key] = sanitize_inputs($input);
        } else {
            $sanitized[$key] = sanitize_input($input);
        }
    }
    
    return $sanitized;
}

/**
 * Sanitize a URL
 * 
 * @param string $url URL to sanitize
 * @return string Sanitized URL or empty string if invalid
 */
function sanitize_url($url) {
    $url = filter_var($url, FILTER_SANITIZE_URL);
    
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        return $url;
    }
    
    return '';
}

/**
 * Generate a secure random string
 * 
 * @param int $length Length of the string
 * @return string Random string
 */
function generate_random_string($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Validate email address
 * 
 * @param string $email Email to validate
 * @return bool True if valid, false otherwise
 */
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Check if request is AJAX
 * 
 * @return bool True if AJAX request, false otherwise
 */
function is_ajax_request() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Get client IP address
 * 
 * @return string IP address
 */
function get_client_ip() {
    $keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($keys as $key) {
        if (!empty($_SERVER[$key])) {
            return filter_var($_SERVER[$key], FILTER_VALIDATE_IP);
        }
    }
    
    return 'UNKNOWN';
}

/**
 * Redirect to another page
 * 
 * @param string $url URL to redirect to
 * @param int $status HTTP status code
 * @return void
 */
function redirect($url, $status = 302) {
    http_response_code($status);
    header("Location: $url");
    exit;
}

/**
 * Set security headers
 * 
 * @return void
 */
function set_security_headers() {
    // Prevent clickjacking
    header('X-Frame-Options: SAMEORIGIN');
    
    // Enable XSS protection in browsers
    header('X-XSS-Protection: 1; mode=block');
    
    // Prevent MIME type sniffing
    header('X-Content-Type-Options: nosniff');
    
    // Referrer policy
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // Permissions policy
    header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
    
    // Content Security Policy - customize as needed
    $csp = "default-src 'self'; " .
           "script-src 'self' https://www.gstatic.com https://cdn.firebase.com https://www.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; " .
           "style-src 'self' https://www.w3schools.com https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; " .
           "img-src 'self' https://res.cloudinary.com data:; " .
           "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " .
           "connect-src 'self' https://*.firebaseio.com https://firestore.googleapis.com wss://*.firebaseio.com https://api.cloudinary.com; " .
           "frame-src 'self' https://*.firebaseapp.com; " .
           "object-src 'none';";
           
    header("Content-Security-Policy: $csp");
}