<?php
/**
 * Header Component Template
 * Common header shared across pages
 * 
 * Variables:
 * - $page_title: Page title
 * - $page_description: Page meta description
 * - $custom_styles: Additional CSS files or inline styles
 * - $custom_head: Additional content for head section
 * - $body_class: CSS classes for body tag
 */

// Set defaults if not provided
$page_title = $page_title ?? 'Mannar';
$page_description = $page_description ?? 'Mannar - Peer und Genesungsbegleiter';
$body_class = $body_class ?? '';

// Load version information for cache busting
if (!defined('ASSET_VERSION')) {
    require_once __DIR__ . '/../../version.php';
}
$asset_version = defined('ASSET_VERSION') ? ASSET_VERSION : '1.0.0';
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($page_title) ?></title>
    <meta name="description" content="<?= htmlspecialchars($page_description) ?>">
    
    <!-- Favicon -->
    <link rel="icon" href="<?= ASSET_PATH ?>/img/favicon.ico">
    <link rel="apple-touch-icon" href="<?= ASSET_PATH ?>/img/apple-touch-icon.png">
    
    <!-- Base Styles -->
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="<?= ASSET_PATH ?>/css/main.css?v=<?= $asset_version ?>">
    
    <!-- Custom Styles -->
    <?php if (isset($custom_styles)): ?>
        <?= $custom_styles ?>
    <?php endif; ?>
    
    <!-- Firebase SDK (Core) -->
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
    
    <!-- Firebase Configuration -->
    <script>
        const firebaseConfig = <?= json_encode(FIREBASE_CONFIG) ?>;
    </script>
    
    <!-- Additional head content -->
    <?php if (isset($custom_head)): ?>
        <?= $custom_head ?>
    <?php endif; ?>
    
    <!-- Preload critical assets -->
    <link rel="preload" href="<?= ASSET_PATH ?>/img/IMG_4781.svg" as="image">
    <link rel="preload" href="<?= ASSET_PATH ?>/js/ui-utils.js?v=<?= $asset_version ?>" as="script">
</head>
<body class="<?= htmlspecialchars($body_class) ?>">
    <!-- Accessibility skip link -->
    <a href="#main-content" class="skip-link">Zum Hauptinhalt springen</a>
    
    <!-- Status message container -->
    <div id="statusMsg" class="status-msg" role="alert" aria-live="polite"></div>