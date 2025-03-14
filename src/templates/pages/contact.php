 <?php
/**
 * Contact Page Template
 * 
 * Standalone contact page with form and contact information.
 */

// Generate CSRF token for the contact form
$csrf_token = generate_csrf_token();

// Page configuration
$page_title = 'Kontakt | Mannar';
$page_description = 'Kontaktieren Sie uns für mehr Informationen über unsere Angebote.';
$body_class = 'contact-page';
$current_page = 'contact';

// Check if contact form is enabled
$contact_form_enabled = defined('FEATURES') && isset(FEATURES['enable_contact_form']) && FEATURES['enable_contact_form'];

// Get contact information from global settings if available
$contentService = ContentService::getInstance();
$settings = $contentService->getGlobalSettings();

$contact_email = $settings['contact_email'] ?? (defined('EMAIL_CONFIG') && isset(EMAIL_CONFIG['contact_email']) ? EMAIL_CONFIG['contact_email'] : 'kontakt@beispiel.de');
$contact_phone = $settings['contact_phone'] ?? '+49 30 123456';
$contact_address = $settings['contact_address'] ?? 'Berlin, Deutschland';

// Additional styles for the contact page
$custom_styles = '
<style>
    .contact-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
    }
    
    .contact-header {
        text-align: center;
        margin-bottom: 40px;
    }
    
    .contact-title {
        font-size: 36px;
        color: #2c3e50;
        margin-bottom: 10px;
    }
    
    .contact-subtitle {
        font-size: 18px;
        color: #7f8c8d;
        max-width: 600px;
        margin: 0 auto;
    }
    
    .contact-info {
        margin-bottom: 30px;
    }
    
    .contact-info-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .contact-info-icon {
        width: 40px;
        height: 40px;
        background-color: #3498db;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        flex-shrink: 0;
    }
    
    .contact-info-text {
        font-size: 16px;
    }
    
    .contact-map {
        width: 100%;
        height: 300px;
        background-color: #f5f5f5;
        margin-bottom: 30px;
        border-radius: 5px;
        overflow: hidden;
    }
    
    .contact-form {
        background-color: white;
        padding: 30px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #34495e;
    }
    
    .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    .form-message {
        display: none;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 4px;
    }
    
    .form-message.success {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }
    
    .form-message.error {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    
    .btn-submit {
        padding: 12px 25px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .btn-submit:hover {
        background-color: #2980b9;
    }
    
    .disabled-form-message {
        text-align: center;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 5px;
        border: 1px solid #e9ecef;
    }
    
    @media (max-width: 768px) {
        .contact-title {
            font-size: 28px;
        }
        
        .contact-map {
            height: 200px;
        }
    }
</style>
';

// Additional scripts for the contact form
$additional_scripts = '
<script>
document.addEventListener("DOMContentLoaded", function() {
    // Initialize map if available
    initializeMap();
    
    // Contact form handling
    const contactForm = document.getElementById("contactForm");
    
    if (contactForm) {
        const formMessage = document.getElementById("formMessage");
        const submitBtn = document.getElementById("submitBtn");
        
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = \'<i class="fas fa-spinner fa-spin"></i> Senden...\';
            formMessage.style.display = "none";
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Send form data
            fetch("api/contact.php", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            })
            .then(response => response.json())
            .then(data => {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = \'<i class="fas fa-paper-plane"></i> Nachricht senden\';
                
                // Handle response
                if (data.success) {
                    // Show success message
                    formMessage.className = "form-message success";
                    formMessage.textContent = data.message || "Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei Ihnen melden.";
                    formMessage.style.display = "block";
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error message
                    formMessage.className = "form-message error";
                    formMessage.textContent = data.error || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
                    formMessage.style.display = "block";
                }
                
                // Scroll to message
                formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
            })
            .catch(error => {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = \'<i class="fas fa-paper-plane"></i> Nachricht senden\';
                
                // Show error message
                formMessage.className = "form-message error";
                formMessage.textContent = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
                formMessage.style.display = "block";
                
                console.error("Contact form error:", error);
            });
        });
    }
});

// Initialize map (placeholder for actual map implementation)
function initializeMap() {
    // This function would be replaced with actual map implementation
    // like Google Maps, Leaflet, or OpenStreetMap
    console.log("Map initialization would happen here");
    
    // Example placeholder implementation
    const mapElement = document.getElementById("contactMap");
    if (mapElement) {
        // Create map placeholder content
        const mapPlaceholder = document.createElement("div");
        mapPlaceholder.style.width = "100%";
        mapPlaceholder.style.height = "100%";
        mapPlaceholder.style.display = "flex";
        mapPlaceholder.style.alignItems = "center";
        mapPlaceholder.style.justifyContent = "center";
        mapPlaceholder.style.backgroundColor = "#e9ecef";
        mapPlaceholder.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-map-marker-alt" style="font-size: 32px; color: #3498db;"></i>
                <p>Kartenansicht</p>
            </div>
        `;
        
        mapElement.appendChild(mapPlaceholder);
    }
}
</script>
';
?>

<div class="contact-container">
    <div class="contact-header">
        <h1 class="contact-title">Kontaktieren Sie uns</h1>
        <p class="contact-subtitle">Wir freuen uns, von Ihnen zu hören. Senden Sie uns eine Nachricht und wir melden uns so schnell wie möglich bei Ihnen.</p>
    </div>
    
    <div class="w3-row-padding">
        <div class="w3-col m5">
            <div class="contact-info">
                <h2>Kontaktinformationen</h2>
                
                <div class="contact-info-item">
                    <div class="contact-info-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="contact-info-text">
                        <?= htmlspecialchars($contact_address) ?>
                    </div>
                </div>
                
                <div class="contact-info-item">
                    <div class="contact-info-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="contact-info-text">
                        <a href="mailto:<?= htmlspecialchars($contact_email) ?>"><?= htmlspecialchars($contact_email) ?></a>
                    </div>
                </div>
                
                <div class="contact-info-item">
                    <div class="contact-info-icon">
                        <i class="fas fa-phone"></i>
                    </div>
                    <div class="contact-info-text">
                        <a href="tel:<?= preg_replace('/[^0-9+]/', '', $contact_phone) ?>"><?= htmlspecialchars($contact_phone) ?></a>
                    </div>
                </div>
            </div>
            
            <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue">
                <p><i class="fas fa-info-circle"></i> In der Regel antworten wir innerhalb von 24 Stunden auf Ihre Anfrage.</p>
            </div>
            
            <div class="contact-map" id="contactMap">
                <!-- Map will be inserted here by JavaScript -->
            </div>
        </div>
        
        <div class="w3-col m7">
            <?php if ($contact_form_enabled): ?>
                <div id="formMessage" class="form-message" role="alert"></div>
                
                <form id="contactForm" class="contact-form" method="post">
                    <div class="w3-row-padding">
                        <div class="w3-col m6">
                            <div class="form-group">
                                <label for="name">Name *</label>
                                <input type="text" id="name" name="name" class="form-control" required>
                            </div>
                        </div>
                        
                        <div class="w3-col m6">
                            <div class="form-group">
                                <label for="email">E-Mail-Adresse *</label>
                                <input type="email" id="email" name="email" class="form-control" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="subject">Betreff</label>
                        <input type="text" id="subject" name="subject" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Nachricht *</label>
                        <textarea id="message" name="message" class="form-control" rows="6" required></textarea>
                    </div>
                    
                    <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
                    
                    <button type="submit" id="submitBtn" class="btn-submit">
                        <i class="fas fa-paper-plane"></i> Nachricht senden
                    </button>
                </form>
            <?php else: ?>
                <div class="disabled-form-message">
                    <i class="fas fa-envelope-open-text" style="font-size: 48px; color: #6c757d; margin-bottom: 15px;"></i>
                    <h3>Kontaktformular deaktiviert</h3>
                    <p>Das Kontaktformular ist derzeit deaktiviert. Bitte kontaktieren Sie uns direkt per E-Mail oder Telefon.</p>
                    <div class="w3-margin-top">
                        <a href="mailto:<?= htmlspecialchars($contact_email) ?>" class="w3-button w3-blue">
                            <i class="fas fa-envelope"></i> E-Mail senden
                        </a>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>