<?php
/**
 * Unauthorized Access Page Template
 * 
 * Displayed when a user attempts to access restricted content without proper authorization.
 */

// Set page configuration
$page_title = 'Zugriff verweigert | Mannar';
$page_description = 'Sie haben keine Berechtigung, auf diese Ressource zuzugreifen.';
$body_class = 'error-page unauthorized';

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
        <i class="fas fa-lock"></i>
    </div>
    
    <h1 class="error-title">Zugriff verweigert</h1>
    
    <div class="error-message">
        <p>Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.</p>
        <p>Bitte stellen Sie sicher, dass Sie angemeldet sind und über die notwendigen Berechtigungen verfügen.</p>
    </div>
    
    <div class="error-actions">
        <a href="index.php" class="w3-button w3-blue">
            <i class="fas fa-home"></i> Zur Startseite
        </a>
        
        <a href="admin.php" class="w3-button w3-green">
            <i class="fas fa-sign-in-alt"></i> Erneut anmelden
        </a>
    </div>
    
    <div class="w3-panel w3-pale-yellow w3-leftbar w3-border-yellow w3-margin-top">
        <p>Wenn Sie der Meinung sind, dass Sie Zugriff haben sollten, wenden Sie sich bitte an den Administrator.</p>
    </div>
</div> 