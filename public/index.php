<?php
/**
 * Main Entry Point
 * 
 * This is the main entry point for the Mannar website.
 * It bootstraps the application and handles routing to the appropriate page.
 */

// Load the bootstrap file
require_once __DIR__ . '/../bootstrap.php';

// Include core initialization
require_once SRC_PATH . '/core/init.php';

// Default page is home
$page = 'home';

// Check if a page is specified in the URL
if (isset($_GET['page'])) {
    $page = htmlspecialchars($_GET['page']);
}

// Choose the appropriate template based on the page
switch ($page) {
    case 'home':
        // Render the home page
        render_template('pages/home');
        break;
        
    case 'page':
        // Check if a page ID is provided
        if (isset($_GET['id'])) {
            // Render the dynamic page
            render_template('pages/page');
        } else {
            // Redirect to home if no ID is provided
            header('Location: index.php');
            exit;
        }
        break;
        
    case 'preview':
        // Render the preview page
        render_template('pages/preview');
        break;
        
    case 'contact':
        // Render the contact page
        render_template('pages/contact');
        break;
        
    default:
        // Check if page exists in Firestore
        $contentService = new ContentService();
        if ($contentService->pageExists($page)) {
            $_GET['id'] = $page;
            render_template('pages/page');
        } else {
            // Page not found, show 404
            http_response_code(404);
            render_template('pages/404', ['page' => $page]);
        }
        break;
}