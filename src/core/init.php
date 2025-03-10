 <?php
// Create new file: src/core/init.php

/**
 * Application initialization
 * This file bootstraps the application and loads required components
 */

// Configuration
require_once __DIR__ . '/config.php';

// Session management
session_start();

// Utility functions
require_once __DIR__ . '/utils/security.php';
require_once __DIR__ . '/utils/formatting.php';

// Page components
require_once __DIR__ . '/components/header.php';
require_once __DIR__ . '/components/footer.php';
require_once __DIR__ . '/components/navigation.php';

// Load version information
require_once __DIR__ . '/../version.php';

/**
 * Render page template with data
 * 
 * @param string $template Template filename
 * @param array $data Data to pass to template
 * @return void
 */
function render_template($template, $data = []) {
    // Make data variables accessible in template
    extract($data);
    
    // Determine template path
    $template_path = __DIR__ . '/../templates/' . $template . '.php';
    
    if (file_exists($template_path)) {
        require $template_path;
    } else {
        throw new Exception("Template not found: $template");
    }
}