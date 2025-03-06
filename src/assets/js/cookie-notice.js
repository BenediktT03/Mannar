 /**
 * Einfacher Cookie-Hinweis für DSGVO-Konformität
 */
(function() {
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
  window.addEventListener('load', function() {
    setTimeout(showCookieBanner, 1000);
  });
})();