<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Panel</title>
  
  <!-- Core Styles -->
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  
  <!-- Enhanced Admin Panel CSS -->
  <link rel="stylesheet" href="./assets/css/admin.css" />
  
<!-- Quill Editor CSS -->
<link href="https://cdn.quilljs.com/2.0.0-dev.4/quill.snow.css" rel="stylesheet">
<link href="https://cdn.quilljs.com/2.0.0-dev.4/quill.bubble.css" rel="stylesheet">
<link href="./assets/css/quill-custom.css" rel="stylesheet">

<!-- Quill Editor library -->
<script src="https://cdn.quilljs.com/2.0.0-dev.4/quill.min.js"></script>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
  <?php require_once 'csrf-utils.php'; 
$csrf_token = generateCsrfToken();
?>
<script>
// CSRF-Token für Javascript verfügbar machen
const csrfToken = "<?php echo $csrf_token; ?>";
</script>
</head>
<body>

  <!-- Admin-Header -->
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
      <button class="tab-btn active" data-tab="content">
        <i class="fas fa-edit"></i> Content
      </button>
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
      <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo $csrf_token; ?>">
    </div>
    
    <!-- Tab: Content -->
    <div id="content-tab" class="tab-content active">
      <!-- Section "About me" -->
      <h3>About Me</h3>
      <div class="w3-card w3-padding w3-margin-bottom content-card">
        <label for="aboutTitle">Title:</label>
        <input id="aboutTitle" type="text" class="w3-input w3-margin-bottom" />
        <label for="aboutSubtitle">Subtitle:</label>
        <input id="aboutSubtitle" type="text" class="w3-input w3-margin-bottom" />
        <label for="aboutText">Description:</label>
        <textarea id="aboutText" class="tinymce-editor w3-margin-bottom" rows="5"></textarea>
      </div>

      <!-- Section "Offerings/Portfolio" -->
      <h3>My Offerings</h3>
      <div class="w3-card w3-padding w3-margin-bottom content-card">
        <label for="offeringsTitle">Section Title:</label>
        <input id="offeringsTitle" type="text" class="w3-input w3-margin-bottom" />
        <label for="offeringsSubtitle">Section Subtitle:</label>
        <input id="offeringsSubtitle" type="text" class="w3-input w3-margin-bottom" />
        
        <div class="w3-row w3-margin-top">
          <div class="w3-col m6">
            <label>Title Font Size:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="offeringsTitleSize" min="1.5" max="3.5" step="0.1" value="2.5" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="offeringsTitleSizeValue">2.5</span> em
              </div>
            </div>
          </div>
          <div class="w3-col m6">
            <label>Subtitle Font Size:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="offeringsSubtitleSize" min="0.8" max="2" step="0.1" value="1.2" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="offeringsSubtitleSizeValue">1.2</span> em
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Offering 1 -->
      <div class="w3-card w3-padding w3-margin-bottom content-card">
        <p><strong>Offering 1:</strong></p>
        <label for="offer1Title">Title:</label>
        <input id="offer1Title" type="text" class="w3-input w3-margin-bottom" />
        <label for="offer1Desc">Description:</label>
        <textarea id="offer1Desc" class="tinymce-editor w3-margin-bottom" rows="3"></textarea>
        <label>Image for Offering 1:</label>
        <div class="w3-row">
          <div class="w3-col m9">
            <div id="offer1ImagePreview" class="image-preview">
              <img id="offer1Img" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
            </div>
          </div>
          <div class="w3-col m3 w3-padding-small">
            <button id="offer1UploadBtn" class="w3-button w3-blue w3-block">
              <i class="fas fa-upload"></i> Choose Image
            </button>
          </div>
        </div>
      </div>
      
      <!-- Offering 2 -->
      <div class="w3-card w3-padding w3-margin-bottom content-card">
        <p><strong>Offering 2:</strong></p>
        <label for="offer2Title">Title:</label>
        <input id="offer2Title" type="text" class="w3-input w3-margin-bottom" />
        <label for="offer2Desc">Description:</label>
        <textarea id="offer2Desc" class="tinymce-editor w3-margin-bottom" rows="3"></textarea>
        <label>Image for Offering 2:</label>
        <div class="w3-row">
          <div class="w3-col m9">
            <div id="offer2ImagePreview" class="image-preview">
              <img id="offer2Img" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
            </div>
          </div>
          <div class="w3-col m3 w3-padding-small">
            <button id="offer2UploadBtn" class="w3-button w3-blue w3-block">
              <i class="fas fa-upload"></i> Choose Image
            </button>
          </div>
        </div>
      </div>
      
      <!-- Offering 3 -->
      <div class="w3-card w3-padding w3-margin-bottom content-card">
        <p><strong>Offering 3:</strong></p>
        <label for="offer3Title">Title:</label>
        <input id="offer3Title" type="text" class="w3-input w3-margin-bottom" />
        <label for="offer3Desc">Description:</label>
        <textarea id="offer3Desc" class="tinymce-editor w3-margin-bottom" rows="3"></textarea>
        <label>Image for Offering 3:</label>
        <div class="w3-row">
          <div class="w3-col m9">
            <div id="offer3ImagePreview" class="image-preview">
              <img id="offer3Img" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
            </div>
          </div>
          <div class="w3-col m3 w3-padding-small">
            <button id="offer3UploadBtn" class="w3-button w3-blue w3-block">
              <i class="fas fa-upload"></i> Choose Image
            </button>
          </div>
        </div>
      </div>

      <!-- Section "Contact" -->
      <h3>Contact</h3>
      <div class="w3-card w3-padding w3-margin-bottom content-card">
        <label for="contactTitle">Title:</label>
        <input id="contactTitle" type="text" class="w3-input w3-margin-bottom" />
        <label for="contactSubtitle">Subtitle/Note:</label>
        <input id="contactSubtitle" type="text" class="w3-input w3-margin-bottom" />
        <label>Image for Contact Area (e.g. Map):</label>
        <div class="w3-row">
          <div class="w3-col m9">
            <div id="contactImagePreview" class="image-preview">
              <img id="contactImg" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
            </div>
          </div>
          <div class="w3-col m3 w3-padding-small">
            <button id="contactUploadBtn" class="w3-button w3-blue w3-block">
              <i class="fas fa-upload"></i> Choose Image
            </button>
          </div>
        </div>
        
        <div class="w3-row w3-margin-top">
          <div class="w3-col m6">
            <label>Title Font Size:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="contactTitleSize" min="1.5" max="3.5" step="0.1" value="2.5" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="contactTitleSizeValue">2.5</span> em
              </div>
            </div>
          </div>
          <div class="w3-col m6">
            <label>Subtitle Font Size:</label>
            <div class="w3-row">
              <div class="w3-col s9">
                <input type="range" id="contactSubtitleSize" min="0.8" max="2" step="0.1" value="1.2" class="w3-input" />
              </div>
              <div class="w3-col s3 w3-padding-small">
                <span id="contactSubtitleSizeValue">1.2</span> em
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button - Sticky at the bottom -->
      <div class="action-buttons">
        <button id="saveDraftBtn" class="w3-button w3-yellow w3-margin-right">
          <i class="fas fa-save"></i> Save as Draft
        </button>
        <button id="publishBtn" class="w3-button w3-green">
          <i class="fas fa-globe"></i> Publish
        </button>
      </div>
      <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo $csrf_token; ?>">
    </div>
    
    <!-- Tab: Pages -->
    <div id="pages-tab" class="tab-content">
      <h3>Manage Pages</h3>
      <!-- The page editor components will be dynamically created by page-editor-enhanced.js -->
      <div id="pagesContainer" class="w3-row">
        <!-- This will be populated by the PageEditor -->
      </div>
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
        <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo $csrf_token; ?>">
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
        <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo $csrf_token; ?>">
      </div>
    </div>
  </div>

  <script src="./assets/js/firebase-service.js"></script>
<!-- Wait a moment for Firebase to initialize -->
<script>
  // Add this inline script to ensure Firebase is initialized before proceeding
  document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not available! Check script loading.');
    } else {
      console.log('Firebase is available');
    }
  });
</script>
<!-- Then load the admin panel script -->
<!-- Quill integration script -->
<script src="./assets/js/quill-integration.js"></script>
<script src="./assets/js/quill-page-editor.js"></script>
<script src="./assets/js/admin-panel.js"></script>
<script src="./assets/js/page-editor-enhanced.js"></script>
<script src="./assets/js/global-settings.js"></script>
<script>
  // Initialize Quill for rich text editing
  document.addEventListener('DOMContentLoaded', function() {
    // Make tinymce global API available for backwards compatibility
    window.tinymce = window.quillEditor.initRichTextEditors();
    
    // Direct login handler
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function() {
        const emailField = document.getElementById('emailField');
        const passField = document.getElementById('passField');
        const loginError = document.getElementById('loginError');
        
        if (!emailField || !passField) {
          console.error('Email or password field not found');
          return;
        }
        
        const email = emailField.value.trim();
        const pass = passField.value;
        
        if (!email || !pass) {
          if (loginError) loginError.textContent = "Please enter email and password";
          return;
        }
        
        // Initialize Firebase if needed
        if (typeof firebase !== 'undefined') {
          firebase.auth().signInWithEmailAndPassword(email, pass)
            .then(function(userCredential) {
              console.log('Login successful:', userCredential.user.email);
              document.getElementById('loginDiv').style.display = 'none';
              document.getElementById('adminDiv').style.display = 'block';
            })
            .catch(function(error) {
              console.error('Login error:', error);
              if (loginError) loginError.textContent = "Login failed: " + error.message;
            });
        } else {
          console.error('Firebase is not initialized!');
          if (loginError) loginError.textContent = "Error: Firebase not available";
        }
      });
    }
  });

  <script>
  // Add this script at the end of admin-panel.php
  document.addEventListener('DOMContentLoaded', function() {
    // Log important elements to console for debugging
    console.log('DOM Content Loaded');
    console.log('pagesContainer:', document.getElementById('pagesContainer'));
    console.log('pagesList or pagesListCard:', 
                document.getElementById('pagesList') || document.getElementById('pagesListCard'));
    
    // Check Firebase initialization
    console.log('Firebase available:', typeof firebase !== 'undefined');
    if (typeof firebase !== 'undefined') {
      console.log('Firebase apps:', firebase.apps.length);
      console.log('Firestore available:', typeof firebase.firestore === 'function');
    }
    
    // Ensure that the PageEditor initializes correctly
    if (typeof PageEditor === 'undefined') {
      console.error('PageEditor is not defined. Check that page-editor-enhanced.js is loaded');
    } else {
      console.log('PageEditor is defined. Methods:', 
                  Object.keys(PageEditor).filter(key => typeof PageEditor[key] === 'function'));
    }
    
    // Add a retry button for page loading if needed
    const pagesTab = document.getElementById('pages-tab');
    if (pagesTab) {
      const retryButton = document.createElement('button');
      retryButton.className = 'w3-button w3-blue w3-margin-top';
      retryButton.innerHTML = '<i class="fas fa-sync"></i> Reload Pages';
      retryButton.onclick = function() {
        console.log('Manual page reload triggered');
        if (typeof PageEditor !== 'undefined' && typeof PageEditor.loadPages === 'function') {
          PageEditor.loadPages();
        } else {
          console.error('PageEditor.loadPages is not available');
          alert('Error: Page editor not properly initialized. Try refreshing the page.');
        }
      };
      
      // Add the button at the top of the pages tab
      const firstChild = pagesTab.firstChild;
      if (firstChild) {
        pagesTab.insertBefore(retryButton, firstChild);
      } else {
        pagesTab.appendChild(retryButton);
      }
    }
  });


<!-- Make sure scripts are loaded in the correct order -->

  // Check if scripts are loaded in the correct order
  document.addEventListener('DOMContentLoaded', function() {
    const scriptOrder = [
      { name: 'Firebase App', loaded: typeof firebase !== 'undefined' },
      { name: 'Firebase Firestore', loaded: typeof firebase !== 'undefined' && typeof firebase.firestore === 'function' },
      { name: 'Firebase Auth', loaded: typeof firebase !== 'undefined' && typeof firebase.auth === 'function' },
      { name: 'Quill Editor', loaded: typeof Quill !== 'undefined' },
      { name: 'Firebase Service', loaded: typeof firebaseService !== 'undefined' },
      { name: 'Quill Integration', loaded: typeof quillEditor !== 'undefined' },
      { name: 'Page Editor', loaded: typeof PageEditor !== 'undefined' }
    ];
    
    console.log('Script loading status:');
    console.table(scriptOrder);
    
    // Check for issues
    const missingScripts = scriptOrder.filter(script => !script.loaded);
    if (missingScripts.length > 0) {
      console.error('Missing scripts:', missingScripts.map(s => s.name).join(', '));
      alert('Warning: Some required scripts failed to load. Admin panel may not work correctly.');
    }
  });

<!-- Add this script block at the end of admin-panel.php, replacing any existing debugging scripts -->
<!-- Make sure this comes before any closing </body> tag -->

<!-- Debug and helper scripts -->

  // Helper script to detect and report script loading issues
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Check for script dependencies
    const dependencies = [
      { name: 'Firebase App', status: typeof firebase !== 'undefined' },
      { name: 'Firebase Firestore', status: typeof firebase !== 'undefined' && typeof firebase.firestore === 'function' },
      { name: 'Firebase Auth', status: typeof firebase !== 'undefined' && typeof firebase.auth === 'function' },
      { name: 'Quill Editor', status: typeof Quill !== 'undefined' },
      { name: 'FirebaseService', status: typeof firebaseService !== 'undefined' || typeof window.firebaseService !== 'undefined' },
      { name: 'QuillEditor', status: typeof quillEditor !== 'undefined' || typeof window.quillEditor !== 'undefined' },
      { name: 'PageEditor', status: typeof PageEditor !== 'undefined' }
    ];
    
    console.table(dependencies);
    
    // Check for critical elements
    console.log('Pages tab:', document.getElementById('pages-tab') ? 'Found' : 'Missing');
    console.log('Pages container:', document.getElementById('pagesContainer') ? 'Found' : 'Missing');
    
    // Add force refresh button
    const addRefreshButton = () => {
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'w3-button w3-blue w3-margin';
      refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Force Reload Pages';
      refreshBtn.onclick = function() {
        if (typeof PageEditor !== 'undefined' && typeof PageEditor.loadPages === 'function') {
          console.log('Force reloading pages...');
          PageEditor.loadPages();
        } else {
          console.error('PageEditor not available');
          alert('PageEditor not available. Try refreshing the page.');
        }
      };
      
      const pagesTab = document.getElementById('pages-tab');
      if (pagesTab) {
        pagesTab.insertBefore(refreshBtn, pagesTab.firstChild);
      }
    };
    
    // Add the refresh button after a short delay
    setTimeout(addRefreshButton, 1000);
  });
</script>

<!-- Firebase initialization checking script -->
<script>
  // Check Firebase initialization
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not defined! Check Firebase script loading.');
      
      // Create an error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'w3-panel w3-red';
      errorMsg.innerHTML = `
        <h3>Firebase Error</h3>
        <p>Firebase failed to load. The admin panel may not work correctly.</p>
        <button class="w3-button w3-white" onclick="location.reload()">Reload Page</button>
      `;
      
      // Add to the top of the page
      document.body.insertBefore(errorMsg, document.body.firstChild);
      return;
    }
    
    // Ensure Firebase is initialized
    if (!firebase.apps.length) {
      try {
        // Use config from your config.php
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
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    }
    
    // Initialize PageEditor if available
    if (typeof PageEditor !== 'undefined' && typeof PageEditor.init === 'function') {
      console.log('Initializing PageEditor...');
      setTimeout(() => {
        PageEditor.init();
      }, 500);
    }
  });
  // Verbesserte Tab-Steuerung mit Fehlerbehebung
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initialisiere verbesserte Tab-Steuerung...');
  
  // Tab-Controller-Klasse für bessere Organisation
  class TabController {
    constructor() {
      this.tabs = document.querySelectorAll('.tab-btn');
      this.contents = document.querySelectorAll('.tab-content');
      this.activeTab = null;
      this.setupEventListeners();
      this.fixTabDisplay();
    }
    
    // Event-Listener für Tab-Buttons
    setupEventListeners() {
      this.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const tabName = tab.getAttribute('data-tab');
          this.activateTab(tabName, tab);
        });
      });
      
      console.log('Tab-Eventlistener eingerichtet');
    }
    
    // Tab aktivieren
    activateTab(tabName, tabButton) {
      console.log('Aktiviere Tab:', tabName);
      
      // Alle Tabs deaktivieren
      this.tabs.forEach(t => t.classList.remove('active'));
      this.contents.forEach(c => {
        c.style.display = 'none';
        c.classList.remove('active');
      });
      
      // Aktiven Tab setzen
      tabButton.classList.add('active');
      const content = document.getElementById(`${tabName}-tab`);
      
      if (content) {
        content.style.display = 'block';
        content.classList.add('active');
        this.activeTab = tabName;
        
        // Spezielle Aktionen für bestimmte Tabs
        if (tabName === 'pages') {
          this.initializePageEditor();
        } else if (tabName === 'preview') {
          this.refreshPreview();
        }
      } else {
        console.error(`Tab-Inhalt mit ID "${tabName}-tab" nicht gefunden`);
      }
    }
    
    // Tabs korrigieren - beim Start werden wir sicherstellen,
    // dass nur ein Tab aktiv ist
    fixTabDisplay() {
      console.log('Korrigiere Tab-Anzeige...');
      
      // Prüfen, ob ein Tab bereits aktiv ist
      const activeTabButton = document.querySelector('.tab-btn.active');
      
      if (activeTabButton) {
        const tabName = activeTabButton.getAttribute('data-tab');
        this.activateTab(tabName, activeTabButton);
      } else {
        // Standardmäßig ersten Tab aktivieren
        const firstTab = this.tabs[0];
        if (firstTab) {
          const tabName = firstTab.getAttribute('data-tab');
          this.activateTab(tabName, firstTab);
        }
      }
    }
    
    // PageEditor initialisieren
    initializePageEditor() {
      console.log('Initialisiere PageEditor...');
      
      // Verzögerung hinzufügen, um sicherzustellen, dass Firebase geladen ist
      setTimeout(() => {
        if (typeof PageEditor !== 'undefined') {
          // Zuerst überprüfen, ob PageEditor bereits initialisiert wurde
          if (typeof PageEditor.init === 'function') {
            console.log('PageEditor.init aufrufen...');
            PageEditor.init();
          }
          
          // Dann Seiten laden
          if (typeof PageEditor.loadPages === 'function') {
            console.log('PageEditor.loadPages aufrufen...');
            PageEditor.loadPages();
          } else {
            console.error('PageEditor.loadPages ist nicht verfügbar!');
          }
        } else {
          console.error('PageEditor ist nicht definiert!');
          
          // Fehlermeldung anzeigen
          const pagesTab = document.getElementById('pages-tab');
          if (pagesTab) {
            pagesTab.innerHTML = `
              <div class="w3-panel w3-red">
                <h3>Fehler: PageEditor nicht geladen</h3>
                <p>Der PageEditor konnte nicht geladen werden. Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.</p>
                <button class="w3-button w3-white" onclick="location.reload()">Seite neu laden</button>
              </div>
            `;
          }
        }
      }, 500);
    }
    
    // Preview aktualisieren
    refreshPreview() {
      const previewFrame = document.getElementById('previewFrame');
      const previewTypeRadios = document.getElementsByName('previewType');
      
      if (previewFrame) {
        const isDraft = Array.from(previewTypeRadios)
          .find(radio => radio.checked)?.value === 'draft';
        
        previewFrame.src = `preview.html?draft=${isDraft}&t=${Date.now()}`;
      }
    }
    
    // Manuell einen Tab aktivieren (kann von außen aufgerufen werden)
    switchToTab(tabName) {
      const tab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
      if (tab) {
        this.activateTab(tabName, tab);
      } else {
        console.error(`Tab mit Name "${tabName}" nicht gefunden`);
      }
    }
  }
  
  // TabController initialisieren und global verfügbar machen
  window.tabController = new TabController();
});

// Debug-Helfer zum Anzeigen von Firebase/PageEditor-Status und zum Beheben von Problemen
document.addEventListener('DOMContentLoaded', function() {
  // Debug-Funktion zum Ausgeben des Status aller wichtigen Komponenten
  function debugStatus() {
    console.group('Admin-Panel Diagnose');
    
    // Firebase-Status prüfen
    console.log('Firebase vorhanden:', typeof firebase !== 'undefined');
    if (typeof firebase !== 'undefined') {
      console.log('Firebase initialisiert:', firebase.apps.length > 0);
      console.log('Firestore verfügbar:', typeof firebase.firestore === 'function');
      console.log('Auth verfügbar:', typeof firebase.auth === 'function');
      
      if (firebase.apps.length > 0) {
        try {
          // Testen, ob die Firestore-Verbindung funktioniert
          firebase.firestore().collection('test').limit(1).get()
            .then(() => console.log('Firestore-Verbindung erfolgreich'))
            .catch(err => console.error('Firestore-Verbindungsfehler:', err));
        } catch (e) {
          console.error('Fehler beim Testen der Firestore-Verbindung:', e);
        }
      }
    }
    
    // PageEditor-Status prüfen
    console.log('PageEditor vorhanden:', typeof PageEditor !== 'undefined');
    if (typeof PageEditor !== 'undefined') {
      console.log('PageEditor-Methoden:', 
        Object.keys(PageEditor).filter(k => typeof PageEditor[k] === 'function'));
    }
    
    // DOM-Elemente prüfen
    console.log('Tab-Buttons:', document.querySelectorAll('.tab-btn').length);
    console.log('Tab-Inhalte:', document.querySelectorAll('.tab-content').length);
    console.log('Pages-Tab:', document.getElementById('pages-tab') ? 'gefunden' : 'nicht gefunden');
    console.log('Pages-Container:', document.getElementById('pagesContainer') ? 'gefunden' : 'nicht gefunden');
    
    // Tab-Status prüfen
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const activeTabContent = document.querySelector('.tab-content.active');
    console.log('Aktiver Tab-Button:', activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'keiner');
    console.log('Aktiver Tab-Inhalt:', activeTabContent ? activeTabContent.id : 'keiner');
    
    // Sichtbarkeit der Tabs prüfen
    document.querySelectorAll('.tab-content').forEach(tab => {
      console.log(`Tab ${tab.id} Display:`, window.getComputedStyle(tab).display);
    });
    
    console.groupEnd();
  }
  
  // Debug-Button zur Seite hinzufügen
  function addDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔍 Debug';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.left = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.backgroundColor = '#f44336';
    debugBtn.style.color = 'white';
    debugBtn.style.border = 'none';
    debugBtn.style.borderRadius = '4px';
    debugBtn.style.padding = '8px 12px';
    debugBtn.style.cursor = 'pointer';
    
    debugBtn.addEventListener('click', function() {
      debugStatus();
      
      // Zusätzliche Aktionen für Tab-Debugging
      const tabController = window.tabController;
      if (tabController) {
        console.log('TabController aktiv');
        tabController.fixTabDisplay();
      } else {
        console.log('TabController nicht gefunden');
      }
      
      // PageEditor initialisieren/neu laden
      if (typeof PageEditor !== 'undefined') {
        if (typeof PageEditor.init === 'function') {
          console.log('PageEditor neu initialisieren...');
          PageEditor.init();
        }
        
        if (typeof PageEditor.loadPages === 'function') {
          console.log('Pages neu laden...');
          PageEditor.loadPages();
        }
      }
      
      // Popup mit Debug-Info
      alert('Debug-Info in der Konsole ausgegeben. Bitte öffnen Sie die Browser-Konsole (F12).');
    });
    
    document.body.appendChild(debugBtn);
  }
  
  // Probleme mit der CSS-Anzeige beheben
  function fixCssDisplay() {
    // Stelle sicher, dass nur ein Tab aktiv ist
    const activeTabContents = document.querySelectorAll('.tab-content.active');
    if (activeTabContents.length > 1) {
      console.warn('Mehrere aktive Tabs gefunden!', activeTabContents);
      
      // Alle außer dem ersten deaktivieren
      for (let i = 1; i < activeTabContents.length; i++) {
        activeTabContents[i].classList.remove('active');
        activeTabContents[i].style.display = 'none';
      }
    }
    
    // Stelle sicher, dass alle Tab-Inhalte korrekte Anzeigestile haben
    document.querySelectorAll('.tab-content').forEach(tab => {
      if (tab.classList.contains('active')) {
        tab.style.display = 'block';
      } else {
        tab.style.display = 'none';
      }
    });
    
    // Stelle sicher, dass der Content-Tab nicht mehr aktiv ist, wenn ein anderer Tab aktiv ist
    const activeTabButton = document.querySelector('.tab-btn.active');
    if (activeTabButton && activeTabButton.getAttribute('data-tab') !== 'content') {
      const contentTab = document.getElementById('content-tab');
      if (contentTab && contentTab.classList.contains('active')) {
        contentTab.classList.remove('active');
        contentTab.style.display = 'none';
      }
    }
  }
  
  // Force-Fix-Button zur Seite hinzufügen
  function addFixButton() {
    const fixBtn = document.createElement('button');
    fixBtn.textContent = '🔧 Fix Tabs';
    fixBtn.style.position = 'fixed';
    fixBtn.style.bottom = '10px';
    fixBtn.style.left = '100px';
    fixBtn.style.zIndex = '9999';
    fixBtn.style.backgroundColor = '#4CAF50';
    fixBtn.style.color = 'white';
    fixBtn.style.border = 'none';
    fixBtn.style.borderRadius = '4px';
    fixBtn.style.padding = '8px 12px';
    fixBtn.style.cursor = 'pointer';
    
    fixBtn.addEventListener('click', function() {
      fixCssDisplay();
      
      // Wechsle zum Pages-Tab
      const tabController = window.tabController;
      if (tabController) {
        tabController.switchToTab('pages');
      } else {
        // Manuelles Umschalten, wenn kein TabController
        const pagesTabBtn = document.querySelector('.tab-btn[data-tab="pages"]');
        if (pagesTabBtn) {
          pagesTabBtn.click();
        }
      }
      
      // PageEditor initialisieren/neu laden
      if (typeof PageEditor !== 'undefined') {
        if (typeof PageEditor.loadPages === 'function') {
          console.log('Pages neu laden...');
          PageEditor.loadPages();
        }
      }
      
      alert('Tabs wurden repariert. Der Pages-Tab sollte jetzt angezeigt werden.');
    });
    
    document.body.appendChild(fixBtn);
  }
  
  // Füge die Debug-Buttons nach einer kurzen Verzögerung hinzu
  setTimeout(() => {
    addDebugButton();
    addFixButton();
    
    // Führe eine erste Diagnose durch
    debugStatus();
    
    // Versuche, CSS-Anzeige zu reparieren
    fixCssDisplay();
  }, 2000);
});
</script>
</body>
</html>