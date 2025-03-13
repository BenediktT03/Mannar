<?php
/**
 * Mannar Website - Admin Panel Entry Point
 * 
 * This is the entry point for the admin panel which provides content management
 * capabilities to authorized users. It loads the admin interface and enforces
 * authentication.
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

// Generate CSRF token for forms
$csrf_token = generate_csrf_token();

try {
    // Admin panel configuration
    $admin_config = [
        'title' => 'Admin Panel | Mannar',
        'description' => 'Verwaltungsbereich für die Mannar-Website',
        'body_class' => 'admin-page',
        'include_firebase_auth' => true,
        'include_firebase_storage' => true,
        'hide_header' => true,
        'hide_footer' => true,
        'csrf_token' => $csrf_token
    ];

    // Start output buffer to capture content
    ob_start();
    ?>

    <!-- Admin Header -->
    <div class="admin-header w3-center">
        <h2><i class="fas fa-tools"></i> Mannar Admin Panel</h2>
    </div>

    <!-- Navigation Controls -->
    <div class="nav-controls w3-padding">
        <a href="index.php" class="w3-button w3-blue w3-margin-right">
            <i class="fas fa-home"></i> Zurück zur Website
        </a>
        <button id="logoutBtn" class="w3-button w3-red">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    </div>

    <!-- Status message -->
    <div id="statusMsg" class="status-msg" role="alert" aria-live="polite"></div>

    <!-- Login Form (shown when not authenticated) -->
    <div id="loginDiv" class="w3-card w3-padding">
        <h3>Login</h3>
        <form id="loginForm">
            <div class="field-container">
                <label for="emailField">E-Mail:</label>
                <input id="emailField" class="w3-input w3-margin-bottom" type="email" placeholder="Email" required />
            </div>
            <div class="field-container">
                <label for="passField">Passwort:</label>
                <input id="passField" class="w3-input w3-margin-bottom" type="password" placeholder="Password" required />
            </div>
            <button id="loginBtn" type="submit" class="w3-button w3-blue w3-block">Login</button>
            <p id="loginError" class="w3-text-red"></p>
        </form>
        <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo $csrf_token; ?>">
    </div>

    <!-- Admin Panel Content (only visible to logged-in users) -->
    <div id="adminDiv" class="w3-container admin-panel" style="display: none;">
        
        <!-- Tabs for different sections -->
        <div class="tabs">
            <button class="tab-btn" data-tab="pages">
                <i class="fas fa-file-alt"></i> Seiten
            </button>
            <button class="tab-btn" data-tab="wordcloud">
                <i class="fas fa-cloud"></i> Word Cloud
            </button>
            <button class="tab-btn" data-tab="preview">
                <i class="fas fa-eye"></i> Vorschau
            </button>
            <button class="tab-btn" data-tab="settings">
                <i class="fas fa-cog"></i> Einstellungen
            </button>
            <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
        </div>
        
        <!-- Tab: Pages -->
        <div id="pages-tab" class="tab-content">
            <h3>Seiten verwalten</h3>
            <!-- The page editor components -->
            <div id="pagesContainer" class="w3-row">
                <div id="pagesListCol" class="w3-col m4 l3">
                    <div class="w3-margin-bottom">
                        <button id="createPageBtn" class="w3-button w3-blue w3-block">
                            <i class="fas fa-plus"></i> Neue Seite erstellen
                        </button>
                    </div>
                    
                    <div id="pagesListCard" class="w3-card w3-padding">
                        <h3>Ihre Seiten</h3>
                        <div id="pagesList" class="pages-list">
                            <div class="w3-center">
                                <i class="fas fa-spinner fa-spin"></i> Seiten werden geladen...
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="pagesEditorCol" class="w3-col m8 l9">
                    <div id="pageWelcomeContainer" class="page-welcome-container w3-center w3-padding-64">
                        <div class="w3-container w3-light-grey w3-padding-32 w3-round">
                            <h2><i class="fas fa-file-alt"></i> Seiten-Manager</h2>
                            <p>Wählen Sie eine Seite aus der Liste aus, um sie zu bearbeiten, oder erstellen Sie eine neue Seite.</p>
                            <button id="welcomeCreateBtn" class="w3-button w3-blue w3-margin-top">
                                <i class="fas fa-plus"></i> Erste Seite erstellen
                            </button>
                        </div>
                    </div>
                    
                    <div id="pageEditorContainer" class="page-editor-container" style="display: none;">
                        <div class="w3-bar w3-teal">
                            <div class="w3-bar-item"><span id="editorPageTitle">Seite bearbeiten</span></div>
                            <button id="closeEditorBtn" class="w3-bar-item w3-button w3-right"><i class="fas fa-times"></i></button>
                        </div>
                        
                        <div class="editor-main w3-row">
                            <div class="w3-col m7 l8">
                                <div class="w3-padding">
                                    <div id="editorForm" class="editor-form">
                                        <!-- Form fields will be inserted here -->
                                        <div class="w3-margin-bottom">
                                            <label><strong>Seiten-ID:</strong></label>
                                            <input type="text" id="pageId" class="w3-input w3-border" readonly />
                                        </div>
                                        
                                        <div class="w3-margin-bottom">
                                            <label><strong>Seitentitel:</strong></label>
                                            <input type="text" id="pageTitle" class="w3-input w3-border" />
                                        </div>
                                        
                                        <div class="w3-margin-bottom">
                                            <label><strong>Template:</strong></label>
                                            <select id="templateSelector" class="w3-select w3-border">
                                                <option value="">-- Template auswählen --</option>
                                                <!-- Templates will be added here -->
                                            </select>
                                        </div>
                                        
                                        <div id="templateFields" class="template-fields">
                                            <!-- Template fields will be inserted here -->
                                        </div>
                                    </div>
                                    
                                    <div class="w3-margin-top w3-padding-16 editor-actions">
                                        <button id="previewPageBtn" class="w3-button w3-amber w3-margin-right">
                                            <i class="fas fa-eye"></i> Vorschau
                                        </button>
                                        <button id="deletePageBtn" class="w3-button w3-red w3-margin-right">
                                            <i class="fas fa-trash"></i> Löschen
                                        </button>
                                        <button id="savePageBtn" class="w3-button w3-green">
                                            <i class="fas fa-save"></i> Speichern
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="w3-col m5 l4">
                                <div class="w3-padding">
                                    <div class="preview-container w3-card w3-padding">
                                        <h4>Live-Vorschau</h4>
                                        <div id="livePreview" class="live-preview w3-white w3-border">
                                            <div class="w3-center w3-padding-32">
                                                <i class="fas fa-image"></i>
                                                <p>Vorschau wird hier angezeigt</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab: Word Cloud -->
        <div id="wordcloud-tab" class="tab-content">
            <h3>Word Cloud bearbeiten</h3>
            <div class="content-card">
                <p>Passen Sie die Wörter in der Word Cloud an. Die Gewichtung (1-9) bestimmt die Größe der Wörter.</p>
                
                <div id="wordCloudContainer" class="word-cloud-admin w3-margin-top">
                    <!-- Word items will be dynamically inserted here -->
                    <div class="w3-center">
                        <i class="fas fa-spinner fa-spin"></i> Word Cloud wird geladen...
                    </div>
                </div>
                
                <button id="addWordBtn" class="w3-button w3-blue w3-margin-top">
                    <i class="fas fa-plus"></i> Neues Wort hinzufügen
                </button>
                
                <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue w3-margin-top">
                    <p><i class="fas fa-info-circle"></i> <strong>Tipp:</strong> Verwenden Sie die Griffe zum Neuanordnen der Wörter. Höhere Gewichtungswerte lassen Wörter größer erscheinen.</p>
                </div>
            </div>
            
            <div class="action-buttons">
                <button id="previewWordCloudBtn" class="w3-button w3-amber w3-margin-right">
                    <i class="fas fa-eye"></i> Vorschau
                </button>
                <button id="saveWordCloudBtn" class="w3-button w3-green">
                    <i class="fas fa-save"></i> Word Cloud speichern
                </button>
                <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
            </div>
        </div>
        
        <!-- Tab: Preview -->
        <div id="preview-tab" class="tab-content">
            <div class="content-card">
                <h3>Website-Vorschau</h3>
                <div class="w3-margin-bottom">
                    <label class="w3-margin-right">
                        <input type="radio" name="previewType" value="draft" checked> 
                        <span class="w3-badge w3-yellow">Entwurf</span>
                    </label>
                    <label>
                        <input type="radio" name="previewType" value="live"> 
                        <span class="w3-badge w3-green">Live-Website</span>
                    </label>
                    <button id="refreshPreviewBtn" class="w3-button w3-blue w3-right">
                        <i class="fas fa-sync-alt"></i> Aktualisieren
                    </button>
                </div>
                <iframe id="previewFrame" class="w3-border" src="preview.html?draft=true" style="width:100%; height:600px;"></iframe>
            </div>
        </div>
        
        <!-- Tab: Global Settings -->
        <div id="settings-tab" class="tab-content">
            <h3>Globale Website-Einstellungen</h3>
            
            <div class="content-card">
                <h4>Farbschema</h4>
                <div class="w3-row">
                    <div class="w3-col m6 w3-padding">
                        <label for="primaryColor">Primärfarbe:</label>
                        <div class="w3-row">
                            <div class="w3-col s3">
                                <input type="color" id="primaryColor" value="<?= DEFAULT_STYLES['colors']['primary'] ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s9 w3-padding-small">
                                <span id="primaryColorValue"><?= DEFAULT_STYLES['colors']['primary'] ?></span>
                            </div>
                        </div>
                    </div>
                    <div class="w3-col m6 w3-padding">
                        <label for="secondaryColor">Sekundärfarbe:</label>
                        <div class="w3-row">
                            <div class="w3-col s3">
                                <input type="color" id="secondaryColor" value="<?= DEFAULT_STYLES['colors']['secondary'] ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s9 w3-padding-small">
                                <span id="secondaryColorValue"><?= DEFAULT_STYLES['colors']['secondary'] ?></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="w3-row w3-margin-top">
                    <div class="w3-col m6 w3-padding">
                        <label for="accentColor">Akzentfarbe:</label>
                        <div class="w3-row">
                            <div class="w3-col s3">
                                <input type="color" id="accentColor" value="<?= DEFAULT_STYLES['colors']['accent'] ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s9 w3-padding-small">
                                <span id="accentColorValue"><?= DEFAULT_STYLES['colors']['accent'] ?></span>
                            </div>
                        </div>
                    </div>
                    <div class="w3-col m6 w3-padding">
                        <label for="textColor">Textfarbe:</label>
                        <div class="w3-row">
                            <div class="w3-col s3">
                                <input type="color" id="textColor" value="<?= DEFAULT_STYLES['colors']['text'] ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s9 w3-padding-small">
                                <span id="textColorValue"><?= DEFAULT_STYLES['colors']['text'] ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="content-card">
                <h4>Typografie</h4>
                <div class="w3-row">
                    <div class="w3-col m6 w3-padding">
                        <label for="fontFamily">Haupt-Schriftart:</label>
                        <select id="fontFamily" class="w3-select w3-border">
                            <option value="'Lato', sans-serif" <?= (DEFAULT_STYLES['typography']['font_family'] === "'Lato', sans-serif") ? 'selected' : '' ?>>Lato (Standard)</option>
                            <option value="'Roboto', sans-serif">Roboto</option>
                            <option value="'Open Sans', sans-serif">Open Sans</option>
                            <option value="'Montserrat', sans-serif">Montserrat</option>
                            <option value="'PT Sans', sans-serif">PT Sans</option>
                        </select>
                    </div>
                    <div class="w3-col m6 w3-padding">
                        <label for="headingFont">Überschriften-Schriftart:</label>
                        <select id="headingFont" class="w3-select w3-border">
                            <option value="'Lato', sans-serif" <?= (DEFAULT_STYLES['typography']['heading_font'] === "'Lato', sans-serif") ? 'selected' : '' ?>>Lato (Standard)</option>
                            <option value="'Roboto', sans-serif">Roboto</option>
                            <option value="'Open Sans', sans-serif">Open Sans</option>
                            <option value="'Montserrat', sans-serif">Montserrat</option>
                            <option value="'PT Sans', sans-serif">PT Sans</option>
                        </select>
                    </div>
                </div>
                
                <div class="w3-row w3-margin-top">
                    <div class="w3-col m6 w3-padding">
                        <label>Basis-Schriftgröße:</label>
                        <div class="w3-row">
                            <div class="w3-col s9">
                                <input type="range" id="baseFontSize" min="14" max="20" step="1" value="<?= intval(DEFAULT_STYLES['typography']['base_font_size']) ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s3 w3-padding-small">
                                <span id="baseFontSizeValue"><?= intval(DEFAULT_STYLES['typography']['base_font_size']) ?></span>px
                            </div>
                        </div>
                    </div>
                    <div class="w3-col m6 w3-padding">
                        <label>Zeilenhöhe:</label>
                        <div class="w3-row">
                            <div class="w3-col s9">
                                <input type="range" id="lineHeight" min="1.2" max="2" step="0.1" value="<?= DEFAULT_STYLES['typography']['line_height'] ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s3 w3-padding-small">
                                <span id="lineHeightValue"><?= DEFAULT_STYLES['typography']['line_height'] ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="content-card">
                <h4>Layout & Stil</h4>
                <div class="w3-row">
                    <div class="w3-col m6 w3-padding">
                        <label for="containerWidth">Inhaltsbreite:</label>
                        <div class="w3-row">
                            <div class="w3-col s9">
                                <input type="range" id="containerWidth" min="800" max="1500" step="50" value="<?= intval(DEFAULT_STYLES['layout']['container_width']) ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s3 w3-padding-small">
                                <span id="containerWidthValue"><?= intval(DEFAULT_STYLES['layout']['container_width']) ?></span>px
                            </div>
                        </div>
                    </div>
                    <div class="w3-col m6 w3-padding">
                        <label for="borderRadius">Eckenradius:</label>
                        <div class="w3-row">
                            <div class="w3-col s9">
                                <input type="range" id="borderRadius" min="0" max="20" step="1" value="<?= intval(DEFAULT_STYLES['layout']['border_radius']) ?>" class="w3-input" />
                            </div>
                            <div class="w3-col s3 w3-padding-small">
                                <span id="borderRadiusValue"><?= intval(DEFAULT_STYLES['layout']['border_radius']) ?></span>px
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="w3-row w3-margin-top">
                    <div class="w3-col m6 w3-padding">
                        <div class="w3-row">
                            <div class="w3-col s8">
                                <label>Button-Stil:</label>
                            </div>
                            <div class="w3-col s4">
                                <select id="buttonStyle" class="w3-select w3-border">
                                    <option value="rounded" selected>Abgerundet</option>
                                    <option value="square">Eckig</option>
                                    <option value="pill">Pill</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="w3-col m6 w3-padding">
                        <div class="w3-row">
                            <div class="w3-col s8">
                                <label>Animationseffekte aktivieren:</label>
                            </div>
                            <div class="w3-col s4">
                                <div class="w3-margin-top">
                                    <input type="checkbox" id="enableAnimations" class="w3-check" checked>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="content-card">
                <h4>Stil-Vorschau</h4>
                <div id="stylePreview" class="w3-white w3-border w3-padding" style="min-height: 300px;">
                    <h1>Dies ist eine Überschrift</h1>
                    <h2>Dies ist eine Unterüberschrift</h2>
                    <p>Dies ist ein Absatz mit Text. Dieser Text zeigt, wie die Typografie-Einstellungen die Lesbarkeit Ihres Inhalts beeinflussen. Es ist wichtig, Schriftarten und -größen zu wählen, die auf verschiedenen Geräten gut lesbar sind.</p>
                    <button class="preview-button">Beispiel-Button</button>
                    <div class="preview-card w3-margin-top w3-padding w3-light-grey">
                        Beispiel für ein Kartenelement
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button id="resetSettingsBtn" class="w3-button w3-red w3-margin-right">
                    <i class="fas fa-undo"></i> Auf Standardwerte zurücksetzen
                </button>
                <button id="previewSettingsBtn" class="w3-button w3-amber w3-margin-right">
                    <i class="fas fa-eye"></i> Vorschau
                </button>
                <button id="saveSettingsBtn" class="w3-button w3-green">
                    <i class="fas fa-save"></i> Einstellungen speichern
                </button>
                <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
            </div>
        </div>
    </div>

    <!-- Create Page Dialog -->
    <div id="createPageDialog" class="w3-modal">
        <div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:600px">
            <header class="w3-container w3-teal">
                <span id="closePageDialogBtn" class="w3-button w3-display-topright">&times;</span>
                <h2>Neue Seite erstellen</h2>
            </header>
            
            <div class="w3-container w3-padding">
                <div class="w3-margin-bottom">
                    <label><strong>Seiten-ID (URL-freundlicher Name):</strong></label>
                    <input type="text" id="newPageId" class="w3-input w3-border" placeholder="z.B. ueber-uns, leistungen, kontakt" />
                    <small class="w3-text-grey">Verwenden Sie nur Kleinbuchstaben, Zahlen und Bindestriche</small>
                </div>
                
                <div class="w3-margin-bottom">
                    <label><strong>Seitentitel:</strong></label>
                    <input type="text" id="newPageTitle" class="w3-input w3-border" placeholder="Seitentitel" />
                </div>
                
                <div class="w3-margin-bottom">
                    <label><strong>Template:</strong></label>
                    <select id="newPageTemplate" class="w3-select w3-border">
                        <option value="">-- Template auswählen --</option>
                        <!-- Templates will be added here -->
                    </select>
                </div>
                
                <div id="templatePreview" class="w3-margin-bottom">
                    <!-- Template preview will be shown here -->
                </div>
            </div>
            
            <footer class="w3-container w3-padding">
                <button id="confirmCreatePageBtn" class="w3-button w3-green w3-right">Erstellen</button>
                <button id="cancelCreatePageBtn" class="w3-button w3-grey w3-right w3-margin-right">Abbrechen</button>
            </footer>
        </div>
    </div>

    <?php
    // Get the captured content
    $content = ob_get_clean();

    // Custom styles for the admin panel
    $custom_styles = '
    <link rel="stylesheet" href="' . ASSETS_URL . '/css/admin.css?v=' . ASSET_VERSION . '">
    <link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
    <link href="' . ASSETS_URL . '/css/quill-custom.css?v=' . ASSET_VERSION . '" rel="stylesheet">
    ';

    // Additional scripts needed for admin
    $admin_scripts = '
    <!-- Firebase Configuration -->
    ' . get_firebase_js_config() . '
    
    <!-- Cloudinary (for image uploads) -->
    <script src="https://upload-widget.cloudinary.com/global/all.js"></script>
    
    <!-- Quill Editor -->
    <script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>
    
    <!-- Sortable.js (for drag and drop) -->
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    
    <!-- Custom Admin Scripts -->
    <script>
        // Make CSRF token available to JS
        window.csrfToken = "' . $csrf_token . '";
    </script>
    <script src="' . ASSETS_URL . '/js/services/firebase.js?v=' . ASSET_VERSION . '"></script>
    <script src="' . ASSETS_URL . '/js/services/upload.js?v=' . ASSET_VERSION . '"></script>
    <script src="' . ASSETS_URL . '/js/admin/editor-module.js?v=' . ASSET_VERSION . '"></script>
    <script src="' . ASSETS_URL . '/js/admin/admin-core.js?v=' . ASSET_VERSION . '"></script>
    <script src="' . ASSETS_URL . '/js/admin/page-manager.js?v=' . ASSET_VERSION . '"></script>
    <script src="' . ASSETS_URL . '/js/admin/word-cloud-manager.js?v=' . ASSET_VERSION . '"></script>
    <script src="' . ASSETS_URL . '/js/admin/settings-manager.js?v=' . ASSET_VERSION . '"></script>
    ';

    // Render the page with the admin layout
    render_template('layouts/admin', [
        'content' => $content,
        'title' => $admin_config['title'],
        'description' => $admin_config['description'],
        'custom_styles' => $custom_styles,
        'body_class' => $admin_config['body_class'],
        'include_firebase_auth' => $admin_config['include_firebase_auth'],
        'include_firebase_storage' => $admin_config['include_firebase_storage'],
        'hide_header' => $admin_config['hide_header'],
        'hide_footer' => $admin_config['hide_footer'],
        'additional_scripts' => $admin_scripts
    ]);

} catch (Exception $e) {
    // Clear any output buffering
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    // Log the error
    error_log('Error in admin.php: ' . $e->getMessage());
    
    // Show error page
    if (APP_DEBUG) {
        // Detailed error in development
        echo '<div style="background-color: #f8d7da; color: #721c24; padding: 20px; margin: 20px; border: 1px solid #f5c6cb; border-radius: 4px;">';
        echo '<h2>Admin Panel Error</h2>';
        echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
        echo '<p>File: ' . htmlspecialchars($e->getFile()) . ' on line ' . $e->getLine() . '</p>';
        echo '<h3>Stack Trace:</h3>';
        echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
        echo '</div>';
    } else {
        // User-friendly error in production
        render_template('error', [
            'title' => 'Admin Panel Error',
            'message' => 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Administrator.',
            'show_home_link' => true
        ]);
    }
}

// Flush the output buffer and send to browser
ob_end_flush();