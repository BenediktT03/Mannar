 /**
 * Einfaches Error-Handling für die Website
 */
window.errorHandler = {
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
  window.errorHandler.handleError(
    event.error || new Error(event.message), 
    'Unbehandelter Fehler'
  );
});

// Unbehandelte Promise-Ablehnungen abfangen
window.addEventListener('unhandledrejection', function(event) {
  window.errorHandler.handleError(
    event.reason || new Error('Unbehandelte Promise-Ablehnung'), 
    'Promise-Fehler'
  );
});