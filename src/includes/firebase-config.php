 <?php
/**
 * firebase-config.php
 * Centralized Firebase configuration for PHP components
 */

// In a production environment, you would store these in environment variables
// using something like $_ENV['FIREBASE_API_KEY'] or getenv('FIREBASE_API_KEY')

// Firebase configuration
$firebase_config = [
    'apiKey' => "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    'authDomain' => "mannar-129a5.firebaseapp.com",
    'projectId' => "mannar-129a5",
    'storageBucket' => "mannar-129a5.firebasestorage.app",
    'messagingSenderId' => "687710492532",
    'appId' => "1:687710492532:web:c7b675da541271f8d83e21",
    'measurementId' => "G-NXBLYJ5CXL"
];

// Create JSON version for JavaScript
$firebase_config_json = json_encode($firebase_config);

// PHP Admin Secret (for server-side validation)
$admin_secret = "your-secret-admin-key"; // Replace with a strong secret in production

/**
 * Creates a JavaScript snippet to initialize Firebase
 * @return string The JavaScript code
 */
function getFirebaseInitScript() {
    global $firebase_config_json;
    
    return <<<EOT
<script>
  // Centralized Firebase configuration
  const FIREBASE_CONFIG = {$firebase_config_json};

  // Initialize Firebase safely
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
  } else {
    console.error("Firebase SDK not loaded. Please check your connection and try again.");
  }
</script>
EOT;
}

/**
 * Validate authentication and admin permissions
 * For server-side operations requiring admin privileges
 * @param string $token Authentication token
 * @return bool Whether the user is authenticated as admin
 */
function validateAdminToken($token) {
    global $admin_secret;
    
    // In production, validate against Firebase Admin SDK or your auth system
    // This is a simplified example
    if (empty($token)) {
        return false;
    }
    
    // Compare with your stored admin token
    return $token === $admin_secret;
}

/**
 * Get Firebase credentials for server-side API access
 * @return array Firebase credentials
 */
function getFirebaseServerCredentials() {
    global $firebase_config;
    
    // In production, you would load a service account JSON file
    // For service account: return json_decode(file_get_contents('path/to/serviceAccountKey.json'), true);
    
    return $firebase_config;
}