 <?php
/**
 * Admin Layout
 * 
 * Base layout template for all admin panel pages.
 * Provides core structure, authentication, and admin interface elements.
 *
 * Variables:
 * - $content: Main content to be rendered in the admin panel
 * - $page_title: Admin page title
 * - $active_tab: Currently active tab in the admin interface
 * - $admin_scripts: Additional JavaScript files for the admin panel
 * - $admin_styles: Additional CSS files for the admin panel
 * - $include_editor: Whether to include rich text editor
 * - $include_sortable: Whether to include the Sortable.js library
 * - $include_cloudinary: Whether to include Cloudinary upload widget
 */

// Require CSRF utilities for security
require_once __DIR__ . '/../../utils/security.php';

// Generate CSRF token for forms
$csrf_token = generate_csrf_token();

// Set defaults if not provided
$page_title = $page_title ?? 'Admin Panel | Mannar';
$active_tab = $active_tab ?? 'pages';
$include_editor = $include_editor ?? true;
$include_sortable = $include_sortable ?? true;
$include_cloudinary = $include_cloudinary ?? true;

// Asset version for cache busting
$asset_version = defined('ASSET_VERSION') ? ASSET_VERSION : '1.0.0';
$asset_path = defined('ASSET_PATH') ? ASSET_PATH : './assets';
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title) ?></title>
    <meta name="robots" content="noindex, nofollow">
    
    <!-- CSS Libraries -->
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<?= $asset_path ?>/css/admin.css?v=<?= $asset_version ?>">
    
    <?php if ($include_editor): ?>
    <!-- Rich Text Editor CSS -->
    <link rel="stylesheet" href="https://cdn.quilljs.com/1.3.7/quill.snow.css">
    <link rel="stylesheet" href="<?= $asset_path ?>/css/quill-custom.css?v=<?= $asset_version ?>">
    <?php endif; ?>
    
    <!-- Additional Admin Styles -->
    <?php if (isset($admin_styles)): ?>
        <?= $admin_styles ?>
    <?php endif; ?>

    <!-- CSRF Token for JavaScript -->
    <script>
        const csrfToken = "<?php echo $csrf_token; ?>";
    </script>
    
    <!-- Firebase Libraries -->
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
    
    <?php if ($include_editor): ?>
    <!-- Rich Text Editor library -->
    <script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>
    <?php endif; ?>
    
    <?php if ($include_sortable): ?>
    <!-- Sortable.js for drag and drop functionality -->
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <?php endif; ?>
    
    <?php if ($include_cloudinary): ?>
    <!-- Cloudinary widget for image uploads -->
    <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script>
    <?php endif; ?>
</head>
<body class="admin-body">
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

    <!-- Status message container -->
    <div id="statusMsg" class="status-msg" role="alert" aria-live="polite"></div>

    <!-- Login Form (initially hidden if auth) -->
    <div id="loginDiv" class="w3-card w3-padding">
        <h3>Login</h3>
        <div id="loginForm">
            <div class="field-container">
                <label for="emailField">Email:</label>
                <input id="emailField" class="w3-input w3-margin-bottom" type="email" placeholder="Email" />
            </div>
            <div class="field-container">
                <label for="passField">Password:</label>
                <input id="passField" class="w3-input w3-margin-bottom" type="password" placeholder="Password" />
            </div>
            <button id="loginBtn" class="w3-button w3-black w3-block">Login</button>
            <p id="loginError" class="w3-text-red"></p>
        </div>
        <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo $csrf_token; ?>">
    </div>

    <!-- Admin Panel Content (initially hidden until auth) -->
    <div id="adminDiv" class="w3-container admin-panel" style="display: none;">
        
        <!-- Tabs for different sections -->
        <div class="tabs">
            <button class="tab-btn <?= $active_tab === 'pages' ? 'active' : '' ?>" data-tab="pages">
                <i class="fas fa-file-alt"></i> Pages
            </button>
            <button class="tab-btn <?= $active_tab === 'wordcloud' ? 'active' : '' ?>" data-tab="wordcloud">
                <i class="fas fa-cloud"></i> Word Cloud
            </button>
            <button class="tab-btn <?= $active_tab === 'preview' ? 'active' : '' ?>" data-tab="preview">
                <i class="fas fa-eye"></i> Preview
            </button>
            <button class="tab-btn <?= $active_tab === 'settings' ? 'active' : '' ?>" data-tab="settings">
                <i class="fas fa-cog"></i> Global Settings
            </button>
            <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
        </div>
        
        <!-- Main content area -->
        <div class="admin-content">
            <?= $content ?? '' ?>
        </div>
    </div>

    <!-- Core Admin Scripts -->
    <script src="<?= $asset_path ?>/js/services/firebase.js?v=<?= $asset_version ?>"></script>
    <script src="<?= $asset_path ?>/js/services/upload.js?v=<?= $asset_version ?>"></script>
    <script src="<?= $asset_path ?>/js/admin/admin-core.js?v=<?= $asset_version ?>"></script>
    
    <?php if ($include_editor): ?>
    <!-- Rich Text Editor Scripts -->
    <script src="<?= $asset_path ?>/js/admin/editor-module.js?v=<?= $asset_version ?>"></script>
    <?php endif; ?>
    
    <!-- Additional Admin Scripts -->
    <script src="<?= $asset_path ?>/js/admin/page-editor.js?v=<?= $asset_version ?>"></script>
    <script src="<?= $asset_path ?>/js/admin/settings-manager.js?v=<?= $asset_version ?>"></script>
    <script src="<?= $asset_path ?>/js/admin/word-cloud-manager.js?v=<?= $asset_version ?>"></script>
    
    <?php if (isset($admin_scripts)): ?>
        <?= $admin_scripts ?>
    <?php endif; ?>

    <!-- Firebase Initialization -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Firebase if not already initialized
            if (typeof firebase !== 'undefined') {
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
                }
            }
            
            // Initialize Admin Core functionality
            if (typeof AdminCore !== 'undefined' && typeof AdminCore.init === 'function') {
                AdminCore.init();
            }
            
            // Initialize Editor if available
            if (typeof EditorModule !== 'undefined' && typeof EditorModule.convertAll === 'function') {
                setTimeout(() => {
                    EditorModule.convertAll('.rich-editor');
                }, 500);
            }
            
            // Set active tab based on server variable
            const activeTab = '<?= $active_tab ?>';
            if (typeof AdminCore !== 'undefined' && typeof AdminCore.switchTab === 'function') {
                setTimeout(() => {
                    AdminCore.switchTab(activeTab);
                }, 100);
            }
        });
    </script>

    <!-- Error Recovery Script -->
    <script>
        // Fallback error recovery
        window.addEventListener('error', function(e) {
            console.error('Runtime error detected:', e.message);
            
            // Check if critical admin functions are available
            if (!window.AdminCore || !window.PageEditor) {
                console.warn('Critical admin modules not loaded, attempting recovery...');
                
                // Show error to user
                const statusMsg = document.getElementById('statusMsg');
                if (statusMsg) {
                    statusMsg.textContent = 'Ein Fehler ist aufgetreten. Versuche, die Seite neu zu laden.';
                    statusMsg.className = 'status-msg error show';
                }
                
                // Try to maintain basic functionality
                if (!window.AdminCore) {
                    window.AdminCore = { 
                        showStatus: function(msg, isError) {
                            const statusMsg = document.getElementById('statusMsg');
                            if (statusMsg) {
                                statusMsg.textContent = msg;
                                statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
                            }
                        },
                        switchTab: function(tabId) {
                            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                            if (tabBtn) tabBtn.click();
                        }
                    };
                }
            }
        });
    </script>
</body>
</html>