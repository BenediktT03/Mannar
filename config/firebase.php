<?php
/**
 * Firebase Configuration
 * Centralized settings for Firebase integration
 * 
 * This file contains all Firebase configuration parameters used throughout the application
 * to ensure consistency and easier maintenance.
 */

// Prevent direct access to this file
if (!defined('APP_PATH')) {
    exit('Direct script access is not allowed.');
}

// Firebase project configuration
define('FIREBASE_CONFIG', [
    // Core Firebase settings
    'apiKey' => "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    'authDomain' => "mannar-129a5.firebaseapp.com",
    'projectId' => "mannar-129a5",
    'storageBucket' => "mannar-129a5.firebasestorage.app",
    'messagingSenderId' => "687710492532",
    'appId' => "1:687710492532:web:c7b675da541271f8d83e21",
    'measurementId' => "G-NXBLYJ5CXL"
]);

// Firebase Firestore collections
define('FIREBASE_COLLECTIONS', [
    'content' => 'content',     // Main content collection
    'pages' => 'pages',         // Individual pages collection
    'users' => 'users',         // Users collection
    'settings' => 'settings'    // Application settings collection
]);

// Firebase Storage paths
define('FIREBASE_STORAGE', [
    'images' => 'images/',      // Path for image storage
    'uploads' => 'uploads/',    // Path for general uploads
    'profile' => 'profiles/'    // Path for profile images
]);

// Firebase Auth settings
define('FIREBASE_AUTH', [
    'emailVerification' => true,  // Whether to require email verification
    'passwordResetUrl' => 'https://mannar-129a5.firebaseapp.com/reset-password', // Password reset URL
    'adminEmails' => [            // List of admin email addresses
        // Add admin emails here
    ]
]);

/**
 * Get Firebase configuration for JavaScript
 * 
 * @return string JavaScript code with Firebase configuration
 */
function get_firebase_js_config() {
    return "
    <script>
        // Firebase configuration
        const firebaseConfig = " . json_encode(FIREBASE_CONFIG) . ";
        
        // Initialize Firebase
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            } else {
                firebase.app();
            }
        }
    </script>";
}