<?php
/**
 * Base Layout
 * 
 * Master template for all public-facing pages on the Mannar website.
 * Provides the common HTML structure, metadata, and component inclusion.
 *
 * Variables:
 * - $content: Main content to be rendered in the page
 * - $page_title: Page title (browser tab)
 * - $page_description: Meta description for SEO
 * - $page_keywords: Meta keywords for SEO (optional)
 * - $body_class: Additional CSS classes for body tag
 * - $include_template_css: Whether to include template-specific CSS
 * - $include_firebase_auth: Whether to include Firebase Auth SDK
 * - $include_firebase_storage: Whether to include Firebase Storage SDK
 * - $custom_styles: Additional CSS to include
 * - $custom_head: Additional content for head section
 * - $head_scripts: Scripts to include in head (before body)
 * - $footer_scripts: Scripts to include at end of body
 * - $additional_scripts: Legacy support for additional scripts
 * - $hide_header: Whether to hide the header
 * - $hide_footer: Whether to hide the footer
 * - $hide_navigation: Whether to hide the navigation
 * - $current_page: Current page identifier for navigation
 * - $custom_nav_items: Custom navigation items
 * - $include_dynamic_nav: Whether to include dynamic navigation loading
 * - $open_graph: Open Graph data for social sharing
 * - $hide_go_top: Whether to hide the "go to top" button
 */

// Set defaults if not provided
$page_title = $page_title ?? 'Mannar - Peer und Genesungsbegleiter';
$page_description = $page_description ?? 'Mannar bietet Begleitung und Unterstützung auf dem Weg zu psychischer Gesundheit und persönlichem Wachstum.';
$page_keywords = $page_keywords ?? 'Peer, Genesungsbegleiter, psychische Gesundheit, Achtsamkeit, Selbstreflexion';
$body_class = $body_class ?? '';
$include_template_css = $include_template_css ?? false;
$include_firebase_auth = $include_firebase_auth ?? false;
$include_firebase_storage = $include_firebase_storage ?? false;
$hide_header = $hide_header ?? false;
$hide_footer = $hide_footer ?? false;
$hide_navigation = $hide_navigation ?? false;
$current_page = $current_page ?? '';
$include_dynamic_nav = $include_dynamic_nav ?? false;
$hide_go_top = $hide_go_top ?? false;

// Asset version for cache busting
$asset_version = defined('ASSET_VERSION') ? ASSET_VERSION : '1.0.0';

// Create header data array
$header_data = [
    'page_title' => $page_title,
    'page_description' => $page_description,
    'page_keywords' => $page_keywords,
    'body_class' => $body_class,
    'include_firebase_auth' => $include_firebase_auth,
    'include_firebase_storage' => $include_firebase_storage,
    'custom_styles' => $custom_styles ?? null,
    'custom_head' => $custom_head ?? null,
    'head_scripts' => $head_scripts ?? null,
    'open_graph' => $open_graph ?? null
];

// Create navigation data array
$navigation_data = [
    'current_page' => $current_page,
    'enable_dynamic_nav' => $include_dynamic_nav,
    'custom_menu_items' => $custom_nav_items ?? [],
    'hide_mobile_menu' => false,
    'nav_classes' => ''
];

// Create footer data array
$footer_data = [
    'additional_scripts' => isset($additional_scripts) ? $additional_scripts : (isset($footer_scripts) ? $footer_scripts : null),
    'hide_go_top' => $hide_go_top,
    'hide_social' => false,
    'footer_classes' => '',
    'include_admin_link' => true
];

// Include template-specific CSS if enabled
if ($include_template_css && !empty($current_page)) {
    $template_css = "<link rel=\"stylesheet\" href=\"./assets/css/pages/{$current_page}.css?v={$asset_version}\">";
    $header_data['custom_styles'] = isset($header_data['custom_styles']) 
        ? $header_data['custom_styles'] . $template_css 
        : $template_css;
}

// Include header component
if (!$hide_header) {
    include_once __DIR__ . '/../components/header.php';
}

// Include navigation component
if (!$hide_navigation) {
    include_once __DIR__ . '/../components/navigation.php';
}
?>

<!-- Main Content Area -->
<main id="main-content" class="main-content">
    <?= $content ?? '' ?>
</main>

<?php
// Include footer component
if (!$hide_footer) {
    include_once __DIR__ . '/../components/footer.php';
}
?>