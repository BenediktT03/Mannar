<?php
/**
 * Mannar Website - Main Entry Point
 * 
 * This is the primary entry point for the website. It loads the application
 * bootstrap, initializes core components, and renders the homepage.
 *
 * @package     Mannar
 * @version     1.0.3
 */

// Define base application path constant
define('APP_PATH', dirname(__DIR__));

// Include the bootstrap file
require_once APP_PATH . '/bootstrap.php';

// Start output buffering for better control
ob_start();

try {
    // Page configuration for home page
    $page_data = [
        'page_title' => DEFAULT_META['title'],
        'page_description' => DEFAULT_META['description'],
        'current_page' => 'home',
        'body_class' => 'home-page',
        'og_image' => DEFAULT_META['og_image'],
        'canonical_url' => BASE_URL,
        
        // Additional scripts specific to homepage
        'additional_scripts' => '
            <script src="' . ASSETS_URL . '/js/content-loader.js?v=' . ASSET_VERSION . '"></script>
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    // Initialize content loader
                    ContentLoader.loadMainContent(false).then(data => {
                        console.log("Content loaded successfully");
                    }).catch(error => {
                        console.error("Error loading content:", error);
                    });
                    
                    // Load word cloud if enabled
                    if (' . (ENABLE_WORD_CLOUD ? 'true' : 'false') . ') {
                        ContentLoader.loadWordCloud().then(words => {
                            const wordCloudList = document.getElementById("wordCloudList");
                            if (wordCloudList) {
                                ContentLoader.renderWordCloud(wordCloudList, words);
                                UIUtils.animateWordCloud(document.querySelector(".textbubble"));
                            }
                        });
                    }
                });
            </script>
        '
    ];

    // Start output buffer to capture content
    ob_start();
    ?>

    <!-- Hero Section with Logo -->
    <div class="bgimg-1 w3-display-container" id="home">
        <div class="w3-display-middle" style="white-space:nowrap;">
            <img src="<?= ASSETS_URL ?>/img/IMG_4781.svg" alt="Mannar Logo" id="mainLogo" style="display:none;">
        </div>
    </div>

    <!-- About Section -->
    <div class="w3-content w3-container w3-padding-64" id="about">
        <h2 id="aboutTitle" class="w3-center" data-content-field="aboutTitle">ÜBER MICH</h2>
        <p id="aboutSubtitle" class="w3-center" data-content-field="aboutSubtitle"><em>Peer und Genesungsbegleiter</em></p>
        <div id="aboutText" class="animate-item" data-content-field="aboutText" data-html="true">
            <p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum. Meine eigenen Erfahrungen haben mich gelehrt, wie wichtig Achtsamkeit, Bewusstsein und Selbstreflexion für den Heilungsprozess sind.</p>
        </div>
        
        <?php if (ENABLE_WORD_CLOUD): ?>
        <div class="textbubble">
            <ul class="word-cloud" id="wordCloudList" role="navigation" aria-label="Psychologie & Spiritualität Word Cloud">
                <!-- Will be dynamically populated by JavaScript -->
            </ul>
        </div>
        <?php endif; ?>
    </div>

    <!-- Portfolio/Offerings Section -->
    <div class="w3-content w3-container w3-padding-64" id="portfolio">
        <h2 id="offeringsTitle" class="w3-center" data-content-field="offeringsTitle">MEINE ANGEBOTE</h2>
        <p id="offeringsSubtitle" class="w3-center" data-content-field="offeringsSubtitle"><em>Hier sind einige meiner Leistungen und Angebote</em></p>
        
        <!-- Offerings Cards -->
        <div class="w3-row-padding">
            <!-- Offering 1 -->
            <div class="w3-col m4 portfolio-item animate-item delay-1">
                <div class="w3-card w3-round">
                    <img id="offer1Image" src="<?= ASSETS_URL ?>/img/placeholder.jpg" alt="Angebot 1" style="width:100%"
                         data-content-field="offer1_image">
                    <div class="w3-container">
                        <h3 id="offer1Title" data-content-field="offer1Title">Einzelgespräche</h3>
                        <div id="offer1Desc" data-content-field="offer1Desc" data-html="true">
                            <p>Persönliche Begleitung auf Ihrem Weg zu mehr Bewusstsein und Selbsterkenntnis.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Offering 2 -->
            <div class="w3-col m4 portfolio-item animate-item delay-2">
                <div class="w3-card w3-round">
                    <img id="offer2Image" src="<?= ASSETS_URL ?>/img/placeholder.jpg" alt="Gruppenworkshops" style="width:100%"
                         data-content-field="offer2_image">
                    <div class="w3-container">
                        <h3 id="offer2Title" data-content-field="offer2Title">Gruppenworkshops</h3>
                        <div id="offer2Desc" data-content-field="offer2Desc" data-html="true">
                            <p>Gemeinsame Erfahrungsräume für Austausch und Wachstum in der Gemeinschaft.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Offering 3 -->
            <div class="w3-col m4 portfolio-item animate-item delay-3">
                <div class="w3-card w3-round">
                    <img id="offer3Image" src="<?= ASSETS_URL ?>/img/placeholder.jpg" alt="Meditation" style="width:100%"
                         data-content-field="offer3_image">
                    <div class="w3-container">
                        <h3 id="offer3Title" data-content-field="offer3Title">Meditation</h3>
                        <div id="offer3Desc" data-content-field="offer3Desc" data-html="true">
                            <p>Anleitungen und Übungen zur Stärkung von Achtsamkeit und innerem Frieden.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal for displaying images on click -->
    <div id="modal01" class="w3-modal w3-black" onclick="this.style.display='none'">
        <span class="w3-button w3-large w3-black w3-display-topright" title="Schließen"><i class="fas fa-times"></i></span>
        <div class="w3-modal-content w3-animate-zoom w3-center w3-transparent w3-padding-64">
            <img id="img01" class="w3-image" alt="Vergrößertes Bild">
            <p id="caption" class="w3-opacity w3-large"></p>
        </div>
    </div>

    <!-- Contact Section -->
    <div class="w3-content w3-container w3-padding-64" id="contact">
        <h2 id="contactTitle" class="w3-center" data-content-field="contactTitle">KONTAKT</h2>
        <p id="contactSubtitle" class="w3-center" data-content-field="contactSubtitle"><em>Ich freue mich auf Ihre Nachricht!</em></p>

        <div class="w3-row w3-padding-32 w3-section">
            <div class="w3-col m4 w3-container animate-item">
                <img id="contactImage" src="<?= ASSETS_URL ?>/img/placeholder.jpg" class="w3-image w3-round" 
                     style="width:100%" alt="Karte zu meinem Standort" data-content-field="contact_image">
            </div>
            <div class="w3-col m8 w3-panel animate-item delay-1">
                <div class="w3-large w3-margin-bottom">
                    <i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Berlin, Deutschland<br>
                    <i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Telefon: +49 30 123456<br>
                    <i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> E-Mail: <?= htmlspecialchars(EMAIL_CONFIG['contact_email']) ?><br>
                </div>
                <p>Schauen Sie auf einen Kaffee vorbei <i class="fas fa-coffee"></i>, oder hinterlassen Sie mir eine Nachricht:</p>
                
                <?php if (ENABLE_CONTACT_FORM): ?>
                <form action="<?= API_URL ?>/contact.php" method="post" class="contact-form w3-container">
                    <?php $csrf_token = generate_csrf_token(); ?>
                    <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
                    
                    <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
                        <div class="w3-half">
                            <input class="w3-input w3-border" type="text" placeholder="Name" required name="name">
                        </div>
                        <div class="w3-half">
                            <input class="w3-input w3-border" type="email" placeholder="E-Mail" required name="email">
                        </div>
                    </div>
                    <input class="w3-input w3-border w3-margin-bottom" type="text" placeholder="Betreff" name="subject">
                    <textarea class="w3-input w3-border" name="message" rows="5" placeholder="Nachricht" required></textarea>
                    <button class="w3-button w3-black w3-right w3-section" type="submit">
                        <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
                    </button>
                </form>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <?php
    // Get the captured content
    $content = ob_get_clean();

    // Render the page with the header, content, and footer
    render_template('layouts/base', [
        'content' => $content,
        'page_data' => $page_data
    ]);

} catch (Exception $e) {
    // Clear any output buffering
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    // Log the error
    error_log('Error in index.php: ' . $e->getMessage());
    
    // Show error page
    if (APP_DEBUG) {
        // Detailed error in development
        echo '<div style="background-color: #f8d7da; color: #721c24; padding: 20px; margin: 20px; border: 1px solid #f5c6cb; border-radius: 4px;">';
        echo '<h2>Error</h2>';
        echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
        echo '<p>File: ' . htmlspecialchars($e->getFile()) . ' on line ' . $e->getLine() . '</p>';
        echo '<h3>Stack Trace:</h3>';
        echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
        echo '</div>';
    } else {
        // User-friendly error in production
        render_template('error', [
            'title' => 'Entschuldigung, ein Fehler ist aufgetreten',
            'message' => 'Bitte versuchen Sie es später noch einmal oder kontaktieren Sie uns direkt.'
        ]);
    }
}

// Flush the output buffer and send to browser
ob_end_flush();