/**
 * Authentication Service
 * Centralized service for handling user authentication and permissions
 */
const AuthService = (function() {
  // Store the current authenticated user
  let currentUser = null;
  
  // List of event listeners for auth state changes
  const authListeners = [];
  
  /**
   * Initialize the authentication service
   * @returns {Promise<void>}
   */
  async function init() {
    // Get Firebase Auth instance
    const auth = firebase.auth();
    
    // Set up authentication state change listener
    auth.onAuthStateChanged(user => {
      currentUser = user;
      
      // Notify all listeners of auth state change
      authListeners.forEach(listener => {
        try {
          listener(user);
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      });
    });
  }
  
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Result object with success status and user or error
   */
  async function login(email, password) {
    try {
      const auth = firebase.auth();
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Login error:', error);
      
      return {
        success: false,
        error: {
          code: error.code,
          message: getErrorMessage(error.code) || error.message
        }
      };
    }
  }
  
  /**
   * Logout current user
   * @returns {Promise<Object>} Result object with success status
   */
  async function logout() {
    try {
      const auth = firebase.auth();
      await auth.signOut();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  function isAuthenticated() {
    return currentUser !== null;
  }
  
  /**
   * Get current user
   * @returns {Object|null} Current user or null if not authenticated
   */
  function getCurrentUser() {
    return currentUser;
  }
  
  /**
   * Add listener for authentication state changes
   * @param {Function} listener - Function to call when auth state changes
   * @returns {Function} Function to remove the listener
   */
  function onAuthStateChanged(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    
    authListeners.push(listener);
    
    // Return function to remove the listener
    return () => {
      const index = authListeners.indexOf(listener);
      if (index !== -1) {
        authListeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Reset password for a user
   * @param {string} email - Email of the user
   * @returns {Promise<Object>} Result object with success status
   */
  async function resetPassword(email) {
    if (!email) {
      return {
        success: false,
        error: {
          code: 'auth/invalid-email',
          message: 'Please provide a valid email address.'
        }
      };
    }
    
    try {
      const auth = firebase.auth();
      await auth.sendPasswordResetEmail(email);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      return {
        success: false,
        error: {
          code: error.code,
          message: getErrorMessage(error.code) || error.message
        }
      };
    }
  }
  
  /**
   * Get user-friendly error message for auth error codes
   * @param {string} errorCode - Firebase auth error code
   * @returns {string|null} User-friendly error message or null if no message for this code
   */
  function getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/invalid-email': 'The email address is not valid.',
      'auth/user-disabled': 'This user account has been disabled.',
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'Incorrect password for this account.',
      'auth/email-already-in-use': 'This email address is already in use.',
      'auth/weak-password': 'The password is too weak.',
      'auth/operation-not-allowed': 'This operation is not allowed.',
      'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
      'auth/network-request-failed': 'A network error occurred. Please check your connection.',
      'auth/requires-recent-login': 'This operation requires a recent login. Please log in again.'
    };
    
    return errorMessages[errorCode] || null;
  }
  
  /**
   * Check if current user has administrator role
   * @returns {boolean} True if user is an administrator
   */
  function isAdmin() {
    // In a real application, you would check claims or roles from Firebase
    // For this simple implementation, we'll just check if the user is authenticated
    return isAuthenticated();
  }
  
  /**
   * Get user display name or email
   * @returns {string} User display name or email
   */
  function getUserDisplayName() {
    if (!currentUser) {
      return '';
    }
    
    return currentUser.displayName || currentUser.email || 'User';
  }
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Result object with success status
   */
  async function updateProfile(profileData) {
    if (!currentUser) {
      return {
        success: false,
        error: {
          code: 'auth/no-user',
          message: 'No user is currently logged in.'
        }
      };
    }
    
    try {
      await currentUser.updateProfile(profileData);
      
      return {
        success: true,
        user: currentUser
      };
    } catch (error) {
      console.error('Update profile error:', error);
      
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
  
  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result object with success status
   */
  async function changePassword(currentPassword, newPassword) {
    if (!currentUser) {
      return {
        success: false,
        error: {
          code: 'auth/no-user',
          message: 'No user is currently logged in.'
        }
      };
    }
    
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        error: {
          code: 'auth/invalid-password',
          message: 'Please provide both current and new passwords.'
        }
      };
    }
    
    try {
      // Re-authenticate user first
      const credential = firebase.auth.EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await currentUser.reauthenticateWithCredential(credential);
      
      // Change password
      await currentUser.updatePassword(newPassword);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Change password error:', error);
      
      return {
        success: false,
        error: {
          code: error.code,
          message: getErrorMessage(error.code) || error.message
        }
      };
    }
  }
  
  // Initialize service when loaded
  init().catch(error => {
    console.error('Failed to initialize AuthService:', error);
  });
  
  // Public API
  return {
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    onAuthStateChanged,
    resetPassword,
    isAdmin,
    getUserDisplayName,
    updateProfile,
    changePassword
  };
})();

// Make service globally available
window.AuthService = AuthService;