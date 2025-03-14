/**
 * UI Service
 * 
 * Bietet Funktionen für UI-Interaktionen, Benachrichtigungen,
 * Modals, Toasts und andere UI-Komponenten für ein einheitliches
 * Benutzererlebnis auf der gesamten Website.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

import { errorHandler } from '../utils/error-handler.js';

/**
 * UI Service Klasse
 */
class UIService {
  /**
   * Erstellt eine neue UIService-Instanz
   */
  constructor() {
    this.toastContainer = null;
    this.modalContainer = null;
    this.activeModals = [];
    this.init();
  }
  
  /**
   * Initialisiert den UI-Service
   */
  init() {
    // Beim DOM-Ready initialisieren
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setup());
    } else {
      this._setup();
    }
  }
  
  /**
   * Richtet die UI-Container ein
   * @private
   */
  _setup() {
    // Toast-Container erstellen
    if (!document.getElementById('toast-container')) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    } else {
      this.toastContainer = document.getElementById('toast-container');
    }
    
    // Modal-Container erstellen
    if (!document.getElementById('modal-container')) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.id = 'modal-container';
      this.modalContainer.className = 'modal-container';
      document.body.appendChild(this.modalContainer);
    } else {
      this.modalContainer = document.getElementById('modal-container');
    }
    
    // Globale Klick-Listener für modales Schließen
    document.addEventListener('click', (event) => {
      if (event.target.matches('.modal-backdrop') || event.target.matches('.modal-close')) {
        const modalId = event.target.closest('.modal-wrapper')?.id?.replace('-wrapper', '') || '';
        if (modalId) {
          this.closeModal(modalId);
        }
      }
    });
    
    // ESC-Taste zum Schließen von Modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.activeModals.length > 0) {
        this.closeModal(this.activeModals[this.activeModals.length - 1]);
      }
    });
  }
  
  /**
   * Zeigt eine Benachrichtigung (Toast) an
   * @param {string|Object} message - Nachrichtentext oder Konfigurationsobjekt
   * @param {string} type - Typ der Benachrichtigung (success, error, warning, info)
   * @param {number} duration - Anzeigedauer in Millisekunden
   * @returns {HTMLElement} Toast-Element
   */
  showToast(message, type = 'info', duration = 3000) {
    // Einfache Nachricht in Konfigurationsobjekt umwandeln
    const config = typeof message === 'object' ? message : {
      message: message,
      type: type,
      duration: duration
    };
    
    // Toast-Element erstellen
    const toast = document.createElement('div');
    toast.className = `toast toast-${config.type || 'info'}`;
    toast.setAttribute('role', 'alert');
    
    // Toast-Inhalt erstellen
    const content = document.createElement('div');
    content.className = 'toast-content';
    
    // Symbol je nach Typ
    let iconSVG = '';
    switch (config.type) {
      case 'success':
        iconSVG = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>';
        break;
      case 'error':
        iconSVG = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>';
        break;
      case 'warning':
        iconSVG = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2L1 21h22L12 2zm0 15h-2v2h2v-2zm0-8h-2v6h2V9z"></path></svg>';
        break;
      default: // info
        iconSVG = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>';
    }
    
    // Icon-Element erstellen
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.innerHTML = iconSVG;
    content.appendChild(icon);
    
    // Nachrichtentext hinzufügen
    const messageElement = document.createElement('div');
    messageElement.className = 'toast-message';
    messageElement.innerHTML = config.message;
    content.appendChild(messageElement);
    
    toast.appendChild(content);
    
    // Schließen-Button hinzufügen
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>';
    closeButton.addEventListener('click', () => this.removeToast(toast));
    toast.appendChild(closeButton);
    
    // Toast zum Container hinzufügen
    if (this.toastContainer) {
      this.toastContainer.appendChild(toast);
    } else {
      document.body.appendChild(toast);
    }
    
    // Animation starten
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Nach Ablauf der Zeit automatisch entfernen
    if (config.duration !== -1) {
      toast.timeoutId = setTimeout(() => {
        this.removeToast(toast);
      }, config.duration);
    }
    
    return toast;
  }
  
  /**
   * Entfernt einen Toast
   * @param {HTMLElement} toast - Zu entfernendes Toast-Element
   */
  removeToast(toast) {
    // Timeout löschen, falls vorhanden
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    
    // Animation zum Ausblenden
    toast.classList.remove('show');
    
    // Nach Abschluss der Animation entfernen
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  /**
   * Zeigt eine Erfolgsbenachrichtigung an
   * @param {string} message - Nachrichtentext
   * @param {number} duration - Anzeigedauer in Millisekunden
   * @returns {HTMLElement} Toast-Element
   */
  success(message, duration = 3000) {
    return this.showToast(message, 'success', duration);
  }
  
  /**
   * Zeigt eine Fehlerbenachrichtigung an
   * @param {string} message - Nachrichtentext
   * @param {number} duration - Anzeigedauer in Millisekunden
   * @returns {HTMLElement} Toast-Element
   */
  error(message, duration = 5000) {
    return this.showToast(message, 'error', duration);
  }
  
  /**
   * Zeigt eine Warnbenachrichtigung an
   * @param {string} message - Nachrichtentext
   * @param {number} duration - Anzeigedauer in Millisekunden
   * @returns {HTMLElement} Toast-Element
   */
  warning(message, duration = 4000) {
    return this.showToast(message, 'warning', duration);
  }
  
  /**
   * Zeigt eine Informationsbenachrichtigung an
   * @param {string} message - Nachrichtentext
   * @param {number} duration - Anzeigedauer in Millisekunden
   * @returns {HTMLElement} Toast-Element
   */
  info(message, duration = 3000) {
    return this.showToast(message, 'info', duration);
  }
  
  /**
   * Öffnet ein Modal-Fenster
   * @param {string|Object} options - Modal-ID oder Konfigurationsobjekt
   * @returns {string} ID des geöffneten Modals
   */
  openModal(options) {
    try {
      // Einfache ID in Konfigurationsobjekt umwandeln
      const config = typeof options === 'string' ? { id: options } : options;
      
      // Modal-ID generieren
      const modalId = config.id || `modal-${Date.now()}`;
      
      // Prüfen, ob ein Modal mit dieser ID bereits existiert
      const existingModal = document.getElementById(modalId);
      if (existingModal) {
        // Vorhandenes Modal anzeigen
        existingModal.classList.add('active');
        document.getElementById(`${modalId}-wrapper`).classList.add('active');
        document.body.classList.add('modal-open');
        
        // Zur aktiven Modal-Liste hinzufügen, falls noch nicht vorhanden
        if (!this.activeModals.includes(modalId)) {
          this.activeModals.push(modalId);
        }
        
        return modalId;
      }
      
      // Neues Modal erstellen
      const modalWrapper = document.createElement('div');
      modalWrapper.className = 'modal-wrapper';
      modalWrapper.id = `${modalId}-wrapper`;
      
      // Modal-Backdrop (Hintergrund) erstellen
      const modalBackdrop = document.createElement('div');
      modalBackdrop.className = 'modal-backdrop';
      modalWrapper.appendChild(modalBackdrop);
      
      // Modal-Dialog erstellen
      const modalDialog = document.createElement('div');
      modalDialog.className = `modal-dialog ${config.size || ''}`;
      
      // Modal-Inhalt erstellen
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = modalId;
      
      // Modal-Header erstellen, falls Titel angegeben
      if (config.title) {
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalTitle = document.createElement('h3');
        modalTitle.className = 'modal-title';
        modalTitle.innerHTML = config.title;
        modalHeader.appendChild(modalTitle);
        
        // Schließen-Button hinzufügen
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>';
        modalHeader.appendChild(closeButton);
        
        modal.appendChild(modalHeader);
      }
      
      // Modal-Body erstellen
      const modalBody = document.createElement('div');
      modalBody.className = 'modal-body';
      
      // Inhalt einfügen: HTML-String, DOM-Element oder auszuführende Funktion
      if (typeof config.content === 'string') {
        modalBody.innerHTML = config.content;
      } else if (config.content instanceof HTMLElement) {
        modalBody.appendChild(config.content);
      } else if (typeof config.content === 'function') {
        const content = config.content(modal);
        if (content instanceof HTMLElement) {
          modalBody.appendChild(content);
        } else if (typeof content === 'string') {
          modalBody.innerHTML = content;
        }
      }
      
      modal.appendChild(modalBody);
      
      // Modal-Footer erstellen, falls Buttons angegeben
      if (config.buttons && Array.isArray(config.buttons) && config.buttons.length > 0) {
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        // Buttons hinzufügen
        config.buttons.forEach(button => {
          const buttonElement = document.createElement('button');
          buttonElement.className = `btn ${button.className || ''}`;
          buttonElement.innerHTML = button.text || 'OK';
          
          if (button.close) {
            buttonElement.setAttribute('data-close-modal', 'true');
          }
          
          if (button.onClick && typeof button.onClick === 'function') {
            buttonElement.addEventListener('click', (event) => {
              const result = button.onClick(event, modal);
              
              // Modal automatisch schließen, wenn onClick true zurückgibt oder close=true ist
              if (result === true || button.close) {
                this.closeModal(modalId);
              }
            });
          } else if (button.close) {
            buttonElement.addEventListener('click', () => this.closeModal(modalId));
          }
          
          modalFooter.appendChild(buttonElement);
        });
        
        modal.appendChild(modalFooter);
      }
      
      modalDialog.appendChild(modal);
      modalWrapper.appendChild(modalDialog);
      
      // Modal zum Container hinzufügen
      if (this.modalContainer) {
        this.modalContainer.appendChild(modalWrapper);
      } else {
        document.body.appendChild(modalWrapper);
      }
      
      // Animation starten
      setTimeout(() => {
        modalWrapper.classList.add('active');
        document.body.classList.add('modal-open');
      }, 10);
      
      // Zur aktiven Modal-Liste hinzufügen
      this.activeModals.push(modalId);
      
      // onOpen-Callback aufrufen, falls angegeben
      if (config.onOpen && typeof config.onOpen === 'function') {
        setTimeout(() => {
          config.onOpen(modal);
        }, 300);
      }
      
      return modalId;
    } catch (error) {
      errorHandler.logError('Fehler beim Öffnen des Modals:', error);
      return null;
    }
  }
  
  /**
   * Schließt ein Modal-Fenster
   * @param {string} modalId - ID des zu schließenden Modals
   * @returns {boolean} True bei Erfolg
   */
  closeModal(modalId) {
    try {
      const modal = document.getElementById(modalId);
      if (!modal) return false;
      
      const modalWrapper = document.getElementById(`${modalId}-wrapper`);
      if (!modalWrapper) return false;
      
      // Animation zum Ausblenden
      modalWrapper.classList.remove('active');
      
      // Modal aus der aktiven Liste entfernen
      this.activeModals = this.activeModals.filter(id => id !== modalId);
      
      // Body-Klasse entfernen, wenn keine Modals mehr aktiv sind
      if (this.activeModals.length === 0) {
        document.body.classList.remove('modal-open');
      }
      
      // Nach Abschluss der Animation entfernen
      setTimeout(() => {
        if (modalWrapper.parentNode) {
          modalWrapper.parentNode.removeChild(modalWrapper);
        }
      }, 300);
      
      return true;
    } catch (error) {
      errorHandler.logError(`Fehler beim Schließen des Modals ${modalId}:`, error);
      return false;
    }
  }
  
  /**
   * Öffnet ein Bestätigungsdialog
   * @param {string|Object} options - Nachricht oder Konfigurationsobjekt
   * @returns {Promise<boolean>} True bei Bestätigung, False bei Abbruch
   */
  confirm(options) {
    return new Promise((resolve) => {
      // Einfache Nachricht in Konfigurationsobjekt umwandeln
      const config = typeof options === 'string' ? { message: options } : options;
      
      const modalConfig = {
        id: config.id || 'confirm-dialog',
        title: config.title || 'Bestätigung',
        content: config.message || 'Möchten Sie fortfahren?',
        buttons: [
          {
            text: config.cancelText || 'Abbrechen',
            className: 'btn-secondary',
            close: true,
            onClick: () => {
              resolve(false);
              return true;
            }
          },
          {
            text: config.confirmText || 'OK',
            className: 'btn-primary',
            close: true,
            onClick: () => {
              resolve(true);
              return true;
            }
          }
        ]
      };
      
      this.openModal(modalConfig);
    });
  }
  
  /**
   * Öffnet ein Eingabedialog
   * @param {string|Object} options - Nachricht oder Konfigurationsobjekt
   * @returns {Promise<string|null>} Eingegebener Text oder null bei Abbruch
   */
  prompt(options) {
    return new Promise((resolve) => {
      // Einfache Nachricht in Konfigurationsobjekt umwandeln
      const config = typeof options === 'string' ? { message: options } : options;
      
      const inputId = `prompt-input-${Date.now()}`;
      
      const content = `
        <div class="modal-prompt">
          <p>${config.message || 'Bitte geben Sie einen Wert ein:'}</p>
          <input type="text" id="${inputId}" class="form-control" 
            value="${config.defaultValue || ''}" 
            placeholder="${config.placeholder || ''}"
            ${config.required ? 'required' : ''}>
        </div>
      `;
      
      const modalConfig = {
        id: config.id || 'prompt-dialog',
        title: config.title || 'Eingabe',
        content: content,
        buttons: [
          {
            text: config.cancelText || 'Abbrechen',
            className: 'btn-secondary',
            close: true,
            onClick: () => {
              resolve(null);
              return true;
            }
          },
          {
            text: config.confirmText || 'OK',
            className: 'btn-primary',
            close: false,
            onClick: () => {
              const input = document.getElementById(inputId);
              const value = input.value.trim();
              
              if (config.required && !value) {
                input.classList.add('error');
                return false;
              }
              
              resolve(value);
              return true;
            }
          }
        ],
        onOpen: (modal) => {
          const input = document.getElementById(inputId);
          if (input) {
            input.focus();
            
            // Enter-Taste abfangen
            input.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') {
                const value = input.value.trim();
                
                if (config.required && !value) {
                  input.classList.add('error');
                  return;
                }
                
                resolve(value);
                this.closeModal(config.id || 'prompt-dialog');
              }
            });
          }
        }
      };
      
      this.openModal(modalConfig);
    });
  }
  
  /**
   * Zeigt einen Ladeindikator an
   * @param {string|Object} options - Nachricht oder Konfigurationsobjekt
   * @returns {string} ID des Ladeindikators
   */
  showLoader(options = {}) {
    // Einfache Nachricht in Konfigurationsobjekt umwandeln
    const config = typeof options === 'string' ? { message: options } : options;
    
    const loaderId = config.id || `loader-${Date.now()}`;
    
    // Loader-Element erstellen
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.id = loaderId;
    
    // Loader-Inhalt erstellen
    const loaderContent = document.createElement('div');
    loaderContent.className = 'loader-content';
    
    // Spinner erstellen
    const spinner = document.createElement('div');
    spinner.className = 'loader-spinner';
    spinner.innerHTML = `
      <svg viewBox="0 0 24 24" width="40" height="40">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
      </svg>
    `;
    loaderContent.appendChild(spinner);
    
    // Nachricht hinzufügen, falls angegeben
    if (config.message) {
      const message = document.createElement('div');
      message.className = 'loader-message';
      message.innerHTML = config.message;
      loaderContent.appendChild(message);
    }
    
    loader.appendChild(loaderContent);
    
    // Loader zum Dokument hinzufügen
    document.body.appendChild(loader);
    
    // Animation starten
    setTimeout(() => {
      loader.classList.add('active');
      document.body.classList.add('loader-active');
    }, 10);
    
    return loaderId;
  }
  
  /**
   * Versteckt einen Ladeindikator
   * @param {string} loaderId - ID des zu versteckenden Ladeindikators
   */
  hideLoader(loaderId) {
    const loader = document.getElementById(loaderId);
    if (!loader) return;
    
    // Animation zum Ausblenden
    loader.classList.remove('active');
    
    // Nach Abschluss der Animation entfernen
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
      
      // Prüfen, ob noch weitere Loader aktiv sind
      const activeLoaders = document.querySelectorAll('.loader-overlay.active');
      if (activeLoaders.length === 0) {
        document.body.classList.remove('loader-active');
      }
    }, 300);
  }
  
  /**
   * Zeigt eine nützliche Hilfebox an
   * @param {string|HTMLElement} target - Zielelement oder CSS-Selektor
   * @param {string|Object} options - Inhalt oder Konfigurationsobjekt
   * @returns {HTMLElement} Tooltip-Element
   */
  showTooltip(target, options = {}) {
    try {
      // Zielelement finden
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      
      if (!element) {
        console.warn(`Zielelement für Tooltip nicht gefunden: ${target}`);
        return null;
      }
      
      // Einfachen Inhalt in Konfigurationsobjekt umwandeln
      const config = typeof options === 'string' ? { content: options } : options;
      
      // Eindeutige ID für den Tooltip generieren
      const tooltipId = config.id || `tooltip-${Date.now()}`;
      
      // Vorhandenen Tooltip entfernen
      const existingTooltip = document.getElementById(tooltipId);
      if (existingTooltip) {
        existingTooltip.parentNode.removeChild(existingTooltip);
      }
      
      // Tooltip erstellen
      const tooltip = document.createElement('div');
      tooltip.className = `tooltip ${config.className || ''}`;
      tooltip.id = tooltipId;
      
      // Tooltip-Inhalt setzen
      tooltip.innerHTML = config.content || '';
      
      // Tooltip zum Dokument hinzufügen
      document.body.appendChild(tooltip);
      
      // Position des Tooltips berechnen
      const updatePosition = () => {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        const position = config.position || 'top';
        
        let top, left;
        
        switch (position) {
          case 'top':
            top = elementRect.top - tooltipRect.height - 8;
            left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
            break;
          case 'bottom':
            top = elementRect.bottom + 8;
            left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
            break;
          case 'left':
            top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
            left = elementRect.left - tooltipRect.width - 8;
            break;
          case 'right':
            top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
            left = elementRect.right + 8;
            break;
        }
        
        // Sicherstellen, dass der Tooltip im sichtbaren Bereich bleibt
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 0) left = 0;
        if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width;
        
        if (top < 0) top = 0;
        if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height;
        
        // Position setzen
        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
        
        // CSS-Klasse für die Richtung setzen
        tooltip.className = `tooltip ${config.className || ''} tooltip-${position}`;
      };
      
      // Initial positionieren
      updatePosition();
      
      // Tooltip anzeigen
      setTimeout(() => {
        tooltip.classList.add('active');
      }, 10);
      
      // Event-Listener für Fenstergrößenänderungen
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      // Tooltip automatisch schließen
      if (config.duration !== -1) {
        setTimeout(() => {
          this.hideTooltip(tooltipId);
        }, config.duration || 3000);
      }
      
      // Tooltip-Objekt mit Methode zum Schließen zurückgeben
      tooltip.hide = () => this.hideTooltip(tooltipId);
      
      return tooltip;
    } catch (error) {
      errorHandler.logError('Fehler beim Anzeigen des Tooltips:', error);
      return null;
    }
  }
  
  /**
   * Versteckt einen Tooltip
   * @param {string} tooltipId - ID des zu versteckenden Tooltips
   */
  hideTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (!tooltip) return;
    
    // Animation zum Ausblenden
    tooltip.classList.remove('active');
    
    // Nach Abschluss der Animation entfernen
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 300);
  }
  
  /**
   * Zeigt eine Benachrichtigung im oberen Teil des Bildschirms an
   * @param {string|Object} options - Benachrichtigungstext oder Konfigurationsobjekt
   * @returns {HTMLElement} Benachrichtigungselement
   */
  showNotification(options) {
    // Einfachen Text in Konfigurationsobjekt umwandeln
    const config = typeof options === 'string' ? { message: options } : options;
    
    // Notification-Container erstellen, falls nicht vorhanden
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
    
    // Notification erstellen
    const notification = document.createElement('div');
    notification.className = `notification ${config.type || 'info'}`;
    
    // Notification-Inhalt erstellen
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    // Titel hinzufügen, falls angegeben
    if (config.title) {
      const title = document.createElement('div');
      title.className = 'notification-title';
      title.innerHTML = config.title;
      content.appendChild(title);
    }
    
    // Nachricht hinzufügen
    const message = document.createElement('div');
    message.className = 'notification-message';
    message.innerHTML = config.message || '';
    content.appendChild(message);
    
    notification.appendChild(content);
    
    // Schließen-Button hinzufügen
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>';
    closeButton.addEventListener('click', () => this.removeNotification(notification));
    notification.appendChild(closeButton);
    
    // Notification zum Container hinzufügen
    notificationContainer.appendChild(notification);
    
    // Animation starten
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Nach Ablauf der Zeit automatisch entfernen
    if (config.duration !== -1) {
      notification.timeoutId = setTimeout(() => {
        this.removeNotification(notification);
      }, config.duration || 5000);
    }
    
    return notification;
  }
  
  /**
   * Entfernt eine Benachrichtigung
   * @param {HTMLElement} notification - Zu entfernende Benachrichtigung
   */
  removeNotification(notification) {
    // Timeout löschen, falls vorhanden
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
    
    // Animation zum Ausblenden
    notification.classList.remove('show');
    
    // Nach Abschluss der Animation entfernen
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  /**
   * Aktiviert/deaktiviert einen Darkmode
   * @param {boolean} enable - True zum Aktivieren, False zum Deaktivieren
   * @param {boolean} persist - Soll die Einstellung gespeichert werden?
   */
  toggleDarkMode(enable, persist = true) {
    if (enable) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    if (persist) {
      localStorage.setItem('darkMode', enable ? 'enabled' : 'disabled');
    }
    
    // Custom Event auslösen
    document.dispatchEvent(new CustomEvent('darkModeChange', { detail: { enabled: enable } }));
  }
  
  /**
   * Prüft, ob der Darkmode aktiviert ist
   * @returns {boolean} True, wenn Darkmode aktiv ist
   */
  isDarkModeEnabled() {
    return document.body.classList.contains('dark-mode');
  }
  
  /**
   * Lädt die Darkmode-Einstellung aus dem lokalen Speicher
   */
  loadDarkModePreference() {
    const savedPreference = localStorage.getItem('darkMode');
    
    if (savedPreference === 'enabled') {
      this.toggleDarkMode(true, false);
    } else if (savedPreference === 'disabled') {
      this.toggleDarkMode(false, false);
    } else {
      // Systemeinstellung prüfen
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.toggleDarkMode(prefersDarkMode, false);
      
      // Auf Änderungen der Systemeinstellung reagieren
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Nur reagieren, wenn keine benutzerdefinierte Einstellung vorhanden ist
        if (!localStorage.getItem('darkMode')) {
          this.toggleDarkMode(e.matches, false);
        }
      });
    }
  }
  
  /**
   * Aktiviert/deaktiviert einen Fullscreen-Modus
   * @param {HTMLElement} element - Element für Vollbildmodus (oder null für ganzes Dokument)
   * @returns {Promise<boolean>} True bei Erfolg
   */
  async toggleFullscreen(element = null) {
    try {
      const doc = window.document;
      const docEl = element || doc.documentElement;
      
      if (!doc.fullscreenElement && !doc.mozFullScreenElement &&
          !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        // Vollbildmodus aktivieren
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        return true;
      } else {
        // Vollbildmodus beenden
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
        return false;
      }
    } catch (error) {
      errorHandler.logError('Fehler beim Umschalten des Vollbildmodus:', error);
      return false;
    }
  }
  
  /**
   * Scrollt sanft zu einem Element
   * @param {string|HTMLElement} target - Zielelement oder CSS-Selektor
   * @param {Object} options - Scroll-Optionen
   * @returns {boolean} True bei Erfolg
   */
  scrollTo(target, options = {}) {
    try {
      // Zielelement finden
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      
      if (!element) {
        console.warn(`Zielelement für Scroll nicht gefunden: ${target}`);
        return false;
      }
      
      // Standardoptionen
      const defaultOptions = {
        behavior: 'smooth',
        offset: 0,
        callback: null,
        duration: 500
      };
      
      const scrollOptions = { ...defaultOptions, ...options };
      
      // Native Scroll-API verwenden, falls unterstützt
      if ('scrollBehavior' in document.documentElement.style && !scrollOptions.callback) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - scrollOptions.offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: scrollOptions.behavior
        });
        
        return true;
      }
      
      // Fallback für ältere Browser oder mit Callback
      const startPosition = window.pageYOffset;
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - scrollOptions.offset;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();
      
      const animateScroll = (currentTime) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / scrollOptions.duration, 1);
        
        // Easing-Funktion (ease-in-out)
        const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        window.scrollTo(0, startPosition + distance * easeInOut(progress));
        
        if (timeElapsed < scrollOptions.duration) {
          requestAnimationFrame(animateScroll);
        } else if (scrollOptions.callback && typeof scrollOptions.callback === 'function') {
          scrollOptions.callback();
        }
      };
      
      requestAnimationFrame(animateScroll);
      return true;
    } catch (error) {
      errorHandler.logError('Fehler beim Scrollen:', error);
      return false;
    }
  }
}

// Eine Singleton-Instanz des UIService erstellen
const uiService = new UIService();

// Service exportieren
export default uiService;