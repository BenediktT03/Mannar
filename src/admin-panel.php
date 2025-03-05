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
  <link rel="stylesheet" href="./assets/css/admin-enhanced.css" />
  <link rel="stylesheet" href="./assets/css/dashboard.css" />
  
  <!-- TinyMCE -->
  <script src="https://cdn.tiny.cloud/1/5pxzy8guun55o6z5mi0r8c4j8gk5hqeq3hpsotx123ak212k/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
  
  <!-- Chart.js for Dashboard -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
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
  </div>

  <!-- Admin Panel Content (only visible to logged-in users) -->
  <div id="adminDiv" class="w3-container admin-panel" style="display: none;">
    
    <!-- Tabs for different sections -->
    <div class="tabs">
      <button class="tab-btn" data-tab="dashboard">
        <i class="fas fa-tachometer-alt"></i> Dashboard
      </button>
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
    </div>
    
    <!-- Tab: Dashboard -->
    <div id="dashboard-tab" class="tab-content">
      <div class="w3-bar w3-padding">
        <h3 class="w3-bar-item"><i class="fas fa-chart-line"></i> Website Statistics Dashboard</h3>
        <div class="w3-right w3-padding-16">
          <span>Last updated: <span id="lastUpdatedTime">-</span></span>
          <button id="refreshStatsBtn" class="w3-button w3-blue w3-margin-left">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>
      
      <!-- Date Range Selector -->
      <div class="w3-row w3-padding-16">
        <div class="w3-col l3 m5 s12">
          <label for="dateRangeSelector"><strong>Date Range:</strong></label>
          <select id="dateRangeSelector" class="w3-select w3-border">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days" selected>Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div id="customDateContainer" class="w3-col l9 m7 s12" style="display: none;">
          <div class="w3-row">
            <div class="w3-col s6 m6 w3-padding">
              <label for="customStartDate"><strong>Start Date:</strong></label>
              <input type="date" id="customStartDate" class="w3-input w3-border">
            </div>
            <div class="w3-col s6 m6 w3-padding">
              <label for="customEndDate"><strong>End Date:</strong></label>
              <input type="date" id="customEndDate" class="w3-input w3-border">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="w3-row-padding">
        <!-- Page Views -->
        <div class="w3-col l3 m6 s12">
          <div class="dashboard-stat-card w3-card w3-padding w3-round w3-margin-bottom">
            <div class="w3-center">
              <div class="stat-icon"><i class="fas fa-eye"></i></div>
              <h4>Total Page Views</h4>
              <div class="stat-value" id="totalPageViews">-</div>
              <div class="stat-label">in selected period</div>
            </div>
          </div>
        </div>
        
        <!-- User Sessions -->
        <div class="w3-col l3 m6 s12">
          <div class="dashboard-stat-card w3-card w3-padding w3-round w3-margin-bottom">
            <div class="w3-center">
              <div class="stat-icon"><i class="fas fa-users"></i></div>
              <h4>User Sessions</h4>
              <div class="stat-value" id="totalSessions">-</div>
              <div class="stat-label">in selected period</div>
            </div>
          </div>
        </div>
        
        <!-- Edits Made -->
        <div class="w3-col l3 m6 s12">
          <div class="dashboard-stat-card w3-card w3-padding w3-round w3-margin-bottom">
            <div class="w3-center">
              <div class="stat-icon"><i class="fas fa-edit"></i></div>
              <h4>Edits Made</h4>
              <div class="stat-value" id="totalEdits">-</div>
              <div class="stat-label">in selected period</div>
            </div>
          </div>
        </div>
        
        <!-- Logins -->
        <div class="w3-col l3 m6 s12">
          <div class="dashboard-stat-card w3-card w3-padding w3-round w3-margin-bottom">
            <div class="w3-center">
              <div class="stat-icon"><i class="fas fa-sign-in-alt"></i></div>
              <h4>User Logins</h4>
              <div class="stat-value" id="totalLogins">-</div>
              <div class="stat-label">in selected period</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Charts Section -->
      <div class="w3-row-padding">
        <!-- Page Views Chart -->
        <div class="w3-col m6 s12">
          <div class="w3-card w3-white w3-round w3-margin-bottom">
            <div class="w3-container w3-padding">
              <h4><i class="fas fa-chart-line"></i> Page Views Trend</h4>
              <div class="chart-container" style="position: relative; height: 300px;">
                <canvas id="pageViewsChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <!-- User Activity Chart -->
        <div class="w3-col m6 s12">
          <div class="w3-card w3-white w3-round w3-margin-bottom">
            <div class="w3-container w3-padding">
              <h4><i class="fas fa-chart-bar"></i> User Activity</h4>
              <div class="chart-container" style="position: relative; height: 300px;">
                <canvas id="userActivityChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Popular Pages -->
      <div class="w3-card w3-white w3-round w3-margin-bottom">
        <div class="w3-container w3-padding">
          <h4><i class="fas fa-fire"></i> Most Popular Pages</h4>
          <div id="popularPagesContainer">
            <div class="w3-center w3-padding">
              <i class="fas fa-spinner fa-spin"></i> Loading popular pages...
            </div>
          </div>
        </div>
      </div>
      
      <!-- Change Log -->
      <div class="w3-card w3-white w3-round w3-margin-bottom">
        <div class="w3-container w3-padding">
          <div class="w3-bar">
            <h4 class="w3-bar-item"><i class="fas fa-history"></i> Recent Changes</h4>
            <button id="viewAllChangesBtn" class="w3-bar-item w3-button w3-blue w3-right">View All</button>
          </div>
          <div id="recentChangesContainer">
            <div class="w3-center w3-padding">
              <i class="fas fa-spinner fa-spin"></i> Loading recent changes...
            </div>
          </div>
        </div>
      </div>
      
      <!-- Export Options -->
      <div class="w3-card w3-white w3-round w3-margin-bottom">
        <div class="w3-container w3-padding">
          <h4><i class="fas fa-file-export"></i> Export Data</h4>
          <p>Export statistics data for further analysis or reporting.</p>
          <div class="w3-section">
            <button id="exportCSVBtn" class="w3-button w3-blue w3-margin-right">
              <i class="fas fa-file-csv"></i> Export as CSV
            </button>
            <button id="exportExcelBtn" class="w3-button w3-green">
              <i class="fas fa-file-excel"></i> Export as Excel
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading Indicator -->
      <div id="statsLoadingIndicator" class="w3-modal" style="display: none;">
        <div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width: 300px;">
          <div class="w3-center w3-padding-64">
            <i class="fas fa-spinner fa-spin" style="font-size: 48px;"></i>
            <p>Loading statistics...</p>
          </div>
        </div>
      </div>
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

      <!-- Change Log Entry -->
      <div class="w3-card w3-padding w3-margin-bottom content-card">
        <div class="w3-panel w3-pale-blue">
          <h4><i class="fas fa-history"></i> Change Log</h4>
          <p>Enter a brief description of the changes you're making (optional):</p>
          <textarea id="changeLogNotes" class="w3-input w3-border" placeholder="e.g., Updated about section, added new images, fixed typos"></textarea>
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
          <p><i class="fas fa-info-circle"></i> <strong>Note:</strong> Word Cloud preview is disabled. Changes will only be visible on the published website.</p>
        </div>
      </div>
      
      <div class="action-buttons">
        <button id="saveWordCloudBtn" class="w3-button w3-green">
          <i class="fas fa-save"></i> Save Word Cloud
        </button>
      </div>
    </div>
    
    <!-- Tab: Preview -->
    <div id="preview-tab" class="tab-content">
      <div class="content-card">
        <h3>Website Preview</h3>
        <div class="w3-margin-bottom">
          <label class="w3-margin-right">
            <input type="radio" name="previewType" value="draft" checked> 
            <span class="w3-badge w3-yellow">Draft - Currently Editing</span>
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
      </div>
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
  <script src="./assets/js/dashboard.js"></script>
  <script src="./assets/js/page-editor-enhanced.js"></script>
  <script src="./assets/js/global-settings.js"></script>
</body>
</html>