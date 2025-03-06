 /**
 * app.js
 * Zentrale Anwendungslogik und Initialisierungssteuerung
 */

import { configureLoader } from './loader.js';
import { initFirebase, getFirestore, getAuth } from './firebase.js';
import { isMobileDevice, debounce, generateUniqueId } from './utils.js';
import { showStatus } from './ui-utils.js';
import LazyLoad from './lazy-load.js';

// Global App State
const App = {
    // App-Modus (frontend, admin)
    mode: 'frontend',
    
    // Initialisierungsstatus
    initialized: false,
    isLoading: true,
    
    // Module und Komponenten
    modules: {},
    components: {},
    
    // Services
    services: {
        firebase: null,
        db: null, 
        auth: null,
        storage: null
    },
    
    // Konfiguration
    config: {
        debug: false,
        features: {
            lazyLoading: true,
            animations: true,
            wordCloud: true
        },
        version: '1.0.0'
    }
};

/**
 * Anwendungskonfiguration setzen
 * @param {Object} config Konfigurationsoptionen
 */
export function configureApp(config = {}) {
    // Config tief zusammenführen
    App.config = mergeDeep(App.config, config);
    
    // Loader konfigurieren
    configureLoader({
        basePath: App.config.basePath || '',
        version: App.config.version,
        debug: App.config.debug
    });
    
    // Debug-Modus aktivieren/deaktivieren
    if (App.config.debug) {
        console.log('App konfiguriert:', App.config);
    } else {
        // Im Produktionsmodus bestimmte Konsolenausgaben deaktivieren
        if (typeof window !== 'undefined' && window.console) {
            const noop = () => {};
            // Original-Konsolenmethoden speichern
            const originalConsole = {
                log: console.log,
                debug: console.debug,
                info: console.info
            };
            
            // In einer Produktionsumgebung nur Warnungen und Fehler anzeigen
            if (process.env.NODE_ENV === 'production') {
                console.log = noop;
                console.debug = noop;
                console.info = noop;
                
                // Methode zum Wiederherstellen der Konsolenfunktionen hinzufügen
                console.restoreConsole = () => {
                    console.log = originalConsole.log;
                    console.debug = originalConsole.debug;
                    console.info = originalConsole.info;
                };
            }
        }
    }
    
    return App.config;
}

/**
 * Anwendung initialisieren
 * @param {string} mode Modus (frontend, admin)
 * @param {Object} options Weitere Initialisierungsoptionen
 * @returns {Promise} Promise, das erfüllt wird, wenn die App initialisiert ist
 */
export async function initApp(mode = 'frontend', options = {}) {
    if (App.initialized) {
        console.warn('App ist bereits initialisiert');
        return App;
    }
    
    // Modus setzen
    App.mode = mode;
    
    try {
        // Konfiguration aktualisieren, falls Optionen übergeben werden
        if (options.config) {
            configureApp(options.config);
        }
        
        // Ladezustand anzeigen
        App.isLoading = true;
        showLoading(true);
        
        // Firebase initialisieren
        if (options.initFirebase !== false) {
            await initAppServices();
        }
        
        // Feature-basierte Modulinitialisierung
        if (App.config.features.lazyLoading) {
            LazyLoad.init();
        }
        
        // Modus-spezifische Initialisierung
        if (mode === 'admin') {
            await initAdminApp();
        } else {
            await initFrontendApp();
        }
        
        // App als initialisiert markieren
        App.initialized = true;
        App.isLoading = false;
        
        // Lade-Anzeige ausblenden
        showLoading(false);
        
        if (App.config.debug) {
            console.log(`App im Modus "${mode}" initialisiert`);
        }
        
        // DOMContentLoaded-Event auslösen, falls bereits geschehen
        if (document.readyState !== 'loading') {
            fireDomReadyEvent();
        }
        
        return App;
    } catch (error) {
        console.error('Fehler bei der App-Initialisierung:', error);
        
        // Lade-Anzeige ausblenden
        showLoading(false);
        
        // Fehler anzeigen
        showStatus('Fehler bei der Anwendungsinitialisierung', true);
        
        throw error;
    }
}

/**
 * App-Services initialisieren (Firebase, DB usw.)
 */
async function initAppServices() {
    // Firebase initialisieren
    const firebase = initFirebase();
    
    if (firebase) {
        App.services.firebase = firebase;
        App.services.db = getFirestore();
        App.services.auth = getAuth();
        
        // Storage nur im Admin-Modus laden
        if (App.mode === 'admin' && typeof firebase.storage !== 'undefined') {
            App.services.storage = firebase.storage();
        }
    } else {
        console.warn('Firebase konnte nicht initialisiert werden');
    }
}

/**
 * Admin-Anwendung initialisieren
 */
async function initAdminApp() {
    // Admin-spezifische Module importieren und initialisieren
    const adminModules = [
        { name: 'auth', path: '../modules/auth.js' },
        { name: 'contentManager', path: '../modules/content-manager.js' },
        { name: 'ui', path: '../modules/ui-manager.js' }
    ];
    
    // Module laden und initialisieren
    for (const moduleInfo of adminModules) {
        try {
            const module = await import(moduleInfo.path);
            
            if (typeof module.default === 'function') {
                App.modules[moduleInfo.name] = module.default();
            } else if (typeof module.init === 'function') {
                App.modules[moduleInfo.name] = module.init();
            } else {
                App.modules[moduleInfo.name] = module;
            }
            
            if (App.config.debug) {
                console.log(`Modul "${moduleInfo.name}" initialisiert`);
            }
        } catch (error) {
            console.error(`Fehler beim Laden des Moduls "${moduleInfo.name}":`, error);
        }
    }
    
    // Admin-spezifische Event-Listener hinzufügen
    setupAdminEventListeners();
}

/**
 * Frontend-Anwendung initialisieren
 */
async function initFrontendApp() {
    // Frontend-spezifische Module importieren und initialisieren
    const frontendModules = [
        { name: 'ui', path: '../modules/ui-manager.js' },
        { name: 'contentManager', path: '../modules/content-manager.js' }
    ];
    
    // Feature-spezifische Module
    if (App.config.features.wordCloud) {
        frontendModules.push({ name: 'wordCloud', path: '../modules/word-cloud.js' });
    }
    
    // Module laden und initialisieren
    for (const moduleInfo of frontendModules) {
        try {
            const module = await import(moduleInfo.path);
            
            if (typeof module.default === 'function') {
                App.modules[moduleInfo.name] = module.default();
            } else if (typeof module.init === 'function') {
                App.modules[moduleInfo.name] = module.init();
            } else {
                App.modules[moduleInfo.name] = module;
            }
            
            if (App.config.debug) {
                console.log(`Modul "${moduleInfo.name}" initialisiert`);
            }
        } catch (error) {
            console.error(`Fehler beim Laden des Moduls "${moduleInfo.name}":`, error);
        }
    }
    
    // Frontend-spezifische Event-Listener hinzufügen
    setupFrontendEventListeners();
}

/**
 * Admin-spezifische Event-Listener einrichten
 */
function setupAdminEventListeners() {
    // Vor dem Entladen die Benutzer warnen, wenn ungespeicherte Änderungen vorliegen
    window.addEventListener('beforeunload', e => {
        if (window.isDirty === true) {
            e.preventDefault();
            e.returnValue = 'Sie haben ungespeicherte Änderungen. Möchten Sie wirklich die Seite verlassen?';
            return e.returnValue;
        }
    });
    
    // Session-Timeout-Warnungen
    const sessionTimeoutWarning = debounce(() => {
        // Prüfen, ob Benutzer authentifiziert ist
        if (App.services.auth && App.services.auth.currentUser) {
            // Falls Authentifizierungstoken bald abläuft, warnen
            App.services.auth.currentUser.getIdTokenResult()
                .then(idTokenResult => {
                    const expirationTime = new Date(idTokenResult.expirationTime).getTime();
                    const now = Date.now();
                    const timeRemaining = expirationTime - now;
                    
                    // Warnen, wenn weniger als 5 Minuten verbleiben
                    if (timeRemaining > 0 && timeRemaining < 5 * 60 * 1000) {
                        showStatus('Ihre Sitzung läuft bald ab. Bitte speichern Sie Ihre Arbeit.', false, 10000);
                    }
                })
                .catch(error => {
                    console.error('Fehler beim Abrufen des Token-Status:', error);
                });
        }
    }, 60000); // Jede Minute prüfen
    
    // Aktivitäts-Tracking für Session-Timeout
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(eventType => {
        document.addEventListener(eventType, sessionTimeoutWarning, { passive: true });
    });
}

/**
 * Frontend-spezifische Event-Listener einrichten
 */
function setupFrontendEventListeners() {
    // Event-Listener für Performanceoptimierung
    
    // Ruhezustand erkennen (Tab im Hintergrund)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Seite ist im Hintergrund, nicht-kritische Aufgaben pausieren
            App.isBackgrounded = true;
        } else {
            // Seite ist wieder im Vordergrund
            App.isBackgrounded = false;
            
            // Lazy-Loading aktualisieren
            if (App.config.features.lazyLoading) {
                LazyLoad.refresh();
            }
        }
    });
    
    // Responsive-Anpassungen
    const handleResize = debounce(() => {
        App.isMobile = isMobileDevice();
        
        // Event für Größenänderung auslösen
        window.dispatchEvent(new CustomEvent('app:resize', {
            detail: {
                isMobile: App.isMobile,
                width: window.innerWidth,
                height: window.innerHeight
            }
        }));
    }, 200);
    
    window.addEventListener('resize', handleResize);
    
    // Initial aufrufen
    handleResize();
}

/**
 * DOM-Ready-Event auslösen
 */
function fireDomReadyEvent() {
    window.dispatchEvent(new CustomEvent('app:ready', {
        detail: {
            app: App
        }
    }));
    
    if (App.config.debug) {
        console.log('App bereit - Event "app:ready" ausgelöst');
    }
}

/**
 * Ladeanzeige anzeigen/ausblenden
 * @param {boolean} show Anzeigen oder ausblenden
 */
function showLoading(show) {
    // Lade-Anzeige anzeigen/ausblenden
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Tiefes Zusammenführen von Objekten
 * @param {Object} target Zielobjekt
 * @param {Object} source Quellobjekt
 * @returns {Object} Zusammengeführtes Objekt
 */
function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    
    return output;
}

/**
 * Prüft, ob ein Wert ein Objekt ist
 * @param {*} item Zu prüfender Wert
 * @returns {boolean} Ob es sich um ein Objekt handelt
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Modul registrieren
 * @param {string} name Modulname
 * @param {Object} module Modulobjekt oder -instanz
 */
export function registerModule(name, module) {
    App.modules[name] = module;
    
    if (App.config.debug) {
        console.log(`Modul "${name}" registriert`);
    }
    
    return module;
}

/**
 * Komponente registrieren
 * @param {string} name Komponentenname
 * @param {Object} component Komponentenobjekt
 */
export function registerComponent(name, component) {
    App.components[name] = component;
    
    if (App.config.debug) {
        console.log(`Komponente "${name}" registriert`);
    }
    
    return component;
}

/**
 * App-Instanz abrufen
 * @returns {Object} Die App-Instanz
 */
export function getApp() {
    return App;
}

// Beim Laden der Seite Event-Listener für DOMContentLoaded einrichten
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        fireDomReadyEvent();
    });
}

// Exportiere die App-Instanz und Funktionen
export default {
    init: initApp,
    configure: configureApp,
    registerModule,
    registerComponent,
    get: getApp,
    getModule: (name) => App.modules[name] || null,
    getService: (name) => App.services[name] || null
};