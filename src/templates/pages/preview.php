<?php
/**
 * Preview Page Template
 * 
 * Provides a previewing interface for content creators to view draft or live content
 * before publishing to the main website. The page loads content dynamically from
 * Firebase based on the preview mode selected (draft or live).
 * 
 * @package Mannar
 * @subpackage Templates
 */

// Include required files
require_once __DIR__ . '/../../core/init.php';

// Determine preview mode from query parameters
$is_draft = isset($_GET['draft']) && $_GET['draft'] === 'true';
$preview_mode = $is_draft ? 'draft' : 'live';
$preview_class = $is_draft ? '' : 'live';

// Set page configuration
$page_config = [
    'title' => 'Content Preview - Mannar',
    'description' => 'Preview content before publishing - Mannar',
    'body_class' => 'preview-page',
    'include_firebase' => true,
    
    // Custom head content for preview-specific styling
    'custom_head' => '
        <style>
            /* Preview indicator styles */
            .preview-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background-color: #ff9800;
                color: white;
                text-align: center;
                padding: 5px;
                z-index: 1000;
                font-size: 14px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .preview-indicator.live {
                background-color: #4CAF50;
            }
            
            /* Adjust main content to accommodate the indicator */
            body.preview-page #main-content {
                padding-top: 30px;
            }
        </style>
    ',
    
    // Load preview-specific JavaScript
    'additional_scripts' => '
        <script src="' . ASSET_PATH . '/js/preview.js?v=' . ASSET_VERSION . '"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                // Initialize preview mode
                PreviewModule.init({
                    isDraft: ' . ($is_draft ? 'true' : 'false') . ',
                    timestamp: ' . time() . '
                });
            });
        </script>
    '
];

// Start output buffering for content
ob_start();
?>

<!-- Preview mode indicator -->
<div id="previewIndicator" class="preview-indicator <?php echo $preview_class; ?>" role="status" aria-live="polite">
    Preview Mode: <span id="previewMode"><?php echo ucfirst($preview_mode); ?></span>
    <button id="refreshPreviewBtn" class="refresh-button" title="Refresh preview">
        <i class="fas fa-sync-alt"></i>
    </button>
</div>

<!-- Hero Section with Logo -->
<div class="bgimg-1 w3-display-container" id="home">
    <div class="w3-display-middle" style="white-space:nowrap;">
        <img src="<?php echo ASSET_PATH; ?>/img/IMG_4781.svg" alt="Mannar Logo" id="mainLogo" style="display:none;">
    </div>
</div>

<!-- About Section -->
<div class="w3-content w3-container w3-padding-64" id="about">
    <h2 id="aboutTitleDisplay" class="w3-center"></h2>
    <p id="aboutSubtitleDisplay" class="w3-center"><em></em></p>
    <div id="aboutTextDisplay" class="animate-item"></div>

    <div class="textbubble">
        <ul class="word-cloud" id="wordCloudList" role="navigation" aria-label="Word Cloud">
            <!-- Will be dynamically populated -->
        </ul>
    </div>
</div>

<!-- Portfolio/Offerings Section -->
<div class="w3-content w3-container w3-padding-64" id="portfolio">
    <h2 id="offeringsTitleDisplay" class="w3-center"></h2>
    <p id="offeringsSubtitleDisplay" class="w3-center"><em></em></p>
    
    <!-- Offerings Cards -->
    <div class="w3-row-padding">
        <!-- Offering 1 -->
        <div class="w3-col m4 portfolio-item">
            <div class="w3-card w3-round">
                <img id="offer1ImageDisplay" src="<?php echo ASSET_PATH; ?>/img/placeholder.jpg" alt="Offering 1" style="width:100%">
                <div class="w3-container">
                    <h3 id="offer1TitleDisplay"></h3>
                    <div id="offer1DescDisplay"></div>
                </div>
            </div>
        </div>
        
        <!-- Offering 2 -->
        <div class="w3-col m4 portfolio-item">
            <div class="w3-card w3-round">
                <img id="offer2ImageDisplay" src="<?php echo ASSET_PATH; ?>/img/placeholder.jpg" alt="Offering 2" style="width:100%">
                <div class="w3-container">
                    <h3 id="offer2TitleDisplay"></h3>
                    <div id="offer2DescDisplay"></div>
                </div>
            </div>
        </div>
        
        <!-- Offering 3 -->
        <div class="w3-col m4 portfolio-item">
            <div class="w3-card w3-round">
                <img id="offer3ImageDisplay" src="<?php echo ASSET_PATH; ?>/img/placeholder.jpg" alt="Offering 3" style="width:100%">
                <div class="w3-container">
                    <h3 id="offer3TitleDisplay"></h3>
                    <div id="offer3DescDisplay"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Contact Section -->
<div class="w3-content w3-container w3-padding-64" id="contact">
    <h2 id="contactTitleDisplay" class="w3-center"></h2>
    <p id="contactSubtitleDisplay" class="w3-center"></p>

    <div class="w3-row w3-padding-32 w3-section">
        <div class="w3-col m4 w3-container">
            <img id="contactImageDisplay" src="<?php echo ASSET_PATH; ?>/img/placeholder.jpg" class="w3-image w3-round" style="width:100%" alt="Contact image">
        </div>
        <div class="w3-col m8 w3-panel">
            <div class="w3-large w3-margin-bottom">
                <i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Berlin, Germany<br>
                <i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Phone: +49 30 123456<br>
                <i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Email: contact@example.com<br>
            </div>
            <p>Drop by for a cup of coffee <i class="fas fa-coffee"></i>, or leave me a message:</p>
            
            <!-- Contact form (display only, not functional in preview) -->
            <form class="w3-container" id="previewContactForm">
                <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
                    <div class="w3-half">
                        <input class="w3-input w3-border" type="text" placeholder="Name" disabled>
                    </div>
                    <div class="w3-half">
                        <input class="w3-input w3-border" type="text" placeholder="Email" disabled>
                    </div>
                </div>
                <textarea class="w3-input w3-border" placeholder="Message" disabled rows="4"></textarea>
                <button class="w3-button w3-black w3-right w3-section" type="button" disabled>
                    <i class="fas fa-paper-plane"></i> SEND MESSAGE
                </button>
            </form>
        </div>
    </div>
</div>

<!-- Page loading overlay -->
<div id="pageLoading" class="page-loading">
    <div class="spinner"></div>
    <p>Loading preview content...</p>
</div>

<?php
// Get the captured content
$content = ob_get_clean();

// Render the page with the base template
render_template('layouts/base', [
    'title' => $page_config['title'],
    'description' => $page_config['description'],
    'content' => $content,
    'custom_head' => $page_config['custom_head'],
    'body_class' => $page_config['body_class'],
    'additional_scripts' => $page_config['additional_scripts'],
    'include_firebase' => $page_config['include_firebase']
]);
?>