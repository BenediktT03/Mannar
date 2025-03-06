 /**
 * loader.js
 * Optimierter Ressourcenlader für JavaScript mit Performance-Verbesserungen
 */

// Modul-Status
const Loader = {
    // Geladene Ressourcen
    loaded: {
        scripts: {},
        styles: {},
        modules: {}
    },
    
    // Anstehende Ladeprozesse
    pending: {
        scripts: {},
        styles: {},
        modules: {}
    },
    
    // Konfiguration
    config: {
        basePath: '',
        version: '',
        debug: false
    }
};

/**
 * Loader konfigurieren
 * @param {Object} options Konfigurationsoptionen
 */
export function configureLoader(options = {}) {
    Loader.config = {
        ...Loader.config,
        ...options
    };
    
    // Basis-Pfad richtig formatieren
    if (Loader.config.basePath && !Loader.config.basePath.endsWith('/')) {
        Loader.config.basePath += '/';
    }
    
    if (Loader.config.debug) {
        console.log('Loader konfiguriert:', Loader.config);
    }
}

/**
 * Ressourcen-URL mit Version erstellen
 * @param {string} path Ressourcen-Pfad
 * @returns {string} Vollständige URL
 */
function createResourceUrl(path) {
    // Prüfen, ob es sich um eine absolute URL handelt
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
        return path;
    }
    
    // Basis-URL und Version hinzufügen
    let url = Loader.config.basePath + path;
    
    // Cache-Busting-Parameter hinzufügen, wenn Version angegeben
    if (Loader.config.version) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}v=${Loader.config.version}`;
    }
    
    return url;
}

/**
 * Script laden
 * @param {string} path Script-URL oder -Pfad
 * @param {Object} options Ladeoptionen (async, defer, module)
 * @returns {Promise} Promise, das erfüllt wird, wenn das Script geladen ist
 */
export function loadScript(path, options = {}) {
    const url = createResourceUrl(path);
    
    // Prüfen, ob bereits geladen oder in Bearbeitung
    if (Loader.loaded.scripts[url]) {
        return Promise.resolve();
    }
    
    if (Loader.pending.scripts[url]) {
        return Loader.pending.scripts[url];
    }
    
    // Neue Anfrage erstellen
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        
        script.src = url;
        
        // Optionen anwenden
        if (options.async !== false) script.async = true;
        if (options.defer) script.defer = true;
        if (options.module) script.type = 'module';
        if (options.id) script.id = options.id;
        
        // Load- und Error-Handler
        script.onload = () => {
            if (Loader.config.debug) {
                console.log(`Script geladen: ${url}`);
            }
            Loader.loaded.scripts[url] = true;
            delete Loader.pending.scripts[url];
            resolve();
        };
        
        script.onerror = (error) => {
            console.error(`Fehler beim Laden des Scripts: ${url}`, error);
            delete Loader.pending.scripts[url];
            reject(error);
        };
        
        // Script zum Dokument hinzufügen
        document.head.appendChild(script);
    });
    
    // Als anhängig markieren
    Loader.pending.scripts[url] = promise;
    
    return promise;
}

/**
 * Stylesheet laden
 * @param {string} path Stylesheet-URL oder -Pfad
 * @param {Object} options Ladeoptionen (id, media)
 * @returns {Promise} Promise, das erfüllt wird, wenn das Stylesheet geladen ist
 */
export function loadStyle(path, options = {}) {
    const url = createResourceUrl(path);
    
    // Prüfen, ob bereits geladen oder in Bearbeitung
    if (Loader.loaded.styles[url]) {
        return Promise.resolve();
    }
    
    if (Loader.pending.styles[url]) {
        return Loader.pending.styles[url];
    }
    
    // Neue Anfrage erstellen
    const promise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        
        link.rel = 'stylesheet';
        link.href = url;
        
        // Optionen anwenden
        if (options.id) link.id = options.id;
        if (options.media) link.media = options.media;
        
        // Load- und Error-Handler
        link.onload = () => {
            if (Loader.config.debug) {
                console.log(`Stylesheet geladen: ${url}`);
            }
            Loader.loaded.styles[url] = true;
            delete Loader.pending.styles[url];
            resolve();
        };
        
        link.onerror = (error) => {
            console.error(`Fehler beim Laden des Stylesheets: ${url}`, error);
            delete Loader.pending.styles[url];
            reject(error);
        };
        
        // Link zum Dokument hinzufügen
        document.head.appendChild(link);
    });
    
    // Als anhängig markieren
    Loader.pending.styles[url] = promise;
    
    return promise;
}

/**
 * JavaScript-Modul dynamisch importieren
 * @param {string} path Modul-URL oder -Pfad
 * @returns {Promise} Promise, das mit dem geladenen Modul erfüllt wird
 */
export async function loadModule(path) {
    const url = createResourceUrl(path);
    
    // Prüfen, ob bereits geladen oder in Bearbeitung
    if (Loader.loaded.modules[url]) {
        return Loader.loaded.modules[url];
    }
    
    if (Loader.pending.modules[url]) {
        return Loader.pending.modules[url];
    }
    
    try {
        // Modul dynamisch importieren
        const modulePromise = import(/* webpackIgnore: true */ url);
        Loader.pending.modules[url] = modulePromise;
        
        const module = await modulePromise;
        
        if (Loader.config.debug) {
            console.log(`Modul geladen: ${url}`);
        }
        
        // Als geladen markieren
        Loader.loaded.modules[url] = module;
        delete Loader.pending.modules[url];
        
        return module;
    } catch (error) {
        console.error(`Fehler beim Laden des Moduls: ${url}`, error);
        delete Loader.pending.modules[url];
        throw error;
    }
}

/**
 * Mehrere Scripts parallel laden
 * @param {Array} paths Array von Script-Pfaden
 * @param {Object} options Ladeoptionen
 * @returns {Promise} Promise, das erfüllt wird, wenn alle Scripts geladen sind
 */
export function loadScripts(paths, options = {}) {
    const promises = paths.map(path => loadScript(path, options));
    return Promise.all(promises);
}

/**
 * Mehrere Stylesheets parallel laden
 * @param {Array} paths Array von Stylesheet-Pfaden
 * @param {Object} options Ladeoptionen
 * @returns {Promise} Promise, das erfüllt wird, wenn alle Stylesheets geladen sind
 */
export function loadStyles(paths, options = {}) {
    const promises = paths.map(path => loadStyle(path, options));
    return Promise.all(promises);
}

/**
 * Scripts und Styles laden, die von einer Komponente benötigt werden
 * @param {Object} dependencyMap Abhängigkeitsmap { scripts: [], styles: [] }
 * @returns {Promise} Promise, das erfüllt wird, wenn alle Ressourcen geladen sind
 */
export async function loadDependencies(dependencyMap) {
    const promises = [];
    
    if (dependencyMap.styles && dependencyMap.styles.length > 0) {
        promises.push(loadStyles(dependencyMap.styles));
    }
    
    if (dependencyMap.scripts && dependencyMap.scripts.length > 0) {
        promises.push(loadScripts(dependencyMap.scripts));
    }
    
    return Promise.all(promises);
}

/**
 * Prüfen, ob eine Ressource bereits geladen wurde
 * @param {string} path Ressourcen-Pfad
 * @param {string} type Ressourcen-Typ ('script', 'style', 'module')
 * @returns {boolean} Ob die Ressource geladen wurde
 */
export function isLoaded(path, type = 'script') {
    const url = createResourceUrl(path);
    
    switch (type) {
        case 'script':
            return !!Loader.loaded.scripts[url];
        case 'style':
            return !!Loader.loaded.styles[url];
        case 'module':
            return !!Loader.loaded.modules[url];
        default:
            return false;
    }
}

/**
 * Script blockierend laden (nicht empfohlen)
 * @param {string} path Script-URL oder -Pfad
 * @returns {void}
 */
export function loadScriptSync(path) {
    const url = createResourceUrl(path);
    
    // Synchrones Laden des Scripts
    document.write(`<script src="${url}"></script>`);
    
    // Als geladen markieren
    Loader.loaded.scripts[url] = true;
}

/**
 * Inline-Script zum Dokument hinzufügen
 * @param {string} code JavaScript-Code
 * @returns {Promise} Promise, das erfüllt wird, wenn das Script hinzugefügt wurde
 */
export function addInlineScript(code) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.textContent = code;
        document.head.appendChild(script);
        resolve();
    });
}

/**
 * Inline-Stylesheet zum Dokument hinzufügen
 * @param {string} css CSS-Code
 * @returns {Promise} Promise, das erfüllt wird, wenn das Stylesheet hinzugefügt wurde
 */
export function addInlineStyle(css) {
    return new Promise((resolve) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        resolve();
    });
}

/**
 * Zeigt Debug-Informationen zum Lader-Status an
 * @returns {Object} Lader-Status
 */
export function getLoaderStatus() {
    return {
        loaded: {
            scripts: Object.keys(Loader.loaded.scripts),
            styles: Object.keys(Loader.loaded.styles),
            modules: Object.keys(Loader.loaded.modules)
        },
        pending: {
            scripts: Object.keys(Loader.pending.scripts),
            styles: Object.keys(Loader.pending.styles),
            modules: Object.keys(Loader.pending.modules)
        },
        config: Loader.config
    };
}

// Standardkonfiguration auf Basis des aktuellen Skripts
const defaultBasePath = document.currentScript ? 
    document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf('/') + 1) : 
    '';

// Loader mit Standardwerten konfigurieren
configureLoader({
    basePath: defaultBasePath,
    version: document.currentScript?.getAttribute('data-version') || '',
    debug: document.currentScript?.getAttribute('data-debug') === 'true'
});