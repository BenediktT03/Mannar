<?php
require_once 'csrf-utils.php';
$csrf_token = generateCsrfToken();
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Panel</title>
  
  <!-- CSS Libraries -->
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  
  <!-- Custom CSS -->
  <link rel="stylesheet" href="./assets/css/admin.css" />
  
  <!-- Quill Editor CSS -->
  <link href="https://cdn.quilljs.com/2.0.0-dev.4/quill.snow.css" rel="stylesheet">
  <link href="https://cdn.quilljs.com/2.0.0-dev.4/quill.bubble.css" rel="stylesheet">
  <link href="./assets/css/quill-custom.css" rel="stylesheet">

  <!-- CSRF Token for JavaScript -->
  <script>
    const csrfToken = "<?php echo $csrf_token; ?>";
  </script>
  
  <!-- Firebase Libraries -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
  
  <!-- Quill Editor library -->
  <script src="https://cdn.quilljs.com/2.0.0-dev.4/quill.min.js"></script>
</head>
<body>
  <!-- Admin Header -->
  <div class="admin-header w3-center">
    <h2><i class="fas fa-tools"></i> Mannar Admin Panel</h2>
  </div>
  
  <!-- Navigation Controls -->
  <div class="nav-controls">
    <a href="index.php" class="w3-button w3-blue w3-margin-right">
      <i class="fas fa-home"></i> Back to Website
    </a>
    <button id="logoutBtn" class="w3-button w3-red">
      <i class="fas fa-sign-out-alt"></i> Logout
    </button>
  </div>

  <!-- Status message -->
  <div id="statusMsg" class="status-msg"></div>

  <!-- Login Form -->
  <div id="loginDiv" class="w3-card w3-padding">
    <h3>Login</h3>
    <input id="emailField" class="w3-input w3-margin-bottom" type="email" placeholder="Email" />
    <input id="passField" class="w3-input w3-margin-bottom" type="password" placeholder="Password" />
    <button id="loginBtn" class="w3-button w3-black w3-block">Login</button>
    <p id="loginError" class="w3-text-red"></p>
    <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo $csrf_token; ?>">
  </div>

  <!-- Admin Panel Content (only visible to logged-in users) -->
  <div id="adminDiv" class="w3-container admin-panel" style="display: none;">
    
    <!-- Tabs for different sections -->
    <div class="tabs">
      <button class="tab-btn" data-tab="pages">
        <i class="fas fa-file-alt"></i> Pages
      </button>
      <button class="tab-btn" data-tab="wordcloud">
        <i class="fas fa-cloud"></i> Word Cloud
      </button>
      <button class="tab-btn" data-tab="preview">
        <i class="fas fa-eye"></i> Preview
      </button>
      <button class="tab-btn" data-tab="settings">
        <i class="fas fa-cog"></i> Global Settings
      </button>
      <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
    </div>
    
    <!-- Tab: Pages (combined with former Content tab) -->
    <div id="pages-tab" class="tab-content">
      <h3>Manage Pages</h3>
      <!-- The page editor components will be dynamically created by page-editor-enhanced.js -->
      <div id="pagesContainer" class="w3-row">
        <!-- This will be populated by the PageEditor -->
      </div>
      <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
    </div>

    <!-- Tab: Word Cloud -->
    <div id="wordcloud-tab" class="tab-content">
      <h3>Edit Word Cloud</h3>
      <div class="content-card">
        <p>Customize the words in the word cloud. The weight (1-9) determines the size of the words.</p>
        
        <div id="wordCloudContainer" class="word-cloud-admin w3-margin-top">
          <!-- Word items will be dynamically inserted here -->
        </div>
        
        <button id="addWordBtn" class="w3-button w3-blue w3-margin-top">
          <i class="fas fa-plus"></i> Add New Word
        </button>
        
        <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue w3-margin-top">
          <p><i class="fas fa-info-circle"></i> <strong>Tip:</strong> Use the drag handles to rearrange words. Higher weight values make words appear larger.</p>
        </div>
      </div>
      
      <div class="action-buttons">
        <button id="previewWordCloudBtn" class="w3-button w3-amber w3-margin-right">
          <i class="fas fa-eye"></i> Preview
        </button>
        <button id="saveWordCloudBtn" class="w3-button w3-green">
          <i class="fas fa-save"></i> Save Word Cloud
        </button>
        <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
      </div>
    </div>
    
    <!-- Tab: Preview -->
    <div id="preview-tab" class="tab-content">
      <div class="content-card">
        <h3>Website Preview</h3>
        <div class="w3-margin-bottom">
          <label class="w3-margin-right">
            <input type="radio" name="previewType" value="draft" checked> 
            <span class="w3-badge w3-yellow">Draft</span>
          </label>
          <label>
            <input type="radio" name="previewType" value="live"> 
            <span class="w3-badge w3-green">Live Website</span>
          </label>
          <button id="refreshPreviewBtn" class="w3-button w3-blue w3-right">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <iframe id="previewFrame" class="w3-border" src="preview.html?draft=true" style="width:100%; height:600px;"></iframe>
      </div>
    </div>
    
    <!-- Tab: Global Settings -->
    <div id="settings-tab" class="tab-content">
      <h3>Global Site Settings</h3>
      
      <div class="content-card">
        <h4>Color Scheme</h4>
        <div class="w3-row">
          <div class="w3-col m6 w3-padding">
            <label for="primaryColor">Primary Color:</label>
            <div class="w3-row">
              <div class="w3-col s3">
                <input type="color" id="primaryColor" value="#3498db" class="w3-input" />
              </div>
              <div class="w3-col s9 w3-padding-small">
                <span id="primaryColorValue">#3498db</span>
              </div>
            </div>
          </div>
          <div class="w3-col m6 w3-padding">
            <label for="secondaryColor">Secondary Color:</label>
            <div class="w3-row">
              <div class="w3-col s3">
                <input type="color" id="secondaryColor" value="#2c3e50" class="w3-input" />
              </div>
              <div class="w3-col s9 w3-padding-small">
                <span id="secondaryColorValue">#2c3e50</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="w3-row w3-margin-top">
          <div class="w3-col m6 w3-padding">
            <label for="accentColor">Accent Color:</label>
            <div class="w3-row">
              <div class="w3-col s3">
                <input type="color" id="accentColor" value="#e74c3c" class="w3-input" />
              </div>
              <div class="w3-col s9 w3-padding-small">
                <span id="accentColorValue">#e74c3c</span>
              </div>
            </div>
          </div>
          <div class="w3-col m6 w3-padding">
            <label for="textColor">Text Color:</label>
            <div class="w3-row">
              <div class="w3-col s3">
                <input type="color" id="textColor" value="#333333" class="w3-input" />
              </div>
              <div class="w3-col s9 w3-padding-small">
                <span id="textColorValue">#333333</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue w3-margin-top">
          <p><i class="fas fa-info-circle"></i> <strong>Note:</strong> The color scheme applies to the entire website. Preview your changes before publishing.</p>
        </div>
      </div>
      
      <div class="content-card">
        <h4>Typography</h4>
        <div class="w3-row">
          <div class="w3-col m6 w3-padding">
            <label for="fontFamily">Main Font Family:</label>
            <select id="fontFamily" class="w3-select w3-border">
              <option value="'Lato', sans-serif" selected>Lato (Default)</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'PT Sans', sans-serif">PT Sans</option>
            </select>
          </div>
          <div class="w3-col m6 w3-padding">
            <label for="headingFont">Heading Font Family:</label>
            <select id="headingFont" class="w3-select w3-border">
              <option value="'Lato', sans-serif" selected>Lato (Default)</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'PT Sans', sans-serif">PT Sans</option>
            </select>
          </div>
        </div>
        
        <div class="w3-row w3-margin-top">
          <div class="w3-col m6 w3-padding">
            <label>Base Font Size:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="baseFontSize" min="14" max="20" step="1" value="16" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="baseFontSizeValue">16</span>px
              </div>
            </div>
          </div>
          <div class="w3-col m6 w3-padding">
            <label>Line Height:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="lineHeight" min="1.2" max="2" step="0.1" value="1.6" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="lineHeightValue">1.6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-card">
        <h4>Layout & Style</h4>
        <div class="w3-row">
          <div class="w3-col m6 w3-padding">
            <label for="containerWidth">Content Container Width:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="containerWidth" min="800" max="1500" step="50" value="1170" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="containerWidthValue">1170</span>px
              </div>
            </div>
          </div>
          <div class="w3-col m6 w3-padding">
            <label for="borderRadius">Border Radius:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="borderRadius" min="0" max="20" step="1" value="4" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="borderRadiusValue">4</span>px
              </div>
            </div>
          </div>
        </div>
        
        <div class="w3-row w3-margin-top">
          <div class="w3-col m6 w3-padding">
            <div class="w3-row">
              <div class="w3-col s8">
                <label>Button Style:</label>
              </div>
              <div class="w3-col s4">
                <select id="buttonStyle" class="w3-select w3-border">
                  <option value="rounded" selected>Rounded</option>
                  <option value="square">Square</option>
                  <option value="pill">Pill</option>
                </select>
              </div>
            </div>
          </div>
          <div class="w3-col m6 w3-padding">
            <div class="w3-row">
              <div class="w3-col s8">
                <label>Enable Animation Effects:</label>
              </div>
              <div class="w3-col s4">
                <label class="switch">
                  <input type="checkbox" id="enableAnimations" checked>
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-card">
        <h4>Live Style Preview</h4>
        <div id="stylePreview" class="w3-white w3-border w3-padding" style="min-height: 300px;">
          <h1>This is a heading</h1>
          <h2>This is a subheading</h2>
          <p>This is a paragraph of text. This text will show how the typography settings affect the readability of your content. It's important to choose fonts and sizes that are easy to read on different devices.</p>
          <button class="preview-button">Sample Button</button>
          <div class="preview-card w3-margin-top w3-padding w3-light-grey">
            Sample Card Element
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button id="resetSettingsBtn" class="w3-button w3-red w3-margin-right">
          <i class="fas fa-undo"></i> Reset to Defaults
        </button>
        <button id="previewSettingsBtn" class="w3-button w3-amber w3-margin-right">
          <i class="fas fa-eye"></i> Preview
        </button>
        <button id="saveSettingsBtn" class="w3-button w3-green">
          <i class="fas fa-save"></i> Save Settings
        </button>
        <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
      </div>
    </div>
  </div>

  <!-- ======= JAVASCRIPT IMPORTS ======= -->
  
  <!-- Firebase Service -->
  <script src="./assets/js/firebase-service.js"></script>
  
  <!-- Quill Integration Scripts -->
  <script src="./assets/js/quill-integration.js"></script>
  <script src="./assets/js/quill-page-editor.js"></script>
  
  <!-- Main App Scripts -->
  <script src="./assets/js/admin-panel.js"></script>
  <script src="./assets/js/page-editor-enhanced.js"></script>
  <script src="./assets/js/global-settings.js"></script>
  <script>
  // Create a global PageEditor object if it doesn't exist
window.PageEditor = window.PageEditor || {};

// Add required methods if missing
if (typeof window.PageEditor.init !== 'function') {
  console.log('Adding fallback PageEditor.init()');
  window.PageEditor.init = function() {
    console.log('PageEditor.init() fallback called');
    
    // Basic initialization - find pages container and show message
    const pagesContainer = document.getElementById('pagesContainer');
    if (pagesContainer) {
      pagesContainer.innerHTML = `
        <div class="w3-panel w3-yellow">
          <h3>Admin Panel Recovery Mode</h3>
          <p>The page editor encountered an initialization error. Basic functionality has been restored.</p>
          <button class="w3-button w3-blue" onclick="location.reload()">Refresh Page</button>
          <div id="pagesList" class="w3-margin-top"></div>
        </div>
      `;
    }
    
    // Call loadPages to show some content
    if (typeof this.loadPages === 'function') {
      this.loadPages();
    }
  };
}

if (typeof window.PageEditor.loadPages !== 'function') {
  console.log('Adding fallback PageEditor.loadPages()');
  window.PageEditor.loadPages = function() {
    console.log('PageEditor.loadPages() fallback called');
    
    // Find pages list container
    const pagesList = document.getElementById('pagesList');
    if (!pagesList) return;
    
    // Show placeholder content
    pagesList.innerHTML = `
      <div class="w3-card w3-padding w3-margin-bottom w3-pale-yellow">
        <div class="w3-bar-item w3-padding">
          <span class="page-title"><i class="fas fa-home"></i> Homepage (index.php)</span><br>
          <small class="w3-text-grey">Main Website Content</small>
        </div>
        <div class="w3-bar-item w3-right">
          <a href="index.php" target="_blank" class="w3-button w3-small w3-blue">
            <i class="fas fa-eye"></i>
          </a>
        </div>
      </div>
      <p class="w3-center">Emergency mode active - limited functionality available</p>
    `;
  };
}

if (typeof window.PageEditor.setDirty !== 'function') {
  window.PageEditor.setDirty = function(value) {
    console.log('PageEditor.setDirty() fallback called with value:', value);
  };
}

// Call init when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Emergency fix: calling PageEditor.init()');
  if (typeof window.PageEditor.init === 'function') {
    window.PageEditor.init();
  }
});
</script>
  <!-- Initialize Firebase -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Check if Firebase is available
      if (typeof firebase === 'undefined') {
        console.error('Firebase is not available! Check script loading.');
      } else {
        console.log('Firebase is available');
        
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
          firebase.initializeApp({
            apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
            authDomain: "mannar-129a5.firebaseapp.com", 
            projectId: "mannar-129a5",
            storageBucket: "mannar-129a5.firebasestorage.app",
            messagingSenderId: "687710492532",
            appId: "1:687710492532:web:c7b675da541271f8d83e21",
            measurementId: "G-NXBLYJ5CXL"
          });
          console.log('Firebase initialized successfully');
        }
      }
    });
  </script>
  
  <!-- Initialize Quill Editor -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Make tinymce global API available for backwards compatibility
      if (typeof quillEditor !== 'undefined' && typeof quillEditor.initRichTextEditors === 'function') {
        window.tinymce = window.quillEditor.initRichTextEditors();
      } else {
        console.warn('Quill editor integration not available');
      }
      
      // Initialize PageEditor if available
      if (typeof PageEditor !== 'undefined' && typeof PageEditor.init === 'function') {
        console.log('Initializing PageEditor...');
        setTimeout(() => {
          PageEditor.init();
        }, 500);
      } else {
        console.warn('PageEditor not available or missing init function');
      }

      // Set 'pages' tab as default active tab
      setTimeout(() => {
        const pagesTabBtn = document.querySelector('.tab-btn[data-tab="pages"]');
        if (pagesTabBtn) {
          pagesTabBtn.click();
        }
      }, 100);
    });
  </script>

  <!-- Enhanced Tab Management -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Initializing enhanced tab management...');
      
      // Tab Controller Class
      class TabController {
        constructor() {
          this.tabs = document.querySelectorAll('.tab-btn');
          this.contents = document.querySelectorAll('.tab-content');
          this.activeTab = null;
          this.setupEventListeners();
          this.fixTabDisplay();
        }
        
        // Event listeners for tab buttons
        setupEventListeners() {
          this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
              e.preventDefault();
              const tabName = tab.getAttribute('data-tab');
              this.activateTab(tabName, tab);
            });
          });
          
          console.log('Tab event listeners setup');
        }
        
        // Activate a tab
        activateTab(tabName, tabButton) {
          console.log('Activating tab:', tabName);
          
          // Deactivate all tabs
          this.tabs.forEach(t => t.classList.remove('active'));
          this.contents.forEach(c => {
            c.style.display = 'none';
            c.classList.remove('active');
          });
          
          // Set active tab
          tabButton.classList.add('active');
          const content = document.getElementById(`${tabName}-tab`);
          
          if (content) {
            content.style.display = 'block';
            content.classList.add('active');
            this.activeTab = tabName;
            
            // Special actions for specific tabs
            if (tabName === 'pages') {
              this.initializePageEditor();
            } else if (tabName === 'preview') {
              this.refreshPreview();
            }
          } else {
            console.error(`Tab content with ID "${tabName}-tab" not found`);
          }
        }
        
        // Fix tabs - ensure only one tab is active at startup
        fixTabDisplay() {
          console.log('Fixing tab display...');
          
          // Check if a tab is already active
          const activeTabButton = document.querySelector('.tab-btn.active');
          
          if (activeTabButton) {
            const tabName = activeTabButton.getAttribute('data-tab');
            this.activateTab(tabName, activeTabButton);
          } else {
            // Activate pages tab by default
            const firstTab = document.querySelector('.tab-btn[data-tab="pages"]') || this.tabs[0];
            if (firstTab) {
              const tabName = firstTab.getAttribute('data-tab');
              this.activateTab(tabName, firstTab);
            }
          }
        }
        
        // Initialize PageEditor
        initializePageEditor() {
          console.log('Initializing PageEditor...');
          
          // Add delay to ensure Firebase is loaded
          setTimeout(() => {
            if (typeof PageEditor !== 'undefined') {
              // First check if PageEditor has been initialized
              if (typeof PageEditor.init === 'function') {
                console.log('Calling PageEditor.init...');
                PageEditor.init();
              }
              
              // Then load pages
              if (typeof PageEditor.loadPages === 'function') {
                console.log('Calling PageEditor.loadPages...');
                PageEditor.loadPages();
              } else {
                console.error('PageEditor.loadPages is not available!');
              }
            } else {
              console.error('PageEditor is not defined!');
              
              // Show error message
              const pagesTab = document.getElementById('pages-tab');
              if (pagesTab) {
                pagesTab.innerHTML = `
                  <div class="w3-panel w3-red">
                    <h3>Error: PageEditor not loaded</h3>
                    <p>The PageEditor could not be loaded. Please refresh the page and try again.</p>
                    <button class="w3-button w3-white" onclick="location.reload()">Reload Page</button>
                  </div>
                `;
              }
            }
          }, 500);
        }
        
        // Refresh preview
        refreshPreview() {
          const previewFrame = document.getElementById('previewFrame');
          const previewTypeRadios = document.getElementsByName('previewType');
          
          if (previewFrame) {
            const isDraft = Array.from(previewTypeRadios)
              .find(radio => radio.checked)?.value === 'draft';
            
            previewFrame.src = `preview.html?draft=${isDraft}&t=${Date.now()}`;
          }
        }
        
        // Manually activate a tab (can be called externally)
        switchToTab(tabName) {
          const tab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
          if (tab) {
            this.activateTab(tabName, tab);
          } else {
            console.error(`Tab with name "${tabName}" not found`);
          }
        }
      }
      
      // Initialize TabController and make globally available
      window.tabController = new TabController();
    });
  </script>

  <!-- Debug Helpers -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Loading debug helpers...');
      
      // Debug function to output status of all important components
      function debugStatus() {
        console.group('Admin Panel Diagnostics');
        
        // Check Firebase status
        console.log('Firebase available:', typeof firebase !== 'undefined');
        if (typeof firebase !== 'undefined') {
          console.log('Firebase initialized:', firebase.apps.length > 0);
          console.log('Firestore available:', typeof firebase.firestore === 'function');
          console.log('Auth available:', typeof firebase.auth === 'function');
        }
        
        // Check PageEditor status
        console.log('PageEditor available:', typeof PageEditor !== 'undefined');
        if (typeof PageEditor !== 'undefined') {
          console.log('PageEditor methods:', 
            Object.keys(PageEditor).filter(k => typeof PageEditor[k] === 'function'));
        }
        
        // Check DOM elements
        console.log('Tab buttons:', document.querySelectorAll('.tab-btn').length);
        console.log('Tab contents:', document.querySelectorAll('.tab-content').length);
        console.log('Pages tab:', document.getElementById('pages-tab') ? 'found' : 'not found');
        console.log('Pages container:', document.getElementById('pagesContainer') ? 'found' : 'not found');
        
        console.groupEnd();
      }
      
      // Run initial diagnostics
      setTimeout(debugStatus, 1000);
    });

    document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Admin Panel...');
  
  // Make sure PageEditor is properly initialized after DOM is loaded
  if (typeof PageEditor !== 'undefined') {
    console.log('PageEditor is defined, initializing...');
    
    if (typeof PageEditor.init === 'function') {
      console.log('Calling PageEditor.init()');
      PageEditor.init();
      
      // Set up a fallback for loadPages if it's not properly exposed
      if (typeof PageEditor.loadPages !== 'function') {
        console.warn('PageEditor.loadPages is not available, creating fallback...');
        
        // Create a fallback function
        PageEditor.loadPages = function() {
          console.log('Using fallback loadPages function');
          // Show a placeholder in the pages list
          const pagesList = document.getElementById('pagesList');
          if (pagesList) {
            pagesList.innerHTML = `
              <div class="w3-panel w3-pale-yellow w3-center">
                <p>Page loading is temporarily unavailable. Please refresh the page.</p>
                <button class="w3-button w3-blue" onclick="location.reload()">Refresh Page</button>
              </div>
            `;
          }
        };
      }
    } else {
      console.error('PageEditor.init is not a function');
    }
  } else {
    console.error('PageEditor is not defined');
    
    // Show error message on pages tab
    const pagesTab = document.getElementById('pages-tab');
    if (pagesTab) {
      pagesTab.innerHTML = `
        <div class="w3-panel w3-red">
          <h3>Error: PageEditor not loaded</h3>
          <p>The PageEditor could not be loaded. Please check the browser console for errors and refresh the page.</p>
          <button class="w3-button w3-white" onclick="location.reload()">Reload Page</button>
        </div>
      `;
    }
  }
  
  // Initialize TabController
  if (typeof window.tabController !== 'undefined' && typeof window.tabController.switchToTab === 'function') {
    // Switch to pages tab by default
    window.tabController.switchToTab('pages');
  }
});
  </script>
</body>
</html>