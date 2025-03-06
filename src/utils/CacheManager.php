 <?php
/**
 * CacheManager.php
 * Einfaches aber effektives Caching-System
 */

class CacheManager {
    /**
     * Cache-Verzeichnis
     * @var string
     */
    private static $cacheDir = __DIR__ . '/../cache/';
    
    /**
     * Standard-Cache-Lebenszeit in Sekunden (1 Stunde)
     * @var int
     */
    private static $defaultTtl = 3600;
    
    /**
     * Ob Caching aktiviert ist
     * @var bool
     */
    private static $enabled = true;
    
    /**
     * Cache-System initialisieren
     * 
     * @param string $cacheDir Alternatives Cache-Verzeichnis
     * @param bool $enabled Ob Caching aktiviert sein soll
     * @return bool Erfolgsstatus
     */
    public static function init($cacheDir = null, $enabled = true) {
        // Cache-Verzeichnis überschreiben, falls angegeben
        if ($cacheDir !== null) {
            self::$cacheDir = rtrim($cacheDir, '/') . '/';
        }
        
        // Caching-Status setzen
        self::$enabled = $enabled;
        
        // Cache-Verzeichnis erstellen, falls es nicht existiert
        if (self::$enabled && !is_dir(self::$cacheDir)) {
            if (!mkdir(self::$cacheDir, 0755, true)) {
                error_log('Cache-Verzeichnis konnte nicht erstellt werden: ' . self::$cacheDir);
                self::$enabled = false;
                return false;
            }
            
            // .htaccess-Datei erstellen, um direkten Zugriff zu blockieren
            $htaccess = "Deny from all\n";
            file_put_contents(self::$cacheDir . '.htaccess', $htaccess);
        }
        
        return self::$enabled;
    }
    
    /**
     * Cache-Status setzen
     * 
     * @param bool $enabled Ob Caching aktiviert sein soll
     */
    public static function setEnabled($enabled) {
        self::$enabled = $enabled;
    }
    
    /**
     * Cache-Lebenszeit setzen
     * 
     * @param int $seconds Standardlebenszeit in Sekunden
     */
    public static function setDefaultTtl($seconds) {
        self::$defaultTtl = max(1, (int)$seconds);
    }
    
    /**
     * Eindeutigen Cache-Schlüssel generieren
     * 
     * @param string $key Basis-Cache-Schlüssel
     * @param array $params Zusätzliche Parameter, die den Cache-Schlüssel beeinflussen
     * @return string Eindeutiger Cache-Schlüssel
     */
    public static function generateKey($key, $params = []) {
        if (!empty($params)) {
            // Parameter sortieren, um konsistente Schlüsselgenerierung sicherzustellen
            ksort($params);
            $paramString = json_encode($params);
            $key .= '_' . md5($paramString);
        }
        
        // Ungültige Zeichen für Dateinamen entfernen
        return preg_replace('/[^a-zA-Z0-9_-]/', '_', $key);
    }
    
    /**
     * Daten im Cache speichern
     * 
     * @param string $key Cache-Schlüssel
     * @param mixed $data Zu speichernde Daten
     * @param int|null $ttl Lebensdauer in Sekunden (null für Standard)
     * @return bool Erfolgsstatus
     */
    public static function set($key, $data, $ttl = null) {
        if (!self::$enabled) {
            return false;
        }
        
        $ttl = $ttl === null ? self::$defaultTtl : max(1, (int)$ttl);
        
        $cacheFile = self::$cacheDir . $key;
        
        // Cache-Inhalt erstellen
        $content = [
            'data' => $data,
            'expires' => time() + $ttl,
            'created' => time()
        ];
        
        // Daten serialisieren und speichern
        $serialized = serialize($content);
        
        if (file_put_contents($cacheFile, $serialized, LOCK_EX) === false) {
            error_log('Cache konnte nicht gespeichert werden: ' . $key);
            return false;
        }
        
        return true;
    }
    
    /**
     * Daten aus dem Cache abrufen
     * 
     * @param string $key Cache-Schlüssel
     * @param mixed $default Standardwert, falls Cache nicht gefunden
     * @return mixed Cache-Daten oder Standardwert
     */
    public static function get($key, $default = null) {
        if (!self::$enabled) {
            return $default;
        }
        
        $cacheFile = self::$cacheDir . $key;
        
        // Prüfen, ob Cache-Datei existiert
        if (!file_exists($cacheFile)) {
            return $default;
        }
        
        // Cache-Inhalt lesen
        $content = file_get_contents($cacheFile);
        
        if ($content === false) {
            return $default;
        }
        
        try {
            // Inhalt deserialisieren
            $data = unserialize($content);
            
            // Prüfen, ob Cache abgelaufen ist
            if (!is_array($data) || !isset($data['expires']) || $data['expires'] < time()) {
                // Veralteten Cache löschen
                @unlink($cacheFile);
                return $default;
            }
            
            return $data['data'];
        } catch (Exception $e) {
            error_log('Cache konnte nicht deserialisiert werden: ' . $e->getMessage());
            return $default;
        }
    }
    
    /**
     * Daten im Cache abrufen oder mit einer Callback-Funktion erzeugen
     * 
     * @param string $key Cache-Schlüssel
     * @param callable $callback Funktion zum Erzeugen der Daten
     * @param int|null $ttl Lebensdauer in Sekunden (null für Standard)
     * @param array $params Parameter für die Callback-Funktion
     * @return mixed Cache-Daten oder Rückgabewert des Callbacks
     */
    public static function remember($key, $callback, $ttl = null, $params = []) {
        // Zuerst im Cache nachsehen
        $cachedData = self::get($key);
        
        if ($cachedData !== null) {
            return $cachedData;
        }
        
        // Daten mit Callback erzeugen
        $fresh = call_user_func_array($callback, $params);
        
        // Neue Daten im Cache speichern
        self::set($key, $fresh, $ttl);
        
        return $fresh;
    }
    
    /**
     * Cache-Eintrag löschen
     * 
     * @param string $key Cache-Schlüssel
     * @return bool Erfolgsstatus
     */
    public static function delete($key) {
        if (!self::$enabled) {
            return false;
        }
        
        $cacheFile = self::$cacheDir . $key;
        
        if (file_exists($cacheFile)) {
            return @unlink($cacheFile);
        }
        
        return true;
    }
    
    /**
     * Prüfen, ob ein Cache-Eintrag existiert und gültig ist
     * 
     * @param string $key Cache-Schlüssel
     * @return bool Ob gültiger Cache existiert
     */
    public static function has($key) {
        if (!self::$enabled) {
            return false;
        }
        
        $cacheFile = self::$cacheDir . $key;
        
        // Prüfen, ob Cache-Datei existiert
        if (!file_exists($cacheFile)) {
            return false;
        }
        
        // Cache-Inhalt lesen und auf Gültigkeit prüfen
        $content = file_get_contents($cacheFile);
        
        if ($content === false) {
            return false;
        }
        
        try {
            $data = unserialize($content);
            
            // Prüfen, ob Cache abgelaufen ist
            if (!is_array($data) || !isset($data['expires']) || $data['expires'] < time()) {
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Mehrere Cache-Einträge gleichzeitig abrufen
     * 
     * @param array $keys Array von Cache-Schlüsseln
     * @return array Assoziatives Array mit Cache-Daten
     */
    public static function getMultiple($keys) {
        $result = [];
        
        foreach ($keys as $key) {
            $result[$key] = self::get($key);
        }
        
        return $result;
    }
    
    /**
     * Mehrere Cache-Einträge gleichzeitig speichern
     * 
     * @param array $items Assoziatives Array mit Schlüssel => Wert-Paaren
     * @param int|null $ttl Lebensdauer in Sekunden (null für Standard)
     * @return bool Erfolgsstatus
     */
    public static function setMultiple($items, $ttl = null) {
        $success = true;
        
        foreach ($items as $key => $value) {
            $result = self::set($key, $value, $ttl);
            $success = $success && $result;
        }
        
        return $success;
    }
    
    /**
     * Mehrere Cache-Einträge gleichzeitig löschen
     * 
     * @param array $keys Array von Cache-Schlüsseln
     * @return bool Erfolgsstatus
     */
    public static function deleteMultiple($keys) {
        $success = true;
        
        foreach ($keys as $key) {
            $result = self::delete($key);
            $success = $success && $result;
        }
        
        return $success;
    }
    
    /**
     * Gesamten Cache löschen oder nach Präfix filtern
     * 
     * @param string $prefix Optionaler Präfix zum Filtern
     * @return bool Erfolgsstatus
     */
    public static function clear($prefix = '') {
        if (!self::$enabled) {
            return false;
        }
        
        $success = true;
        
        // Alle Cache-Dateien auflisten
        $files = glob(self::$cacheDir . $prefix . '*');
        
        foreach ($files as $file) {
            if (is_file($file)) {
                $result = @unlink($file);
                $success = $success && $result;
            }
        }
        
        return $success;
    }
    
    /**
     * Abgelaufenen Cache aufräumen
     * 
     * @return int Anzahl gelöschter Cache-Einträge
     */
    public static function cleanExpired() {
        if (!self::$enabled) {
            return 0;
        }
        
        $count = 0;
        
        // Alle Cache-Dateien auflisten
        $files = glob(self::$cacheDir . '*');
        
        foreach ($files as $file) {
            if (is_file($file) && pathinfo($file, PATHINFO_BASENAME) !== '.htaccess') {
                // Cache-Inhalt lesen
                $content = file_get_contents($file);
                
                if ($content !== false) {
                    try {
                        $data = unserialize($content);
                        
                        // Prüfen, ob Cache abgelaufen ist
                        if (is_array($data) && isset($data['expires']) && $data['expires'] < time()) {
                            if (@unlink($file)) {
                                $count++;
                            }
                        }
                    } catch (Exception $e) {
                        // Beschädigte Cache-Datei löschen
                        @unlink($file);
                        $count++;
                    }
                }
            }
        }
        
        return $count;
    }
    
    /**
     * Cache-Info abrufen
     * 
     * @return array Cache-Statistiken
     */
    public static function getInfo() {
        if (!self::$enabled) {
            return [
                'enabled' => false,
                'directory' => self::$cacheDir,
                'items' => 0,
                'size' => 0
            ];
        }
        
        $totalSize = 0;
        $items = 0;
        $expired = 0;
        
        // Alle Cache-Dateien auflisten
        $files = glob(self::$cacheDir . '*');
        
        foreach ($files as $file) {
            if (is_file($file) && pathinfo($file, PATHINFO_BASENAME) !== '.htaccess') {
                $items++;
                $totalSize += filesize($file);
                
                // Prüfen, ob Cache abgelaufen ist
                $content = file_get_contents($file);
                
                if ($content !== false) {
                    try {
                        $data = unserialize($content);
                        
                        if (is_array($data) && isset($data['expires']) && $data['expires'] < time()) {
                            $expired++;
                        }
                    } catch (Exception $e) {
                        $expired++;
                    }
                }
            }
        }
        
        return [
            'enabled' => self::$enabled,
            'directory' => self::$cacheDir,
            'items' => $items,
            'expired' => $expired,
            'size' => $totalSize,
            'size_formatted' => self::formatSize($totalSize),
            'default_ttl' => self::$defaultTtl
        ];
    }
    
    /**
     * Dateigröße formatieren
     * 
     * @param int $bytes Größe in Bytes
     * @return string Formatierte Größe
     */
    private static function formatSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

// Cache-System initialisieren
CacheManager::init();