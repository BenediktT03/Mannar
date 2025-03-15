 /**
 * Error Handler
 * 
 * Zentrale Fehlerbehandlung für die gesamte Anwendung.
 * Bietet Funktionen zum Protokollieren, Anzeigen und Verfolgen von Fehlern.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

/**
 * Error Handler Klasse
 */
class ErrorHandler {
  /**
   * Erstellt eine neue ErrorHandler-Instanz
   */
  constructor() {
    this.errorLog = [];
    this.maxLogEntries = 100;
    this.devMode = this._isDevMode();
    this.errorCallback = null;
    
    // Unbehandelte Fehler abfangen
    this._setupGlobalErrorHandling();
  }
  
  /**
   * Richtet globale Fehlerbehandlung ein
   * @private
   */
  _setupGlobalErrorHandling() {
    // Unbehandelte Fehler abfangen
    window.addEventListener('error', (event) => {
      this.logError('Unbehandelter Fehler:', event.error || event.message);
      // Standardverhalten nicht verhindern
    });
    
    // Unbehandelte Promise-Ablehnungen abfangen
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unbehandelte Promise-Ablehnung:', event.reason);
      // Standardverhalten nicht verhindern
    });
  }
  
  /**
   * Prüft, ob die Anwendung im Entwicklungsmodus läuft
   * @returns {boolean} True, wenn im Entwicklungsmodus
   * @private
   */
  _isDevMode() {
    // Verschiedene Methoden zur Erkennung des Entwicklungsmodus
    return (
      // 1. Lokale Entwicklungsumgebung
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      // 2. Staging/Test-Umgebung
      window.location.hostname.includes('dev.') ||
      window.location.hostname.includes('test.') ||
      window.location.hostname.includes('staging.') ||
      // 3. Explizite URL-Parameter
      new URLSearchParams(window.location.search).has('dev_mode')
    );
  }
  
  /**
   * Protokolliert einen Fehler
   * @param {string} message - Fehlermeldung
   * @param {Error|Object|string} error - Fehler-Objekt oder zusätzliche Informationen
   * @param {Object} context - Zusätzlicher Kontext zum Fehler
   */
  logError(message, error = null, context = {}) {
    // Fehlerobjekt erstellen
    const errorObject = this._createErrorObject(message, error, context);
    
    // Fehler zum Log hinzufügen
    this.errorLog.unshift(errorObject);
    
    // Log auf maximale Größe begrenzen
    if (this.errorLog.length > this.maxLogEntries) {
      this.errorLog.pop();
    }
    
    // Im Entwicklungsmodus in der Konsole ausgeben
    if (this.devMode) {
      console.error(message, error, context);
    }
    
    // Fehler an den Server senden, falls konfiguriert
    this._sendErrorToServer(errorObject);
    
    // Callback aufrufen, falls vorhanden
    if (this.errorCallback && typeof this.errorCallback === 'function') {
      this.errorCallback(errorObject);
    }
    
    return errorObject;
  }
  
  /**
   * Erstellt ein strukturiertes Fehlerobjekt
   * @param {string} message - Fehlermeldung
   * @param {Error|Object|string} error - Fehler-Objekt oder zusätzliche Informationen
   * @param {Object} context - Zusätzlicher Kontext zum Fehler
   * @returns {Object} Strukturiertes Fehlerobjekt
   * @private
   */
  _createErrorObject(message, error, context) {
    // Aktueller Zeitstempel
    const timestamp = new Date();
    
    // Basisinformationen
    const errorObject = {
      id: this._generateErrorId(),
      timestamp: timestamp,
      message: message,
      context: { ...context }
    };
    
    // Fehlerinformationen extrahieren
    if (error instanceof Error) {
      errorObject.errorName = error.name;
      errorObject.errorMessage = error.message;
      errorObject.stack = error.stack;
    } else if (error !== null) {
      if (typeof error === 'object') {
        errorObject.errorDetails = JSON.stringify(error);
      } else {
        errorObject.errorDetails = String(error);
      }
    }
    
    // Browser- und Umgebungsinformationen hinzufügen
    errorObject.environment = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: timestamp.toISOString()
    };
    
    return errorObject;
  }
  
  /**
   * Generiert eine eindeutige Fehler-ID
   * @returns {string} Eindeutige Fehler-ID
   * @private
   */
  _generateErrorId() {
    return 'error_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }
  
  /**
   * Sendet einen Fehler an den Server zur Protokollierung
   * @param {Object} errorObject - Zu sendendes Fehlerobjekt
   * @private
   */
  _sendErrorToServer(errorObject) {
    // Nur im Produktionsmodus oder explizit konfiguriert an den Server senden
    if (!this.devMode && this.shouldReportErrors) {
      try {
        // Fehler-URL aus Konfiguration oder Fallback
        const errorReportingUrl = this.errorReportingUrl || '/api/log-error';
        
        // Fetch API verwenden, um den Fehler zu senden
        fetch(errorReportingUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorObject),
          // Keine Credentials einschließen, da dies ein reiner Logging-Endpunkt ist
          credentials: 'omit',
          // Fehler beim Senden ignorieren
          mode: 'no-cors'
        }).catch(() => {
          // Fehler beim Senden ignorieren (um Endlosschleifen zu vermeiden)
        });
      } catch (e) {
        // Fehler beim Senden ignorieren (um Endlosschleifen zu vermeiden)
        if (this.devMode) {
          console.warn('Fehler beim Senden des Fehlerberichts:', e);
        }
      }
    }
  }
  
  /**
   * Registriert einen Callback für Fehler
   * @param {Function} callback - Funktion, die bei Fehlern aufgerufen wird
   */
  setErrorCallback(callback) {
    if (typeof callback === 'function') {
      this.errorCallback = callback;
    } else {
      throw new Error('Der errorCallback muss eine Funktion sein');
    }
  }
  
  /**
   * Konfiguriert den ErrorHandler
   * @param {Object} config - Konfigurationsobjekt
   */
  configure(config = {}) {
    if (config.maxLogEntries) {
      this.maxLogEntries = config.maxLogEntries;
    }
    
    if (config.devMode !== undefined) {
      this.devMode = !!config.devMode;
    }
    
    if (config.errorReportingUrl) {
      this.errorReportingUrl = config.errorReportingUrl;
      this.shouldReportErrors = true;
    }
    
    if (config.shouldReportErrors !== undefined) {
      this.shouldReportErrors = !!config.shouldReportErrors;
    }
  }
  
  /**
   * Gibt alle protokollierten Fehler zurück
   * @returns {Array} Array von Fehlerobjekten
   */
  getErrorLog() {
    return [...this.errorLog];
  }
  
  /**
   * Löscht alle protokollierten Fehler
   */
  clearErrorLog() {
    this.errorLog = [];
  }
  
  /**
   * Behandelt einen Fehler und zeigt eine benutzerfreundliche Meldung an
   * @param {Error|string} error - Zu behandelnder Fehler
   * @param {string} userMessage - Benutzerfreundliche Meldung
   * @param {boolean} showToUser - Soll die Meldung dem Benutzer angezeigt werden?
   */
  handleError(error, userMessage = 'Es ist ein Fehler aufgetreten.', showToUser = true) {
    // Fehler protokollieren
    this.logError(userMessage, error);
    
    // Meldung anzeigen, falls gewünscht
    if (showToUser) {
      try {
        // Versuchen, uiService zu verwenden, falls verfügbar
        if (window.uiService) {
          window.uiService.error(userMessage);
        } else {
          // Fallback: Alert
          this._showErrorMessage(userMessage);
        }
      } catch (e) {
        // Fallback bei Fehlern
        this._showErrorMessage(userMessage);
      }
    }
  }
  
  /**
   * Zeigt eine benutzerfreundliche Fehlermeldung an
   * @param {string} message - Anzuzeigende Nachricht
   * @private
   */
  _showErrorMessage(message) {
    // Prüfen, ob bereits eine Fehlermeldung angezeigt wird
    let errorContainer = document.getElementById('error-message-container');
    
    if (!errorContainer) {
      // Container erstellen, falls nicht vorhanden
      errorContainer = document.createElement('div');
      errorContainer.id = 'error-message-container';
      errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background-color: #f44336;
        color: white;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        transition: transform 0.3s ease, opacity 0.3s ease;
        transform: translateY(-20px);
        opacity: 0;
      `;
      document.body.appendChild(errorContainer);
      
      // Animation starten
      setTimeout(() => {
        errorContainer.style.transform = 'translateY(0)';
        errorContainer.style.opacity = '1';
      }, 10);
      
      // Schließen-Button hinzufügen
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;';
      closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      `;
      closeButton.addEventListener('click', () => {
        this._hideErrorMessage(errorContainer);
      });
      errorContainer.appendChild(closeButton);
      
      // Content-Container erstellen
      const contentContainer = document.createElement('div');
      contentContainer.id = 'error-message-content';
      errorContainer.appendChild(contentContainer);
      
      // Automatisch ausblenden nach 5 Sekunden
      setTimeout(() => {
        this._hideErrorMessage(errorContainer);
      }, 5000);
    }
    
    // Nachricht in den Container einfügen
    document.getElementById('error-message-content').innerHTML = message;
  }
  
  /**
   * Versteckt eine Fehlermeldung
   * @param {HTMLElement} container - Fehler-Container
   * @private
   */
  _hideErrorMessage(container) {
    // Animation zum Ausblenden
    container.style.transform = 'translateY(-20px)';
    container.style.opacity = '0';
    
    // Nach Abschluss der Animation entfernen
    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 300);
  }
}

// Eine Singleton-Instanz des ErrorHandler erstellen
const errorHandler = new ErrorHandler();

// Handler exportieren
export { errorHandler };