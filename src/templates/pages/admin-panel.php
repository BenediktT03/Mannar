<?php
/**
 * Admin Panel Template
 * 
 * Main template for the admin interface that allows content management.
 * Uses the admin layout and provides tab-specific content sections.
 */

// Include initialization
require_once 'core/init.php';

// Generate CSRF token for forms
$csrf_token = generate_csrf_token();

// Page configuration
$page_config = [
    'title' => 'Admin Panel | Mannar',
    'description' => 'Verwaltungsbereich für die Mannar-Website',
    'body_class' => 'admin-page',
    'include_firebase_auth' => true,
    'include_firebase_storage' => true,
    'hide_header' => true,
    'hide_footer' => true,
    'hide_navigation' => true
];

// Start output buffering to capture template content
ob_start();
?>

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
    <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
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
                        <input type="color" id="primaryColor" value="#3498db" class="w3-input" />
                    </div>
                    <div class="w3-col s9 w3-padding-small">
                        <span id="primaryColorValue">#3498db</span>
                    </div>
                </div>
            </div>
            <div class="w3-col m6 w3-padding">
                <label for="secondaryColor">Sekundärfarbe:</label>
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
                <label for="accentColor">Akzentfarbe:</label>
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
                <label for="textColor">Textfarbe:</label>
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
    </div>
    
    <div class="content-card">
        <h4>Typografie</h4>
        <div class="w3-row">
            <div class="w3-col m6 w3-padding">
                <label for="fontFamily">Haupt-Schriftart:</label>
                <select id="fontFamily" class="w3-select w3-border">
                    <option value="'Lato', sans-serif" selected>Lato (Standard)</option>
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'PT Sans', sans-serif">PT Sans</option>
                </select>
            </div>
            <div class="w3-col m6 w3-padding">
                <label for="headingFont">Überschriften-Schriftart:</label>
                <select id="headingFont" class="w3-select w3-border">
                    <option value="'Lato', sans-serif" selected>Lato (Standard)</option>
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
                        <input type="range" id="baseFontSize" min="14" max="20" step="1" value="16" class="w3-input" />
                    </div>
                    <div class="w3-col s3 w3-padding-small">
                        <span id="baseFontSizeValue">16</span>px
                    </div>
                </div>
            </div>
            <div class="w3-col m6 w3-padding">
                <label>Zeilenhöhe:</label>
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
        <h4>Layout & Stil</h4>
        <div class="w3-row">
            <div class="w3-col m6 w3-padding">
                <label for="containerWidth">Inhaltsbreite:</label>
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
                <label for="borderRadius">Eckenradius:</label>
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
// Get buffered content
$content = ob_get_clean();

// Additional scripts for admin functionality
$admin_scripts = '
<script>
    // Ensure all modules are properly initialized
    document.addEventListener("DOMContentLoaded", function() {
        // Initialize editors after DOM is fully loaded
        if (typeof EditorModule !== "undefined") {
            setTimeout(function() {
                EditorModule.convertAll(".rich-editor");
            }, 300);
        }

        // Initialize PageEditor
        if (typeof PageEditor !== "undefined" && typeof PageEditor.init === "function") {
            setTimeout(function() {
                PageEditor.init();
            }, 300);
        }

        // Initialize WordCloud manager
        if (typeof WordCloudManager !== "undefined" && typeof WordCloudManager.init === "function") {
            setTimeout(function() {
                WordCloudManager.init();
            }, 300);
        }

        // Initialize Settings manager
        if (typeof SettingsManager !== "undefined" && typeof SettingsManager.init === "function") {
            setTimeout(function() {
                SettingsManager.init();
            }, 300);
        }
    });
</script>
';

// Render with admin layout
render_template('layouts/admin', [
    'content' => $content,
    'page_title' => $page_config['title'],
    'active_tab' => 'pages',
    'admin_scripts' => $admin_scripts,
    'include_editor' => true,
    'include_sortable' => true,
    'include_cloudinary' => true
]);
?>