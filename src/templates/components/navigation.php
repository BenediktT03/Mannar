 <?php
// Create new file: src/templates/components/navigation.php

/**
 * Main navigation component
 */
?>
<div class="w3-top">
  <div class="w3-bar" id="myNavbar" role="navigation" aria-label="Hauptnavigation">
    <button class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right" 
            onclick="toggleFunction()" 
            aria-label="Menü öffnen/schließen" 
            aria-expanded="false"
            aria-controls="navDemo">
      <i class="fas fa-bars" aria-hidden="true"></i>
    </button>
    
    <!-- Navigation items with improved ARIA attributes -->
    <a href="index.php" class="w3-bar-item w3-button">HOME</a>
    <a href="index.php#about" class="w3-bar-item w3-button w3-hide-small">
      <i class="fas fa-user" aria-hidden="true"></i> ABOUT
    </a>
    <a href="index.php#portfolio" class="w3-bar-item w3-button w3-hide-small">
      <i class="fas fa-th" aria-hidden="true"></i> PORTFOLIO
    </a>
    <a href="index.php#contact" class="w3-bar-item w3-button w3-hide-small">
      <i class="fas fa-envelope" aria-hidden="true"></i> KONTAKT
    </a>
    
    <?php if (isset($dynamic_nav) && $dynamic_nav): ?>
      <div id="dynamicNav"></div>
    <?php endif; ?>
  </div>

  <!-- Mobile menu with improved ARIA attributes -->
  <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium" 
       role="menu" aria-labelledby="menuButton">
    <a href="index.php#about" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">ABOUT</a>
    <a href="index.php#portfolio" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">PORTFOLIO</a>
    <a href="index.php#contact" class="w3-bar-item w3-button" onclick="toggleFunction()" role="menuitem">KONTAKT</a>
    
    <?php if (isset($dynamic_nav) && $dynamic_nav): ?>
      <div id="dynamicNavMobile" role="menu"></div>
    <?php endif; ?>
  </div>
</div>