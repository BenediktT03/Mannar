/**
 * ui-enhancements.js - UI-Verbesserungen für die Mannar-Website
 * Konsolidiert die Funktionalitäten aus lazy-load.js, cookie-notice.js und error-handler.js
 */

// Sofort ausführendes Modul für UI-Verbesserungen
window.uiEnhancements = (function() {
  /**
   * Initialisiert alle UI-Verbesserungen
   */
  function init() {
    initLazyLoading();
    initCookieNotice();
    initErrorHandling();
    console.log("UI Enhancements initialized");
  }

  // ====== LAZY LOADING ======
  
  /**
   * Optimiertes Lazy-Loading für Bilder
   */
  function initLazyLoading() {
    const images = document.querySelectorAll('img:not([loading])');
    
    // Native Unterstützung
    if ('loading' in HTMLImageElement.prototype) {
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });
    } else {
      // Fallback für ältere Browser
      const lazyImageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '200px 0px' }
      );
      
      images.forEach(img => {
        // Original-Quelle als data-Attribut
        if (!img.hasAttribute('data-src') && img.src) {
          img.setAttribute('data-src', img.src);
          // Kleine Platzhalter-Quelle
          img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
          // Bei Sichtbarkeit die echte Quelle setzen
          img.addEventListener('load', function() {
            if (img.classList.contains('loaded') && img.hasAttribute('data-src')) {
              img.src = img.getAttribute('data-src');
            }
          });
        }
        
        lazyImageObserver.observe(img);
      });
    }
  }

  // ====== COOKIE NOTICE ======
  
  /**
   * Einfacher Cookie-Hinweis für DSGVO-Konformität
   */
  function initCookieNotice() {
    // Nur ausführen, wenn Browser Cookies unterstützt
    if (!navigator.cookieEnabled) return;

    // Cookie-Hilfsfunktionen
    const cookies = {
      set: function(name, value, days) {
        let expires = "";
        if (days) {
          const date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
      },
      
      get: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      }
    };

    // Cookie-Banner anzeigen, wenn nicht bereits akzeptiert
    function showCookieBanner() {
      if (cookies.get('cookie_consent')) {
        return;
      }
      
      // Banner erstellen
      const banner = document.createElement('div');
      banner.className = 'cookie-banner';
      banner.innerHTML = `
        <div class="cookie-content">
          <p>Diese Website verwendet Cookies, um die Benutzererfahrung zu verbessern.</p>
          <div class="cookie-buttons">
            <button id="accept-cookies" class="w3-button w3-green">Akzeptieren</button>
            <button id="reject-cookies" class="w3-button w3-grey">Ablehnen</button>
          </div>
        </div>
      `;
      
      // Styling hinzufügen
      const style = document.createElement('style');
      style.textContent = `
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 15px;
          z-index: 9999;
          font-size: 14px;
          text-align: center;
        }
        
        .cookie-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .cookie-content p {
          margin: 0;
          padding: 0;
          flex: 1;
        }
        
        .cookie-buttons {
          margin-left: 20px;
        }
        
        @media (max-width: 767px) {
          .cookie-content {
            flex-direction: column;
          }
          
          .cookie-content p {
            margin-bottom: 15px;
            text-align: center;
          }
          
          .cookie-buttons {
            margin-left: 0;
          }
        }
      `;
      
      // Zum Dokument hinzufügen
      document.head.appendChild(style);
      document.body.appendChild(banner);
      
      // Event-Listener für Buttons
      document.getElementById('accept-cookies').addEventListener('click', function() {
        cookies.set('cookie_consent', 'accepted', 365);
        banner.style.display = 'none';
      });
      
      document.getElementById('reject-cookies').addEventListener('click', function() {
        cookies.set('cookie_consent', 'rejected', 365);
        banner.style.display = 'none';
      });
    }

    // Banner nach Verzögerung anzeigen
    setTimeout(showCookieBanner, 1000);
  }

  // ====== ERROR HANDLING ======
  
  /**
   * Einfaches Error-Handling für die Website
   */
  function initErrorHandling() {
    // Error Handler Objekt
    const errorHandler = {
      /**
       * Fehler protokollieren und verarbeiten
       * @param {Error} error - Das Fehlerobjekt
       * @param {string} context - Kontext des Fehlers
       * @returns {Object} Fehler-Information
       */
      handleError: function(error, context = 'Allgemeiner Fehler') {
        // Fehler in der Konsole protokollieren
        console.error(`Fehler in ${context}:`, error);
        
        // Optional: Fehler im localStorage speichern für Diagnose
        this.logError(error, context);
        
        // Status-Meldung anzeigen, wenn die Funktion existiert
        if (typeof showStatus === 'function') {
          showStatus(`Fehler: ${error.message || 'Unbekannter Fehler'}`, true);
        }
        
        // Strukturiertes Fehlerobjekt zurückgeben
        return {
          success: false,
          error: {
            message: error.message || 'Ein unbekannter Fehler ist aufgetreten',
            context: context
          }
        };
      },
      
      /**
       * Fehler im localStorage speichern für einfache Diagnose
       */
      logError: function(error, context) {
        try {
          // Maximale Anzahl an Fehlern begrenzen
          const MAX_ERRORS = 10;
          
          // Vorhandene Fehler holen
          const storedErrors = JSON.parse(localStorage.getItem('mannar_errors') || '[]');
          
          // Wenn zu viele, ältesten entfernen
          if (storedErrors.length >= MAX_ERRORS) {
            storedErrors.shift();
          }
          
          // Neuen Fehler hinzufügen
          storedErrors.push({
            time: new Date().toISOString(),
            context: context,
            message: error.message || 'Unbekannter Fehler',
            url: window.location.href
          });
          
          // Speichern
          localStorage.setItem('mannar_errors', JSON.stringify(storedErrors));
        } catch (e) {
          // Ignorieren, wenn localStorage nicht verfügbar
          console.error('Fehler beim Speichern des Fehlers:', e);
        }
      }
    };

    // Globale Fehlerbehandlung
    window.addEventListener('error', function(event) {
      errorHandler.handleError(
        event.error || new Error(event.message), 
        'Unbehandelter Fehler'
      );
    });

    // Unbehandelte Promise-Ablehnungen abfangen
    window.addEventListener('unhandledrejection', function(event) {
      errorHandler.handleError(
        event.reason || new Error('Unbehandelte Promise-Ablehnung'), 
        'Promise-Fehler'
      );
    });

    // Global verfügbar machen
    window.errorHandler = errorHandler;
  }
  
  // Öffentliche API
  return {
    init: init,
    lazyLoad: initLazyLoading
  };
})();

// Automatische Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  window.uiEnhancements.init();
}); 