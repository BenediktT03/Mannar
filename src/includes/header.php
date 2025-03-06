 <?php
/**
 * header.php
 * Common header used across all pages
 */

// Get current page name
$current_page = basename($_SERVER['PHP_SELF'], '.php');

// Get page title
$page_title = isset($title) ? $title : 'Mannar';
$page_description = isset($description) ? $description : 'Mannar - Peer, Genesungsbegeleiter';

// Check if a custom page ID is provided
$page_id = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';

// Flag for preview mode
$preview_mode = isset($_GET['preview']) && $_GET['preview'] === 'true';
$draft_mode = isset($_GET['draft']) && $_GET['draft'] === 'true';
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo $page_title; ?></title>
  <meta name="description" content="<?php echo $page_description; ?>">
  
  <!-- Core Styles -->
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  
  <!-- Custom CSS - Modular structure -->
  <link rel="stylesheet" href="./assets/css/base/variables.css">
  <link rel="stylesheet" href="./assets/css/base/typography.css">
  <link rel="stylesheet" href="./assets/css/base/layout.css">
  <link rel="stylesheet" href="./assets/css/components/navbar.css">
  <link rel="stylesheet" href="./assets/css/components/word-cloud.css">
  <link rel="stylesheet" href="./assets/css/components/forms.css">
  <link rel="stylesheet" href="./assets/css/components/cards.css">
  
  <?php if ($current_page === 'admin-panel'): ?>
  <!-- Admin-specific styles -->
  <link rel="stylesheet" href="./assets/css/admin.css">
  <?php else: ?>
  <!-- Main website styles -->
  <link rel="stylesheet" href="./assets/css/main.css">
  <?php endif; ?>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  
  <?php if ($current_page === 'admin-panel'): ?>
  <!-- Admin-specific Libraries -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
  <script src="https://cdn.tiny.cloud/1/5pxzy8guun55o6z5mi0r8c4j8gk5hqeq3hpsotx123ak212k/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <?php endif; ?>
  
  <?php if ($preview_mode): ?>
  <!-- Preview Mode Styles -->
  <style>
    .preview-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: <?php echo $draft_mode ? '#ff9800' : '#4CAF50'; ?>;
      color: white;
      text-align: center;
      padding: 5px;
      z-index: 1000;
      font-size: 14px;
    }
  </style>
  <?php endif; ?>
</head>
<body class="<?php echo $current_page === 'admin-panel' ? 'admin-body' : ''; ?>">
  
  <?php if ($preview_mode): ?>
  <!-- Preview mode indicator -->
  <div class="preview-indicator">
    Vorschau-Modus: <span id="previewMode"><?php echo $draft_mode ? 'ENTWURF' : 'LIVE'; ?></span>
  </div>
  <?php endif; ?>
  
  <!-- Skip Navigation Link for Accessibility -->
  <a href="#main-content" class="skip-nav">Skip to main content</a>

  <!-- Navbar (always visible) -->
  <div class="w3-top">
    <div class="w3-bar" id="myNavbar">
      <a class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right" href="javascript:void(0);" onclick="toggleFunction()" title="Navigation Menu" aria-controls="navDemo" aria-expanded="false" aria-label="Toggle navigation menu">
        <i class="fas fa-bars"></i>
      </a>
      <a href="<?php echo $current_page === 'index' ? '#home' : 'index.php'; ?>" class="w3-bar-item w3-button">HOME</a>
      <a href="<?php echo $current_page === 'index' ? '#about' : 'index.php#about'; ?>" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-user"></i> ABOUT</a>
      <a href="<?php echo $current_page === 'index' ? '#portfolio' : 'index.php#portfolio'; ?>" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-th"></i> PORTFOLIO</a>
      <a href="<?php echo $current_page === 'index' ? '#contact' : 'index.php#contact'; ?>" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-envelope"></i> KONTAKT</a>
      
      <?php if ($current_page === 'page' && !empty($page_id)): ?>
      <!-- Dynamic page navigation for custom pages -->
      <div id="dynamicNav"></div>
      <?php endif; ?>
    </div>

    <!-- Navbar for small screens -->
    <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium">
      <a href="<?php echo $current_page === 'index' ? '#about' : 'index.php#about'; ?>" class="w3-bar-item w3-button" onclick="toggleFunction()">ABOUT</a>
      <a href="<?php echo $current_page === 'index' ? '#portfolio' : 'index.php#portfolio'; ?>" class="w3-bar-item w3-button" onclick="toggleFunction()">PORTFOLIO</a>
      <a href="<?php echo $current_page === 'index' ? '#contact' : 'index.php#contact'; ?>" class="w3-bar-item w3-button" onclick="toggleFunction()">KONTAKT</a>
      
      <?php if ($current_page === 'page' && !empty($page_id)): ?>
      <!-- Dynamic mobile navigation for custom pages -->
      <div id="dynamicNavMobile"></div>
      <?php endif; ?>
    </div>
  </div>
  
  <!-- Main Content Start -->
  <main id="main-content">