 /**
 * auth.js
 * Handles all authentication-related functionality
 */

import { getAuth } from '../core/firebase.js';
import { showStatus } from '../core/utils.js';

// State
let currentUser = null;
let authListeners = [];

/**
 * Initialize authentication module
 * @returns {Object} Auth methods
 */
export function initAuth() {
  const auth = getAuth();
  if (!auth) return null;
  
  // Set up auth state listener
  auth.onAuthStateChanged(handleAuthStateChange);
  
  return {
    login,
    logout,
    getCurrentUser,
    addAuthStateListener,
    removeAuthStateListener
  };
}

/**
 * Handle authentication state changes
 * @param {Object} user - Firebase user object or null when signed out
 */
function handleAuthStateChange(user) {
  currentUser = user;
  
  // Update UI elements
  updateAuthUI(user);
  
  // Notify all listeners
  authListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error('Error in auth state listener:', error);
    }
  });
  
  console.log(user ? `User logged in: ${user.email}` : 'User logged out');
}

/**
 * Update UI elements based on authentication state
 * @param {Object} user - Firebase user object or null
 */
function updateAuthUI(user) {
  const loginDiv = document.getElementById('loginDiv');
  const adminDiv = document.getElementById('adminDiv');
  
  if (loginDiv) {
    loginDiv.style.display = user ? 'none' : 'block';
  }
  
  if (adminDiv) {
    adminDiv.style.display = user ? 'block' : 'none';
  }
  
  // Reset login form
  if (!user) {
    const emailField = document.getElementById('emailField');
    const passField = document.getElementById('passField');
    const loginError = document.getElementById('loginError');
    
    if (emailField) emailField.value = '';
    if (passField) passField.value = '';
    if (loginError) loginError.textContent = '';
  }
}

/**
 * Add a listener for auth state changes
 * @param {Function} listener - Function to call when auth state changes
 */
export function addAuthStateListener(listener) {
  if (typeof listener !== 'function') return;
  
  // Don't add the same listener twice
  if (!authListeners.includes(listener)) {
    authListeners.push(listener);
  }
}

/**
 * Remove an auth state listener
 * @param {Function} listener - Listener to remove
 */
export function removeAuthStateListener(listener) {
  const index = authListeners.indexOf(listener);
  if (index !== -1) {
    authListeners.splice(index, 1);
  }
}

/**
 * Get the current authenticated user
 * @returns {Object} User object or null
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login result
 */
export async function login(email, password) {
  const auth = getAuth();
  if (!auth) return { success: false, error: 'Auth not initialized' };
  
  // Input validation
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  // Apply rate limiting
  const now = Date.now();
  const lastAttempt = parseInt(localStorage.getItem('lastLoginAttempt') || '0');
  const attemptCount = parseInt(localStorage.getItem('loginAttemptCount') || '0');
  
  if (attemptCount >= 5 && (now - lastAttempt) < 60000) { // 1 minute lockout
    return { success: false, error: 'Too many attempts. Please try again in a minute.' };
  }
  
  // Update attempt tracking
  localStorage.setItem('lastLoginAttempt', now.toString());
  localStorage.setItem('loginAttemptCount', 
    (now - lastAttempt > 300000) ? '1' : (attemptCount + 1).toString()); // Reset after 5 minutes
  
  try {
    // Show loading status
    showStatus('Logging in...', false, 0);
    
    // Attempt login
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Reset attempt counter on success
    localStorage.setItem('loginAttemptCount', '0');
    
    // Success message
    showStatus('Logged in successfully');
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    
    showStatus(`Login failed: ${error.message}`, true);
    
    return { success: false, error: error.message };
  }
}

/**
 * Logout the current user
 * @param {boolean} force - Whether to force logout even with unsaved changes
 * @returns {Promise} Logout result
 */
export async function logout(force = false) {
  const auth = getAuth();
  if (!auth) return { success: false, error: 'Auth not initialized' };
  
  // Check for unsaved changes
  const hasUnsavedChanges = window.isDirty === true;
  
  if (hasUnsavedChanges && !force) {
    const confirmed = confirm('You have unsaved changes. Are you sure you want to log out?');
    if (!confirmed) {
      return { success: false, error: 'Logout canceled due to unsaved changes' };
    }
  }
  
  try {
    // Show loading status
    showStatus('Logging out...', false, 0);
    
    // Sign out
    await auth.signOut();
    
    // Success message
    showStatus('Logged out successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    showStatus(`Error during logout: ${error.message}`, true);
    
    return { success: false, error: error.message };
  }
}

// Handles pressing enter in login form
export function setupLoginForm() {
  const emailField = document.getElementById('emailField');
  const passField = document.getElementById('passField');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  
  if (!emailField || !passField || !loginBtn) return;
  
  // Clear previous listeners to avoid duplicates
  const newEmailField = emailField.cloneNode(true);
  const newPassField = passField.cloneNode(true);
  const newLoginBtn = loginBtn.cloneNode(true);
  
  emailField.parentNode.replaceChild(newEmailField, emailField);
  passField.parentNode.replaceChild(newPassField, passField);
  loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
  
  // Login button click handler
  newLoginBtn.addEventListener('click', async () => {
    // Disable button during login
    newLoginBtn.disabled = true;
    newLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    // Clear previous error
    if (loginError) loginError.textContent = '';
    
    const result = await login(newEmailField.value, newPassField.value);
    
    // Update UI based on result
    if (!result.success && loginError) {
      loginError.textContent = result.error;
    }
    
    // Reset button
    newLoginBtn.disabled = false;
    newLoginBtn.innerHTML = 'Login';
  });
  
  // Enter key handler
  newPassField.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
      // Disable button during login
      newLoginBtn.disabled = true;
      newLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      
      // Clear previous error
      if (loginError) loginError.textContent = '';
      
      const result = await login(newEmailField.value, newPassField.value);
      
      // Update UI based on result
      if (!result.success && loginError) {
        loginError.textContent = result.error;
      }
      
      // Reset button
      newLoginBtn.disabled = false;
      newLoginBtn.innerHTML = 'Login';
    }
  });
}

// Initialize when this module is loaded
initAuth();