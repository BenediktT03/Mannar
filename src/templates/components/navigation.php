<?php
/**
 * Navigation Component
 * 
 * Provides a responsive navigation menu for the Mannar website with 
 * accessibility features and mobile support.
 * 
 * Variables:
 * - $current_page: String identifying the current page for active highlighting
 * - $enable_dynamic_nav: Whether to load additional menu items dynamically
 * - $custom_menu_items: Array of additional menu items [url, text, icon, target]
 * - $hide_mobile_menu: Whether to hide the mobile menu button
 * - $nav_classes: Additional CSS classes for the navigation bar
 * - $fixed_position: Whether the navigation should be fixed at the top
 */

// Set defaults if not provided
$current_page = $current_page ?? '';
$enable_dynamic_nav = $enable_dynamic_nav ?? false;
$custom_menu_items = $custom_menu_items ?? [];
$hide_mobile_menu = $hide_mobile_menu ?? false;
$nav_classes = $nav_classes ?? '';
$fixed_position = $fixed_position ?? true;

// Determine positioning class
$position_class = $fixed_position ? 'w3-top' : '';

// Menu items definition
$menu_items = [
    'home' => [
        'url' => 'index.php',
        'text' => 'HOME',
        'icon' => null,
        'hide_on_mobile' => false
    ],
    'about' => [
        'url' => 'index.php#about',
        'text' => 'ABOUT',
        'icon' => 'fas fa-user',
        'hide_on_mobile' => true
    ],
    'portfolio' => [
        'url' => 'index.php#portfolio',
        'text' => 'PORTFOLIO',
        'icon' => 'fas fa-th',
        'hide_on_mobile' => true
    ],
    'contact' => [
        'url' => 'index.php#contact',
        'text' => 'KONTAKT',
        'icon' => 'fas fa-envelope',
        'hide_on_mobile' => true
    ]
];

// Add custom menu items
if (!empty($custom_menu_items)) {
    foreach ($custom_menu_items as $key => $item) {
        $menu_items[$key] = $item;
    }
}
?>

<!-- Navigation Bar -->
<div class="<?= $position_class ?> navigation-container">
    <div class="w3-bar <?= $nav_classes ?>" id="myNavbar" role="navigation" aria-label="Hauptnavigation">
        <!-- Desktop menu items -->
        <?php foreach ($menu_items as $id => $item): ?>
            <?php 
                $is_current = ($current_page === $id);
                $hide_class = $item['hide_on_mobile'] ? 'w3-hide-small' : '';
                $active_class = $is_current ? 'w3-text-blue active-nav-item' : '';
                $target = isset($item['target']) ? "target=\"{$item['target']}\"" : '';
            ?>
            <a href="<?= $item['url'] ?>" 
               class="w3-bar-item w3-button <?= $hide_class ?> <?= $active_class ?>"
               <?php if ($is_current): ?>aria-current="page"<?php endif; ?>
               <?= $target ?>>
                <?php if ($item['icon']): ?>
                    <i class="<?= $item['icon'] ?>" aria-hidden="true"></i> 
                <?php endif; ?>
                <?= $item['text'] ?>
            </a>
        <?php endforeach; ?>
        
        <?php if ($enable_dynamic_nav): ?>
            <!-- Dynamic navigation items will be inserted here by JavaScript -->
            <div id="dynamicNav" class="w3-hide-small"></div>
        <?php endif; ?>
        
        <?php if (!$hide_mobile_menu): ?>
            <!-- Mobile menu toggle button -->
            <button class="w3-bar-item w3-button w3-right w3-hide-medium w3-hide-large"
                    onclick="toggleFunction()"
                    aria-expanded="false"
                    aria-controls="navDemo"
                    aria-label="Menü öffnen/schließen">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
        <?php endif; ?>
    </div>

    <?php if (!$hide_mobile_menu): ?>
        <!-- Mobile menu (hidden by default) -->
        <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium" 
             role="menu" aria-labelledby="menuButton">
            <?php foreach ($menu_items as $id => $item): ?>
                <?php if (!isset($item['hide_on_mobile']) || !$item['hide_on_mobile']): ?>
                    <a href="<?= $item['url'] ?>" 
                       class="w3-bar-item w3-button" 
                       onclick="toggleFunction()" 
                       role="menuitem"
                       <?= isset($item['target']) ? "target=\"{$item['target']}\"" : '' ?>>
                        <?= $item['text'] ?>
                    </a>
                <?php endif; ?>
            <?php endforeach; ?>
            
            <?php if ($enable_dynamic_nav): ?>
                <!-- Dynamic mobile navigation items will be inserted here by JavaScript -->
                <div id="dynamicNavMobile" role="menu"></div>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>

<!-- JavaScript for mobile navigation toggle -->
<script>
// Global toggle function for mobile navigation
window.toggleFunction = function() {
    const navDemo = document.getElementById('navDemo');
    if (!navDemo) return;
    
    navDemo.classList.toggle('w3-show');
    
    // Update ARIA attributes
    const toggleBtn = document.querySelector('[aria-controls="navDemo"]');
    if (toggleBtn) {
        const isExpanded = navDemo.classList.contains('w3-show');
        toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
};

// Initialize dynamic navigation if enabled
document.addEventListener('DOMContentLoaded', function() {
    <?php if ($enable_dynamic_nav): ?>
    if (typeof window.loadDynamicNavigation === 'function') {
        window.loadDynamicNavigation();
    }
    <?php endif; ?>
    
    // Navbar scroll behavior
    const navbar = document.getElementById('myNavbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
                navbar.classList.add('visible');
            } else {
                navbar.classList.remove('scrolled');
                if (window.scrollY <= 10) {
                    navbar.classList.remove('visible');
                }
            }
        });
        
        // Initial check for scroll position
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            navbar.classList.add('visible');
        }
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const navDemo = document.getElementById('navDemo');
        if (navDemo && 
            navDemo.classList.contains('w3-show') && 
            !event.target.closest('#navDemo') && 
            !event.target.closest('[aria-controls="navDemo"]')) {
            toggleFunction();
        }
    });
});
</script>