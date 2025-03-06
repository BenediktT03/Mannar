</main>
    <!-- Hauptinhalt Ende -->

    <!-- Nach-oben-Button -->
    <div class="go-top" id="goTopBtn" role="button" aria-label="Nach oben" tabindex="0">
        <i class="fas fa-arrow-up"></i>
    </div>

    <!-- Footer -->
    <footer class="w3-center w3-black w3-padding-64 w3-opacity w3-hover-opacity-off" itemscope itemtype="http://schema.org/WPFooter">
        <a href="#top" class="w3-button w3-light-grey"><i class="fas fa-arrow-up w3-margin-right"></i>Nach oben</a>
        
        <div class="w3-xlarge w3-section social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Besuchen Sie uns auf Facebook">
                <i class="fab fa-facebook w3-hover-opacity" aria-hidden="true"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Besuchen Sie uns auf Instagram">
                <i class="fab fa-instagram w3-hover-opacity" aria-hidden="true"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Folgen Sie uns auf Twitter">
                <i class="fab fa-twitter w3-hover-opacity" aria-hidden="true"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="Besuchen Sie unser LinkedIn-Profil">
                <i class="fab fa-linkedin w3-hover-opacity" aria-hidden="true"></i>
            </a>
        </div>
        
        <div class="w3-container footer-links">
            <div class="w3-row-padding">
                <div class="w3-col m4">
                    <h4>Kontakt</h4>
                    <address itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
                        <span itemprop="streetAddress">Musterstraße 123</span><br>
                        <span itemprop="postalCode">12345</span> <span itemprop="addressLocality">Musterstadt</span><br>
                        <a href="tel:+491234567890" itemprop="telephone">+49 123 456789</a><br>
                        <a href="mailto:info@mannar.de" itemprop="email">info@mannar.de</a>
                    </address>
                </div>
                <div class="w3-col m4">
                    <h4>Schnellzugriff</h4>
                    <ul class="footer-menu">
                        <li><a href="index.php">Home</a></li>
                        <li><a href="index.php#about">Über mich</a></li>
                        <li><a href="index.php#portfolio">Angebote</a></li>
                        <li><a href="index.php#contact">Kontakt</a></li>
                    </ul>
                </div>
                <div class="w3-col m4">
                    <h4>Rechtliches</h4>
                    <ul class="footer-menu">
                        <li><a href="datenschutz.php">Datenschutz</a></li>
                        <li><a href="impressum.php">Impressum</a></li>
                        <li><a href="agb.php">AGB</a></li>
                        <li class="admin-link"><a href="admin-panel.php" style="opacity: 0.6; font-size: 0.9em; text-decoration: none;">Admin</a></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="copyright">
            <p>&copy; <?php echo date('Y'); ?> Mannar | Peer und Genesungsbegleiter</p>
        </div>
    </footer>

    <!-- Cookie-Hinweis -->
    <div id="cookieNotice" class="cookie-notice">
        <div class="cookie-content">
            <p>Diese Website verwendet Cookies, um Ihnen das beste Erlebnis auf unserer Website zu bieten.</p>
            <div class="cookie-buttons">
                <button id="cookieAccept" class="w3-button w3-green">Akzeptieren</button>
                <button id="cookieDecline" class="w3-button w3-light-grey">Ablehnen</button>
                <a href="datenschutz.php" class="w3-button">Datenschutz</a>
            </div>
        </div>
    </div>

    <!-- Lade-Indikator -->
    <div id="loading-indicator" class="loading-overlay" style="display: none;">
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p>Inhalt wird geladen...</p>
        </div>
    </div>

    <!-- Footer-Assets ausgeben -->
    <?php echo AssetLoader::printFooterAssets(); ?>
    
    <!-- Seitenspezifische Scripts -->
    <?php 
    // Ermittle die aktuelle Seite für Script-Loading
    $current_page = basename($_SERVER['PHP_SELF'], '.php');
    
    // Seitenspezifische Scripts laden
    switch ($current_page):
        case 'admin-panel': 
            // Admin-Panel zusätzliche Scripts
            if (isset($additional_admin_scripts) && is_array($additional_admin_scripts)):
                foreach ($additional_admin_scripts as $script): ?>
    <script src="<?php echo htmlspecialchars($script); ?>"></script>
    <?php 
                endforeach;
            endif;
            break;
            
        default:
            // Alle Seiten zusätzliche Scripts
            if (isset($additional_scripts) && is_array($additional_scripts)):
                foreach ($additional_scripts as $script): ?>
    <script src="<?php echo htmlspecialchars($script); ?>"></script>
    <?php 
                endforeach;
            endif;
    endswitch; 
    ?>
    
    <!-- Performance-Optimierte Funktionen -->
    <script>
    // Cookie-Hinweis-Handler
    document.addEventListener('DOMContentLoaded', function() {
        // Cookie-Funktionen
        const getCookie = function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };
        
        const setCookie = function(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
        };
        
        // Cookie-Hinweis anzeigen
        const cookieNotice = document.getElementById('cookieNotice');
        const cookieAccept = document.getElementById('cookieAccept');
        const cookieDecline = document.getElementById('cookieDecline');
        
        if (cookieNotice && cookieAccept && cookieDecline) {
            // Cookie-Status prüfen
            const cookieConsent = getCookie('consent');
            
            if (cookieConsent === null) {
                // Cookie-Hinweis anzeigen
                cookieNotice.style.display = 'block';
                
                // Event-Listener für Buttons
                cookieAccept.addEventListener('click', function() {
                    setCookie('consent', 'granted', 365);
                    cookieNotice.style.display = 'none';
                });
                
                cookieDecline.addEventListener('click', function() {
                    setCookie('consent', 'declined', 30);
                    cookieNotice.style.display = 'none';
                });
            }
        }
        
        // Nach-oben-Button-Handler
        const goTopBtn = document.getElementById('goTopBtn');
        if (goTopBtn) {
            // Scroll-Handler
            const toggleGoTopButton = function() {
                if (window.scrollY > 300) {
                    goTopBtn.classList.add('visible');
                } else {
                    goTopBtn.classList.remove('visible');
                }
            };
            
            // Anfangszustand prüfen
            toggleGoTopButton();
            
            // Scroll-Event-Listener
            window.addEventListener('scroll', toggleGoTopButton, { passive: true });
            
            // Click-Event-Listener
            goTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            // Keyboard-Unterstützung
            goTopBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
    
    // Navigation umschalten
    function toggleFunction() {
        const navDemo = document.getElementById('navDemo');
        const toggleBtn = document.querySelector('.w3-right.w3-hide-medium.w3-hide-large');
        
        if (navDemo) {
            navDemo.classList.toggle('w3-show');
            
            if (toggleBtn) {
                const isExpanded = navDemo.classList.contains('w3-show');
                toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            }
        }
    }
    </script>
    
    <?php if ($debug_mode): ?>
    <!-- Debug-Informationen -->
    <div class="debug-info">
        <h3>Debug-Informationen</h3>
        <ul>
            <li>Seite: <?php echo $current_page; ?></li>
            <li>Ladezeit: <span id="pageLoadTime">-</span></li>
            <li>Speicherverbrauch: <?php echo round(memory_get_peak_usage() / 1024 / 1024, 2); ?> MB</li>
        </ul>
        <script>
            window.addEventListener('load', function() {
                document.getElementById('pageLoadTime').textContent = 
                    ((performance.now() / 1000).toFixed(2)) + ' Sekunden';
            });
        </script>
    </div>
    <?php endif; ?>
</body>
</html>