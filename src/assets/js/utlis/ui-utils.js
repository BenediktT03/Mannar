/**
 * UI Utilities
 * Allgemeine UI-Funktionen und Verbesserungen für die Website
 */
const UIUtils = (function() {
  /**
   * Statusmeldung anzeigen
   * @param {string} message - Anzuzeigende Nachricht
   * @param {boolean} isError - Bei true wird Fehlerstyling verwendet
   * @param {number} timeout - Zeit in Millisekunden, nach der die Meldung verschwindet (0 = dauerhaft)
   */
  function showStatus(message, isError = false, timeout = 3000) {
    let statusMsg = document.getElementById('statusMsg');
    
    // Status-Element erstellen, wenn es nicht existiert
    if (!statusMsg) {
      statusMsg = document.createElement('div');
      statusMsg.id = 'statusMsg';
      statusMsg.className = 'status-msg';
      document.body.appendChild(statusMsg);
    }
    
    // Nachricht setzen und Stil anpassen
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    // Timer für Ausblenden setzen, wenn gewünscht
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, timeout);
    }
  }

  /**
   * Lazy Loading für Bilder initialisieren
   */
  function initLazyLoading() {
    // Native Lazy Loading verwenden, wenn unterstützt
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img:not([loading])').forEach(img => {
        img.loading = 'lazy';
      });
    } else {
      // Fallback mit Intersection Observer
      if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const dataSrc = img.getAttribute('data-src');
              
              if (dataSrc) {
                // Bild laden, wenn data-src vorhanden
                img.src = dataSrc;
                img.removeAttribute('data-src');
              }
              
              img.classList.add('loaded');
              lazyImageObserver.unobserve(img);
            }
          });
        }, {
          rootMargin: '200px 0px'
        });
        
        // Alle Bilder mit data-src Attribut oder ohne loading Attribut beobachten
        document.querySelectorAll('img[data-src], img:not([loading])').forEach(img => {
          // Originales src in data-src speichern, falls noch nicht vorhanden
          if (!img.hasAttribute('data-src') && img.src && !img.src.startsWith('data:')) {
            img.setAttribute('data-src', img.src);
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
          }
          
          lazyImageObserver.observe(img);
        });
      }
    }
  }

  /**
   * Animationen für Elemente initialisieren
   */
  function initAnimations() {
    // Animationen überspringen, wenn die Einstellung für reduzierte Animation aktiviert ist
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.animate-item').forEach(el => {
        el.classList.add('visible');
      });
      return;
    }
    
    // Intersection Observer für Animation beim Scrollen
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      // Alle animierbaren Elemente beobachten
      document.querySelectorAll('.animate-item').forEach(el => {
        observer.observe(el);
      });
    } else {
      // Fallback: Alle Elemente sofort anzeigen
      document.querySelectorAll('.animate-item').forEach(el => {
        el.classList.add('visible');
      });
    }
  }

  /**
   * "Nach oben"-Button initialisieren
   */
  function initGoToTopButton() {
    const goTopBtn = document.getElementById('goTopBtn');
    if (!goTopBtn) return;
    
    // Scroll-Handler für Sichtbarkeit des Buttons
    function handleScroll() {
      if (window.scrollY > 300) {
        goTopBtn.classList.add('visible');
      } else {
        goTopBtn.classList.remove('visible');
      }
    }
    
    // Initial prüfen und Scroll-Event anhängen
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    // Click-Handler für nach oben scrollen
    goTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    });
  }

  /**
   * Verbesserte mobile Navigation
   */
  function initMobileNav() {
    const navbar = document.getElementById('myNavbar');
    const navDemo = document.getElementById('navDemo');
    
    if (!navbar || !navDemo) return;
    
    // Function für das Umschalten des mobilen Menüs
    window.toggleFunction = function() {
      navDemo.classList.toggle('w3-show');
      
      // ARIA-Attribute aktualisieren für Barrierefreiheit
      const toggleButton = document.querySelector('[aria-controls="navDemo"]');
      if (toggleButton) {
        const isExpanded = navDemo.classList.contains('w3-show');
        toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }
    };
    
    // Navbar-Verhalten bei Scrollen
    function handleNavScroll() {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
        navbar.classList.add('visible');
      } else {
        navbar.classList.remove('scrolled');
        if (window.scrollY <= 10) {
          navbar.classList.remove('visible');
        }
      }
    }
    
    // Initial prüfen und Scroll-Event anhängen
    handleNavScroll();
    window.addEventListener('scroll', handleNavScroll);
    
    // Menü schließen bei Klick außerhalb
    document.addEventListener('click', (event) => {
      if (navDemo.classList.contains('w3-show') && 
          !navDemo.contains(event.target) && 
          !event.target.closest('[aria-controls="navDemo"]')) {
        navDemo.classList.remove('w3-show');
        
        // ARIA-Attribute aktualisieren
        const toggleButton = document.querySelector('[aria-controls="navDemo"]');
        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', 'false');
        }
      }
    });
    
    // Smooth Scrolling für interne Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        e.preventDefault();
        
        // Smooth Scrolling, aber nicht bei Einstellung für reduzierte Animation
        targetElement.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
        
        // Mobile Menü schließen, wenn offen
        if (navDemo.classList.contains('w3-show')) {
          navDemo.classList.remove('w3-show');
          
          // ARIA-Attribute aktualisieren
          const toggleButton = document.querySelector('[aria-controls="navDemo"]');
          if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  }

  /**
   * Modales Fenster für Bilder initialisieren
   */
  function initImageModal() {
    // Klick-Handler für alle Bilder in Portfolio-Items hinzufügen
    document.querySelectorAll('.portfolio-item img, .gallery-item img').forEach(img => {
      img.addEventListener('click', function() {
        const modal = document.getElementById('modal01');
        
        // Modal erstellen, wenn es nicht existiert
        if (!modal) {
          const modalHtml = `
            <div id="modal01" class="w3-modal w3-black" onclick="this.style.display='none'">
              <span class="w3-button w3-large w3-black w3-display-topright" title="Schließen"><i class="fas fa-times"></i></span>
              <div class="w3-modal-content w3-animate-zoom w3-center w3-transparent w3-padding-64">
                <img id="img01" class="w3-image">
                <p id="caption" class="w3-opacity w3-large"></p>
              </div>
            </div>
          `;
          
          const modalContainer = document.createElement('div');
          modalContainer.innerHTML = modalHtml;
          document.body.appendChild(modalContainer.firstChild);
        }
        
        // Modal anzeigen
        const modalElement = document.getElementById('modal01');
        const modalImg = document.getElementById('img01');
        const captionText = document.getElementById('caption');
        
        modalElement.style.display = 'block';
        modalImg.src = this.src;
        captionText.innerHTML = this.alt || '';
      });
    });
  }

  /**
   * Formularvalidierung initialisieren
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('form:not(.no-validation)');
    
    forms.forEach(form => {
      // Submit-Handler hinzufügen
      form.addEventListener('submit', function(event) {
        if (!this.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          
          // Fehlermeldungen anzeigen
          highlightInvalidFields(this);
        }
        
        this.classList.add('was-validated');
      });
      
      // Live-Validierung
      form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('blur', function() {
          validateField(this);
        });
        
        field.addEventListener('input', function() {
          if (this.classList.contains('is-invalid')) {
            validateField(this);
          }
        });
      });
    });
    
    // Einzelnes Feld validieren
    function validateField(field) {
      if (field.checkValidity()) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
      }
    }
    
    // Ungültige Felder hervorheben
    function highlightInvalidFields(form) {
      form.querySelectorAll('input, textarea, select').forEach(field => {
        validateField(field);
      });
      
      // Zum ersten ungültigen Feld scrollen
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  }

  /**
   * Alle UI-Verbesserungen initialisieren
   */
  function initAll() {
    initLazyLoading();
    initAnimations();
    initGoToTopButton();
    initMobileNav();
    initImageModal();
    initFormValidation();
  }

  // Öffentliche API
  return {
    showStatus,
    initLazyLoading,
    initAnimations,
    initGoToTopButton,
    initMobileNav,
    initImageModal,
    initFormValidation,
    initAll
  };
})();

// Für globalen Zugriff
window.UIUtils = UIUtils;

// Für Rückwärtskompatibilität mit bestehendem Code
window.showStatus = UIUtils.showStatus;

// Automatisch initialisieren, wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', UIUtils.initAll);