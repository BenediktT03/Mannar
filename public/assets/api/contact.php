<?php
/**
 * Contact Form API Endpoint
 * 
 * Processes contact form submissions with validation, security checks,
 * spam detection, and stores messages for backup.
 * 
 * @package Mannar
 * @subpackage API
 */

// Initialize the application
require_once __DIR__ . '/../../src/core/init.php';

// Only process if contact form is enabled
if (!ENABLE_CONTACT_FORM) {
    json_response([
        'success' => false,
        'error' => 'Contact form is currently disabled.'
    ], 403);
}

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

// Check for rate limiting
if (is_rate_limited('contact_form', 3, 60)) { // 3 submissions per minute
    json_response([
        'success' => false,
        'error' => 'Too many submissions. Please try again later.'
    ], 429);
}

// Get and sanitize input
$name = sanitize_input($_POST['name'] ?? '');
$email = sanitize_input($_POST['email'] ?? '');
$subject = sanitize_input($_POST['subject'] ?? 'Contact Form Submission');
$message = sanitize_input($_POST['message'] ?? '');

// Validate required fields
if (empty($name) || empty($email) || empty($message)) {
    json_response([
        'success' => false,
        'error' => 'Please fill in all required fields.'
    ], 400);
}

// Validate email
if (!validate_email($email)) {
    json_response([
        'success' => false,
        'error' => 'Please enter a valid email address.'
    ], 400);
}

// Simple spam check
if (is_spam($message)) {
    json_response([
        'success' => false,
        'error' => 'Your message was flagged as potential spam. Please try again.'
    ], 400);
}

// Prepare email content
$email_config = EMAIL_CONFIG;
$to = $email_config['contact_email'];
$email_subject = "Website Contact: " . $subject;
$email_message = "Name: $name\n";
$email_message .= "Email: $email\n\n";
$email_message .= "Message:\n$message\n";

// Add IP for tracking spam
if (DEBUG_MODE) {
    $email_message .= "\n\nIP: " . get_client_ip();
    $email_message .= "\nUser Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown');
    $email_message .= "\nTimestamp: " . date('Y-m-d H:i:s');
}

// Email headers
$headers = "From: {$email_config['from_name']} <{$email_config['from_email']}>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Attempt to send email
$mail_sent = false;

try {
    // Try to send email using PHP mail() function
    $mail_sent = mail($to, $email_subject, $email_message, $headers);
    
    // Log the email for debugging
    if (DEBUG_MODE) {
        error_log("Contact form email: To: $to, From: {$email_config['from_email']}, Subject: $email_subject");
    }
    
    // Store the message in database or file (for backup)
    store_contact_message([
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'ip' => get_client_ip(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'timestamp' => time()
    ]);
    
    // Update rate limiting
    update_rate_limit('contact_form');
    
    if ($mail_sent) {
        // Success response
        json_response([
            'success' => true,
            'message' => 'Thank you for your message. We will get back to you soon!'
        ]);
    } else {
        // Email sending failed
        throw new Exception('Failed to send email');
    }
} catch (Exception $e) {
    // Log the error
    error_log('Contact form error: ' . $e->getMessage());
    
    // Still store the message for manual processing
    store_contact_message([
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'ip' => get_client_ip(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'timestamp' => time(),
        'error' => $e->getMessage()
    ]);
    
    // Error response
    json_response([
        'success' => false,
        'error' => 'Unable to send your message at this time. Please try again later or contact us directly.'
    ], 500);
}

/**
 * Check if a message might be spam
 * 
 * @param string $message Message to check
 * @return bool True if message is likely spam
 */
function is_spam($message) {
    // Simple spam check: Look for too many URLs or spammy keywords
    $url_count = preg_match_all('#https?://[^\s<>"]+|www\.[^\s<>"]+#', $message);
    
    if ($url_count > 3) {
        return true;
    }
    
    // Check for common spam keywords
    $spam_keywords = [
        'viagra', 'casino', 'buy cheap', 'free offer', 'winner', 'buy now',
        'cheap meds', 'weight loss', 'earn money', 'make money fast'
    ];
    
    $message_lower = strtolower($message);
    foreach ($spam_keywords as $keyword) {
        if (strpos($message_lower, $keyword) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Check if requests are rate limited
 * 
 * @param string $key Rate limit key (e.g., 'contact_form')
 * @param int $max Maximum attempts allowed
 * @param int $period Period in seconds
 * @return bool True if rate limited
 */
function is_rate_limited($key, $max, $period) {
    $ip = get_client_ip();
    $rate_key = "rate_limit:{$key}:{$ip}";
    
    // Use session for simple rate limiting
    if (!isset($_SESSION[$rate_key])) {
        $_SESSION[$rate_key] = [
            'count' => 0,
            'first_attempt' => time()
        ];
    }
    
    $rate_data = $_SESSION[$rate_key];
    
    // Reset if period has passed
    if (time() - $rate_data['first_attempt'] > $period) {
        $_SESSION[$rate_key] = [
            'count' => 0,
            'first_attempt' => time()
        ];
        return false;
    }
    
    // Check if maximum attempts reached
    if ($rate_data['count'] >= $max) {
        return true;
    }
    
    return false;
}

/**
 * Update rate limit counter
 * 
 * @param string $key Rate limit key
 * @return void
 */
function update_rate_limit($key) {
    $ip = get_client_ip();
    $rate_key = "rate_limit:{$key}:{$ip}";
    
    if (isset($_SESSION[$rate_key])) {
        $_SESSION[$rate_key]['count']++;
    }
}

/**
 * Store contact message for backup
 * 
 * @param array $data Message data
 * @return bool Success status
 */
function store_contact_message($data) {
    // Use the new data directory structure
    $messages_dir = __DIR__ . '/../../data/messages';
    
    // Create directory if it doesn't exist
    if (!is_dir($messages_dir)) {
        mkdir($messages_dir, 0750, true);
    }
    
    $filename = $messages_dir . '/' . date('Y-m-d_H-i-s') . '_' . md5($data['email']) . '.json';
    
    return file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT)) !== false;
}