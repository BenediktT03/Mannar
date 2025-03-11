<?php
/**
 * Footer Component Template
 * Common footer shared across pages
 * 
 * Variables:
 * - $additional_scripts: Additional JavaScript files or inline scripts
 * - $hide_go_top: Whether to hide the "go to top" button
 * - $hide_social: Whether to hide social media icons
 */

// Set defaults if not provided
$hide_go_top = $hide_go_top ?? false;
$hide_social = $hide_social ?? false;

// Load version information for cache busting
if (!defined('ASSET_VERSION')) {
    require_once __DIR__ . '/../../version.php';
}
$asset_version = defined('ASSET_VERSION') ? ASSET_VERSION : '1.0.0';

// Current year for copyright
$current_year = date('Y');
?>

<!-- Footer -->
<footer class="w3-center w3-black w3-padding-64 w3-opacity w3-hover-opacity-off">
    <?php if (!$hide_go_top): ?>
        <a href="#home" class="w3-button w3-light-grey">
            <i class="fas fa-arrow-up w3-margin-right"></i>Nach oben
        </a>
    <?php endif; ?>
    
    <?php if (!$hide_social): ?>
        <div class="w3-xlarge w3-section social-icons">
            <a href="#" aria-label="Facebook" rel="noopener noreferrer">
                <i class="fab fa-facebook w3-hover-opacity"></i>
            </a>
            <a href="#" aria-label="Instagram" rel="noopener noreferrer">
                <i class="fab fa-instagram w3-hover-opacity"></i>
            </a>
            <a href="#" aria-label="Twitter" rel="noopener noreferrer">
                <i class="fab fa-twitter w3-hover-opacity"></i>
            </a>
            <a href="#" aria-label="LinkedIn" rel="noopener noreferrer">
                <i class="fab fa-linkedin w3-hover-opacity"></i>
            </a>
        </div>
    <?php endif; ?>
    
    <p>&copy; <?= $current_year ?> Mannar | Peer und Genesungsbegleiter</p>
    
    <!-- Hidden admin link, only visible on hover -->
    <p class="admin-link">
        <a href="admin-panel.php" class="w3-opacity w3-hover-opacity-off">Admin</a>
    </p>
</footer>

<!-- Go to top button -->
<?php if (!$hide_go_top): ?>
    <div class="go-top" id="goTopBtn" aria-label="Nach oben scrollen">
        <i class="fas fa-arrow-up"></i>
    </div>
<?php endif; ?>

<!-- Core Scripts -->
<script src="<?= ASSET_PATH ?>/js/services/firebase.js?v=<?= $asset_version ?>"></script>
<script src="<?= ASSET_PATH ?>/js/utils/ui-utils.js?v=<?= $asset_version ?>"></script>
<script src="<?= ASSET_PATH ?>/js/main.js?v=<?= $asset_version ?>"></script>

<!-- Additional Scripts -->
<?php if (isset($additional_scripts)): ?>
    <?= $additional_scripts ?>
<?php endif; ?>

</body>
</html>