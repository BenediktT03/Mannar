 <?php
/**
 * 404 Error Page Template
 * 
 * Displays a friendly error page when content is not found.
 * 
 * Variables:
 * - $page: The page that was requested but not found
 */

// Set page configuration
$page_title = 'Seite nicht gefunden | Mannar';
$page_description = 'Die angeforderte Seite konnte nicht gefunden werden.';
$body_class = 'error-page not-found';

// Additional styles for the error page
$custom_styles = '
<style>
    .error-container {
        text-align: center;
        padding: 50px 20px;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .error-icon {
        font-size: 80px;
        color: #e74c3c;
        margin-bottom: 20px;
    }
    
    .error-title {
        font-size: 36px;
        margin-bottom: 15px;
        color: #2c3e50;
    }
    
    .error-message {
        font-size: 18px;
        color: #7f8c8d;
        margin-bottom: 30px;
    }
    
    .error-actions {
        margin-top: 30px;
    }
    
    .error-actions .w3-button {
        margin: 10px;
    }
    
    @media (max-width: 600px) {
        .error-title {
            font-size: 28px;
        }
        
        .error-icon {
            font-size: 60px;
        }
    }
</style>
';
?>

<!-- Error Content -->
<div class="error-container w3-animate-opacity">
    <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
    </div>
    
    <h1 class="error-title">Seite nicht gefunden</h1>
    
    <div class="error-message">
        <p>Die von Ihnen gesuchte Seite <strong>"<?= htmlspecialchars($page ?? 'unknown') ?>"</strong> existiert leider nicht oder wurde möglicherweise verschoben.</p>
    </div>
    
    <div class="error-actions">
        <a href="index.php" class="w3-button w3-blue">
            <i class="fas fa-home"></i> Zur Startseite
        </a>
        
        <a href="index.php#contact" class="w3-button w3-green">
            <i class="fas fa-envelope"></i> Kontakt aufnehmen
        </a>
    </div>
    
    <div class="w3-panel w3-pale-yellow w3-leftbar w3-border-yellow w3-margin-top">
        <p>Wenn Sie der Meinung sind, dass dies ein Fehler ist, kontaktieren Sie bitte den Administrator.</p>
    </div>
</div>