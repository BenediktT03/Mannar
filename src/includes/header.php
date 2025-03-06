<?php
/**
 * improved-header.php
 * Optimiertes Header-Template mit verbesserten Ladezeiten und Best Practices
 */

// Fehlerreporting nur in Entwicklungsumgebung aktivieren
ini_set('display_errors', DEBUG_MODE ? 1 : 0);
error_reporting(DEBUG_MODE ? E_ALL : 0);

// Notwendige Utilities laden
require_once __DIR__ . '/../utils/AssetLoader.php';
require_once __DIR__ . '/../utils/CacheManager.php';
require_once __DIR__ . '/../utils/InputSanitizer.php';
require_once __DIR__ . '/../utils/CsrfProtection.php';
require_once __DIR__ . '/../components/ResponsiveImage.php';
require_once __DIR__ . '/../config/env.php';

// Aktuelle Seite ermitteln
$current_page = basename($_SERVER['PHP_SELF'], '.php');

// Seitentitel und -beschreibung sicher abrufen
$page_title = isset($title) ? InputSanitizer::sanitizeText($title) : 'Mannar';
$page_description = isset($description) ? InputSanitizer::sanitizeText($description) : 'Mannar - Peer und Genesungsbegeleiter';

// Benutzerdefinierte Seiten-ID prüfen (für dynamische Seiten)
$page_id = isset($_GET['id']) ? InputSanitizer::sanitizeText($_GET['id']) : '';

// Flag für Vorschaumodus
$preview_mode = isset($_GET['preview']) && $_GET['preview'] === 'true';
$draft_mode = isset($_GET['draft']) && $_GET['draft'] === 'true';

// Open Graph / Social Media Metadaten
$og_type = isset($og_type) ? $og_type : 'website';
$og_image = isset($og_image) ? $og_image : 'assets/images/og-image.jpg';
$twitter_card = isset($twitter_card) ? $twitter_card : 'summary_large_image';
$canonical_url = isset($canonical_url) ? $canonical_url : (SITE_URL . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Kritisches CSS laden (für schnellere erste Anzeige)
$critical_css_path = __DIR__ . '/../assets/css/critical/' . $current_page . '-critical.css';
$default_critical_css_path = __DIR__ . '/../assets/css/critical/default-critical.css';

// Seiten-Assets vorbereiten
AssetLoader::loadPageAssets($current_page);

// CSRF-Token für Formulare generieren
$csrf_token = CsrfProtection::getToken();
?>
<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title; ?></title>
    <meta name="description" content="<?php echo $page_description; ?>">
    <meta name="author" content="Mannar">
    
    <!-- Kanonische URL für SEO -->
    <link rel="canonical" href="<?php echo $canonical_url; ?>">
    
    <!-- Favicon-Einstellungen -->
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#3498db">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="<?php echo $og_type; ?>">
    <meta property="og:url" content="<?php echo $canonical_url; ?>">
    <meta property="og:title" content="<?php echo $page_title; ?>">
    <meta property="og:description" content="<?php echo $page_description; ?>">
    <meta property="og:image" content="<?php echo SITE_URL . '/' . ltrim($og_image, '/'); ?>">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="<?php echo $twitter_card; ?>">
    <meta name="twitter:title" content="<?php echo $page_title; ?>">
    <meta name="twitter:description" content="<?php echo $page_description; ?>">
    <meta name="twitter:image" content="<?php echo SITE_URL . '/' . ltrim($og_image, '/'); ?>">
    
    <!-- CSRF-Token für AJAX-Anfragen -->
    <?php echo CsrfProtection::metaTag(); ?>
    
    <!-- DNS-Prefetch und Preconnect für externe Domains -->
    <?php echo AssetLoader::printPreconnect(); ?>
    
    <!-- Kritisches CSS inline für schnelleres Rendering -->
    <?php
    if (file_exists($critical_css_path)) {
        echo AssetLoader::printCriticalCSS($critical_css_path);
    } elseif (file_exists($default_critical_css_path)) {
        echo AssetLoader::printCriticalCSS($default_critical_css_path);
    }
    ?>
    
    <!-- Verzögertes Laden von Non-Critical CSS -->
    <script>
    // Funktion zum Laden von CSS-Dateien
    function loadCSS(src) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = src;
        document.head.appendChild(link);
    }
    
    // CSS-Dateien verzögert laden
    window.addEventListener('load', function() {
        // Kritisches CSS bereits geladen, jetzt Rest laden
        requestAnimationFrame(function() {
            setTimeout(function() {
                // Header-Assets ausgeben
                <?php echo AssetLoader::printHeaderAssets(); ?>
            }, 0);
        });
    });
    </script>
    
    <!-- Sofortiges Laden von CSS, falls JavaScript deaktiviert ist -->
    <noscript>
        <?php echo AssetLoader::printHeaderAssets(); ?>
    </noscript>
    
    <?php if ($preview_mode): ?>
    <!-- Vorschaumodus-spezifische Styles -->
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
        
        body {
            margin-top: 30px; /* Platz für den Vorschau-Indikator */
        }
    </style>
    <?php endif; ?>
    
    <!-- Frühzeitiges Laden der Schriftarten -->
    <link rel="preload" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap"></noscript>
</head>
<body class="<?php echo $current_page === 'admin-panel' ? 'admin-body' : ''; ?>"<?php echo isset($body_attributes) ? ' ' . $body_attributes : ''; ?>>
    <?php if ($preview_mode): ?>
    <!-- Vorschaumodus-Indikator -->
    <div class="preview-indicator" role="alert">
        Vorschau-Modus: <span id="previewMode"><?php echo $draft_mode ? 'ENTWURF' : 'LIVE'; ?></span>
    </div>
    <?php endif; ?>
    
    <!-- Skip-Navigation-Link für Barrierefreiheit -->
    <a href="#main-content" class="skip-nav">Zum Hauptinhalt springen</a>

    <!-- Navbar (immer sichtbar) -->
    <header class="w3-top">
        <nav class="w3-bar" id="myNavbar" role="navigation" aria-label="Hauptnavigation">
            <button class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right" 
                    onclick="toggleFunction()" 
                    title="Navigation Menu" 
                    aria-controls="navDemo" 
                    aria-expanded="false" 
                    aria-label="Navigationsmenü umschalten">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
            <a href="<?php echo $current_page === 'index' ? '#home' : 'index.php'; ?>" class="w3-bar-item w3-button">HOME</a>
            <a href="<?php echo $current_page === 'index' ? '#about' : 'index.php#about'; ?>" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-user" aria-hidden="true"></i> ÜBER MICH</a>
            <a href="<?php echo $current_page === 'index' ? '#portfolio' : 'index.php#portfolio'; ?>" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-th" aria-hidden="true"></i> ANGEBOTE</a>
            <a href="<?php echo $current_page === 'index' ? '#contact' : 'index.php#contact'; ?>" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-envelope" aria-hidden="true"></i> KONTAKT</a>
            
            <?php if ($current_page === 'page' && !empty($page_id)): ?>
            <!-- Dynamische Seitennavigation für benutzerdefinierte Seiten -->
            <div id="dynamicNav"></div>
            <?php endif; ?>
        </nav>

        <!-- Navigationsmenü für kleine Bildschirme -->
        <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium" aria-labelledby="mobileMenuTitle" role="menu">
            <span id="mobileMenuTitle" class="sr-only">Mobiles Navigationsmenü</span>
            <a href="<?php echo $current_page === 'index' ? '#about' : 'index.php#about'; ?>" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">ÜBER MICH</a>
            <a href="<?php echo $current_page === 'index' ? '#portfolio' : 'index.php#portfolio'; ?>" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">ANGEBOTE</a>
            <a href="<?php echo $current_page === 'index' ? '#contact' : 'index.php#contact'; ?>" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">KONTAKT</a>
            
            <?php if ($current_page === 'page' && !empty($page_id)): ?>
            <!-- Dynamische mobile Navigation für benutzerdefinierte Seiten -->
            <div id="dynamicNavMobile" role="menu"></div>
            <?php endif; ?>
        </div>
    </header>
    
    <!-- Hauptinhalt beginnt -->
    <main id="main-content">