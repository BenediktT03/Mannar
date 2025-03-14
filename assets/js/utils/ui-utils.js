 /**
 * UI Utilities
 * 
 * Sammlung von Hilfsfunktionen für UI-Interaktionen und DOM-Manipulation.
 * Diese Funktionen werden in verschiedenen Komponenten und Services verwendet.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

import { errorHandler } from './error-handler.js';

/**
 * Aktiviert/deaktiviert ein Element
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {boolean} enabled - Aktivieren (true) oder deaktivieren (false)
 * @param {boolean} hideOnDisable - Element ausblenden, wenn deaktiviert
 */
export function toggleElement(selector, enabled, hideOnDisable = false) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    if (enabled) {
      element.removeAttribute('disabled');
      element.classList.remove('disabled');
      if (hideOnDisable) {
        element.classList.remove('hidden');
      }
    } else {
      element.setAttribute('disabled', 'disabled');
      element.classList.add('disabled');
      if (hideOnDisable) {
        element.classList.add('hidden');
      }
    }
  } catch (error) {
    errorHandler.logError('Fehler beim Umschalten des Elements:', error);
  }
}

/**
 * Zeigt/versteckt ein Element
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {boolean} visible - Anzeigen (true) oder verstecken (false)
 * @param {string} displayType - CSS display-Typ, wenn angezeigt
 */
export function toggleVisibility(selector, visible, displayType = 'block') {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    if (visible) {
      element.style.display = displayType;
    } else {
      element.style.display = 'none';
    }
  } catch (error) {
    errorHandler.logError('Fehler beim Umschalten der Sichtbarkeit:', error);
  }
}

/**
 * Fügt eine CSS-Klasse zu einem Element hinzu oder entfernt sie
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {string} className - Hinzuzufügende/zu entfernende CSS-Klasse
 * @param {boolean} add - Klasse hinzufügen (true) oder entfernen (false)
 */
export function toggleClass(selector, className, add) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    if (add) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  } catch (error) {
    errorHandler.logError('Fehler beim Umschalten der CSS-Klasse:', error);
  }
}

/**
 * Animiert ein Element
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {string} animationName - Name der Animation
 * @param {Function} callback - Callback nach Abschluss der Animation
 */
export function animateElement(selector, animationName, callback) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    // Animation-Klasse hinzufügen
    element.classList.add('animated', animationName);
    
    // Event-Listener für Animationsende
    const handleAnimationEnd = () => {
      element.classList.remove('animated', animationName);
      element.removeEventListener('animationend', handleAnimationEnd);
      
      if (callback && typeof callback === 'function') {
        callback(element);
      }
    };
    
    element.addEventListener('animationend', handleAnimationEnd);
  } catch (error) {
    errorHandler.logError('Fehler bei der Element-Animation:', error);
  }
}

/**
 * Führt eine Fade-In-Animation für ein Element durch
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {number} duration - Animationsdauer in Millisekunden
 * @param {Function} callback - Callback nach Abschluss der Animation
 */
export function fadeIn(selector, duration = 300, callback) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    // Anfangsstil
    element.style.opacity = '0';
    element.style.display = 'block';
    
    // Übergangseffekt aktivieren
    element.style.transition = `opacity ${duration}ms ease`;
    
    // Animation im nächsten Frame starten
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
    
    // Callback nach Abschluss der Animation
    setTimeout(() => {
      element.style.transition = '';
      
      if (callback && typeof callback === 'function') {
        callback(element);
      }
    }, duration);
  } catch (error) {
    errorHandler.logError('Fehler bei der Fade-In-Animation:', error);
  }
}

/**
 * Führt eine Fade-Out-Animation für ein Element durch
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {number} duration - Animationsdauer in Millisekunden
 * @param {Function} callback - Callback nach Abschluss der Animation
 */
export function fadeOut(selector, duration = 300, callback) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    // Anfangsstil
    element.style.opacity = '1';
    
    // Übergangseffekt aktivieren
    element.style.transition = `opacity ${duration}ms ease`;
    
    // Animation im nächsten Frame starten
    requestAnimationFrame(() => {
      element.style.opacity = '0';
    });
    
    // Callback nach Abschluss der Animation
    setTimeout(() => {
      element.style.display = 'none';
      element.style.transition = '';
      
      if (callback && typeof callback === 'function') {
        callback(element);
      }
    }, duration);
  } catch (error) {
    errorHandler.logError('Fehler bei der Fade-Out-Animation:', error);
  }
}

/**
 * Führt eine sanfte Slide-Down-Animation durch
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {number} duration - Animationsdauer in Millisekunden
 * @param {Function} callback - Callback nach Abschluss der Animation
 */
export function slideDown(selector, duration = 300, callback) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    // Elementhöhe ermitteln
    element.style.display = 'block';
    element.style.height = 'auto';
    const height = element.offsetHeight;
    
    // Anfangsstil
    element.style.overflow = 'hidden';
    element.style.height = '0px';
    element.style.paddingTop = '0px';
    element.style.paddingBottom = '0px';
    element.style.marginTop = '0px';
    element.style.marginBottom = '0px';
    
    // Übergangseffekt aktivieren
    element.style.transition = `height ${duration}ms ease, 
                               padding ${duration}ms ease, 
                               margin ${duration}ms ease`;
    
    // Animation im nächsten Frame starten
    requestAnimationFrame(() => {
      element.style.height = `${height}px`;
      element.style.paddingTop = '';
      element.style.paddingBottom = '';
      element.style.marginTop = '';
      element.style.marginBottom = '';
    });
    
    // Callback nach Abschluss der Animation
    setTimeout(() => {
      element.style.height = 'auto';
      element.style.overflow = '';
      element.style.transition = '';
      
      if (callback && typeof callback === 'function') {
        callback(element);
      }
    }, duration);
  } catch (error) {
    errorHandler.logError('Fehler bei der Slide-Down-Animation:', error);
  }
}

/**
 * Führt eine sanfte Slide-Up-Animation durch
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {number} duration - Animationsdauer in Millisekunden
 * @param {Function} callback - Callback nach Abschluss der Animation
 */
export function slideUp(selector, duration = 300, callback) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    // Anfangsstil
    element.style.overflow = 'hidden';
    element.style.height = `${element.offsetHeight}px`;
    
    // Übergangseffekt aktivieren
    element.style.transition = `height ${duration}ms ease, 
                               padding ${duration}ms ease, 
                               margin ${duration}ms ease`;
    
    // Animation im nächsten Frame starten
    requestAnimationFrame(() => {
      element.style.height = '0px';
      element.style.paddingTop = '0px';
      element.style.paddingBottom = '0px';
      element.style.marginTop = '0px';
      element.style.marginBottom = '0px';
    });
    
    // Callback nach Abschluss der Animation
    setTimeout(() => {
      element.style.display = 'none';
      element.style.overflow = '';
      element.style.height = '';
      element.style.paddingTop = '';
      element.style.paddingBottom = '';
      element.style.marginTop = '';
      element.style.marginBottom = '';
      element.style.transition = '';
      
      if (callback && typeof callback === 'function') {
        callback(element);
      }
    }, duration);
  } catch (error) {
    errorHandler.logError('Fehler bei der Slide-Up-Animation:', error);
  }
}

/**
 * Wechselt zwischen Slide-Down und Slide-Up Animationen
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {number} duration - Animationsdauer in Millisekunden
 * @param {Function} callback - Callback nach Abschluss der Animation
 */
export function slideToggle(selector, duration = 300, callback) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    const isHidden = window.getComputedStyle(element).display === 'none';
    
    if (isHidden) {
      slideDown(element, duration, callback);
    } else {
      slideUp(element, duration, callback);
    }
  } catch (error) {
    errorHandler.logError('Fehler bei der Slide-Toggle-Animation:', error);
  }
}

/**
 * Erstellt ein DOM-Element mit Attributen und Kindern
 * @param {string} tag - HTML-Tag des zu erstellenden Elements
 * @param {Object} attributes - Objekt mit Attributen für das Element
 * @param {Array|Node|string} children - Kind-Element(e) oder Textinhalt
 * @returns {HTMLElement} Erstelltes DOM-Element
 */
export function createElement(tag, attributes = {}, children = null) {
  try {
    const element = document.createElement(tag);
    
    // Attribute setzen
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        if (key === 'style' && typeof attributes[key] === 'object') {
          // Stil-Objekt verarbeiten
          Object.assign(element.style, attributes[key]);
        } else if (key === 'classList' && Array.isArray(attributes[key])) {
          // Klassen-Array verarbeiten
          element.classList.add(...attributes[key]);
        } else if (key === 'dataset' && typeof attributes[key] === 'object') {
          // Dataset-Objekt verarbeiten
          Object.assign(element.dataset, attributes[key]);
        } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
          // Event-Listener
          const eventName = key.substring(2).toLowerCase();
          element.addEventListener(eventName, attributes[key]);
        } else {
          // Normales Attribut
          element.setAttribute(key, attributes[key]);
        }
      }
    }
    
    // Kinder hinzufügen
    if (children !== null) {
      if (Array.isArray(children)) {
        // Array von Kindern
        children.forEach(child => {
          if (child) {
            if (typeof child === 'string') {
              element.appendChild(document.createTextNode(child));
            } else {
              element.appendChild(child);
            }
          }
        });
      } else if (typeof children === 'string') {
        // Textinhalt
        element.textContent = children;
      } else {
        // Einzelnes Kind-Element
        element.appendChild(children);
      }
    }
    
    return element;
  } catch (error) {
    errorHandler.logError('Fehler beim Erstellen des Elements:', error);
    return document.createElement(tag);
  }
}

/**
 * Entfernt alle Kind-Elemente eines Elements
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 */
export function removeAllChildren(selector) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  } catch (error) {
    errorHandler.logError('Fehler beim Entfernen aller Kinder:', error);
  }
}

/**
 * Delegiert Events für dynamisch hinzugefügte Elemente
 * @param {string|HTMLElement} container - Container-Selektor oder DOM-Element
 * @param {string} eventName - Name des Events (z.B. 'click')
 * @param {string} selector - Selektor für die Zielelemente
 * @param {Function} handler - Event-Handler
 */
export function delegateEvent(container, eventName, selector, handler) {
  try {
    const element = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!element) {
      console.warn(`Container-Element nicht gefunden: ${container}`);
      return;
    }
    
    element.addEventListener(eventName, function(event) {
      const targetElement = event.target.closest(selector);
      
      if (targetElement && element.contains(targetElement)) {
        handler.call(targetElement, event, targetElement);
      }
    });
  } catch (error) {
    errorHandler.logError('Fehler bei der Event-Delegation:', error);
  }
}

/**
 * Debounce-Funktion zur Ratenbegrenzung von Funktionsaufrufen
 * @param {Function} func - Auszuführende Funktion
 * @param {number} wait - Wartezeit in Millisekunden
 * @param {boolean} immediate - Sofort ausführen beim ersten Aufruf
 * @returns {Function} Debounced Funktion
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle-Funktion zur Begrenzung der Ausführungsrate einer Funktion
 * @param {Function} func - Auszuführende Funktion
 * @param {number} limit - Minimaler Abstand zwischen Ausführungen in Millisekunden
 * @returns {Function} Throttled Funktion
 */
export function throttle(func, limit = 300) {
  let lastCall = 0;
  
  return function executedFunction(...args) {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

/**
 * Fügt oder entfernt eine Klasse bei Hover
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {string} className - Hinzuzufügende Klasse
 */
export function addHoverClass(selector, className) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    element.addEventListener('mouseenter', () => {
      element.classList.add(className);
    });
    
    element.addEventListener('mouseleave', () => {
      element.classList.remove(className);
    });
  } catch (error) {
    errorHandler.logError('Fehler beim Hinzufügen der Hover-Klasse:', error);
  }
}

/**
 * Fügt Touch-Swipe-Erkennung zu einem Element hinzu
 * @param {string|HTMLElement} selector - Element-Selektor oder DOM-Element
 * @param {Object} callbacks - Callback-Funktionen für Swipe-Richtungen
 * @param {Object} options - Optionen für die Swipe-Erkennung
 */
export function addSwipeDetection(selector, callbacks = {}, options = {}) {
  try {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    
    if (!element) {
      console.warn(`Element nicht gefunden: ${selector}`);
      return;
    }
    
    const defaultOptions = {
      threshold: 50,
      restraint: 100,
      allowedTime: 300
    };
    
    const config = { ...defaultOptions, ...options };
    
    let startX, startY, startTime, distX, distY;
    
    element.addEventListener('touchstart', function(e) {
      const touchobj = e.changedTouches[0];
      startX = touchobj.pageX;
      startY = touchobj.pageY;
      startTime = new Date().getTime();
    }, { passive: true });
    
    element.addEventListener('touchend', function(e) {
      const touchobj = e.changedTouches[0];
      distX = touchobj.pageX - startX;
      distY = touchobj.pageY - startY;
      const elapsedTime = new Date().getTime() - startTime;
      
      // Prüfen, ob die Swipe-Gesten die Bedingungen erfüllen
      if (elapsedTime <= config.allowedTime) {
        // Horizontaler Swipe
        if (Math.abs(distX) >= config.threshold && Math.abs(distY) <= config.restraint) {
          if (distX > 0 && callbacks.right) {
            callbacks.right(e);
          } else if (distX < 0 && callbacks.left) {
            callbacks.left(e);
          }
        }
        // Vertikaler Swipe
        else if (Math.abs(distY) >= config.threshold && Math.abs(distX) <= config.restraint) {
          if (distY > 0 && callbacks.down) {
            callbacks.down(e);
          } else if (distY < 0 && callbacks.up) {
            callbacks.up(e);
          }
        }
      }
    }, { passive: true });
  } catch (error) {
    errorHandler.logError('Fehler bei der Swipe-Erkennung:', error);
  }
}

/**
 * Formatiert einen Betrag als Preis
 * @param {number} amount - Zu formatierender Betrag
 * @param {string} currency - Währungscode (z.B. 'EUR', 'USD')
 * @param {string} locale - Browser-Locale (z.B. 'de-DE', 'en-US')
 * @returns {string} Formatierter Preis
 */
export function formatPrice(amount, currency = 'EUR', locale = 'de-DE') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    errorHandler.logError('Fehler bei der Preisformatierung:', error);
    return `${amount} ${currency}`;
  }
}

/**
 * Formatiert ein Datum
 * @param {Date|string|number} date - Zu formatierendes Datum
 * @param {string} format - Datumsformat (z.B. 'short', 'medium', 'long', 'full')
 * @param {string} locale - Browser-Locale (z.B. 'de-DE', 'en-US')
 * @returns {string} Formatiertes Datum
 */
export function formatDate(date, format = 'medium', locale = 'de-DE') {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    switch (format) {
      case 'short':
        options.month = 'numeric';
        break;
      case 'medium':
        options.month = 'short';
        break;
      case 'long':
        options.month = 'long';
        options.weekday = 'long';
        break;
      case 'full':
        options.month = 'long';
        options.weekday = 'long';
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
      case 'time':
        delete options.year;
        delete options.month;
        delete options.day;
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
    }
    
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    errorHandler.logError('Fehler bei der Datumsformatierung:', error);
    return String(date);
  }
}

/**
 * Erstellt einen formattierten HTML-Text aus einem Markdown-ähnlichen Text
 * @param {string} text - Zu formatierender Text
 * @returns {string} HTML-formatierter Text
 */
export function formatText(text) {
  try {
    if (!text) return '';
    
    // Absätze erkennen (leere Zeilen)
    let html = text.replace(/\n\s*\n/g, '</p><p>');
    
    // Am Anfang und Ende <p> hinzufügen
    html = '<p>' + html + '</p>';
    
    // Fetter Text (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Kursiver Text (*text*)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Überschriften (# Überschrift)
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    
    // Links [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Listen erkennen (- Element)
    html = html.replace(/(<p>)?- (.*?)(<\/p>)?/g, (match, p1, content) => {
      return (p1 ? '<ul>' : '') + '<li>' + content + '</li>' + (p1 ? '</ul>' : '');
    });
    
    // Leere Listen-Tags korrigieren
    html = html.replace(/<\/ul><ul>/g, '');
    
    // Zeilenumbrüche
    html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');
    
    return html;
  } catch (error) {
    errorHandler.logError('Fehler bei der Textformatierung:', error);
    return text || '';
  }
}

/**
 * Trunkiert einen Text auf eine bestimmte Länge
 * @param {string} text - Zu trunkierender Text
 * @param {number} maxLength - Maximale Länge
 * @param {string} suffix - Suffix für trunkierten Text
 * @returns {string} Trunkierter Text
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  try {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    // Text an Wortgrenze trunkieren
    const truncated = text.substring(0, maxLength).trim();
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + suffix;
    }
    
    return truncated + suffix;
  } catch (error) {
    errorHandler.logError('Fehler bei der Texttrunkierung:', error);
    return text || '';
  }
}

/**
 * Kopiert Text in die Zwischenablage
 * @param {string} text - Zu kopierender Text
 * @returns {Promise<boolean>} True bei Erfolg
 */
export async function copyToClipboard(text) {
  try {
    // Moderne Clipboard API verwenden, falls verfügbar
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback für ältere Browser
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    return success;
  } catch (error) {
    errorHandler.logError('Fehler beim Kopieren in die Zwischenablage:', error);
    return false;
  }
}

/**
 * Generiert eine eindeutige ID
 * @param {string} prefix - Optionales Präfix für die ID
 * @returns {string} Eindeutige ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initialisiert LazyLoad für Bilder und iframes
 * @param {Object} options - Optionen für LazyLoad
 */
export function initLazyLoading(options = {}) {
  try {
    const defaultOptions = {
      rootMargin: '0px 0px 200px 0px',
      threshold: 0.1,
      loadedClass: 'loaded',
      loadingClass: 'loading',
      errorClass: 'error'
    };
    
    const config = { ...defaultOptions, ...options };
    
    // Intersection Observer nur erstellen, wenn er unterstützt wird
    if (!('IntersectionObserver' in window)) {
      // Fallback: Alle Bilder sofort laden
      loadAllLazyElements();
      return;
    }
    
    // Intersection Observer erstellen
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          element.classList.add(config.loadingClass);
          
          if (element.tagName === 'IMG') {
            // Lazy-Load für Bilder
            if (element.dataset.src) {
              element.src = element.dataset.src;
            }
            
            if (element.dataset.srcset) {
              element.srcset = element.dataset.srcset;
            }
            
            element.onload = () => {
              element.classList.remove(config.loadingClass);
              element.classList.add(config.loadedClass);
            };
            
            element.onerror = () => {
              element.classList.remove(config.loadingClass);
              element.classList.add(config.errorClass);
            };
          } else if (element.tagName === 'IFRAME') {
            // Lazy-Load für iframes
            if (element.dataset.src) {
              element.src = element.dataset.src;
              
              element.onload = () => {
                element.classList.remove(config.loadingClass);
                element.classList.add(config.loadedClass);
              };
              
              element.onerror = () => {
                element.classList.remove(config.loadingClass);
                element.classList.add(config.errorClass);
              };
            }
          } else if (element.dataset.background) {
            // Lazy-Load für Hintergrundbilder
            element.style.backgroundImage = `url(${element.dataset.background})`;
            
            // Dummy-Bild erstellen, um das Laden zu überwachen
            const img = new Image();
            img.src = element.dataset.background;
            
            img.onload = () => {
              element.classList.remove(config.loadingClass);
              element.classList.add(config.loadedClass);
            };
            
            img.onerror = () => {
              element.classList.remove(config.loadingClass);
              element.classList.add(config.errorClass);
            };
          }
          
          // Element nicht mehr beobachten
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });
    
    // Alle Lazy-Load-Elemente beobachten
    document.querySelectorAll('[data-src], [data-srcset], [data-background]').forEach(element => {
      observer.observe(element);
    });
    
    // Hilfsfunktion zum sofortigen Laden aller Elemente
    function loadAllLazyElements() {
      document.querySelectorAll('[data-src]').forEach(element => {
        element.src = element.dataset.src;
      });
      
      document.querySelectorAll('[data-srcset]').forEach(element => {
        element.srcset = element.dataset.srcset;
      });
      
      document.querySelectorAll('[data-background]').forEach(element => {
        element.style.backgroundImage = `url(${element.dataset.background})`;
      });
    }
  } catch (error) {
    errorHandler.logError('Fehler bei der Initialisierung des Lazy-Loadings:', error);
  }
}

/**
 * Initialisiert Smooth Scrolling für Anker-Links
 * @param {Object} options - Optionen für Smooth Scrolling
 */
export function initSmoothScrolling(options = {}) {
  try {
    const defaultOptions = {
      offset: 0,
      duration: 500,
      easing: 'easeInOutCubic'
    };
    
    const config = { ...defaultOptions, ...options };
    
    // Easing-Funktionen
    const easings = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };
    
    // Scroll-Funktion
    const scrollTo = (target, duration, callback) => {
      const startPosition = window.pageYOffset;
      const targetPosition = target - config.offset;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();
      
      const step = (currentTime) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easing = easings[config.easing] || easings.easeInOutCubic;
        
        window.scrollTo(0, startPosition + distance * easing(progress));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(step);
        } else if (callback && typeof callback === 'function') {
          callback();
        }
      };
      
      requestAnimationFrame(step);
    };
    
    // Event-Listener für Anker-Links
    document.addEventListener('click', event => {
      const target = event.target.closest('a');
      
      if (!target) return;
      
      // Nur interne Links mit Hash behandeln
      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      const id = href === '#' ? 'body' : href;
      const element = document.querySelector(id);
      
      if (!element) return;
      
      event.preventDefault();
      
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
      scrollTo(targetPosition, config.duration);
    });
  } catch (error) {
    errorHandler.logError('Fehler bei der Initialisierung des Smooth Scrollings:', error);
  }
}

/**
 * Erstellt eine Funktion, die höchstens einmal ausgeführt wird
 * @param {Function} func - Auszuführende Funktion
 * @returns {Function} Funktion, die höchstens einmal ausgeführt wird
 */
export function once(func) {
  let called = false;
  let result;
  
  return function(...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    
    return result;
  };
}

/**
 * Kombiniert mehrere Klassennamen zu einem String
 * @param {...string|Object|Array} classes - Klassennamen oder Objekte/Arrays mit Klassenbedingungen
 * @returns {string} Kombinierte Klassennamen
 */
export function classNames(...classes) {
  const result = [];
  
  classes.forEach(item => {
    if (!item) return;
    
    if (typeof item === 'string' || typeof item === 'number') {
      result.push(item);
    } else if (Array.isArray(item)) {
      result.push(classNames(...item));
    } else if (typeof item === 'object') {
      for (const key in item) {
        if (item.hasOwnProperty(key) && item[key]) {
          result.push(key);
        }
      }
    }
  });
  
  return result.join(' ');
}