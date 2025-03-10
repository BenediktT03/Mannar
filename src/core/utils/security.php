 <?php
// Create new file: src/core/utils/security.php

/**
 * Security utilities
 */

/**
 * Generate CSRF token
 * 
 * @param int $expiry Token expiry time in seconds (default 3600 = 1 hour)
 * @return string Generated token
 */
function generate_csrf_token($expiry = 3600) {
    $salt = 'mannar-csrf-protection';
    $timestamp = time();
    $expiry_time = $timestamp + $expiry;
    
    // Store expiry in session
    $_SESSION['csrf_expiry'] = $expiry_time;
    
    // Generate token with timestamp for extra security
    return hash('sha256', $salt . $timestamp . session_id());
}

/**
 * Verify CSRF token validity
 * 
 * @param string $token Token to verify
 * @return bool Token validity
 */
function verify_csrf_token($token) {
    // Check if token exists and session hasn't expired
    if (empty($token) || empty($_SESSION['csrf_expiry'])) {
        return false;
    }
    
    // Check if token is expired
    if (time() > $_SESSION['csrf_expiry']) {
        return false;
    }
    
    // Validate token against stored value
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Clean user input to prevent XSS
 * 
 * @param string $input User input
 * @return string Sanitized input
 */
function clean_input($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}