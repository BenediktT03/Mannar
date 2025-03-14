<?php
/**
 * Firebase Configuration
 * 
 * Firebase connection settings and credentials for the Mannar website.
 * This file is used to initialize Firebase services.
 */

// Firebase project settings
define('FIREBASE_CONFIG', [
    'api_key' => 'AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM',
    'auth_domain' => 'mannar-129a5.firebaseapp.com',
    'project_id' => 'mannar-129a5',
    'storage_bucket' => 'mannar-129a5.firebasestorage.app',
    'messaging_sender_id' => '687710492532',
    'app_id' => '1:687710492532:web:c7b675da541271f8d83e21',
    'measurement_id' => 'G-NXBLYJ5CXL',
    'database_uri' => 'https://mannar-129a5.firebaseio.com',
    
    // Service account key file path (for server-side operations)
    'service_account_path' => APP_PATH . '/config/firebase-credentials.json',
    
    // Admin user emails allowed to access the admin panel
    'admin_emails' => [
        'admin@mannar.example.com',
        'webmaster@mannar.example.com'
    ],
    
    // JWT secret for custom authentication (if not using Firebase Auth)
    'jwt_secret' => 'your_very_secure_secret_key_for_jwt_tokens',
    
    // URLs for operations
    'password_reset_url' => BASE_URL . '/reset-password.php',
    'verify_email_url' => BASE_URL . '/verify-email.php',
    
    // Cloudinary configuration for image uploads
    'cloudinary' => [
        'cloud_name' => 'dlegnsmho',
        'api_key' => '811453586293945',
        'api_secret' => 'ygiBwVjmJJNsPmmVJ9lhAUDz9lQ',
        'upload_preset' => 'ml_default'
    ]
]);

return FIREBASE_CONFIG;