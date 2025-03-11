<?php
/**
 * Navigation Component Template
 * Responsive navigation bar with accessibility improvements
 * 
 * Variables:
 * - $current_page: Current page identifier (for active state)
 * - $enable_dynamic_nav: Enable dynamic page navigation
 */

// Set defaults if not provided
$current_page = $current_page ?? '';
$enable_dynamic_nav = $enable_dynamic_nav ?? false;
?>
<div class="w3-top">
    <div class="w3-bar" id="myNavbar" role="navigation" aria-label="Hauptnavigation">
        <!-- Mobile menu toggle button -->
        <button class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right" 
                onclick="toggleFunction()" 
                aria-label="Menü öffnen/schließen" 
                aria-expanded="false"
                aria-controls="navDemo">
            <i class="fas fa-bars" aria-hidden="true"></i>
        </button>
        
        <!-- Main navigation items -->
        <a href="index.php" class="w3-bar-item w3-button<?= $current_page === 'home' ? ' w3-text-blue' : '' ?>">HOME</a>
        <a href="index.php#about" class="w3-bar-item w3-button w3-hide-small<?= $current_page === 'about' ? ' w3-text-blue' : '' ?>">
            <i class="fas fa-user" aria-hidden="true"></i> ABOUT
        </a>
        <a href="index.php#portfolio" class="w3-bar-item w3-button w3-hide-small<?= $current_page === 'portfolio' ? ' w3-text-blue' : '' ?>">
            <i class="fas fa-th" aria-hidden="true"></i> PORTFOLIO
        </a>
        <a href="index.php#contact" class="w3-bar-item w3-button w3-hide-small<?= $current_page === 'contact' ? ' w3-text-blue' : '' ?>">
            <i class="fas fa-envelope" aria-hidden="true"></i> KONTAKT
        </a>
        
        <?php if ($enable_dynamic_nav): ?>
            <!-- Dynamic navigation populated by JavaScript -->
            <div id="dynamicNav"></div>
        <?php endif; ?>
    </div>

    <!-- Mobile menu -->
    <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium" 
         role="menu" aria-labelledby="menuButton">
        <a href="index.php#about" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">ABOUT</a>
        <a href="index.php#portfolio" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">PORTFOLIO</a>
        <a href="index.php#contact" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">KONTAKT</a>
        
        <?php if ($enable_dynamic_nav): ?>
            <!-- Dynamic mobile navigation populated by JavaScript -->
            <div id="dynamicNavMobile" role="menu"></div>
        <?php endif; ?>
    </div>
</div>