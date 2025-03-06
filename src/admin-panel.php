 <?php
/**
 * admin-panel.php
 * Main administration panel for managing website content
 */

// Set page title and description
$title = 'Admin Panel - Mannar';
$description = 'Administration Panel for Mannar Website';

// Include header
require_once 'includes/header.php';
?>

<!-- Admin Panel Container -->
<div class="admin-container">
  <!-- Login Form (initially visible, hidden after login) -->
  <div id="loginDiv" class="w3-card-4 w3-container w3-padding-large w3-margin-top w3-margin-bottom">
    <h2 class="w3-center">Admin Login</h2>
    
    <div class="w3-panel w3-pale-red w3-display-container w3-padding-small" id="loginError" style="display: none;"></div>
    
    <form class="w3-container" id="loginForm">
      <p>
        <label for="emailField">Email</label>
        <input class="w3-input w3-border" type="email" id="emailField" required>
      </p>
      
      <p>
        <label for="passField">Password</label>
        <input class="w3-input w3-border" type="password" id="passField" required>
      </p>
      
      <div class="w3-row">
        <div class="w3-half">
          <label class="w3-text-grey">
            <input class="w3-check" type="checkbox" id="rememberCheck"> Remember me
          </label>
        </div>
        <div class="w3-half w3-right-align">
          <button type="button" class="w3-button w3-blue" id="loginBtn">Login</button>
        </div>
      </div>
    </form>
  </div>
  
  <!-- Admin Panel (hidden until login) -->
  <div id="adminDiv" class="admin-panel" style="display: none;">
    <!-- Admin Header -->
    <div class="admin-header w3-container w3-teal">
      <h1>Mannar Admin Panel</h1>
      <div class="admin-toolbar">
        <button id="logoutBtn" class="w3-button w3-red w3-right">Logout</button>
        <button id="saveChangesBtn" class="w3-button w3-green w3-right w3-margin-right" onclick="AdminPanel.saveAllChanges()">Save Changes</button>
      </div>
    </div>
    
    <!-- Admin Tabs -->
    <div class="admin-tabs w3-bar w3-black">
      <button class="tab-btn w3-bar-item w3-button w3-padding-large" data-tab="dashboard">
        <i class="fas fa-tachometer-alt"></i> Dashboard
      </button>
      <button class="tab-btn w3-bar-item w3-button w3-padding-large active" data-tab="pages">
        <i class="fas fa-file-alt"></i> Pages
      </button>
      <button class="tab-btn w3-bar-item w3-button w3-padding-large" data-tab="wordcloud">
        <i class="fas fa-cloud"></i> Word Cloud
      </button>
      <button class="tab-btn w3-bar-item w3-button w3-padding-large" data-tab="preview">
        <i class="fas fa-eye"></i> Preview
      </button>
      <button class="tab-btn w3-bar-item w3-button w3-padding-large" data-tab="settings">
        <i class="fas fa-cog"></i> Settings
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="admin-content">
      <!-- Dashboard Tab -->
      <div id="dashboard-tab" class="tab-content w3-container w3-padding">
        <h2>Dashboard</h2>
        <div class="w3-row-padding">
          <div class="w3-third">
            <div class="w3-card w3-container w3-padding w3-center">
              <h3><i class="fas fa-file-alt"></i> Pages</h3>
              <p id="pageCount">0 pages created</p>
              <button class="w3-button w3-blue" onclick="AdminPanel.switchTab('pages')">Manage Pages</button>
            </div>
          </div>
          <div class="w3-third">
            <div class="w3-card w3-container w3-padding w3-center">
              <h3><i class="fas fa-cloud"></i> Word Cloud</h3>
              <p id="wordCount">0 words in cloud</p>
              <button class="w3-button w3-blue" onclick="AdminPanel.switchTab('wordcloud')">Edit Word Cloud</button>
            </div>
          </div>
          <div class="w3-third">
            <div class="w3-card w3-container w3-padding w3-center">
              <h3><i class="fas fa-eye"></i> Preview</h3>
              <p>See your changes</p>
              <button class="w3-button w3-blue" onclick="AdminPanel.switchTab('preview')">Preview Site</button>
            </div>
          </div>
        </div>
        
        <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue w3-margin-top">
          <p>Welcome to the admin panel. Use the tabs above to manage your website content.</p>
        </div>
      </div>
      
      <!-- Pages Tab -->
      <div id="pages-tab" class="tab-content w3-container w3-padding" style="display: block;">
        <h2>Page Management</h2>
        
        <div class="w3-row">
          <!-- Page List Column -->
          <div id="pagesListCol" class="w3-third">
            <div class="w3-card w3-white w3-margin-bottom">
              <header class="w3-container w3-blue">
                <h3>Pages</h3>
              </header>
              
              <div class="w3-container w3-padding">
                <button id="createPageBtn" class="w3-button w3-green w3-block">
                  <i class="fas fa-plus"></i> Create New Page
                </button>
              </div>
              
              <div id="pagesList" class="w3-container" style="max-height: 600px; overflow-y: auto;">
                <!-- Pages will be loaded here -->
                <div class="w3-center w3-padding">
                  <i class="fas fa-spinner fa-spin"></i> Loading pages...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Page Editor Column -->
          <div id="pagesEditorCol" class="w3-twothird">
            <!-- Welcome message when no page is selected -->
            <div id="pageWelcomeContainer" class="w3-container w3-card w3-white w3-padding-large">
              <h3 class="w3-center">Page Editor</h3>
              <p class="w3-center">Select a page from the list to edit, or create a new page.</p>
              <div class="w3-center w3-padding-large">
                <i class="fas fa-file-alt w3-jumbo w3-text-blue w3-opacity"></i>
              </div>
              <button id="welcomeCreateBtn" class="w3-button w3-green w3-block w3-margin-top">
                <i class="fas fa-plus"></i> Create New Page
              </button>
            </div>
            
            <!-- Page Editor Form (hidden initially) -->
            <div id="pageEditorContainer" class="w3-container w3-card w3-white w3-padding-large" style="display: none;">
              <div class="w3-bar w3-border-bottom w3-padding-bottom">
                <h3 id="editorPageTitle" class="w3-left">Editing: Page Title</h3>
                <button id="closeEditorBtn" class="w3-button w3-red w3-right">
                  <i class="fas fa-times"></i> Close
                </button>
              </div>
              
              <form id="editorForm" class="w3-padding-top">
                <input type="hidden" id="pageId" name="pageId">
                
                <div class="form-group">
                  <label for="pageTitle"><strong>Page Title:</strong></label>
                  <input type="text" id="pageTitle" name="pageTitle" class="w3-input w3-border" required>
                </div>
                
                <div class="form-group">
                  <label for="templateSelector"><strong>Template:</strong></label>
                  <select id="templateSelector" name="template" class="w3-select w3-border">
                    <option value="">Select a template</option>
                    <!-- Templates will be loaded dynamically -->
                  </select>
                </div>
                
                <div id="templateFields" class="w3-padding-top">
                  <!-- Template fields will be generated here -->
                </div>
                
                <div class="w3-row-padding w3-section">
                  <div class="w3-half">
                    <h4>Live Preview</h4>
                    <div id="livePreview" class="preview-container w3-border w3-padding" style="min-height: 300px;">
                      <!-- Live preview content -->
                    </div>
                  </div>
                  <div class="w3-half">
                    <h4>Actions</h4>
                    <div class="w3-bar">
                      <button type="button" id="savePageBtn" class="w3-button w3-green">
                        <i class="fas fa-save"></i> Save Page
                      </button>
                      <button type="button" id="previewPageBtn" class="w3-button w3-blue">
                        <i class="fas fa-eye"></i> Preview Page
                      </button>
                      <button type="button" id="deletePageBtn" class="w3-button w3-red">
                        <i class="fas fa-trash"></i> Delete Page
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Create Page Dialog -->
        <div id="createPageDialog" class="w3-modal">
          <div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width: 600px;">
            <div class="w3-container w3-blue">
              <span id="closePageDialogBtn" class="w3-button w3-display-topright">&times;</span>
              <h3>Create New Page</h3>
            </div>
            
            <form class="w3-container w3-padding-large">
              <div class="form-group">
                <label for="newPageId"><strong>Page ID:</strong></label>
                <input type="text" id="newPageId" class="w3-input w3-border" required
                       placeholder="URL-friendly identifier (e.g., about-us)">
                <small class="w3-text-grey">This will be used in the URL: mannar.de/page.php?id=your-page-id</small>
              </div>
              
              <div class="form-group">
                <label for="newPageTitle"><strong>Page Title:</strong></label>
                <input type="text" id="newPageTitle" class="w3-input w3-border" required
                       placeholder="Page title">
              </div>
              
              <div class="form-group">
                <label for="newPageTemplate"><strong>Template:</strong></label>
                <select id="newPageTemplate" class="w3-select w3-border" required>
                  <option value="">Select a template</option>
                  <!-- Templates will be loaded dynamically -->
                </select>
              </div>
              
              <div id="templatePreview" class="w3-margin-top">
                <!-- Template preview will be displayed here -->
              </div>
              
              <div class="w3-bar w3-margin-top">
                <button type="button" id="confirmCreatePageBtn" class="w3-button w3-green w3-right">Create Page</button>
                <button type="button" id="cancelCreatePageBtn" class="w3-button w3-grey w3-right w3-margin-right">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Word Cloud Tab -->
      <div id="wordcloud-tab" class="tab-content w3-container w3-padding">
        <h2>Word Cloud Management</h2>
        
        <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue">
          <p>Manage the words that appear in the word cloud on the homepage. Adjust word weight to control size (1-9).</p>
        </div>
        
        <button id="addWordBtn" class="word-add-btn">
          <i class="fas fa-plus"></i> Add New Word
        </button>
        
        <div id="wordCloudContainer" class="word-cloud-admin">
          <!-- Word cloud items will be loaded here -->
          <div class="w3-center w3-padding">
            <i class="fas fa-spinner fa-spin"></i> Loading word cloud...
          </div>
        </div>
        
        <div class="word-cloud-actions">
          <button id="previewWordCloudBtn" class="w3-button w3-blue">
            <i class="fas fa-eye"></i> Preview Word Cloud
          </button>
          <button id="saveWordCloudBtn" class="w3-button w3-green">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
      
      <!-- Preview Tab -->
      <div id="preview-tab" class="tab-content w3-container w3-padding">
        <h2>Preview Website</h2>
        
        <div class="w3-row w3-margin-bottom">
          <div class="w3-half">
            <label class="w3-radio">
              <input type="radio" name="previewType" value="live" checked> 
              Live Version
            </label>
          </div>
          <div class="w3-half">
            <label class="w3-radio">
              <input type="radio" name="previewType" value="draft"> 
              Draft Version
            </label>
          </div>
        </div>
        
        <button id="refreshPreviewBtn" class="w3-button w3-blue w3-margin-bottom">
          <i class="fas fa-sync"></i> Refresh Preview
        </button>
        
        <div class="w3-card w3-white">
          <iframe id="previewFrame" src="preview.php" style="width: 100%; height: 600px; border: none;"></iframe>
        </div>
      </div>
      
      <!-- Settings Tab -->
      <div id="settings-tab" class="tab-content w3-container w3-padding">
        <h2>Global Settings</h2>
        
        <div class="w3-panel w3-pale-yellow w3-leftbar w3-border-yellow">
          <p>This feature is under development and will be available in a future update.</p>
        </div>
        
        <div class="w3-card w3-white w3-padding">
          <h3>Website Information</h3>
          <div class="form-group">
            <label for="siteName"><strong>Site Name:</strong></label>
            <input type="text" id="siteName" class="w3-input w3-border" value="Mannar" disabled>
          </div>
          
          <div class="form-group">
            <label for="siteDescription"><strong>Site Description:</strong></label>
            <input type="text" id="siteDescription" class="w3-input w3-border" value="Peer und Genesungsbegleiter" disabled>
          </div>
          
          <h3 class="w3-margin-top">Theme Settings</h3>
          <div class="w3-row-padding">
            <div class="w3-half">
              <div class="form-group">
                <label for="primaryColor"><strong>Primary Color:</strong></label>
                <input type="color" id="primaryColor" class="w3-input w3-border" value="#3498db" disabled>
              </div>
            </div>
            <div class="w3-half">
              <div class="form-group">
                <label for="secondaryColor"><strong>Secondary Color:</strong></label>
                <input type="color" id="secondaryColor" class="w3-input w3-border" value="#2c3e50" disabled>
              </div>
            </div>
          </div>
          
          <button class="w3-button w3-blue w3-margin-top" disabled>
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Status message container -->
<div id="statusMsg" class="status-msg"></div>

<?php
// Additional scripts for admin panel
$additional_scripts = [
  'https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js'
];

// Include footer
require_once 'includes/footer.php';
?>