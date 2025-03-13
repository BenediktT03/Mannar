 <?php
/**
 * Authentication Service
 * Provides authentication functionality using Firebase Auth
 */

require_once 'src/utils/security.php';

class AuthService {
    /**
     * @var AuthService Singleton instance
     */
    private static $instance = null;
    
    /**
     * @var object Firebase SDK instance
     */
    private $firebase = null;
    
    /**
     * @var array Firebase configuration
     */
    private $config = [];
    
    /**
     * @var string Firebase JWT secret (if using custom authentication)
     */
    private $jwtSecret = '';
    
    /**
     * @var int Token expiration time in seconds
     */
    private $tokenExpiry = 3600; // 1 hour
    
    /**
     * Private constructor for singleton pattern
     */
    private function __construct() {
        // Load Firebase configuration
        if (defined('FIREBASE_CONFIG')) {
            $this->config = FIREBASE_CONFIG;
        } else {
            // Load from configuration file if constant not defined
            $configFile = __DIR__ . '/../config/firebase.php';
            if (file_exists($configFile)) {
                $this->config = require $configFile;
            }
        }
        
        // Initialize Firebase SDK (if available)
        if (class_exists('Kreait\Firebase\Factory')) {
            try {
                $factory = (new \Kreait\Firebase\Factory())
                    ->withServiceAccount($this->config['service_account_path'] ?? null)
                    ->withDatabaseUri($this->config['database_uri'] ?? null);
                
                $this->firebase = $factory->createAuth();
            } catch (\Exception $e) {
                error_log('Firebase initialization error: ' . $e->getMessage());
            }
        }
        
        // Set JWT secret for custom authentication
        $this->jwtSecret = $this->config['jwt_secret'] ?? '';
        
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * Get singleton instance
     * 
     * @return AuthService Instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * Check if user is authenticated
     * 
     * @return bool True if authenticated
     */
    public function isAuthenticated() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    /**
     * Check if user is an administrator
     * 
     * @return bool True if administrator
     */
    public function isAdmin() {
        return $this->isAuthenticated() && 
               (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin');
    }
    
    /**
     * Authenticate user with email and password
     * 
     * @param string $email User email
     * @param string $password User password
     * @return array Result with success status and user information
     */
    public function login($email, $password) {
        // Validate email and password
        if (empty($email) || empty($password)) {
            return [
                'success' => false,
                'error' => 'Email and password are required'
            ];
        }
        
        try {
            // If Firebase SDK is available, use it for authentication
            if ($this->firebase) {
                $signInResult = $this->firebase->signInWithEmailAndPassword($email, $password);
                $user = $signInResult->data();
                
                // Store user info in session
                $_SESSION['user_id'] = $user['localId'];
                $_SESSION['user_email'] = $email;
                $_SESSION['user_display_name'] = $user['displayName'] ?? '';
                $_SESSION['user_role'] = $this->getUserRole($user['localId']);
                $_SESSION['login_time'] = time();
                $_SESSION['last_activity'] = time();
                
                return [
                    'success' => true,
                    'user' => [
                        'id' => $user['localId'],
                        'email' => $email,
                        'display_name' => $user['displayName'] ?? '',
                        'role' => $_SESSION['user_role']
                    ]
                ];
            } 
            
            // If Firebase SDK not available, use REST API (alternative)
            $apiKey = $this->config['api_key'] ?? '';
            
            if (empty($apiKey)) {
                return [
                    'success' => false,
                    'error' => 'Firebase API key not configured'
                ];
            }
            
            // Build request to Firebase Auth REST API
            $data = [
                'email' => $email,
                'password' => $password,
                'returnSecureToken' => true
            ];
            
            $ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={$apiKey}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            curl_close($ch);
            
            if ($httpCode !== 200) {
                $error = json_decode($response, true);
                return [
                    'success' => false,
                    'error' => $error['error']['message'] ?? 'Authentication failed'
                ];
            }
            
            $result = json_decode($response, true);
            
            // Store user info in session
            $_SESSION['user_id'] = $result['localId'];
            $_SESSION['user_email'] = $email;
            $_SESSION['user_display_name'] = $result['displayName'] ?? '';
            $_SESSION['user_token'] = $result['idToken'];
            $_SESSION['user_refresh_token'] = $result['refreshToken'];
            $_SESSION['token_expires'] = time() + (int)$result['expiresIn'];
            $_SESSION['user_role'] = $this->getUserRole($result['localId']);
            $_SESSION['login_time'] = time();
            $_SESSION['last_activity'] = time();
            
            return [
                'success' => true,
                'user' => [
                    'id' => $result['localId'],
                    'email' => $email,
                    'display_name' => $result['displayName'] ?? '',
                    'role' => $_SESSION['user_role']
                ]
            ];
            
        } catch (\Exception $e) {
            error_log('Authentication error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => 'Authentication failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Log out the current user
     * 
     * @return bool Success status
     */
    public function logout() {
        $_SESSION = [];
        
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        
        session_destroy();
        
        return true;
    }
    
    /**
     * Get current user information
     * 
     * @return array|null User information or null if not authenticated
     */
    public function getCurrentUser() {
        if (!$this->isAuthenticated()) {
            return null;
        }
        
        return [
            'id' => $_SESSION['user_id'] ?? '',
            'email' => $_SESSION['user_email'] ?? '',
            'display_name' => $_SESSION['user_display_name'] ?? '',
            'role' => $_SESSION['user_role'] ?? 'user',
            'login_time' => $_SESSION['login_time'] ?? 0,
            'last_activity' => $_SESSION['last_activity'] ?? 0
        ];
    }
    
    /**
     * Get user role from Firebase database
     * 
     * @param string $userId User ID
     * @return string User role (default: 'user')
     */
    private function getUserRole($userId) {
        // In a real application, you would fetch the user's role from Firestore
        // This is a simplified example - replace with actual role retrieval logic
        
        try {
            // Example: Query Firestore for user roles
            if ($this->firebase && class_exists('Kreait\Firebase\Factory')) {
                $factory = (new \Kreait\Firebase\Factory())
                    ->withServiceAccount($this->config['service_account_path'] ?? null)
                    ->withDatabaseUri($this->config['database_uri'] ?? null);
                
                $firestore = $factory->createFirestore();
                $userDoc = $firestore->database()->collection('users')->document($userId)->snapshot();
                
                if ($userDoc->exists()) {
                    $userData = $userDoc->data();
                    return $userData['role'] ?? 'user';
                }
            }
            
            // If Firestore isn't available or user not found, check hard-coded admin list
            $adminEmails = $this->config['admin_emails'] ?? [];
            
            if (in_array($_SESSION['user_email'] ?? '', $adminEmails)) {
                return 'admin';
            }
            
            return 'user';
        } catch (\Exception $e) {
            error_log('Error retrieving user role: ' . $e->getMessage());
            return 'user'; // Default role
        }
    }
    
    /**
     * Update user's last activity timestamp
     * 
     * @return void
     */
    public function updateLastActivity() {
        if ($this->isAuthenticated()) {
            $_SESSION['last_activity'] = time();
        }
    }
    
    /**
     * Check if session has timed out due to inactivity
     * 
     * @param int $maxIdleTime Maximum idle time in seconds
     * @return bool True if session has timed out
     */
    public function hasSessionTimedOut($maxIdleTime = 1800) { // Default: 30 minutes
        if (!$this->isAuthenticated()) {
            return false;
        }
        
        $lastActivity = $_SESSION['last_activity'] ?? 0;
        
        return (time() - $lastActivity) > $maxIdleTime;
    }
    
    /**
     * Generate a password reset link
     * 
     * @param string $email User email
     * @return array Result with success status and reset link or error
     */
    public function generatePasswordResetLink($email) {
        if (empty($email)) {
            return [
                'success' => false,
                'error' => 'Email is required'
            ];
        }
        
        try {
            // If Firebase SDK is available, use it
            if ($this->firebase) {
                $actionCodeSettings = [
                    'url' => $this->config['password_reset_url'] ?? (BASE_URL . '/reset-password.php'),
                    'handleCodeInApp' => false
                ];
                
                $link = $this->firebase->getPasswordResetLink($email, $actionCodeSettings);
                
                return [
                    'success' => true,
                    'reset_link' => $link
                ];
            }
            
            // If Firebase SDK not available, use REST API
            $apiKey = $this->config['api_key'] ?? '';
            
            if (empty($apiKey)) {
                return [
                    'success' => false,
                    'error' => 'Firebase API key not configured'
                ];
            }
            
            $data = [
                'requestType' => 'PASSWORD_RESET',
                'email' => $email
            ];
            
            $ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={$apiKey}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            curl_close($ch);
            
            if ($httpCode !== 200) {
                $error = json_decode($response, true);
                return [
                    'success' => false,
                    'error' => $error['error']['message'] ?? 'Failed to generate password reset link'
                ];
            }
            
            return [
                'success' => true,
                'message' => 'Password reset email sent successfully'
            ];
            
        } catch (\Exception $e) {
            error_log('Password reset error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => 'Failed to generate password reset link: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Check if a user with the given email exists
     * 
     * @param string $email User email
     * @return bool True if user exists
     */
    public function userExists($email) {
        if (empty($email)) {
            return false;
        }
        
        try {
            // If Firebase SDK is available, use it
            if ($this->firebase) {
                try {
                    $user = $this->firebase->getUserByEmail($email);
                    return true;
                } catch (\Exception $e) {
                    // User not found
                    return false;
                }
            }
            
            // If Firebase SDK not available, use REST API
            $apiKey = $this->config['api_key'] ?? '';
            
            if (empty($apiKey)) {
                return false;
            }
            
            $data = [
                'email' => $email,
                'returnSecureToken' => false
            ];
            
            $ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key={$apiKey}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            $response = curl_exec($ch);
            curl_close($ch);
            
            $result = json_decode($response, true);
            
            return isset($result['registered']) && $result['registered'] === true;
            
        } catch (\Exception $e) {
            error_log('User exists check error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verify Firebase ID token
     * 
     * @param string $idToken Firebase ID token
     * @return array Result with success status and user information
     */
    public function verifyIdToken($idToken) {
        if (empty($idToken)) {
            return [
                'success' => false,
                'error' => 'ID token is required'
            ];
        }
        
        try {
            // If Firebase SDK is available, use it
            if ($this->firebase) {
                $verifiedToken = $this->firebase->verifyIdToken($idToken);
                $uid = $verifiedToken->getClaim('sub');
                $user = $this->firebase->getUser($uid);
                
                return [
                    'success' => true,
                    'user' => [
                        'id' => $uid,
                        'email' => $user->email,
                        'display_name' => $user->displayName ?? '',
                        'role' => $this->getUserRole($uid)
                    ]
                ];
            }
            
            // If Firebase SDK not available, token verification is not supported
            return [
                'success' => false,
                'error' => 'Token verification requires Firebase SDK'
            ];
            
        } catch (\Exception $e) {
            error_log('Token verification error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => 'Token verification failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Refresh Firebase ID token
     * 
     * @param string $refreshToken Firebase refresh token
     * @return array Result with success status and new tokens
     */
    public function refreshToken($refreshToken = null) {
        if (empty($refreshToken)) {
            $refreshToken = $_SESSION['user_refresh_token'] ?? null;
        }
        
        if (empty($refreshToken)) {
            return [
                'success' => false,
                'error' => 'Refresh token is required'
            ];
        }
        
        try {
            $apiKey = $this->config['api_key'] ?? '';
            
            if (empty($apiKey)) {
                return [
                    'success' => false,
                    'error' => 'Firebase API key not configured'
                ];
            }
            
            $data = [
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken
            ];
            
            $ch = curl_init("https://securetoken.googleapis.com/v1/token?key={$apiKey}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            curl_close($ch);
            
            if ($httpCode !== 200) {
                $error = json_decode($response, true);
                return [
                    'success' => false,
                    'error' => $error['error']['message'] ?? 'Failed to refresh token'
                ];
            }
            
            $result = json_decode($response, true);
            
            // Update session
            $_SESSION['user_token'] = $result['id_token'];
            $_SESSION['user_refresh_token'] = $result['refresh_token'];
            $_SESSION['token_expires'] = time() + (int)$result['expires_in'];
            
            return [
                'success' => true,
                'id_token' => $result['id_token'],
                'refresh_token' => $result['refresh_token'],
                'expires_in' => $result['expires_in']
            ];
            
        } catch (\Exception $e) {
            error_log('Token refresh error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => 'Failed to refresh token: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Check if token needs refresh
     * 
     * @param int $buffer Buffer time in seconds
     * @return bool True if token needs refresh
     */
    public function needsTokenRefresh($buffer = 300) { // Default: 5 minutes buffer
        if (!$this->isAuthenticated()) {
            return false;
        }
        
        $tokenExpires = $_SESSION['token_expires'] ?? 0;
        
        return (time() + $buffer) >= $tokenExpires;
    }
    
    /**
     * Get user information by ID
     * 
     * @param string $userId User ID
     * @return array|null User information or null if not found
     */
    public function getUserInfo($userId) {
        if (empty($userId)) {
            return null;
        }
        
        try {
            // If Firebase SDK is available, use it
            if ($this->firebase) {
                $user = $this->firebase->getUser($userId);
                
                return [
                    'id' => $user->uid,
                    'email' => $user->email,
                    'display_name' => $user->displayName ?? '',
                    'role' => $this->getUserRole($userId)
                ];
            }
            
            return null;
            
        } catch (\Exception $e) {
            error_log('Get user info error: ' . $e->getMessage());
            return null;
        }
    }
}