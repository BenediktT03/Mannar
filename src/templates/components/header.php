<?php
/**
 * Header Component
 * 
 * Provides a standardized header across all pages of the Mannar website.
 * Includes document head, meta tags, CSS, and initial JavaScript.
 * 
 * Variables:
 * - $page_title: Page title (will appear in browser tab)
 * - $page_description: Page meta description for SEO
 * - $page_keywords: Keywords for SEO (optional)
 * - $page_author: Author meta tag (optional)
 * - $custom_styles: Additional CSS files or inline styles
 * - $custom_head: Additional content for head section
 * - $body_class: CSS classes for body tag
 * - $include_firebase_auth: Whether to include Firebase Auth SDK
 * - $include_firebase_storage: Whether to include Firebase Storage SDK
 * - $load_cloudinary: Whether to load Cloudinary script
 * - $open_graph: Array of Open Graph properties for social sharing
 */

// Set defaults if not provided
$page_title = $page_title ?? 'Mannar - Peer und Genesungsbegleiter';
$page_description = $page_description ?? 'Mannar bietet Begleitung und Unterstützung auf dem Weg zu psychischer Gesundheit und persönlichem Wachstum.';
$page_keywords = $page_keywords ?? 'Peer, Genesungsbegleiter, psychische Gesundheit, Achtsamkeit, Selbstreflexion';
$page_author = $page_author ?? 'Mannar';
$body_class = $body_class ?? '';
$include_firebase_auth = $include_firebase_auth ?? false;
$include_firebase_storage = $include_firebase_storage ?? false;
$load_cloudinary = $load_cloudinary ?? false;

// Get asset version for cache busting
$asset_version = defined('ASSET_VERSION') ? ASSET_VERSION : '1.0.0';
$asset_path = defined('ASSET_PATH') ? ASSET_PATH : './assets';
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title) ?></title>
    <meta name="description" content="<?= htmlspecialchars($page_description) ?>">
    <meta name="keywords" content="<?= htmlspecialchars($page_keywords) ?>">
    <meta name="author" content="<?= htmlspecialchars($page_author) ?>">
    
    <!-- Favicon -->
    <link rel="icon" href="<?= $asset_path ?>/img/favicon.ico">
    <link rel="apple-touch-icon" href="<?= $asset_path ?>/img/apple-touch-icon.png">
    
    <!-- Open Graph for social sharing -->
    <?php if (isset($open_graph) && is_array($open_graph)): ?>
        <?php foreach ($open_graph as $property => $content): ?>
            <meta property="og:<?= htmlspecialchars($property) ?>" content="<?= htmlspecialchars($content) ?>">
        <?php endforeach; ?>
    <?php else: ?>
        <meta property="og:title" content="<?= htmlspecialchars($page_title) ?>">
        <meta property="og:description" content="<?= htmlspecialchars($page_description) ?>">
        <meta property="og:type" content="website">
        <meta property="og:url" content="<?= htmlspecialchars((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]") ?>">
        <meta property="og:image" content="<?= $asset_path ?>/img/og-image.jpg">
    <?php endif; ?>

    <!-- Base Styles -->
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    
    <!-- Main CSS -->
    <link rel="stylesheet" href="<?= $asset_path ?>/css/main.css?v=<?= $asset_version ?>">
    
    <!-- Custom Styles -->
    <?php if (isset($custom_styles)): ?>
        <?= $custom_styles ?>
    <?php endif; ?>
    
    <!-- Preload critical assets -->
    <link rel="preload" href="<?= $asset_path ?>/img/IMG_4781.svg" as="image">
    <link rel="preload" href="<?= $asset_path ?>/js/utils/ui-utils.js?v=<?= $asset_version ?>" as="script">
    
    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
    
    <?php if ($include_firebase_auth): ?>
        <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
    <?php endif; ?>
    
    <?php if ($include_firebase_storage): ?>
        <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
    <?php endif; ?>
    
    <?php if ($load_cloudinary): ?>
        <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script>
    <?php endif; ?>
    
    <!-- Firebase Configuration -->
    <script>
        const firebaseConfig = {
            apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
            authDomain: "mannar-129a5.firebaseapp.com",
            projectId: "mannar-129a5",
            storageBucket: "mannar-129a5.firebasestorage.app",
            messagingSenderId: "687710492532",
            appId: "1:687710492532:web:c7b675da541271f8d83e21",
            measurementId: "G-NXBLYJ5CXL"
        };
        
        // Initialize Firebase
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
        }
    </script>
    
    <!-- Additional head content -->
    <?php if (isset($custom_head)): ?>
        <?= $custom_head ?>
    <?php endif; ?>
</head>
<body class="<?= htmlspecialchars($body_class) ?>">
    <!-- Accessibility skip link -->
    <a href="#main-content" class="skip-link">Zum Hauptinhalt springen</a>
    
    <!-- Status message container -->
    <div id="statusMsg" class="status-msg" role="alert" aria-live="polite"></div>