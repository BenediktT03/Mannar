 /**
 * ui-utils.js
 * Sammlung von UI-Hilfsfunktionen für konsistente Benutzerinteraktionen
 */

// DOM-Elemente cachen
const cachedElements = {};

/**
 * DOM-Element sicher abrufen und cachen
 * @param {string} selector CSS-Selektor oder Element-ID
 * @param {boolean} useCache Ob der Cache verwendet werden soll
 * @returns {Element|null} Das gefundene Element oder null
 */
export function getElement(selector, useCache = true) {
    // Wenn es sich um ein Element handelt, direkt zurückgeben
    if (selector instanceof Element) {
        return selector;
    }
    
    // Prüfen, ob das Element im Cache ist
    if (useCache && cachedElements[selector]) {
        return cachedElements[selector];
    }
    
    // Element abrufen (zuerst als ID, dann als Selektor)
    let element = null;
    
    if (selector.startsWith('#')) {
        element = document.getElementById(selector.substring(1));
    } else if (selector.startsWith('.')) {
        element = document.querySelector(selector);
    } else {
        // Versuchen, als ID zu finden
        element = document.getElementById(selector);
        
        // Wenn nicht gefunden, als Selektor versuchen
        if (!element) {
            element = document.querySelector(selector);
        }
    }
    
    // Im Cache speichern, wenn gefunden
    if (element && useCache) {
        cachedElements[selector] = element;
    }
    
    return element;
}

/**
 * Cache von DOM-Elementen löschen
 * @param {string} [selector] Optionaler Selektor, um nur bestimmte Elemente zu löschen
 */
export function clearElementCache(selector = null) {
    if (selector) {
        delete cachedElements[selector];
    } else {
        Object.keys(cachedElements).forEach(key => {
            delete cachedElements[key];
        });
    }
}

/**
 * Status-Nachricht anzeigen
 * @param {string} message Anzuzeigende Nachricht
 * @param {boolean} isError Ob es sich um eine Fehlermeldung handelt
 * @param {number} timeout Timeout in Millisekunden (0 für kein automatisches Ausblenden)
 * @param {Object} options Weitere Optionen (position, type)
 */
export function showStatus(message, isError = false, timeout = 3000, options = {}) {
    // Standardoptionen
    const defaults = {
        position: 'bottom-right',
        type: isError ? 'error' : 'success',
        icon: isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'
    };
    
    // Optionen zusammenführen
    const settings = { ...defaults, ...options };
    
    // ID generieren
    const statusId = 'status-msg-' + Date.now();
    
    // Vorhandenes Status-Element suchen oder erstellen
    let statusContainer = document.getElementById('status-messages-container');
    
    if (!statusContainer) {
        statusContainer = document.createElement('div');
        statusContainer.id = 'status-messages-container';
        statusContainer.className = `status-container ${settings.position}`;
        document.body.appendChild(statusContainer);
    }
    
    // Status-Meldung erstellen
    const statusElement = document.createElement('div');
    statusElement.id = statusId;
    statusElement.className = `status-msg ${settings.type}`;
    statusElement.setAttribute('role', 'alert');
    
    // Icon hinzufügen, wenn angegeben
    let iconHtml = '';
    if (settings.icon) {
        iconHtml = `<span class="status-icon"><i class="${settings.icon}"></i></span>`;
    }
    
    // Inhalt setzen
    statusElement.innerHTML = `
        ${iconHtml}
        <span class="status-content">${message}</span>
        <button class="status-close" aria-label="Schließen">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Schließen-Button-Handler
    const closeButton = statusElement.querySelector('.status-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hideStatus(statusElement);
        });
    }
    
    // Zum Container hinzufügen
    statusContainer.appendChild(statusElement);
    
    // Animation mit setTimeout, um DOM-Rendering zu ermöglichen
    setTimeout(() => {
        statusElement.classList.add('show');
    }, 10);
    
    // Bei Timeout automatisch ausblenden
    if (timeout > 0) {
        setTimeout(() => {
            hideStatus(statusElement);
        }, timeout);
    }
    
    // Rückgabe für programmatischen Zugriff
    return {
        id: statusId,
        element: statusElement,
        hide: () => hideStatus(statusElement)
    };
}

/**
 * Status-Nachricht ausblenden
 * @param {Element|string} statusElement Element oder ID der Status-Nachricht
 */
export function hideStatus(statusElement) {
    // Element abrufen, falls eine ID übergeben wurde
    if (typeof statusElement === 'string') {
        statusElement = document.getElementById(statusElement);
    }
    
    if (!statusElement) return;
    
    // Animation zum Ausblenden
    statusElement.classList.remove('show');
    
    // Nach Animation entfernen
    setTimeout(() => {
        if (statusElement.parentNode) {
            statusElement.parentNode.removeChild(statusElement);
        }
        
        // Container entfernen, wenn leer
        const container = document.getElementById('status-messages-container');
        if (container && !container.hasChildNodes()) {
            container.parentNode.removeChild(container);
        }
    }, 300); // Entspricht der CSS-Übergangszeit
}

/**
 * Inhalt eines Elements sicher aktualisieren
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {string|Element} content Neuer Inhalt (Text oder Element)
 * @param {string} property Zu aktualisierende Eigenschaft (innerHTML, textContent, value)
 * @returns {boolean} Erfolgsstatus
 */
export function updateContent(selector, content, property = 'innerHTML') {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Element nicht gefunden: ${selector}`);
        return false;
    }
    
    try {
        if (content instanceof Element) {
            // Wenn Inhalt ein Element ist, Kindelemente löschen und neues Element hinzufügen
            if (property === 'innerHTML') {
                element.innerHTML = '';
                element.appendChild(content);
            } else {
                console.warn(`Eigenschaft '${property}' nicht kompatibel mit Element-Inhalt`);
                return false;
            }
        } else {
            // Textinhalt oder HTML setzen
            element[property] = content;
        }
        
        return true;
    } catch (error) {
        console.error(`Fehler beim Aktualisieren des Elements ${selector}:`, error);
        return false;
    }
}

/**
 * Element ein- oder ausblenden
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {boolean} show Ob das Element angezeigt werden soll
 * @param {string} displayStyle Anzeigestil (block, flex, inline-block, ...)
 * @returns {boolean} Erfolgsstatus
 */
export function toggleElement(selector, show, displayStyle = 'block') {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Element nicht gefunden: ${selector}`);
        return false;
    }
    
    try {
        element.style.display = show ? displayStyle : 'none';
        return true;
    } catch (error) {
        console.error(`Fehler beim Umschalten des Elements ${selector}:`, error);
        return false;
    }
}

/**
 * Klasse zu einem Element hinzufügen oder entfernen
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {string} className Hinzuzufügende/zu entfernende Klasse
 * @param {boolean} add Ob die Klasse hinzugefügt (true) oder entfernt (false) werden soll
 * @returns {boolean} Erfolgsstatus
 */
export function toggleClass(selector, className, add) {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Element nicht gefunden: ${selector}`);
        return false;
    }
    
    try {
        if (add) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
        
        return true;
    } catch (error) {
        console.error(`Fehler beim Ändern der Klasse des Elements ${selector}:`, error);
        return false;
    }
}

/**
 * Event-Listener hinzufügen
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {string} eventType Event-Typ (click, input, ...)
 * @param {Function} handler Event-Handler
 * @param {Object} options Event-Optionen
 * @returns {boolean} Erfolgsstatus
 */
export function addEvent(selector, eventType, handler, options = {}) {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Element nicht gefunden: ${selector}`);
        return false;
    }
    
    try {
        element.addEventListener(eventType, handler, options);
        return true;
    } catch (error) {
        console.error(`Fehler beim Hinzufügen des Event-Listeners zu ${selector}:`, error);
        return false;
    }
}

/**
 * Animation zu einem Element hinzufügen
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {string} animationClass Animationsklasse
 * @param {number} duration Animationsdauer in Millisekunden
 * @returns {Promise} Promise, das erfüllt wird, wenn die Animation abgeschlossen ist
 */
export function animateElement(selector, animationClass, duration = 1000) {
    return new Promise((resolve, reject) => {
        const element = getElement(selector);
        
        if (!element) {
            console.warn(`Element nicht gefunden: ${selector}`);
            reject(new Error(`Element nicht gefunden: ${selector}`));
            return;
        }
        
        try {
            // Animationsklasse hinzufügen
            element.classList.add(animationClass);
            
            // Nach Abschluss der Animation aufräumen
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve(element);
            }, duration);
        } catch (error) {
            console.error(`Fehler beim Animieren des Elements ${selector}:`, error);
            reject(error);
        }
    });
}

/**
 * Element mit Fade-In anzeigen
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {number} duration Animationsdauer in Millisekunden
 * @returns {Promise} Promise, das erfüllt wird, wenn die Animation abgeschlossen ist
 */
export function fadeIn(selector, duration = 300) {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Element nicht gefunden: ${selector}`);
        return Promise.reject(new Error(`Element nicht gefunden: ${selector}`));
    }
    
    return new Promise((resolve) => {
        // Element vorbereiten
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        // Kurze Verzögerung für das DOM-Rendering
        setTimeout(() => {
            element.style.opacity = '1';
            
            // Nach Abschluss der Animation aufräumen
            setTimeout(() => {
                element.style.transition = '';
                resolve(element);
            }, duration);
        }, 10);
    });
}

/**
 * Element mit Fade-Out ausblenden
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {number} duration Animationsdauer in Millisekunden
 * @returns {Promise} Promise, das erfüllt wird, wenn die Animation abgeschlossen ist
 */
export function fadeOut(selector, duration = 300) {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Element nicht gefunden: ${selector}`);
        return Promise.reject(new Error(`Element nicht gefunden: ${selector}`));
    }
    
    return new Promise((resolve) => {
        // Element vorbereiten
        element.style.opacity = '1';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        // Animation starten
        element.style.opacity = '0';
        
        // Nach Abschluss der Animation aufräumen
        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = '';
            resolve(element);
        }, duration);
    });
}

/**
 * Modal-Dialog anzeigen
 * @param {string|Element} selector Modal-Selektor oder -ID
 * @param {Object} options Modal-Optionen
 * @returns {Object} Modal-Objekt mit show/hide-Methoden
 */
export function modal(selector, options = {}) {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Modal-Element nicht gefunden: ${selector}`);
        return null;
    }
    
    // Standard-Optionen
    const defaults = {
        closeOnEscape: true,
        closeOnBackdrop: true,
        closeButtonSelector: '.modal-close',
        showClass: 'modal-show',
        backdrop: true,
        backdropClass: 'modal-backdrop',
        onShow: null,
        onHide: null,
        removeOnHide: false
    };
    
    // Optionen zusammenführen
    const settings = { ...defaults, ...options };
    
    // Backdrop-Element
    let backdrop = null;
    
    // Modal-Objekt mit Methoden
    const modalObj = {
        element,
        
        // Modal anzeigen
        show() {
            // Backdrop erstellen, wenn aktiviert
            if (settings.backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = settings.backdropClass;
                document.body.appendChild(backdrop);
                
                // Fade-In für Backdrop
                setTimeout(() => backdrop.classList.add('show'), 10);
                
                // Klick-Handler für Backdrop hinzufügen
                if (settings.closeOnBackdrop) {
                    backdrop.addEventListener('click', modalObj.hide);
                }
            }
            
            // Modal anzeigen
            element.style.display = 'block';
            
            // Animation mit setTimeout, um DOM-Rendering zu ermöglichen
            setTimeout(() => element.classList.add(settings.showClass), 10);
            
            // Close-Button-Handler hinzufügen
            const closeButtons = element.querySelectorAll(settings.closeButtonSelector);
            closeButtons.forEach(button => {
                button.addEventListener('click', modalObj.hide);
            });
            
            // ESC-Taste-Handler hinzufügen
            if (settings.closeOnEscape) {
                document.addEventListener('keydown', modalObj._escKeyHandler);
            }
            
            // Scrollen verhindern
            document.body.style.overflow = 'hidden';
            
            // onShow-Callback aufrufen
            if (typeof settings.onShow === 'function') {
                settings.onShow(modalObj);
            }
            
            return modalObj;
        },
        
        // Modal ausblenden
        hide() {
            // Animation zum Ausblenden
            element.classList.remove(settings.showClass);
            
            if (backdrop) {
                backdrop.classList.remove('show');
            }
            
            // Nach Animation aufräumen
            setTimeout(() => {
                element.style.display = 'none';
                
                // Backdrop entfernen
                if (backdrop && backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                    backdrop = null;
                }
                
                // Scrollen wiederherstellen
                document.body.style.overflow = '';
                
                // Event-Listener entfernen
                if (settings.closeOnEscape) {
                    document.removeEventListener('keydown', modalObj._escKeyHandler);
                }
                
                // Element entfernen, wenn gewünscht
                if (settings.removeOnHide && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                
                // onHide-Callback aufrufen
                if (typeof settings.onHide === 'function') {
                    settings.onHide(modalObj);
                }
            }, 300); // Entspricht der CSS-Übergangszeit
            
            return modalObj;
        },
        
        // ESC-Taste-Handler
        _escKeyHandler(event) {
            if (event.key === 'Escape') {
                modalObj.hide();
            }
        }
    };
    
    return modalObj;
}

/**
 * Formularwerte als Objekt abrufen
 * @param {string|Element|Event} formSelector Formular-Selektor, -Element oder Submit-Event
 * @returns {Object} Formularwerte
 */
export function getFormValues(formSelector) {
    let form;
    
    // Wenn ein Event übergeben wurde, das Formular abrufen
    if (formSelector instanceof Event) {
        formSelector.preventDefault();
        form = formSelector.target;
    } else {
        // Ansonsten das Formular direkt abrufen
        form = getElement(formSelector);
    }
    
    if (!form || !(form instanceof HTMLFormElement)) {
        console.warn('Ungültiges Formular:', formSelector);
        return {};
    }
    
    // FormData erstellen
    const formData = new FormData(form);
    const values = {};
    
    // Werte extrahieren
    for (const [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
            // Array-Werte behandeln
            const arrayKey = key.slice(0, -2);
            if (!values[arrayKey]) {
                values[arrayKey] = [];
            }
            values[arrayKey].push(value);
        } else {
            values[key] = value;
        }
    }
    
    // Checkbox-Werte korrigieren
    Array.from(form.querySelectorAll('input[type=checkbox]')).forEach(checkbox => {
        if (!checkbox.name) return;
        
        // Wenn Checkbox nicht in FormData ist, wurde sie nicht markiert
        if (checkbox.name.endsWith('[]')) {
            // Array-Checkboxen werden bereits korrekt behandelt
        } else if (!formData.has(checkbox.name)) {
            values[checkbox.name] = false;
        } else {
            values[checkbox.name] = true;
        }
    });
    
    return values;
}

/**
 * Formular mit Werten füllen
 * @param {string|Element} formSelector Formular-Selektor oder -Element
 * @param {Object} values Zu setzende Werte
 * @returns {boolean} Erfolgsstatus
 */
export function setFormValues(formSelector, values) {
    const form = getElement(formSelector);
    
    if (!form || !(form instanceof HTMLFormElement)) {
        console.warn('Ungültiges Formular:', formSelector);
        return false;
    }
    
    try {
        // Über alle Werte iterieren
        Object.entries(values).forEach(([name, value]) => {
            // Element/e mit diesem Namen suchen
            const elements = form.elements[name];
            
            if (!elements) {
                return; // Element nicht gefunden, überspringen
            }
            
            // Einzelnes Element oder NodeList?
            if (elements instanceof RadioNodeList) {
                // NodeList (mehrere Elemente mit gleichem Namen)
                Array.from(elements).forEach(element => {
                    setElementValue(element, value);
                });
            } else {
                // Einzelnes Element
                setElementValue(elements, value);
            }
        });
        
        return true;
    } catch (error) {
        console.error('Fehler beim Setzen der Formularwerte:', error);
        return false;
    }
}

/**
 * Wert eines einzelnen Formularelements setzen
 * @param {Element} element Formularelement
 * @param {*} value Zu setzender Wert
 */
function setElementValue(element, value) {
    switch (element.type) {
        case 'checkbox':
            element.checked = !!value;
            break;
        
        case 'radio':
            element.checked = (element.value === value.toString());
            break;
        
        case 'select-multiple':
            // Bei Multi-Select-Feldern Werte als Array erwarten
            if (Array.isArray(value)) {
                Array.from(element.options).forEach(option => {
                    option.selected = value.includes(option.value);
                });
            }
            break;
        
        case 'file':
            // Dateien können nicht programmatisch gesetzt werden
            break;
        
        default:
            // Für Textfelder, Textareas, Select, Hidden, etc.
            element.value = value;
    }
}

/**
 * Element zum Viewport scrollen
 * @param {string|Element} selector Element-Selektor oder -ID
 * @param {Object} options Scroll-Optionen
 * @returns {boolean} Erfolgsstatus
 */
export function scrollToElement(selector, options = {}) {
    const element = getElement(selector);
    
    if (!element) {
        console.warn(`Element nicht gefunden: ${selector}`);
        return false;
    }
    
    // Standard-Optionen
    const defaults = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        offset: 0
    };
    
    // Optionen zusammenführen
    const settings = { ...defaults, ...options };
    
    try {
        // Moderne Browser
        if ('scrollBehavior' in document.documentElement.style) {
            const rect = element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Mit Offset-Anpassung scrollen
            window.scrollTo({
                top: rect.top + scrollTop - settings.offset,
                behavior: settings.behavior
            });
        } else {
            // Fallback für ältere Browser
            element.scrollIntoView({
                behavior: settings.behavior,
                block: settings.block,
                inline: settings.inline
            });
            
            // Offset manuell anwenden
            if (settings.offset) {
                setTimeout(() => {
                    window.scrollBy(0, -settings.offset);
                }, 0);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`Fehler beim Scrollen zu ${selector}:`, error);
        return false;
    }
}

/**
 * HTML-Element erstellen
 * @param {string} tag HTML-Tag
 * @param {Object} attributes Element-Attribute
 * @param {string|Element|Array} children Kind-Elemente oder Textinhalt
 * @returns {Element} Erstelltes Element
 */
export function createElement(tag, attributes = {}, children = null) {
    try {
        const element = document.createElement(tag);
        
        // Attribute setzen
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                // className als Sonderfall
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                // Style-Objekt
                Object.assign(element.style, value);
            } else {
                // Andere Attribute
                element.setAttribute(key, value);
            }
        });
        
        // Kinder hinzufügen
        if (children !== null) {
            if (Array.isArray(children)) {
                // Array von Kindern
                children.forEach(child => {
                    if (child instanceof Element) {
                        element.appendChild(child);
                    } else if (child !== null) {
                        element.appendChild(document.createTextNode(String(child)));
                    }
                });
            } else if (children instanceof Element) {
                // Einzelnes Kind-Element
                element.appendChild(children);
            } else {
                // Textinhalt
                element.textContent = String(children);
            }
        }
        
        return element;
    } catch (error) {
        console.error(`Fehler beim Erstellen des Elements ${tag}:`, error);
        return document.createElement('div'); // Fallback
    }
}

/**
 * HTML-String sicher parsen und als Element zurückgeben
 * @param {string} html HTML-Zeichenkette
 * @returns {Element} Geparste Elemente in einem Container
 */
export function parseHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Fragment erstellen, um alle geparsten Elemente zu enthalten
    const fragment = document.createDocumentFragment();
    
    // Alle Body-Kinder zum Fragment hinzufügen
    Array.from(doc.body.children).forEach(child => {
        fragment.appendChild(child);
    });
    
    return fragment;
}

/**
 * Prüft, ob der Viewport mobil ist
 * @returns {boolean} Ob der Viewport mobil ist
 */
export function isMobileViewport() {
    return window.innerWidth <= 768;
}

// Standard-Stylesheet für Status-Nachrichten einmal hinzufügen
if (typeof document !== 'undefined') {
    // Stylesheet nur einmal hinzufügen
    if (!document.getElementById('ui-utils-styles')) {
        const style = document.createElement('style');
        style.id = 'ui-utils-styles';
        style.textContent = `
            .status-container {
                position: fixed;
                z-index: 1000;
                max-width: 300px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            .status-container.top-right {
                top: 20px;
                right: 20px;
            }
            
            .status-container.top-left {
                top: 20px;
                left: 20px;
            }
            
            .status-container.bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .status-container.bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .status-msg {
                background-color: white;
                color: #333;
                padding: 12px;
                margin-bottom: 10px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                overflow: hidden;
            }
            
            .status-msg.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .status-msg.success {
                border-left: 4px solid #4CAF50;
            }
            
            .status-msg.error {
                border-left: 4px solid #F44336;
            }
            
            .status-msg.info {
                border-left: 4px solid #2196F3;
            }
            
            .status-msg.warning {
                border-left: 4px solid #FF9800;
            }
            
            .status-icon {
                margin-right: 10px;
                font-size: 18px;
            }
            
            .status-msg.success .status-icon {
                color: #4CAF50;
            }
            
            .status-msg.error .status-icon {
                color: #F44336;
            }
            
            .status-msg.info .status-icon {
                color: #2196F3;
            }
            
            .status-msg.warning .status-icon {
                color: #FF9800;
            }
            
            .status-content {
                flex: 1;
            }
            
            .status-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 5px;
                margin-left: 10px;
                font-size: 14px;
                transition: color 0.2s ease;
            }
            
            .status-close:hover {
                color: #333;
            }
            
            @media (max-width: 480px) {
                .status-container {
                    width: calc(100% - 40px);
                    max-width: none;
                }
            }
            
            /* Modal-Stile */
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 900;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .modal-backdrop.show {
                opacity: 1;
            }
            
            [data-modal] {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                overflow-y: auto;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            [data-modal].modal-show {
                opacity: 1;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Objekt mit allen Funktionen exportieren
export default {
    getElement,
    clearElementCache,
    showStatus,
    hideStatus,
    updateContent,
    toggleElement,
    toggleClass,
    addEvent,
    animateElement,
    fadeIn,
    fadeOut,
    modal,
    getFormValues,
    setFormValues,
    scrollToElement,
    createElement,
    parseHTML,
    isMobileViewport
};