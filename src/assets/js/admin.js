/**
 * Consolidated Admin JavaScript
 * Combines firebase-helper.js, tab-navigation.js, and admin-panel.js
 */

// IIFE to avoid global namespace pollution
(function() {
  // Global Admin state
  const Admin = {
    // Firebase references
    db: null,
    auth: null,
    storage: null,
    
    // UI state
    currentTab: 'pages',
    isDirty: false,
    pageEditorInitialized: false,
    
    // Data cache
    imageData: {
      offer1_image: { url: "", public_id: "" },
      offer2_image: { url: "", public_id: "" },
      offer3_image: { url: "", public_id: "" },
      contact_image: { url: "", public_id: "" }
    },
    wordCloudData: [],
    
    // DOM elements cache
    elements: {}
  };

  /* ===== FIREBASE HELPER SECTION ===== */
  // Centralized Firebase config
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    authDomain: "mannar-129a5.firebaseapp.com",
    projectId: "mannar-129a5",
    storageBucket: "mannar-129a5.firebasestorage.app",
    messagingSenderId: "687710492532",
    appId: "1:687710492532:web:c7b675da541271f8d83e21",
    measurementId: "G-NXBLYJ5CXL"
  };

  /**
   * Initialize Firebase with error handling
   */
  function initFirebase() {
    try {
      if (typeof firebase !== 'undefined') {
        Admin.db = firebase.firestore();
        Admin.auth = firebase.auth();
        if (firebase.storage) {
          Admin.storage = firebase.storage();
        }
      } else {
        console.error('Firebase not found');
        showStatus('Firebase could not be initialized. Some features will be limited.', true);
        return;
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      showStatus('Firebase initialization error. Some features will be limited.', true);
    }
  }

  /**
   * Load content with improved validation
   */
  function loadContent(docPath, callback) {
    if (!Admin.db) {
      console.error('Firestore unavailable');
      if (callback) callback(null);
      return;
    }

    // Validate path
    if (!docPath || typeof docPath !== 'string' || !docPath.includes('/')) {
      console.error('Invalid document path:', docPath);
      if (callback) callback(null);
      return;
    }

    const [collection, doc] = docPath.split('/');
    
    Admin.db.collection(collection).doc(doc).get()
      .then(docSnap => {
        if (docSnap.exists) {
          if (callback) callback(docSnap.data());
        } else {
          console.log(`Document ${docPath} not found`);
          if (callback) callback(null);
        }
      })
      .catch(error => {
        console.error(`Error loading ${docPath}:`, error);
        if (callback) callback(null);
      });
  }

  /**
   * Save content with improved validation
   */
  function saveContent(docPath, data, merge = true, callback) {
    if (!Admin.db) {
      console.error('Firestore unavailable');
      if (callback) callback(false, new Error('Firestore unavailable'));
      return;
    }

    // Validate inputs
    if (!docPath || typeof docPath !== 'string' || !docPath.includes('/')) {
      console.error('Invalid document path:', docPath);
      if (callback) callback(false, new Error('Invalid document path'));
      return;
    }

    if (!data || typeof data !== 'object') {
      console.error('Invalid data:', data);
      if (callback) callback(false, new Error('Invalid data'));
      return;
    }

    const [collection, doc] = docPath.split('/');
    
    // Clone data to avoid mutations
    const contentData = {...data};
    
    // Add timestamp
    if (firebase.firestore && firebase.firestore.FieldValue) {
      contentData.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
    } else {
      contentData.lastUpdated = new Date().toISOString();
    }
    
    Admin.db.collection(collection).doc(doc).set(contentData, { merge })
      .then(() => {
        console.log(`Document ${docPath} saved successfully`);
        if (callback) callback(true);
      })
      .catch(error => {
        console.error(`Error saving ${docPath}:`, error);
        if (callback) callback(false, error);
      });
  }

  /* ===== TAB NAVIGATION SECTION ===== */

  /**
   * Initialize tabs
   */
  function initializeTabs() {
    // Default tab activation
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
      Admin.currentTab = activeTabBtn.getAttribute('data-tab');
      const activeTabContent = document.getElementById(`${Admin.currentTab}-tab`);
      if (activeTabContent) {
        activeTabContent.style.display = 'block';
        activeTabContent.classList.add('active');
      }
    } else {
      // Fallback: Activate first tab
      const firstTabBtn = document.querySelector('.tab-btn');
      if (firstTabBtn) {
        firstTabBtn.classList.add('active');
        Admin.currentTab = firstTabBtn.getAttribute('data-tab');
        const firstTabContent = document.getElementById(`${Admin.currentTab}-tab`);
        if (firstTabContent) {
          firstTabContent.style.display = 'block';
          firstTabContent.classList.add('active');
        }
      }
    }
  }

  /**
   * Tab change handler
   */
  function handleTabChange() {
    const tabName = this.getAttribute('data-tab');
    
    console.log(`Switching to tab: ${tabName}`);
    
    // Hide all tab contents
    Admin.elements.tabContents.forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    Admin.elements.tabButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Activate current tab
    this.classList.add('active');
    
    // Show target tab content
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
      targetTab.style.display = 'block';
      targetTab.classList.add('active');
      Admin.currentTab = tabName;
      
      // Tab-specific initialization
      if (tabName === 'preview') {
        refreshPreview();
      } else if (tabName === 'pages') {
        initializePageEditor();
      }
    } else {
      console.error(`Tab content with ID "${tabName}-tab" not found`);
    }
  }

  /**
   * Apply tab CSS fixes
   */
  function ensureTabStyles() {
    // Create style element if it doesn't exist
    if (!document.getElementById('admin-tab-fix-styles')) {
      const style = document.createElement('style');
      style.id = 'admin-tab-fix-styles';
      style.innerHTML = `
        /* Tab display fix */
        .tab-content {
          display: none !important;
        }
        
        .tab-content.active {
          display: block !important;
        }
        
        #dashboard-tab.active, 
        #content-tab.active,
        #pages-tab.active, 
        #wordcloud-tab.active, 
        #preview-tab.active,
        #settings-tab.active {
          display: block !important;
        }
        
        /* Pages tab fix */
        #pagesContainer {
          display: block !important;
          min-height: 200px;
        }
      `;
      document.head.appendChild(style);
      console.log("Tab style fix added");
    }
  }

  /* ===== ADMIN PANEL SECTION ===== */

  /**
   * Initialize after DOM loaded
   */
  document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin Panel initializing");
    
    // Initialize Firebase
    initFirebase();
    
    // Cache DOM elements
    cacheElements();
    
    // Add event listeners
    setupEventListeners();
    
    // Prepare tabs
    initializeTabs();
    
    // Apply tab navigation and display fixes
    applyTabFixes();
    
    // React to auth state
    setupAuthStateListener();
  });

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    // Login elements
    Admin.elements.loginDiv = document.getElementById('loginDiv');
    Admin.elements.adminDiv = document.getElementById('adminDiv');
    Admin.elements.emailField = document.getElementById('emailField');
    Admin.elements.passField = document.getElementById('passField');
    Admin.elements.loginBtn = document.getElementById('loginBtn');
    Admin.elements.loginError = document.getElementById('loginError');
    Admin.elements.logoutBtn = document.getElementById('logoutBtn');
    Admin.elements.statusMsg = document.getElementById('statusMsg');
    
    // Tab elements
    Admin.elements.tabButtons = document.querySelectorAll('.tab-btn');
    Admin.elements.tabContents = document.querySelectorAll('.tab-content');
    
    // Content elements
    Admin.elements.contentTab = document.getElementById('content-tab');
    Admin.elements.pagesTab = document.getElementById('pages-tab');
    Admin.elements.wordcloudTab = document.getElementById('wordcloud-tab');
    Admin.elements.previewTab = document.getElementById('preview-tab');
    Admin.elements.settingsTab = document.getElementById('settings-tab');
    
    // Preview elements
    Admin.elements.previewFrame = document.getElementById('previewFrame');
    Admin.elements.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
    Admin.elements.previewTypeRadios = document.getElementsByName('previewType');
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Login button
    if (Admin.elements.loginBtn) {
      Admin.elements.loginBtn.addEventListener('click', handleLogin);
    }
    
    // Password field: Login on Enter
    if (Admin.elements.passField) {
      Admin.elements.passField.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          handleLogin();
        }
      });
    }
    
    // Logout button
    if (Admin.elements.logoutBtn) {
      Admin.elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Tab buttons
    Admin.elements.tabButtons.forEach(button => {
      button.addEventListener('click', handleTabChange);
    });
    
    // Preview update button
    if (Admin.elements.refreshPreviewBtn) {
      Admin.elements.refreshPreviewBtn.addEventListener('click', refreshPreview);
    }
    
    // Preview type radio buttons
    if (Admin.elements.previewTypeRadios.length > 0) {
      Array.from(Admin.elements.previewTypeRadios).forEach(radio => {
        radio.addEventListener('change', refreshPreview);
      });
    }
  }

  /**
   * Login handler
   */
  function handleLogin() {
    if (!Admin.auth || !Admin.elements.emailField || !Admin.elements.passField) {
      console.error("Auth or form elements not found");
      return;
    }
    
    const email = Admin.elements.emailField.value.trim();
    const pass = Admin.elements.passField.value;
    
    // Validation
    if (!email || !pass) {
      if (Admin.elements.loginError) Admin.elements.loginError.textContent = "Please enter email and password";
      return;
    }
    
    if (Admin.elements.loginError) Admin.elements.loginError.textContent = "";
    showStatus("Logging in...", false, 0);
    
    Admin.auth.signInWithEmailAndPassword(email, pass)
      .then(userCredential => {
        console.log("Login successful:", userCredential.user.email);
        showStatus("Login successful! Loading admin panel...");
      })
      .catch(err => {
        console.error("Login error:", err);
        if (Admin.elements.loginError) Admin.elements.loginError.textContent = "Login failed: " + err.message;
        showStatus("Login failed", true);
      });
  }

  /**
   * Logout handler
   */
  function handleLogout() {
    // Check for unsaved changes
    if (Admin.isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to log out?')) {
        return;
      }
    }
    
    if (!Admin.auth) return;
    
    Admin.auth.signOut().then(() => {
      showStatus("Successfully logged out");
    }).catch(err => {
      console.error("Logout error:", err);
      showStatus("Error during logout: " + err.message, true);
    });
  }

  /**
   * Apply tab fixes
   */
  function applyTabFixes() {
    // CSS fix for tab display
    ensureTabStyles();
    
    // Fix for Pages tab
    setTimeout(fixPageVisibility, 1000);
    
    // Initialize Page Editor if Pages tab is active
    if (Admin.currentTab === 'pages') {
      setTimeout(initializePageEditor, 1000);
    }
  }

  /**
   * Fix Pages tab visibility
   */
  function fixPageVisibility() {
    // Force Pages tab visibility if active
    const pagesTab = Admin.elements.pagesTab;
    const pagesTabBtn = document.querySelector('.tab-btn[data-tab="pages"]');
    
    if (pagesTab && pagesTabBtn && pagesTabBtn.classList.contains('active')) {
      pagesTab.style.display = 'block';
      pagesTab.classList.add('active');
      console.log("Made Pages tab visible");
    }
    
    // Ensure pagesContainer exists
    ensurePagesContainer();
    
    // Initialize Page Editor if needed
    if (Admin.currentTab === 'pages') {
      initializePageEditor();
    }
  }

  /**
   * Ensure pagesContainer exists
   */
  function ensurePagesContainer() {
    const pagesTab = Admin.elements.pagesTab;
    if (!pagesTab) return;
    
    let pagesContainer = document.getElementById('pagesContainer');
    if (!pagesContainer) {
      console.log("Creating pagesContainer");
      pagesContainer = document.createElement('div');
      pagesContainer.id = 'pagesContainer';
      pagesContainer.className = 'w3-row';
      pagesTab.appendChild(pagesContainer);
    }
    
    // Ensure container is visible
    pagesContainer.style.display = 'block';
    
    // Create column for page list if not present
    if (!document.getElementById('pagesListCol')) {
      console.log("Creating pagesListCol");
      const pagesListCol = document.createElement('div');
      pagesListCol.id = 'pagesListCol';
      pagesListCol.className = 'w3-col m4 l3';
      pagesContainer.appendChild(pagesListCol);
      
      // Add button to create a page
      const createBtnContainer = document.createElement('div');
      createBtnContainer.className = 'w3-margin-bottom';
      createBtnContainer.innerHTML = `
        <button id="createPageBtn" class="w3-button w3-blue w3-block">
          <i class="fas fa-plus"></i> Create New Page
        </button>
      `;
      pagesListCol.appendChild(createBtnContainer);
      
      // Add page list
      const pagesListCard = document.createElement('div');
      pagesListCard.id = 'pagesListCard';
      pagesListCard.className = 'w3-card w3-padding';
      pagesListCard.innerHTML = `
        <h3>Your Pages</h3>
        <div id="pagesList" class="pages-list">
          <div class="w3-center">
            <i class="fas fa-spinner fa-spin"></i> Loading pages...
          </div>
        </div>
      `;
      pagesListCol.appendChild(pagesListCard);
    }
  }

  /**
   * Initialize Page Editor
   */
  function initializePageEditor() {
    // Check if PageEditor is available
    if (typeof PageEditor !== 'undefined') {
      if (typeof PageEditor.init === 'function' && !Admin.pageEditorInitialized) {
        console.log("Initializing PageEditor");
        try {
          PageEditor.init();
          Admin.pageEditorInitialized = true;
        } catch (error) {
          console.error("Error initializing PageEditor:", error);
        }
      }
      
      // Load pages
      if (typeof PageEditor.loadPages === 'function') {
        console.log("Loading pages");
        try {
          PageEditor.loadPages();
        } catch (error) {
          console.error("Error loading pages:", error);
        }
      }
    } else {
      console.warn("PageEditor not available");
    }
  }

  /**
   * Refresh preview
   */
  function refreshPreview() {
    if (!Admin.elements.previewFrame) return;
    
    const isDraft = Array.from(Admin.elements.previewTypeRadios)
      .find(radio => radio.checked)?.value === 'draft';
    
    const timestamp = Date.now(); // Cache busting
    Admin.elements.previewFrame.src = `preview.html?draft=${isDraft}&t=${timestamp}`;
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'preview-loading-indicator';
    loadingIndicator.innerHTML = `
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px; 
                box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 1000; text-align: center;">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #3498db;"></i>
        <p>Loading preview...</p>
      </div>
    `;
    
    // Position the loading indicator over the iframe
    const previewContainer = Admin.elements.previewFrame.parentElement;
    if (previewContainer) {
      previewContainer.style.position = 'relative';
      previewContainer.appendChild(loadingIndicator);
      
      // Remove loading indicator when iframe loads
      Admin.elements.previewFrame.onload = function() {
        const indicator = document.getElementById('preview-loading-indicator');
        if (indicator) {
          indicator.remove();
        }
      };
    }
  }

  /**
   * Set up auth state listener
   */
  function setupAuthStateListener() {
    if (!Admin.auth) return;
    
    Admin.auth.onAuthStateChanged(user => {
      if (user) {
        // User is logged in
        console.log("User logged in:", user.email);
        
        if (Admin.elements.loginDiv) Admin.elements.loginDiv.style.display = 'none';
        if (Admin.elements.adminDiv) Admin.elements.adminDiv.style.display = 'block';
        
        // Initialize TinyMCE
        initTinyMCE();
        
        // Wait for TinyMCE and then load content
        setTimeout(() => {
          // Load content if Content tab is active
          if (Admin.currentTab === 'content') {
            loadContentData();
          }
          
          // Load word cloud if Word Cloud tab is active
          if (Admin.currentTab === 'wordcloud') {
            loadWordCloudData();
          }
          
          // Ensure Page Editor loads
          if (Admin.currentTab === 'pages') {
            fixPageVisibility();
          }
        }, 1000);
      } else {
        // User is not logged in
        console.log("User not logged in");
        
        if (Admin.elements.adminDiv) Admin.elements.adminDiv.style.display = 'none';
        if (Admin.elements.loginDiv) Admin.elements.loginDiv.style.display = 'block';
        
        // Clean up TinyMCE
        if (typeof tinymce !== 'undefined') {
          tinymce.remove();
        }
      }
    });
  }

  /**
   * Initialize TinyMCE
   */
  function initTinyMCE() {
    // Remove existing instances
    if (typeof tinymce !== 'undefined') {
      tinymce.remove();
      
      // For regular content fields
      tinymce.init({
        selector: '.tinymce-editor',
        height: 300,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | fontsizeselect | ' +
          'bold italic backcolor forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | link image | help',
        content_style: 'body { font-family: "Lato", sans-serif; font-size: 16px; }',
        font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt',
        setup: function(editor) {
          editor.on('change', function() {
            Admin.isDirty = true;
          });
        }
      });
      
      // For small fields like titles/subtitles
      tinymce.init({
        selector: '.tinymce-editor-small',
        height: 100,
        menubar: false,
        inline: false,
        plugins: [
          'autolink', 'link', 'charmap', 'preview'
        ],
        toolbar: 'undo redo | fontsizeselect | ' +
          'bold italic backcolor forecolor | alignleft aligncenter ' +
          'alignright alignjustify',
        content_style: 'body { font-family: "Lato", sans-serif; font-size: 16px; }',
        font_size_formats: '10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt',
        setup: function(editor) {
          editor.on('change', function() {
            Admin.isDirty = true;
          });
        }
      });
    }
  }

  /**
   * Load content data
   */
  function loadContentData(isDraft = true) {
    if (!Admin.db) return;
    
    showStatus("Loading content...", false, 0);
    
    Admin.db.collection("content").doc(isDraft ? "draft" : "main").get()
      .then(doc => {
        if (!doc.exists) {
          console.warn("No content document found");
          showStatus("No content found. Please save content first.", true);
          return;
        }
        
        const data = doc.data();
        console.log("Data loaded:", data);
        
        // Fill text fields and process other data...
        // (abbreviated to simplify code)
        
        // Reset dirty flag
        Admin.isDirty = false;
        
        showStatus("Content loaded successfully");
      })
      .catch(err => {
        console.error("Error loading data:", err);
        showStatus("Error loading data: " + err.message, true);
      });
  }

  /**
   * Load word cloud data
   */
  function loadWordCloudData() {
    if (!Admin.db) return;
    
    const wordCloudContainer = document.getElementById('wordCloudContainer');
    if (!wordCloudContainer) return;
    
    try {
      Admin.db.collection("content").doc("wordCloud").get().then(doc => {
        if (doc.exists) {
          Admin.wordCloudData = doc.data().words || [];
        } else {
          // Initialize with default values
          Admin.wordCloudData = [
            { text: "Mindfulness", weight: 5, link: "#" },
            { text: "Meditation", weight: 8, link: "#" },
            { text: "Self-reflection", weight: 7, link: "#" },
            { text: "Consciousness", weight: 9, link: "#" },
            { text: "Spirituality", weight: 6, link: "#" }
          ];
          
          // Create document with default data
          Admin.db.collection("content").doc("wordCloud").set({
            words: Admin.wordCloudData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        
        renderWordCloudItems();
      });
    } catch (err) {
      console.error("Error loading word cloud:", err);
      showStatus("Error loading word cloud: " + err.message, true);
    }
  }

  /**
   * Render word cloud items
   */
  function renderWordCloudItems() {
    const wordCloudContainer = document.getElementById('wordCloudContainer');
    if (!wordCloudContainer) return;
    
    wordCloudContainer.innerHTML = '';
    
    if (Admin.wordCloudData.length === 0) {
      wordCloudContainer.innerHTML = `
        <div class="w3-panel w3-pale-yellow w3-center">
          <p>No words in the word cloud. Click "Add New Word" to add words.</p>
        </div>
      `;
      return;
    }
    
    // Create table for better structure
    const tableContainer = document.createElement('div');
    tableContainer.className = 'w3-responsive';
    
    const table = document.createElement('table');
    table.className = 'w3-table w3-bordered w3-striped';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="w3-light-grey">
        <th style="width:5%">Order</th>
        <th style="width:35%">Word</th>
        <th style="width:15%">Weight (1-9)</th>
        <th style="width:35%">Link</th>
        <th style="width:10%">Action</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    
    Admin.wordCloudData.forEach((word, index) => {
      const tr = document.createElement('tr');
      tr.className = 'word-item';
      
      tr.innerHTML = `
        <td class="draggable-handle" style="cursor:move">
          <i class="fas fa-grip-lines"></i> ${index + 1}
        </td>
        <td>
          <input type="text" class="w3-input w3-border" value="${word.text || ''}" data-field="text" placeholder="Enter word">
        </td>
        <td>
          <input type="number" class="w3-input w3-border" value="${word.weight || 5}" data-field="weight" min="1" max="9" placeholder="1-9">
        </td>
        <td>
          <input type="text" class="w3-input w3-border" value="${word.link || '#'}" data-field="link" placeholder="Link (optional)">
        </td>
        <td class="w3-center">
          <button class="w3-button w3-red w3-round delete-word-btn">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      // Add event listeners...
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    wordCloudContainer.appendChild(tableContainer);
  }

  /**
   * Show status message
   */
  function showStatus(message, isError = false, timeout = 3000) {
    const statusMsg = Admin.elements.statusMsg;
    if (!statusMsg) return;
    
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    // Hide after timeout unless it's 0 (persistent)
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, timeout);
    }
  }
  
  // Make Admin object globally available (selected functions only)
  window.AdminPanel = {
    showStatus: showStatus,
    refreshPreview: refreshPreview,
    fixPageVisibility: fixPageVisibility,
    initializePageEditor: initializePageEditor
  };
})();