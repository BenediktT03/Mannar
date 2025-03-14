<?php
/**
 * Contact Form Handler
 * 
 * Processes contact form submissions from the website.
 * Validates input, stores messages, and sends email notifications.
 */

// Load bootstrap
require_once __DIR__ . '/../../bootstrap.php';

// Include core initialization
require_once SRC_PATH . '/core/init.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit;
}

// Check if contact form is enabled
if (!defined('FEATURES') || !isset(FEATURES['enable_contact_form']) || !FEATURES['enable_contact_form']) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'Contact form is disabled'
    ]);
    exit;
}

// Validate CSRF token
if (!isset($_POST['csrf_token']) || !verify_csrf_token($_POST['csrf_token'])) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'CSRF validation failed'
    ]);
    exit;
}

// Get form data
$name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$subject = isset($_POST['subject']) ? sanitize_input($_POST['subject']) : 'Kontaktanfrage';
$message = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';

// Validate input
$errors = [];

if (empty($name)) {
    $errors['name'] = 'Bitte geben Sie Ihren Namen ein.';
}

if (empty($email)) {
    $errors['email'] = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
}

if (empty($message)) {
    $errors['message'] = 'Bitte geben Sie eine Nachricht ein.';
}

// If validation failed, return errors
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit;
}

// Store message in the database or file system
$savedMessage = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'ip' => get_client_ip(),
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'timestamp' => time()
];

// Store in file if database is not available
$messagesDir = APP_PATH . '/data/messages';
if (!is_dir($messagesDir)) {
    mkdir($messagesDir, 0755, true);
}

$filename = $messagesDir . '/' . date('Y-m-d_H-i-s') . '_' . substr(md5($email . time()), 0, 8) . '.json';
$success = file_put_contents($filename, json_encode($savedMessage, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// If we have a database, also store there
if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER')) {
    try {
        $db = Database::getInstance();
        $success = $db->insert('messages', [
            'name' => $name,
            'email' => $email,
            'subject' => $subject,
            'message' => $message,
            'ip' => get_client_ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'created_at' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        // Log the error but continue with file storage
        error_log('Database error: ' . $e->getMessage());
    }
}

// Send email notification if configured
if (defined('EMAIL_CONFIG') && isset(EMAIL_CONFIG['contact_email'])) {
    $to = EMAIL_CONFIG['contact_email'];
    $emailSubject = "Neue Kontaktanfrage: {$subject}";
    
    $headers = [
        'From' => "Mannar Website <{$to}>",
        'Reply-To' => "{$name} <{$email}>",
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/html; charset=UTF-8'
    ];
    
    $emailBody = "
    <html>
    <head>
        <title>Neue Kontaktanfrage</title>
    </head>
    <body>
        <h2>Neue Kontaktanfrage über die Website</h2>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>E-Mail:</strong> {$email}</p>
        <p><strong>Betreff:</strong> {$subject}</p>
        <p><strong>Nachricht:</strong></p>
        <div style='background-color: #f5f5f5; padding: 10px; border-left: 4px solid #007bff;'>
            " . nl2br(htmlspecialchars($message)) . "
        </div>
        <p><small>Gesendet: " . date('d.m.Y H:i:s') . "</small></p>
    </body>
    </html>
    ";
    
    // Use SMTP if configured
    if (isset(EMAIL_CONFIG['use_smtp']) && EMAIL_CONFIG['use_smtp']) {
        // Send email using SMTP (requires additional library)
        // This is a placeholder for SMTP implementation
        // In a real scenario, you would use a library like PHPMailer or Swift Mailer
        $smtpSuccess = false;
        // Log that SMTP is configured but not implemented
        error_log('SMTP is configured but implementation is not available');
    } else {
        // Send using PHP mail function
        $headerStrings = [];
        foreach ($headers as $key => $value) {
            $headerStrings[] = "{$key}: {$value}";
        }
        
        $mailSuccess = mail($to, $emailSubject, $emailBody, implode("\r\n", $headerStrings));
    }
}

// Return success response
echo json_encode([
    'success' => $success !== false,
    'message' => $success !== false 
        ? 'Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei Ihnen melden.' 
        : 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.'
]);