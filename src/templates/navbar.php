 <!-- Navbar -->
<div class="w3-top">
  <div class="w3-bar" id="myNavbar">
    <a class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right" href="javascript:void(0);" onclick="toggleFunction()" title="Navigation Menu">
      <i class="fas fa-bars"></i>
    </a>
    <a href="index.php" class="w3-bar-item w3-button">HOME</a>
    <a href="index.php#about" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-user"></i> ABOUT</a>
    <a href="index.php#portfolio" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-th"></i> PORTFOLIO</a>
    <a href="index.php#contact" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-envelope"></i> KONTAKT</a>
    <?php if (isset($include_dynamic_nav) && $include_dynamic_nav): ?>
    <!-- Dynamische Seiten-Navigation -->
    <div id="dynamicNav"></div>
    <?php endif; ?>
  </div>

  <!-- Navbar für kleine Bildschirme -->
  <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium">
    <a href="index.php#about" class="w3-bar-item w3-button" onclick="toggleFunction()">ABOUT</a>
    <a href="index.php#portfolio" class="w3-bar-item w3-button" onclick="toggleFunction()">PORTFOLIO</a>
    <a href="index.php#contact" class="w3-bar-item w3-button" onclick="toggleFunction()">KONTAKT</a>
    <?php if (isset($include_dynamic_nav) && $include_dynamic_nav): ?>
    <!-- Dynamische Seiten-Navigation -->
    <div id="dynamicNavMobile"></div>
    <?php endif; ?>
  </div>
</div>