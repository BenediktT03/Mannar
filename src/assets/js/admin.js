 /**
 * admin.js
 * Main admin script that consolidates all admin functionality
 */

// Import core modules
import { initFirebase, getFirestore, getAuth, getStorage } from './core/firebase.js';
import { showStatus } from './core/utils.js';
import { ADMIN_TABS, EDITOR_CONFIG } from './core/config.js';

// Import functional modules
import { initAuth, login, logout, setupLoginForm } from './modules/auth.js';
import { initContentManager, loadContent, saveContent, publishContent } from './modules/content-manager.js';
import { initWordCloud } from './modules/word-cloud.js';
import { initUI, switchTab, registerTabListener } from './modules/ui-manager.js';
import { initPageEditor } from './modules/page-editor.js';

// Global state for admin panel
const Admin = {
  // Firebase services
  firebase: null,
  db: null,
  auth: null,
  storage: null,
  
  // UI state
  currentTab: 'pages',
  isDirty: false,
  isInitialized: false,
  
  // Module instances
  auth: null,
  contentManager: null,
  wordCloud: null,
  ui: null,
  pageEditor: null,
  
  // State elements
  elements: {}
};

/**
 * Initialize the admin panel
 */
function initAdminPanel() {
  console.log("Initializing Admin Panel");
  
  // Initialize Firebase
  const firebase = initFirebase();
  if (!firebase) {
    showStatus('Firebase initialization failed. Some features may not work.', true);
    return;
  }
  
  Admin.firebase = firebase;
  Admin.db = getFirestore();
  Admin.auth = getAuth();
  Admin.storage = getStorage();
  
  // Cache common DOM elements
  cacheElements();
  
  // Initialize auth system
  Admin.auth = initAuth();
  setupLoginForm();
  
  // Initialize content manager
  Admin.contentManager = initContentManager();
  
  // Initialize UI manager
  Admin.ui = initUI({
    defaultTab: 'pages'
  });
  
  // Register for tab changes
  registerTabListener(handleTabChange);
  
  // Set up window beforeunload event for unsaved changes
  window.addEventListener('beforeunload', function(e) {
    if (Admin.isDirty) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
  
  // Mark as initialized
  Admin.isInitialized = true;
  console.log("Admin Panel initialized successfully");
}

/**
 * Cache commonly used DOM elements
 */
function cacheElements() {
  Admin.elements = {
    loginDiv: document.getElementById('loginDiv'),
    adminDiv: document.getElementById('adminDiv'),
    logoutBtn: document.getElementById('logoutBtn'),
    refreshPreviewBtn: document.getElementById('refreshPreviewBtn'),
    previewFrame: document.getElementById('previewFrame'),
    statusMsg: document.getElementById('statusMsg')
  };
  
  // Set up event listeners for cached elements
  if (Admin.elements.logoutBtn) {
    Admin.elements.logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (Admin.elements.refreshPreviewBtn) {
    Admin.elements.refreshPreviewBtn.addEventListener('click', refreshPreview);
  }
}

/**
 * Handle tab changes
 * @param {string} tabName - Name of the tab that was activated
 */
function handleTabChange(tabName) {
  console.log(`Tab changed to: ${tabName}`);
  Admin.currentTab = tabName;
  
  // Initialize tab-specific functionality
  switch (tabName) {
    case 'dashboard':
      // Initialize dashboard if we add it later
      break;
      
    case 'pages':
      if (!Admin.pageEditor) {
        console.log("Initializing Page Editor");
        Admin.pageEditor = initPageEditor();
      }
      break;
      
    case 'wordcloud':
      if (!Admin.wordCloud) {
        console.log("Initializing Word Cloud Manager");
        Admin.wordCloud = initWordCloud('admin');
      }
      break;
      
    case 'preview':
      refreshPreview();
      break;
      
    case 'settings':
      // Initialize settings if we add them later
      break;
  }
}

/**
 * Handle logout button click
 */
async function handleLogout() {
  try {
    const result = await logout();
    if (result.success) {
      // UI updates are handled by the auth module
    }
  } catch (error) {
    console.error('Logout error:', error);
    showStatus('Error during logout: ' + error.message, true);
  }
}

/**
 * Refresh the preview iframe
 */
function refreshPreview() {
  if (!Admin.elements.previewFrame) return;
  
  const previewTypeRadios = document.getElementsByName('previewType');
  const isDraft = Array.from(previewTypeRadios)
    .find(radio => radio.checked)?.value === 'draft';
  
  const timestamp = Date.now(); // Cache-busting
  Admin.elements.previewFrame.src = `preview.html?draft=${isDraft}&t=${timestamp}`;
  
  showStatus(`Preview refreshed (${isDraft ? 'Draft' : 'Live'} version)`);
}

/**
 * Mark content as dirty (unsaved changes)
 */
function markDirty() {
  Admin.isDirty = true;
}

/**
 * Clear dirty flag after saving
 */
function clearDirty() {
  Admin.isDirty = false;
}

/**
 * Save all current changes
 */
async function saveAllChanges() {
  // Implementation depends on what's currently being edited
  switch (Admin.currentTab) {
    case 'pages':
      if (Admin.pageEditor && typeof Admin.pageEditor.savePage === 'function') {
        return Admin.pageEditor.savePage();
      }
      break;
      
    case 'wordcloud':
      if (Admin.wordCloud && typeof Admin.wordCloud.saveChanges === 'function') {
        return Admin.wordCloud.saveChanges();
      }
      break;
  }
  
  return { success: false, message: 'Nothing to save' };
}

/**
 * Initialize TinyMCE editor
 */
function initTinyMCE() {
  if (typeof tinymce !== 'undefined') {
    // Remove any existing instances
    tinymce.remove();
    
    // Initialize with our custom configuration
    tinymce.init({
      selector: '.tinymce-editor',
      ...EDITOR_CONFIG,
      setup: function(editor) {
        editor.on('change', function() {
          markDirty();
        });
      }
    });
    
    console.log("TinyMCE initialized");
  } else {
    console.warn("TinyMCE not available");
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminPanel);

// Export key functions for external use and HTML direct access
window.AdminPanel = {
  login,
  logout: handleLogout,
  refreshPreview,
  saveAllChanges,
  switchTab,
  markDirty,
  clearDirty,
  showStatus
};