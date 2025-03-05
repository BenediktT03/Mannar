<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Panel</title>
  
  <!-- Core Styles -->
  <link rel="stylesheet" href="./assets/css/admin-css.css" />
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  
  <!-- Enhanced Admin Panel CSS -->
  
  
  <!-- TinyMCE -->
  <script src="https://cdn.tiny.cloud/1/5pxzy8guun55o6z5mi0r8c4j8gk5hqeq3hpsotx123ak212k/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
  
  <!-- Cloudinary (if available) -->
  <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script>
</head>
<body>

  <!-- Admin-Header -->
  <div class="admin-header w3-center">
    <h2>Admin Panel</h2>
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
  </div>

  <!-- Admin Panel Content (only visible to logged-in users) -->
  <div id="adminDiv" class="w3-container admin-panel" style="display: none;">
    
    <!-- Tabs for different sections -->
    <div class="tabs">
      <button class="tab-btn active" data-tab="content">Content</button>
      <button class="tab-btn" data-tab="pages">Pages</button>
      <button class="tab-btn" data-tab="wordcloud">Word Cloud</button>
      <button class="tab-btn" data-tab="preview">Preview</button>
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
    </div>
    
    <!-- Tab: Pages -->
    <div id="pages-tab" class="tab-content">
      <h3>Manage Pages</h3>
      <div id="pagesListContainer" class="w3-margin-bottom">
        <div class="w3-margin-bottom">
          <button id="createPageBtn" class="w3-button w3-blue">
            <i class="fas fa-plus"></i> Create New Page
          </button>
        </div>
        
        <div id="pagesListBox" class="w3-card w3-padding w3-margin-bottom content-card">
          <h4>Existing Pages</h4>
          <div id="pagesList" class="w3-container">
            <p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Loading pages...</p>
          </div>
        </div>
      </div>
      
      <!-- Form to create a new page -->
      <div id="newPageForm" class="w3-card w3-padding w3-margin-bottom content-card" style="display: none;">
        <h4>Create New Page</h4>
        <div class="w3-section">
          <label><strong>Page Name:</strong></label>
          <input type="text" id="pageName" class="w3-input w3-border w3-margin-bottom" placeholder="e.g. about-me, services, contact" />
          <small class="w3-text-grey">Use lowercase letters, numbers, and hyphens only</small>
          
          <label><strong>Page Title:</strong></label>
          <input type="text" id="pageTitle" class="w3-input w3-border w3-margin-bottom" placeholder="Shown in browser tab" />
          
          <label><strong>Template:</strong></label>
          <select id="pageTemplate" class="w3-select w3-border w3-margin-bottom">
            <option value="basic">Basic Template (Title + Text)</option>
            <option value="text-image">Text with Image (right)</option>
            <option value="image-text">Image (left) with Text</option>
            <option value="gallery">Gallery Template</option>
            <option value="contact">Contact Template</option>
          </select>
          
          <div id="templatePreview" class="w3-margin-bottom">
            <!-- Template preview will be inserted here -->
          </div>
        </div>
        
        <div class="w3-section">
          <button class="w3-button w3-red" id="cancelNewPageBtn">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="w3-button w3-green w3-right" id="createNewPageBtn">
            <i class="fas fa-plus"></i> Create Page
          </button>
        </div>
      </div>
      
      <!-- Form to edit a page -->
      <div id="editPageForm" class="w3-card w3-padding w3-margin-bottom content-card" style="display: none;">
        <h4 id="editPageTitle">Edit Page</h4>
        <div id="templateFields" class="w3-section">
          <!-- Template fields will be inserted here -->
        </div>
        <div class="w3-section">
          <button class="w3-button w3-amber" id="backToListBtn">
            <i class="fas fa-arrow-left"></i> Back to List
          </button>
          <button class="w3-button w3-red w3-margin-left" id="deletePageBtn">
            <i class="fas fa-trash"></i> Delete
          </button>
          <button class="w3-button w3-green w3-right" id="savePageBtn">
            <i class="fas fa-save"></i> Save
          </button>
        </div>
      </div>
    </div>

    <!-- Tab: Word Cloud -->
    <div id="wordcloud-tab" class="tab-content">
      <h3>Edit Word Cloud</h3>
      <p>Here you can customize the words in the word cloud. The weight (1-9) determines the size of the words.</p>
      
      <div id="wordCloudContainer" class="word-cloud-admin">
        <!-- Word items will be dynamically inserted here -->
      </div>
      
      <button id="addWordBtn" class="w3-button w3-blue">
        <i class="fas fa-plus"></i> Add New Word
      </button>
      
      <div class="action-buttons">
        <button id="saveWordCloudBtn" class="w3-button w3-green">
          <i class="fas fa-save"></i> Save Word Cloud
        </button>
      </div>
    </div>
    
    <!-- Tab: Preview -->
    <div id="preview-tab" class="tab-content">
      <div class="w3-margin-bottom">
        <label><input type="radio" name="previewType" value="draft" checked> Draft</label>
        <label class="w3-margin-left"><input type="radio" name="previewType" value="live"> Live Website</label>
        <button id="refreshPreviewBtn" class="w3-button w3-blue w3-right">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      <iframe id="previewFrame" class="preview-frame" src="preview.html?draft=true"></iframe>
    </div>
  </div>

  <!-- Firebase Initialization -->
  <script>
    // One-time Firebase initialization
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
        authDomain: "mannar-129a5.firebaseapp.com",
        projectId: "mannar-129a5",
        storageBucket: "mannar-129a5.firebasestorage.app",
        messagingSenderId: "687710492532",
        appId: "1:687710492532:web:c7b675da541271f8d83e21",
        measurementId: "G-NXBLYJ5CXL"
      });
    }
  </script>
  
  <!-- Scripts -->
  <script src="./assets/js/navbar.js"></script>
  <script src="./assets/js/admin-panel.js"></script>
  <script src="./assets/js/page-editor-fix.js"></script>
</body>
</html>