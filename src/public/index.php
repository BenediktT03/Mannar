<?php
/**
 * Mannar Website Homepage
 * Main entry point for the website
 */

// Initialize the application
require_once 'core/init.php';

// Page configuration
$page_data = [
    'page_title' => 'Mannar - Peer und Genesungsbegleiter',
    'page_description' => 'Mannar bietet Begleitung und Unterstützung auf dem Weg zu psychischer Gesundheit und persönlichem Wachstum.',
    'current_page' => 'home',
    'body_class' => 'home-page',
    
    // Additional scripts specific to homepage
    'additional_scripts' => '
        <script src="' . ASSET_PATH . '/js/content-loader.js?v=' . ASSET_VERSION . '"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                contentLoader.loadContent(false).then(data => {
                    // Content loaded successfully, the content-loader.js will handle rendering
                    console.log("Content loaded successfully");
                });
                
                // Load word cloud if enabled
                if (' . (ENABLE_WORD_CLOUD ? 'true' : 'false') . ') {
                    contentLoader.loadWordCloud().then(words => {
                        const wordCloudList = document.getElementById("wordCloudList");
                        if (wordCloudList) {
                            contentLoader.renderWordCloud(wordCloudList, words);
                            contentLoader.animateWordCloud(document.querySelector(".textbubble"));
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
        <img src="<?= ASSET_PATH ?>/img/IMG_4781.svg" alt="Mannar Logo" id="mainLogo" style="display:none;">
    </div>
</div>

<!-- About Section -->
<div class="w3-content w3-container w3-padding-64" id="about">
    <h2 id="aboutTitle" class="w3-center">ÜBER MICH</h2>
    <p id="aboutSubtitle" class="w3-center"><em>Peer und Genesungsbegleiter</em></p>
    <div id="aboutText" class="animate-item">
        <p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum. Meine eigenen Erfahrungen haben mich gelehrt, wie wichtig Achtsamkeit, Bewusstsein und Selbstreflexion für den Heilungsprozess sind.</p>
    </div>
    
    <?php if (ENABLE_WORD_CLOUD): ?>
    <div class="textbubble">
        <ul class="word-cloud" id="wordCloudList" role="navigation" aria-label="Psychologie & Spiritualität Word Cloud">
            <!-- Will be dynamically populated from Firebase -->
        </ul>
    </div>
    <?php endif; ?>
</div>

<!-- Portfolio/Offerings Section -->
<div class="w3-content w3-container w3-padding-64" id="portfolio">
    <h2 id="offeringsTitle" class="w3-center">MEINE ANGEBOTE</h2>
    <p id="offeringsSubtitle" class="w3-center"><em>Hier sind einige meiner Leistungen und Angebote</em></p>
    
    <!-- Offerings Cards -->
    <div class="w3-row-padding">
        <!-- Offering 1 -->
        <div class="w3-col m4 portfolio-item animate-item delay-1">
            <div class="w3-card w3-round">
                <img id="offer1Image" src="<?= ASSET_PATH ?>/img/placeholder.jpg" alt="Angebot 1" style="width:100%">
                <div class="w3-container">
                    <h3 id="offer1Title">Einzelgespräche</h3>
                    <div id="offer1Desc">
                        <p>Persönliche Begleitung auf Ihrem Weg zu mehr Bewusstsein und Selbsterkenntnis.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Offering 2 -->
        <div class="w3-col m4 portfolio-item animate-item delay-2">
            <div class="w3-card w3-round">
                <img id="offer2Image" src="<?= ASSET_PATH ?>/img/placeholder.jpg" alt="Gruppenworkshops" style="width:100%">
                <div class="w3-container">
                    <h3 id="offer2Title">Gruppenworkshops</h3>
                    <div id="offer2Desc">
                        <p>Gemeinsame Erfahrungsräume für Austausch und Wachstum in der Gemeinschaft.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Offering 3 -->
        <div class="w3-col m4 portfolio-item animate-item delay-3">
            <div class="w3-card w3-round">
                <img id="offer3Image" src="<?= ASSET_PATH ?>/img/placeholder.jpg" alt="Meditation" style="width:100%">
                <div class="w3-container">
                    <h3 id="offer3Title">Meditation</h3>
                    <div id="offer3Desc">
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
    <h2 id="contactTitle" class="w3-center">KONTAKT</h2>
    <p id="contactSubtitle" class="w3-center"><em>Ich freue mich auf Ihre Nachricht!</em></p>

    <div class="w3-row w3-padding-32 w3-section">
        <div class="w3-col m4 w3-container animate-item">
            <img id="contactImage" src="<?= ASSET_PATH ?>/img/placeholder.jpg" class="w3-image w3-round" style="width:100%" alt="Karte zu meinem Standort">
        </div>
        <div class="w3-col m8 w3-panel animate-item delay-1">
            <div class="w3-large w3-margin-bottom">
                <i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Berlin, Deutschland<br>
                <i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Telefon: +49 30 123456<br>
                <i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> E-Mail: <?= htmlspecialchars(EMAIL_CONFIG['contact_email']) ?><br>
            </div>
            <p>Schauen Sie auf einen Kaffee vorbei <i class="fas fa-coffee"></i>, oder hinterlassen Sie mir eine Nachricht:</p>
            
            <?php if (ENABLE_CONTACT_FORM): ?>
            <form action="<?= API_PATH ?>/contact.php" method="post" class="contact-form w3-container">
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
render_component('header', $page_data);
render_component('navigation', $page_data);
?>

<main id="main-content">
    <?= $content ?>
</main>

<?php
render_component('footer', $page_data);
?>