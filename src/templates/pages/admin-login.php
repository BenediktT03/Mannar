 <?php
/**
 * Admin Login Page Template
 * 
 * Provides a login interface for admin users to access the admin panel.
 */

// Generate CSRF token for the login form
$csrf_token = generate_csrf_token();

// Set page configuration
$page_title = 'Admin Login | Mannar';
$page_description = 'Administrationsbereich der Mannar-Website';
$body_class = 'admin-login-page';
$hide_navigation = true;
$hide_footer = true;

// Custom head content for login page
$custom_head = '
<style>
    body.admin-login-page {
        background-color: #f5f5f5;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .login-container {
        max-width: 400px;
        width: 90%;
        padding: 30px;
        background-color: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
    }
    
    .login-logo {
        text-align: center;
        margin-bottom: 20px;
    }
    
    .login-logo img {
        max-width: 150px;
        height: auto;
    }
    
    .login-title {
        text-align: center;
        margin-bottom: 30px;
        font-size: 24px;
        color: #2c3e50;
    }
    
    .login-error {
        display: none;
        padding: 10px;
        margin-bottom: 15px;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        color: #721c24;
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
    
    .btn-submit {
        width: 100%;
        padding: 12px;
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
    
    .back-link {
        margin-top: 20px;
        text-align: center;
    }
    
    .back-link a {
        color: #7f8c8d;
        text-decoration: none;
    }
    
    .back-link a:hover {
        text-decoration: underline;
    }
    
    .login-footer {
        margin-top: 30px;
        text-align: center;
        font-size: 12px;
        color: #95a5a6;
    }
</style>
';

// Custom scripts for login functionality
$additional_scripts = '
<script>
document.addEventListener("DOMContentLoaded", function() {
    // Get elements
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const emailField = document.getElementById("emailField");
    const passField = document.getElementById("passField");
    const submitBtn = document.getElementById("submitBtn");
    
    // Handle form submission
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = \'<i class="fas fa-spinner fa-spin"></i> Anmelden...\';
        loginError.style.display = "none";
        
        // Get form data
        const email = emailField.value.trim();
        const password = passField.value;
        const csrfToken = document.getElementById("csrfToken").value;
        
        // Validate form data
        if (!email || !password) {
            loginError.textContent = "Bitte füllen Sie alle Felder aus.";
            loginError.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Anmelden";
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("csrf_token", csrfToken);
        
        // Send login request
        fetch("admin.php?action=login", {
            method: "POST",
            body: formData,
            credentials: "same-origin"
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to admin panel
                window.location.href = "admin.php";
            } else {
                // Show error message
                loginError.textContent = data.error || "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.";
                loginError.style.display = "block";
                
                // Reset form
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Anmelden";
                passField.value = "";
                passField.focus();
            }
        })
        .catch(error => {
            // Show error message
            loginError.textContent = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
            loginError.style.display = "block";
            
            // Reset form
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Anmelden";
            console.error("Login error:", error);
        });
    });
});
</script>
';
?>

<div class="login-container w3-animate-opacity">
    <div class="login-logo">
        <img src="<?= ASSET_PATH ?>/img/logo-dark.png" alt="Mannar Logo">
    </div>
    
    <h1 class="login-title">Admin-Bereich</h1>
    
    <div id="loginError" class="login-error" role="alert"></div>
    
    <form id="loginForm" method="post">
        <div class="form-group">
            <label for="emailField">E-Mail-Adresse</label>
            <input type="email" id="emailField" class="form-control" placeholder="name@beispiel.de" required autofocus>
        </div>
        
        <div class="form-group">
            <label for="passField">Passwort</label>
            <input type="password" id="passField" class="form-control" placeholder="••••••••" required>
        </div>
        
        <input type="hidden" id="csrfToken" name="csrf_token" value="<?= $csrf_token ?>">
        
        <button type="submit" id="submitBtn" class="btn-submit">Anmelden</button>
    </form>
    
    <div class="back-link">
        <a href="index.php"><i class="fas fa-arrow-left"></i> Zurück zur Website</a>
    </div>
    
    <div class="login-footer">
        &copy; <?= date('Y') ?> Mannar. Alle Rechte vorbehalten.
    </div>
</div>