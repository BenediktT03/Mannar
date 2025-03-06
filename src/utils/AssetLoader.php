 <?php
/**
 * AssetLoader.php
 * Optimiertes Asset-Management und Ressourcen-Laden
 */

class AssetLoader {
    // Cache-Buster-Version (bei Änderungen hochzählen)
    const VERSION = '1.0.0';
    
    // Cache für bereits registrierte Assets
    private static $registeredStyles = [];
    private static $registeredScripts = [];
    
    // Cache für bereits geladene Assets
    private static $loadedStyles = [];
    private static $loadedScripts = [];
    
    /**
     * CSS-Datei registrieren (noch nicht laden)
     *
     * @param string $handle Eindeutiger Bezeichner
     * @param string $path Pfad zur CSS-Datei
     * @param array $dependencies Array von Abhängigkeiten
     * @param bool $inFooter Ob das Asset im Footer geladen werden soll
     */
    public static function registerStyle($handle, $path, $dependencies = [], $inFooter = false) {
        self::$registeredStyles[$handle] = [
            'path' => $path,
            'dependencies' => $dependencies,
            'inFooter' => $inFooter,
            'loaded' => false
        ];
    }
    
    /**
     * JavaScript-Datei registrieren (noch nicht laden)
     *
     * @param string $handle Eindeutiger Bezeichner
     * @param string $path Pfad zur JS-Datei
     * @param array $dependencies Array von Abhängigkeiten
     * @param bool $inFooter Ob das Asset im Footer geladen werden soll
     * @param bool $async Ob das Script asynchron geladen werden soll
     * @param bool $defer Ob das Script verzögert geladen werden soll
     * @param bool $module Ob das Script als ES6-Modul geladen werden soll
     */
    public static function registerScript($handle, $path, $dependencies = [], $inFooter = true, $async = false, $defer = true, $module = false) {
        self::$registeredScripts[$handle] = [
            'path' => $path,
            'dependencies' => $dependencies,
            'inFooter' => $inFooter,
            'async' => $async,
            'defer' => $defer,
            'module' => $module,
            'loaded' => false
        ];
    }
    
    /**
     * CSS-Datei laden
     *
     * @param string $handle Eindeutiger Bezeichner
     * @return bool Ob das Laden erfolgreich war
     */
    public static function enqueueStyle($handle) {
        // Prüfen, ob bereits geladen
        if (isset(self::$loadedStyles[$handle])) {
            return true;
        }
        
        // Prüfen, ob registriert
        if (!isset(self::$registeredStyles[$handle])) {
            error_log("Style '$handle' nicht registriert");
            return false;
        }
        
        $style = self::$registeredStyles[$handle];
        
        // Abhängigkeiten laden
        foreach ($style['dependencies'] as $dependency) {
            self::enqueueStyle($dependency);
        }
        
        // Als geladen markieren
        self::$loadedStyles[$handle] = $style;
        self::$registeredStyles[$handle]['loaded'] = true;
        
        return true;
    }
    
    /**
     * JavaScript-Datei laden
     *
     * @param string $handle Eindeutiger Bezeichner
     * @return bool Ob das Laden erfolgreich war
     */
    public static function enqueueScript($handle) {
        // Prüfen, ob bereits geladen
        if (isset(self::$loadedScripts[$handle])) {
            return true;
        }
        
        // Prüfen, ob registriert
        if (!isset(self::$registeredScripts[$handle])) {
            error_log("Script '$handle' nicht registriert");
            return false;
        }
        
        $script = self::$registeredScripts[$handle];
        
        // Abhängigkeiten laden
        foreach ($script['dependencies'] as $dependency) {
            self::enqueueScript($dependency);
        }
        
        // Als geladen markieren
        self::$loadedScripts[$handle] = $script;
        self::$registeredScripts[$handle]['loaded'] = true;
        
        return true;
    }
    
    /**
     * Alle für Header geplanten Assets ausgeben
     *
     * @return string HTML für Header-Assets
     */
    public static function printHeaderAssets() {
        $output = '';
        
        // Styles im Header
        foreach (self::$loadedStyles as $handle => $style) {
            if (!$style['inFooter']) {
                $output .= self::generateStyleTag($handle, $style);
            }
        }
        
        // Scripts im Header
        foreach (self::$loadedScripts as $handle => $script) {
            if (!$script['inFooter']) {
                $output .= self::generateScriptTag($handle, $script);
            }
        }
        
        return $output;
    }
    
    /**
     * Alle für Footer geplanten Assets ausgeben
     *
     * @return string HTML für Footer-Assets
     */
    public static function printFooterAssets() {
        $output = '';
        
        // Styles im Footer
        foreach (self::$loadedStyles as $handle => $style) {
            if ($style['inFooter']) {
                $output .= self::generateStyleTag($handle, $style);
            }
        }
        
        // Scripts im Footer
        foreach (self::$loadedScripts as $handle => $script) {
            if ($script['inFooter']) {
                $output .= self::generateScriptTag($handle, $script);
            }
        }
        
        return $output;
    }
    
    /**
     * Style-Tag generieren
     *
     * @param string $handle Asset-Handle
     * @param array $style Style-Konfiguration
     * @return string HTML style-Tag
     */
    private static function generateStyleTag($handle, $style) {
        $path = self::getAssetPath($style['path']);
        $version = self::VERSION;
        
        return "<link rel='stylesheet' id='$handle-css' href='$path?ver=$version' type='text/css' media='all' />\n";
    }
    
    /**
     * Script-Tag generieren
     *
     * @param string $handle Asset-Handle
     * @param array $script Script-Konfiguration
     * @return string HTML script-Tag
     */
    private static function generateScriptTag($handle, $script) {
        $path = self::getAssetPath($script['path']);
        $version = self::VERSION;
        
        $async = $script['async'] ? ' async' : '';
        $defer = $script['defer'] ? ' defer' : '';
        $type = $script['module'] ? " type='module'" : '';
        
        return "<script id='$handle-js' src='$path?ver=$version'$async$defer$type></script>\n";
    }
    
    /**
     * Asset-Pfad ermitteln
     *
     * @param string $path Relativer Pfad
     * @return string Vollständiger Pfad
     */
    private static function getAssetPath($path) {
        // Prüfen, ob es sich um eine absolute URL handelt
        if (strpos($path, 'http://') === 0 || strpos($path, 'https://') === 0 || strpos($path, '//') === 0) {
            return $path;
        }
        
        // Prüfen, ob Pfad mit einem Schrägstrich beginnt
        if (strpos($path, '/') === 0) {
            return $path;
        }
        
        // Relativen Pfad in absoluten umwandeln
        $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        return "$basePath/$path";
    }
    
    /**
     * Inline-CSS ausgeben
     *
     * @param string $css CSS-Code
     * @param string $handle Optionaler Handle zur Identifikation
     * @return string HTML style-Tag
     */
    public static function printInlineStyle($css, $handle = 'custom') {
        return "<style id='inline-$handle'>\n$css\n</style>\n";
    }
    
    /**
     * Inline-JavaScript ausgeben
     *
     * @param string $js JavaScript-Code
     * @param string $handle Optionaler Handle zur Identifikation
     * @return string HTML script-Tag
     */
    public static function printInlineScript($js, $handle = 'custom') {
        return "<script id='inline-$handle'>\n$js\n</script>\n";
    }
    
    /**
     * Optimiertes Laden und Preconnecting für externe Ressourcen
     *
     * @param array $domains Liste der Domains für Preconnect
     * @return string HTML für Preconnect-Anweisungen
     */
    public static function printPreconnect($domains = []) {
        $output = '';
        
        // Standarddomains, falls nicht anders angegeben
        if (empty($domains)) {
            $domains = [
                'https://www.gstatic.com',
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
                'https://cdnjs.cloudflare.com'
            ];
        }
        
        foreach ($domains as $domain) {
            $output .= "<link rel='preconnect' href='$domain' crossorigin />\n";
            $output .= "<link rel='dns-prefetch' href='$domain' />\n";
        }
        
        return $output;
    }
    
    /**
     * Kritisches CSS für schnelleres Rendering ausgeben
     * 
     * @param string $cssFilePath Pfad zur kritischen CSS-Datei
     * @return string Inline-CSS oder leerer String bei Fehler
     */
    public static function printCriticalCSS($cssFilePath) {
        if (file_exists($cssFilePath)) {
            $css = file_get_contents($cssFilePath);
            if ($css) {
                return self::printInlineStyle($css, 'critical');
            }
        }
        
        return '';
    }
    
    /**
     * Registriere allgemeine Website-Assets
     */
    public static function registerCommonAssets() {
        // Core-Styles
        self::registerStyle('w3css', 'https://www.w3schools.com/w3css/4/w3.css');
        self::registerStyle('font-lato', 'https://fonts.googleapis.com/css?family=Lato:400,700&display=swap');
        self::registerStyle('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
        
        // Basis-CSS
        self::registerStyle('variables', 'assets/css/base/variables.css', ['w3css']);
        self::registerStyle('typography', 'assets/css/base/typography.css', ['variables', 'font-lato']);
        self::registerStyle('layout', 'assets/css/base/layout.css', ['variables']);
        
        // Komponenten-CSS
        self::registerStyle('navbar', 'assets/css/components/navbar.css', ['variables']);
        self::registerStyle('word-cloud', 'assets/css/components/word-cloud.css', ['variables']);
        self::registerStyle('forms', 'assets/css/components/forms.css', ['variables']);
        self::registerStyle('cards', 'assets/css/components/cards.css', ['variables']);
        
        // Hauptstile
        self::registerStyle('main', 'assets/css/main.css', ['variables', 'typography', 'layout', 'navbar', 'word-cloud', 'forms', 'cards']);
        self::registerStyle('admin', 'assets/css/admin.css', ['variables', 'typography', 'layout', 'navbar', 'forms', 'cards']);
        
        // Firebase-Scripts
        self::registerScript('firebase-app', 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js', [], true, false, true);
        self::registerScript('firebase-firestore', 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js', ['firebase-app'], true, false, true);
        self::registerScript('firebase-auth', 'https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js', ['firebase-app'], true, false, true);
        self::registerScript('firebase-storage', 'https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js', ['firebase-app'], true, false, true);
        
        // Admin-Scripts
        self::registerScript('tinymce', 'https://cdn.tiny.cloud/1/5pxzy8guun55o6z5mi0r8c4j8gk5hqeq3hpsotx123ak212k/tinymce/6/tinymce.min.js', [], true, false, true);
        self::registerScript('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', [], true, false, true);
        
        // Hauptscripts
        self::registerScript('main-js', 'assets/js/main.js', ['firebase-app', 'firebase-firestore', 'firebase-auth'], true, false, true, true);
        self::registerScript('admin-js', 'assets/js/admin.js', ['firebase-app', 'firebase-firestore', 'firebase-auth', 'firebase-storage'], true, false, true, true);
    }
    
    /**
     * Assets für eine bestimmte Seite laden
     * 
     * @param string $pageName Name der Seite (z.B. 'index', 'admin')
     */
    public static function loadPageAssets($pageName) {
        // Gemeinsame Assets registrieren
        self::registerCommonAssets();
        
        // Core-Styles immer laden
        self::enqueueStyle('w3css');
        self::enqueueStyle('font-lato');
        self::enqueueStyle('font-awesome');
        self::enqueueStyle('variables');
        self::enqueueStyle('typography');
        self::enqueueStyle('layout');
        
        // Komponenten-Styles immer laden
        self::enqueueStyle('navbar');
        self::enqueueStyle('forms');
        self::enqueueStyle('cards');
        
        // Seitenspezifische Assets laden
        switch ($pageName) {
            case 'index':
            case 'preview':
                self::enqueueStyle('word-cloud');
                self::enqueueStyle('main');
                self::enqueueScript('firebase-app');
                self::enqueueScript('firebase-firestore');
                self::enqueueScript('firebase-auth');
                self::enqueueScript('main-js');
                break;
                
            case 'admin-panel':
                self::enqueueStyle('word-cloud');
                self::enqueueStyle('admin');
                self::enqueueScript('firebase-app');
                self::enqueueScript('firebase-firestore');
                self::enqueueScript('firebase-auth');
                self::enqueueScript('firebase-storage');
                self::enqueueScript('tinymce');
                self::enqueueScript('chart-js');
                self::enqueueScript('admin-js');
                break;
                
            case 'page':
                self::enqueueStyle('main');
                self::enqueueScript('firebase-app');
                self::enqueueScript('firebase-firestore');
                self::enqueueScript('main-js');
                break;
                
            default:
                // Fallback zu Hauptstilen und -scripts
                self::enqueueStyle('main');
                self::enqueueScript('main-js');
        }
    }
}