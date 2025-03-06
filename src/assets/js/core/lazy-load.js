 /**
 * lazy-load.js
 * Performante Lazy-Loading-Implementierung für Bilder und Inhalte
 */

// Laden-verzögerte Elemente
let lazyElements = [];

// IntersectionObserver-Instance
let observer = null;

// Konfiguration
const defaultConfig = {
    rootMargin: '100px',
    threshold: 0.01,
    loadingClass: 'loading',
    loadedClass: 'loaded',
    errorClass: 'error',
    selectors: {
        images: 'img[loading="lazy"], img[data-src]',
        backgrounds: '[data-bg]',
        iframes: 'iframe[data-src]',
        videos: 'video[data-src]',
        components: '[data-lazy-component]'
    }
};

// Aktuelle Konfiguration
let config = { ...defaultConfig };

/**
 * Initialisiert das Lazy-Loading
 * @param {Object} options Konfigurationsoptionen
 */
export function initLazyLoading(options = {}) {
    // Konfiguration aktualisieren
    config = { ...config, ...options };
    
    // Wenn IntersectionObserver verfügbar ist
    if ('IntersectionObserver' in window) {
        setupIntersectionObserver();
    } else {
        // Fallback für ältere Browser
        setupLegacyLazyLoading();
    }
    
    // Initial alle zu ladenden Elemente registrieren
    registerLazyElements();
    
    console.log(`Lazy Loading initialisiert: ${lazyElements.length} Elemente gefunden`);
    
    return {
        refresh: registerLazyElements,
        loadAll: loadAllElements
    };
}

/**
 * IntersectionObserver für modernes Lazy-Loading einrichten
 */
function setupIntersectionObserver() {
    // Bestehenden Observer bereinigen
    if (observer) {
        observer.disconnect();
    }
    
    // Neuen Observer erstellen
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                loadElement(element);
                observer.unobserve(element);
            }
        });
    }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
    });
}

/**
 * Legacy-Lazy-Loading für Browser ohne IntersectionObserver
 */
function setupLegacyLazyLoading() {
    const loadVisibleElements = debounce(() => {
        lazyElements = lazyElements.filter(element => {
            if (isElementInViewport(element)) {
                loadElement(element);
                return false;
            }
            return true;
        });
        
        // Aufräumen, wenn alle Elemente geladen sind
        if (lazyElements.length === 0) {
            window.removeEventListener('scroll', loadVisibleElements);
            window.removeEventListener('resize', loadVisibleElements);
            window.removeEventListener('orientationchange', loadVisibleElements);
        }
    }, 200);
    
    // Event-Listener für Scrollen, Größenänderung und Orientierungsänderung
    window.addEventListener('scroll', loadVisibleElements, { passive: true });
    window.addEventListener('resize', loadVisibleElements, { passive: true });
    window.addEventListener('orientationchange', loadVisibleElements, { passive: true });
    
    // Initial prüfen
    setTimeout(loadVisibleElements, 100);
}

/**
 * Alle Lazy-Loading-Elemente auf der Seite registrieren
 */
export function registerLazyElements() {
    // Vorhandene Elemente bereinigen (bereits geladene entfernen)
    lazyElements = lazyElements.filter(el => 
        document.body.contains(el) && !el.classList.contains(config.loadedClass)
    );
    
    // Selektoren kombinieren
    const selectorString = Object.values(config.selectors).join(', ');
    const newElements = Array.from(document.querySelectorAll(selectorString))
        .filter(el => !el.classList.contains(config.loadedClass));
    
    // Doppelte entfernen
    newElements.forEach(element => {
        if (!lazyElements.includes(element)) {
            // Element zum Laden markieren
            element.classList.add(config.loadingClass);
            
            // Für modernes Lazy-Loading zum Observer hinzufügen
            if (observer) {
                observer.observe(element);
            }
            
            // Zur Liste hinzufügen
            lazyElements.push(element);
        }
    });
    
    return lazyElements.length;
}

/**
 * Prüft, ob ein Element im Viewport ist
 * @param {Element} element Zu prüfendes Element
 * @returns {boolean} Ob das Element im Viewport ist
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    // Element ist im Viewport + Marge
    const verticalMargin = parseInt(config.rootMargin, 10) || 100;
    
    return (
        rect.bottom >= -verticalMargin &&
        rect.right >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) + verticalMargin &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Lädt ein einzelnes Element
 * @param {Element} element Das zu ladende Element
 */
function loadElement(element) {
    // Elementtyp bestimmen
    if (element.tagName === 'IMG') {
        loadImage(element);
    } else if (element.hasAttribute('data-bg')) {
        loadBackground(element);
    } else if (element.tagName === 'IFRAME') {
        loadIframe(element);
    } else if (element.tagName === 'VIDEO') {
        loadVideo(element);
    } else if (element.hasAttribute('data-lazy-component')) {
        loadComponent(element);
    }
}

/**
 * Lädt ein Bild
 * @param {HTMLImageElement} img Das zu ladende Bild-Element
 */
function loadImage(img) {
    // Lade-Klasse hinzufügen
    img.classList.add(config.loadingClass);
    
    // Quelle aus data-src oder data-srcset abrufen
    const src = img.dataset.src || img.getAttribute('src');
    const srcset = img.dataset.srcset;
    const sizes = img.dataset.sizes;
    
    if (!src) return;
    
    // Neues Bild zum Vorladen erstellen
    const tempImg = new Image();
    
    // Wenn srcset vorhanden, zuerst einrichten
    if (srcset) {
        tempImg.srcset = srcset;
    }
    
    // Wenn sizes vorhanden, einrichten
    if (sizes) {
        tempImg.sizes = sizes;
    }
    
    // Event-Listener für Erfolg und Fehler
    tempImg.onload = () => {
        applyImageSource(img, src, srcset, sizes);
        img.classList.remove(config.loadingClass);
        img.classList.add(config.loadedClass);
        
        // Native loading-Attribut entfernen
        img.removeAttribute('loading');
        
        // Dataset bereinigen
        delete img.dataset.src;
        delete img.dataset.srcset;
        delete img.dataset.sizes;
        
        // Custom Event auslösen
        img.dispatchEvent(new CustomEvent('lazyloaded'));
    };
    
    tempImg.onerror = () => {
        img.classList.remove(config.loadingClass);
        img.classList.add(config.errorClass);
        console.error(`Fehler beim Laden des Bildes: ${src}`);
        
        // Custom Event auslösen
        img.dispatchEvent(new CustomEvent('lazyloaderror'));
    };
    
    // Ladeprozess starten
    tempImg.src = src;
}

/**
 * Wendet Bildquellen an und berücksichtigt Animation
 * @param {HTMLImageElement} img Das Bild-Element
 * @param {string} src Die Bildquelle
 * @param {string} srcset Optionales srcset
 * @param {string} sizes Optionales sizes
 */
function applyImageSource(img, src, srcset, sizes) {
    // Animation vorbereiten
    const shouldAnimate = !img.hasAttribute('data-no-animation');
    
    if (shouldAnimate) {
        // Bild mit Fade-In-Animation anzeigen
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    }
    
    // Quellen setzen
    if (srcset) {
        img.srcset = srcset;
    }
    
    if (sizes) {
        img.sizes = sizes;
    }
    
    img.src = src;
    
    if (shouldAnimate) {
        // Kurze Verzögerung für die Animation
        setTimeout(() => {
            img.style.opacity = '1';
        }, 50);
    }
}

/**
 * Lädt ein Hintergrundbild
 * @param {Element} element Das Element mit Hintergrundbild
 */
function loadBackground(element) {
    const src = element.dataset.bg;
    if (!src) return;
    
    // Lade-Klasse hinzufügen
    element.classList.add(config.loadingClass);
    
    // Bild zum Vorladen erstellen
    const tempImg = new Image();
    
    tempImg.onload = () => {
        // Hintergrundbild mit Fade-In-Animation anwenden
        element.style.backgroundImage = `url('${src}')`;
        element.classList.remove(config.loadingClass);
        element.classList.add(config.loadedClass);
        
        // Dataset bereinigen
        delete element.dataset.bg;
        
        // Custom Event auslösen
        element.dispatchEvent(new CustomEvent('lazyloaded'));
    };
    
    tempImg.onerror = () => {
        element.classList.remove(config.loadingClass);
        element.classList.add(config.errorClass);
        console.error(`Fehler beim Laden des Hintergrundbildes: ${src}`);
        
        // Custom Event auslösen
        element.dispatchEvent(new CustomEvent('lazyloaderror'));
    };
    
    // Ladeprozess starten
    tempImg.src = src;
}

/**
 * Lädt ein Iframe
 * @param {HTMLIFrameElement} iframe Das zu ladende Iframe-Element
 */
function loadIframe(iframe) {
    const src = iframe.dataset.src;
    if (!src) return;
    
    // Lade-Klasse hinzufügen
    iframe.classList.add(config.loadingClass);
    
    // Verzögerung für iframes, um Seitenladeleistung zu verbessern
    setTimeout(() => {
        iframe.src = src;
        iframe.classList.remove(config.loadingClass);
        iframe.classList.add(config.loadedClass);
        
        // Dataset bereinigen
        delete iframe.dataset.src;
        
        // Custom Event auslösen
        iframe.dispatchEvent(new CustomEvent('lazyloaded'));
    }, 100);
}

/**
 * Lädt ein Video
 * @param {HTMLVideoElement} video Das zu ladende Video-Element
 */
function loadVideo(video) {
    const src = video.dataset.src;
    const poster = video.dataset.poster;
    
    // Lade-Klasse hinzufügen
    video.classList.add(config.loadingClass);
    
    // Alle data-src-Quellen für Sources verarbeiten
    Array.from(video.querySelectorAll('source[data-src]')).forEach(source => {
        source.src = source.dataset.src;
        delete source.dataset.src;
    });
    
    // Poster-Bild setzen
    if (poster) {
        video.poster = poster;
        delete video.dataset.poster;
    }
    
    // Hauptquelle setzen
    if (src) {
        video.src = src;
        delete video.dataset.src;
    }
    
    // Video neu laden
    video.load();
    
    // Als geladen markieren
    video.classList.remove(config.loadingClass);
    video.classList.add(config.loadedClass);
    
    // Custom Event auslösen
    video.dispatchEvent(new CustomEvent('lazyloaded'));
}

/**
 * Lädt eine benutzerdefinierte Komponente
 * @param {Element} element Das Element, das die Komponente enthält
 */
function loadComponent(element) {
    const componentName = element.dataset.lazyComponent;
    if (!componentName) return;
    
    // Lade-Klasse hinzufügen
    element.classList.add(config.loadingClass);
    
    // Den Platzhaltertext speichern (falls vorhanden)
    const originalContent = element.innerHTML;
    
    try {
        // Versuchen, die Komponente dynamisch zu laden
        import(/* webpackChunkName: "[request]" */ `../modules/components/${componentName}.js`)
            .then(module => {
                if (typeof module.initComponent === 'function') {
                    // Initialisieren der Komponente mit dem Element und Parametern
                    const params = {};
                    
                    // Alle data-param-* Attribute als Parameter übergeben
                    for (const key in element.dataset) {
                        if (key.startsWith('param')) {
                            const paramName = key.replace('param', '').toLowerCase();
                            params[paramName] = element.dataset[key];
                        }
                    }
                    
                    // Komponente initialisieren
                    module.initComponent(element, params);
                    
                    // Als geladen markieren
                    element.classList.remove(config.loadingClass);
                    element.classList.add(config.loadedClass);
                    
                    // Custom Event auslösen
                    element.dispatchEvent(new CustomEvent('lazyloaded'));
                } else {
                    throw new Error(`Die Komponente "${componentName}" stellt keine initComponent-Methode bereit.`);
                }
            })
            .catch(error => {
                console.error(`Fehler beim Laden der Komponente "${componentName}":`, error);
                element.classList.remove(config.loadingClass);
                element.classList.add(config.errorClass);
                
                // Auf den Platzhaltertext zurücksetzen
                element.innerHTML = originalContent;
                
                // Custom Event auslösen
                element.dispatchEvent(new CustomEvent('lazyloaderror'));
            });
    } catch (error) {
        console.error(`Fehler beim Laden der Komponente "${componentName}":`, error);
        element.classList.remove(config.loadingClass);
        element.classList.add(config.errorClass);
        
        // Auf den Platzhaltertext zurücksetzen
        element.innerHTML = originalContent;
        
        // Custom Event auslösen
        element.dispatchEvent(new CustomEvent('lazyloaderror'));
    }
}

/**
 * Sofort alle registrierten Elemente laden
 */
export function loadAllElements() {
    lazyElements.forEach(element => {
        loadElement(element);
        
        // Vom Observer abmelden, falls vorhanden
        if (observer) {
            observer.unobserve(element);
        }
    });
    
    // Liste leeren
    lazyElements = [];
}

/**
 * Verbesserte debounce-Funktion
 * @param {Function} func Die zu verzögernde Funktion
 * @param {number} wait Verzögerungszeit in Millisekunden
 * @returns {Function} Die verzögerte Funktion
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportieren einer einfachen Lazy-Load-Funktion für einzelne Elemente
export function lazyLoad(element) {
    if (element) {
        loadElement(element);
    }
}

// Beim Laden der Seite automatisch starten
if (typeof window !== 'undefined') {
    // Warten, bis das DOM geladen ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initLazyLoading());
    } else {
        initLazyLoading();
    }
}

// Das gesamte Modul als Default exportieren
export default {
    init: initLazyLoading,
    refresh: registerLazyElements,
    loadAll: loadAllElements,
    load: lazyLoad
};