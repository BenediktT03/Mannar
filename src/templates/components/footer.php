<?php
/**
 * Footer Component
 * 
 * Provides a standardized footer across all pages of the Mannar website
 * 
 * Variables:
 * - $additional_scripts: Optional additional JavaScript files
 * - $hide_go_top: Boolean to hide the "go to top" button
 * - $hide_social: Boolean to hide social media icons
 * - $footer_classes: Additional CSS classes for the footer
 * - $include_admin_link: Boolean to include admin link
 */

// Set defaults if not provided
$hide_go_top = $hide_go_top ?? false;
$hide_social = $hide_social ?? false;
$footer_classes = $footer_classes ?? '';
$include_admin_link = $include_admin_link ?? true;

// Current year for copyright
$current_year = date('Y');

// Get asset version for cache busting
$asset_version = defined('ASSET_VERSION') ? ASSET_VERSION : '1.0.0';
?>

<!-- Footer -->
<footer class="w3-center w3-black w3-padding-64 w3-opacity w3-hover-opacity-off <?= $footer_classes ?>">
    <?php if (!$hide_go_top): ?>
        <a href="#home" class="w3-button w3-light-grey go-top-btn" aria-label="Zurück zum Seitenanfang">
            <i class="fas fa-arrow-up w3-margin-right" aria-hidden="true"></i>Nach oben
        </a>
    <?php endif; ?>
    
    <?php if (!$hide_social): ?>
        <div class="w3-xlarge w3-section social-icons">
            <a href="#" aria-label="Facebook" rel="noopener noreferrer" class="social-icon">
                <i class="fab fa-facebook w3-hover-opacity" aria-hidden="true"></i>
            </a>
            <a href="#" aria-label="Instagram" rel="noopener noreferrer" class="social-icon">
                <i class="fab fa-instagram w3-hover-opacity" aria-hidden="true"></i>
            </a>
            <a href="#" aria-label="Twitter" rel="noopener noreferrer" class="social-icon">
                <i class="fab fa-twitter w3-hover-opacity" aria-hidden="true"></i>
            </a>
            <a href="#" aria-label="LinkedIn" rel="noopener noreferrer" class="social-icon">
                <i class="fab fa-linkedin w3-hover-opacity" aria-hidden="true"></i>
            </a>
        </div>
    <?php endif; ?>
    
    <div class="footer-content">
        <p class="copyright">&copy; <?= $current_year ?> Mannar | Peer und Genesungsbegleiter</p>
        
        <?php if ($include_admin_link): ?>
            <!-- Hidden admin link, only visible on hover -->
            <p class="admin-link">
                <a href="admin.php" class="w3-opacity w3-hover-opacity-off">Admin</a>
            </p>
        <?php endif; ?>
    </div>
</footer>

<!-- Go to top button (fixed position) -->
<?php if (!$hide_go_top): ?>
    <div class="go-top" id="goTopBtn" aria-label="Nach oben scrollen">
        <i class="fas fa-arrow-up" aria-hidden="true"></i>
    </div>
<?php endif; ?>

<!-- Core Scripts -->
<script src="<?= defined('ASSET_PATH') ? ASSET_PATH : './assets' ?>/js/services/firebase.js?v=<?= $asset_version ?>"></script>
<script src="<?= defined('ASSET_PATH') ? ASSET_PATH : './assets' ?>/js/utils/ui-utils.js?v=<?= $asset_version ?>"></script>
<script src="<?= defined('ASSET_PATH') ? ASSET_PATH : './assets' ?>/js/main.js?v=<?= $asset_version ?>"></script>

<!-- Additional Scripts -->
<?php if (isset($additional_scripts)): ?>
    <?= $additional_scripts ?>
<?php endif; ?>

<!-- Initialize UI components -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll-to-top button functionality
    const goTopBtn = document.getElementById('goTopBtn');
    if (goTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                goTopBtn.classList.add('visible');
            } else {
                goTopBtn.classList.remove('visible');
            }
        });
        
        goTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Check if UIUtils is loaded and initialize features
    if (typeof UIUtils !== 'undefined' && UIUtils.initAll) {
        UIUtils.initAll();
    }
});
</script>
</body>
</html>