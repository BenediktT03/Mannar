/**
 * Admin Core Module
 * Central functionality for managing the admin panel
 */
const AdminCore = (function() {
  // State management
  const state = {
    isAuthenticated: false,
    currentTab: '',
    isDirty: false
  };
  
  // UI Elements cache
  let elements = {};
  
  /**
   * Initialize admin panel
   */
  function init() {
    // Cache DOM elements
    cacheElements();
    
    // Check authentication
    checkAuth();
    
    // Initialize tabs
    initTabs();
    
    // Set up dirty state tracking
    initDirtyStateTracking();
    
    console.log('Admin Panel initialized');
  }
  
  /**
   * Cache DOM elements for faster access
   */
  function cacheElements() {
    elements = {
      // Login elements
      loginDiv: document.getElementById('loginDiv'),
      adminDiv: document.getElementById('adminDiv'),
      loginForm: document.getElementById('loginForm'),
      emailField: document.getElementById('emailField'),
      passField: document.getElementById('passField'),
      loginBtn: document.getElementById('loginBtn'),
      loginError: document.getElementById('loginError'),
      logoutBtn: document.getElementById('logoutBtn'),
      
      // Tab elements
      tabButtons: document.querySelectorAll('.tab-btn'),
      tabContents: document.querySelectorAll('.tab-content'),
      
      // Common elements
      statusMsg: document.getElementById('statusMsg')
    };
  }
  
  /**
   * Check authentication status and setup auth events
   */
  function checkAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.error('Firebase Auth not available');
      showStatus('Firebase authentication not available', true);
      return;
    }
    
    // Monitor auth state
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        onLogin(user);
      } else {
        onLogout();
      }
    });
    
    // Setup login form
    if (elements.loginForm) {
      elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup logout button
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', handleLogout);
    }
  }
  
  /**
   * Initialize tabs system
   */
  function initTabs() {
    if (!elements.tabButtons || !elements.tabContents) return;
    
    elements.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        switchTab(tabId);
      });
    });
    
    // Set default active tab
    setTimeout(() => {
      const firstTab = elements.tabButtons[0];
      if (firstTab) {
        firstTab.click();
      }
    }, 100);
  }
  
  /**
   * Switch between tabs
   * @param {string} tabId - ID of the tab to switch to
   */
  function switchTab(tabId) {
    // Check for unsaved changes
    if (state.isDirty && state.currentTab) {
      if (!confirm('Sie haben ungespeicherte Änderungen. Möchten Sie fortfahren?')) {
        return;
      }
    }
    
    // Deactivate all tabs
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    elements.tabContents.forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    
    // Activate selected tab
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(`${tabId}-tab`);
    
    if (selectedBtn && selectedContent) {
      selectedBtn.classList.add('active');
      selectedContent.style.display = 'block';
      selectedContent.classList.add('active');
      
      // Update state
      state.currentTab = tabId;
      
      // Trigger tab-specific initialization
      initTabContent(tabId);
    }
  }
  
  /**
   * Initialize tab-specific content
   * @param {string} tabId - ID of the tab to initialize
   */
  function initTabContent(tabId) {
    switch (tabId) {
      case 'pages':
        if (typeof PageManager !== 'undefined' && PageManager.init) {
          PageManager.init();
        }
        break;
      case 'wordcloud':
        if (typeof WordCloudManager !== 'undefined' && WordCloudManager.init) {
          WordCloudManager.init();
        }
        break;
      case 'settings':
        if (typeof SettingsManager !== 'undefined' && SettingsManager.init) {
          SettingsManager.init();
        }
        break;
      case 'preview':
        refreshPreview();
        break;
    }
  }
  
  /**
   * Login form handler
   * @param {Event} e - Form submit event
   */
  async function handleLogin(e) {
    if (e) e.preventDefault();
    
    const email = elements.emailField.value.trim();
    const password = elements.passField.value;
    
    if (!email || !password) {
      showStatus('Bitte geben Sie E-Mail und Passwort ein', true);
      if (elements.loginError) {
        elements.loginError.textContent = 'Bitte geben Sie E-Mail und Passwort ein';
      }
      return;
    }
    
    showStatus('Anmeldung läuft...', false, 0);
    
    try {
      const result = await firebase.auth().signInWithEmailAndPassword(email, password);
      // Auth state change will trigger onLogin
    } catch (error) {
      console.error('Login error:', error);
      showStatus('Anmeldung fehlgeschlagen: ' + error.message, true);
      if (elements.loginError) {
        elements.loginError.textContent = 'Anmeldung fehlgeschlagen: ' + error.message;
      }
    }
  }
  
  /**
   * Logout handler
   */
  async function handleLogout() {
    if (state.isDirty) {
      if (!confirm('Sie haben ungespeicherte Änderungen. Sind Sie sicher, dass Sie sich abmelden möchten?')) {
        return;
      }
    }
    
    try {
      await firebase.auth().signOut();
      // Auth state change will trigger onLogout
    } catch (error) {
      console.error('Logout error:', error);
      showStatus('Fehler bei der Abmeldung: ' + error.message, true);
    }
  }
  
  /**
   * Handler for successful login
   * @param {Object} user - Firebase user object
   */
  function onLogin(user) {
    state.isAuthenticated = true;
    
    // Update UI
    if (elements.loginDiv) elements.loginDiv.style.display = 'none';
    if (elements.adminDiv) elements.adminDiv.style.display = 'block';
    
    showStatus(`Angemeldet als ${user.email}`);
    console.log('User logged in:', user.email);
  }
  
  /**
   * Handler for logout
   */
  function onLogout() {
    state.isAuthenticated = false;
    
    // Update UI
    if (elements.adminDiv) elements.adminDiv.style.display = 'none';
    if (elements.loginDiv) elements.loginDiv.style.display = 'block';
    
    console.log('User logged out');
  }
  
  /**
   * Refresh preview iframe
   */
  function refreshPreview() {
    const previewFrame = document.getElementById('previewFrame');
    const previewTypeRadios = document.getElementsByName('previewType');
    
    if (previewFrame) {
      const isDraft = Array.from(previewTypeRadios)
        .find(radio => radio.checked)?.value === 'draft';
      
      previewFrame.src = `preview.html?draft=${isDraft}&t=${Date.now()}`; // Cache-busting
    }
  }
  
  /**
   * Set up dirty state tracking for unsaved changes
   */
  function initDirtyStateTracking() {
    // Track form changes
    document.addEventListener('change', e => {
      if (e.target.closest('#adminDiv') && 
          !e.target.closest('.no-dirty-tracking')) {
        state.isDirty = true;
      }
    });
    
    // Add beforeunload handler
    window.addEventListener('beforeunload', e => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = 'Sie haben ungespeicherte Änderungen. Sind Sie sicher, dass Sie die Seite verlassen möchten?';
        return e.returnValue;
      }
    });
  }
  
  /**
   * Display status message
   * @param {string} message - Message to display
   * @param {boolean} isError - Whether this is an error message
   * @param {number} timeout - Auto-hide timeout in ms (0 for no auto-hide)
   */
  function showStatus(message, isError = false, timeout = 3000) {
    if (!elements.statusMsg) return;
    
    elements.statusMsg.textContent = message;
    elements.statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    if (timeout > 0) {
      setTimeout(() => {
        elements.statusMsg.classList.remove('show');
      }, timeout);
    }
  }
  
  /**
   * Reset dirty state
   */
  function resetDirtyState() {
    state.isDirty = false;
  }
  
  // Public API
  return {
    init,
    showStatus,
    switchTab,
    refreshPreview,
    setDirty: (isDirty) => { state.isDirty = isDirty; },
    resetDirtyState
  };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', AdminCore.init);

// Make showStatus globally available for backward compatibility
window.showStatus = AdminCore.showStatus;