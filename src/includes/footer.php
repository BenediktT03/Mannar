 </main>
  <!-- Main Content End -->

  <!-- Go to top button -->
  <div class="go-top" id="goTopBtn" role="button" aria-label="Go to top">
    <i class="fas fa-arrow-up"></i>
  </div>

  <!-- Footer -->
  <footer class="w3-center w3-black w3-padding-64 w3-opacity w3-hover-opacity-off">
    <a href="#home" class="w3-button w3-light-grey"><i class="fas fa-arrow-up w3-margin-right"></i>Nach oben</a>
    <div class="w3-xlarge w3-section social-icons">
      <i class="fab fa-facebook w3-hover-opacity" aria-label="Facebook"></i>
      <i class="fab fa-instagram w3-hover-opacity" aria-label="Instagram"></i>
      <i class="fab fa-snapchat w3-hover-opacity" aria-label="Snapchat"></i>
      <i class="fab fa-pinterest w3-hover-opacity" aria-label="Pinterest"></i>
      <i class="fab fa-twitter w3-hover-opacity" aria-label="Twitter"></i>
      <i class="fab fa-linkedin w3-hover-opacity" aria-label="LinkedIn"></i>
    </div>
    <p>&copy; <?php echo date('Y'); ?> Mannar | Peer und Genesungsbegleiter <span class="admin-link">| <a href="admin-panel.php" style="opacity: 0.3; font-size: 0.8em; text-decoration: none;">Admin</a></span></p>
  </footer>

  <!-- Firebase Initialization -->
  <script>
    // Centralized Firebase configuration
    const FIREBASE_CONFIG = {
      apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
      authDomain: "mannar-129a5.firebaseapp.com",
      projectId: "mannar-129a5",
      storageBucket: "mannar-129a5.firebasestorage.app",
      messagingSenderId: "687710492532",
      appId: "1:687710492532:web:c7b675da541271f8d83e21",
      measurementId: "G-NXBLYJ5CXL"
    };

    // Initialize Firebase safely
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
    } else {
      console.error("Firebase SDK not loaded. Please check your connection and try again.");
    }
  </script>
  
  <?php 
  // Get current page for script loading
  $current_page = basename($_SERVER['PHP_SELF'], '.php');
  
  if ($current_page === 'admin-panel'): 
  ?>
  <!-- Admin Panel Scripts -->
  <script type="module" src="./assets/js/admin.js"></script>
  <?php else: ?>
  <!-- Main Website Scripts -->
  <script type="module" src="./assets/js/main.js"></script>
  <?php endif; ?>
  
  <?php if (isset($additional_scripts) && is_array($additional_scripts)): 
    foreach ($additional_scripts as $script): ?>
  <script src="<?php echo $script; ?>"></script>
  <?php 
    endforeach;
  endif; ?>
</body>
</html>