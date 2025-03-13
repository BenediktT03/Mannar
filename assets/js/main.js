 /**
 * Main JavaScript
 * Haupteinstiegspunkt für die Website-Funktionalität
 * Initialisiert alle erforderlichen Module und Funktionen
 */

// Unmittelbar ausgeführte Funktion für Namensraumschutz
(function() {
  'use strict';
  
  // Konfiguration
  const config = {
    // Animationsverzögerung für gestaffelte Animationen
    animationDelay: 50,
    
    // Scrolling-Schwellenwerte
    scrollThresholds: {
      navbar: 100,
      goTopButton: 300
    },
    
    // Selektoren für DOM-Elemente
    selectors: {
      navbar: '#myNavbar',
      navDemo: '#navDemo',
      toggleBtn: '[aria-controls="navDemo"]',
      goTopBtn: '#goTopBtn',
      logo: '#mainLogo',
      wordCloudContainer: '.textbubble',
      wordCloudItems: '.word-cloud li a',
      portfolioImages: '.portfolio-item img'
    }
  };
  
  // DOM-Elemente-Cache
  let elements = {};
  
  /**
   * DOM-Elemente für schnelleren Zugriff cachen
   */
  function cacheElements() {
    // Alle Selektoren durchlaufen und im elements-Objekt speichern
    Object.entries(config.selectors).forEach(([key, selector]) => {
      elements[key] = document.querySelector(selector);
    });
    
    // Spezialfall für Wortlisten-Elemente (NodeList)
    elements.wordCloudItems = document.querySelectorAll(config.selectors.wordCloudItems);
  }
  
  /**
   * Alle benötigten Ereignislistener initialisieren
   */
  function setupEventListeners() {
    // Scroll-Ereignis für Navbar und "Nach oben"-Button
    window.addEventListener('scroll', handleScroll);
    
    // Prüfen, ob bestimmte Elemente existieren, bevor Ereignislistener angehängt werden
    
    // "Nach oben"-Button
    if (elements.goTopBtn) {
      elements.goTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Logo-Animation
    if (elements.logo) {
      elements.logo.style.display = 'block';
    }
    
    // Smooth Scrolling für interne Links
    setupSmoothScrolling();
    
    // Modal für Bilder
    setupImageModal();
  }
  
  /**
   * Scroll-Ereignisbehandlung
   */
  function handleScroll() {
    // Navbar-Verhalten
    if (elements.navbar) {
      if (window.scrollY > config.scrollThresholds.navbar) {
        elements.navbar.classList.add('scrolled');
        elements.navbar.classList.add('visible');
      } else {
        elements.navbar.classList.remove('scrolled');
        if (window.scrollY <= 10) {
          elements.navbar.classList.remove('visible');
        }
      }
    }
    
    // "Nach oben"-Button-Sichtbarkeit
    if (elements.goTopBtn) {
      if (window.scrollY > config.scrollThresholds.goTopButton) {
        elements.goTopBtn.classList.add('visible');
      } else {
        elements.goTopBtn.classList.remove('visible');
      }
    }
  }
  
  /**
   * Zum Seitenanfang scrollen
   */
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion() ? 'auto' : 'smooth'
    });
  }
  
  /**
   * Sanftes Scrollen für interne Links einrichten
   */
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        e.preventDefault();
        
        targetElement.scrollIntoView({
          behavior: shouldReduceMotion() ? 'auto' : 'smooth',
          block: 'start'
        });
        
        // Mobile Menü schließen, wenn offen
        if (elements.navDemo && elements.navDemo.classList.contains('w3-show')) {
          toggleMobileMenu();
        }
      });
    });
  }
  
  /**
   * Bildmodal für Portfolio-Bilder einrichten
   */
  function setupImageModal() {
    document.querySelectorAll('.portfolio-item img').forEach(img => {
      img.addEventListener('click', function() {
        const modal = document.getElementById('modal01');
        if (!modal) return;
        
        const modalImg = document.getElementById('img01');
        const captionText = document.getElementById('caption');
        
        modal.style.display = 'block';
        modalImg.src = this.src;
        captionText.innerHTML = this.alt || '';
      });
    });
  }
  
  /**
   * Mobile Menü umschalten
   */
  function toggleMobileMenu() {
    if (!elements.navDemo) return;
    
    elements.navDemo.classList.toggle('w3-show');
    
    // ARIA-Attribute aktualisieren
    if (elements.toggleBtn) {
      const isExpanded = elements.navDemo.classList.contains('w3-show');
      elements.toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
  }
  
  /**
   * Funktion zur Wortwolken-Animation
   */
  function animateWordCloud() {
    if (!elements.wordCloudContainer || !elements.wordCloudItems.length || shouldReduceMotion()) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        elements.wordCloudItems.forEach((word, index) => {
          setTimeout(() => {
            word.style.opacity = '1';
            word.style.transform = 'translateY(0)';
          }, config.animationDelay * index);
        });
        
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(elements.wordCloudContainer);
    
    // Sofort prüfen, ob bereits sichtbar
    const rect = elements.wordCloudContainer.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      elements.wordCloudItems.forEach((word, index) => {
        setTimeout(() => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        }, config.animationDelay * index);
      });
    }
  }
  
  /**
   * Prüfen, ob die Einstellung für reduzierte Animation aktiviert ist
   */
  function shouldReduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Website-Inhalte laden
   */
  function loadWebsiteContent() {
    // ContentLoader verwenden, wenn verfügbar
    if (window.ContentLoader && typeof ContentLoader.initPage === 'function') {
      ContentLoader.initPage(false);
    } else {
      console.warn('ContentLoader nicht verfügbar. Fallback wird verwendet.');
      
      // Firebase-Dienst direkt verwenden, wenn verfügbar
      if (window.FirebaseService) {
        FirebaseService.content.load('content/main')
          .then(data => {
            if (!data) {
              console.warn("Keine Inhalte in Firestore gefunden");
              return;
            }
            
            // Text-Felder füllen
            document.querySelectorAll('[data-content-field]').forEach(element => {
              const fieldName = element.dataset.contentField;
              if (data[fieldName]) {
                if (element.tagName === 'IMG') {
                  // Bild-Element
                  element.src = data[fieldName].url || data[fieldName];
                  if (data[fieldName].alt) element.alt = data[fieldName].alt;
                } else if (element.dataset.html === 'true') {
                  // HTML-Inhalt
                  element.innerHTML = data[fieldName];
                } else {
                  // Textinhalt
                  element.textContent = data[fieldName];
                }
              }
            });
          })
          .catch(error => {
            console.error("Fehler beim Laden der Inhalte:", error);
          });
      }
    }
  }
  
  /**
   * Versteckten Admin-Link zum Footer hinzufügen
   */
  function addAdminLink() {
    const footerCopyright = document.querySelector('footer p');
    if (footerCopyright) {
      const adminSpan = document.createElement('span');
      adminSpan.innerHTML = ' | <a href="admin-panel.php" style="opacity: 0.3; font-size: 0.8em; text-decoration: none;">Admin</a>';
      footerCopyright.appendChild(adminSpan);
    }
  }
  
  /**
   * Bilder Lazy-Loading initialisieren
   */
  function initLazyLoading() {
    // Native Lazy Loading verwenden, wenn unterstützt
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.loading = 'lazy';
        }
      });
    } else {
      // Fallback mit Intersection Observer
      if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img:not([loading])');
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.style.opacity = '0';
              
              const tempImg = new Image();
              tempImg.src = img.src;
              tempImg.onload = () => {
                img.style.transition = 'opacity 0.5s ease';
                img.style.opacity = '1';
              };
              
              imageObserver.unobserve(img);
            }
          });
        });
        
        lazyImages.forEach(img => {
          imageObserver.observe(img);
        });
      }
    }
  }
  
  /**
   * Hauptinitialisierungsfunktion
   */
  function init() {
    // DOM-Elemente cachen
    cacheElements();
    
    // Ereignislistener initialisieren
    setupEventListeners();
    
    // Inhalte laden
    loadWebsiteContent();
    
    // Wortwolke animieren
    animateWordCloud();
    
    // Lazy Loading für Bilder
    initLazyLoading();
    
    // Admin-Link hinzufügen
    addAdminLink();
    
    // Globale Toggle-Funktion für mobile Navigation bereitstellen
    window.toggleFunction = toggleMobileMenu;
    
    // Initialen Scroll-Zustand prüfen
    handleScroll();
    
    console.log('Website-Initialisierung abgeschlossen');
  }
  
  // Initialisierung bei DOM-Ladung
  document.addEventListener('DOMContentLoaded', init);
})();