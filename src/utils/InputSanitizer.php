 <?php
/**
 * InputSanitizer.php
 * Erweiterte Funktionen zur Eingabebereinigung und XSS-Prävention
 */

class InputSanitizer {
    /**
     * Bereinigt Texteingaben für sichere Ausgabe in HTML
     * 
     * @param string|array $input Die zu bereinigende Eingabe
     * @param bool $allow_newlines Ob Zeilenumbrüche erlaubt sind
     * @return string|array Bereinigte Eingabe
     */
    public static function sanitizeText($input, $allow_newlines = false) {
        if (is_array($input)) {
            return array_map(function($item) use ($allow_newlines) {
                return self::sanitizeText($item, $allow_newlines);
            }, $input);
        }
        
        // Zuerst Zeichenkodierung stabilisieren (UTF-8 erzwingen)
        if (!mb_check_encoding($input, 'UTF-8')) {
            $input = mb_convert_encoding($input, 'UTF-8', 'UTF-8');
        }
        
        // Alle HTML-Tags entfernen
        $input = strip_tags($input);
        
        // Unsichtbare Zeichen entfernen, aber Leerzeichen und Zeilenumbrüche beibehalten
        $input = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $input);
        
        // HTML-Zeichen escapen
        $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Wenn Zeilenumbrüche nicht erlaubt sind, alle entfernen
        if (!$allow_newlines) {
            $input = str_replace(["\r", "\n"], '', $input);
        }
        
        return $input;
    }
    
    /**
     * Bereitet Text für die sichere Verwendung in Datenbankanfragen vor (nicht als Ersatz für prepared statements)
     * 
     * @param string|array $input Die zu bereinigende Eingabe
     * @return string|array Bereinigte Eingabe
     */
    public static function sanitizeForDatabase($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeForDatabase'], $input);
        }
        
        // Entfernt potenziell gefährliche Zeichen
        return trim(stripslashes($input));
    }
    
    /**
     * Bereinigt HTML-Inhalte für sichere Speicherung und Anzeige
     * Erlaubt bestimmte HTML-Tags, aber entfernt Skripte und gefährliche Attribute
     * 
     * @param string $html Der zu bereinigende HTML-Inhalt
     * @return string Bereinigter HTML-Inhalt
     */
    public static function sanitizeHtml($html) {
        if (empty($html)) {
            return '';
        }
        
        // Laden der HTML Purifier-Bibliothek, wenn verfügbar
        if (class_exists('HTMLPurifier')) {
            $config = HTMLPurifier_Config::createDefault();
            $config->set('HTML.Allowed', 'p,b,i,strong,em,u,h1,h2,h3,h4,h5,h6,blockquote,pre,a[href|title],ul,ol,li,br,span[style],img[src|alt|title|width|height],table,thead,tbody,tr,th,td,hr,div');
            $config->set('HTML.AllowedAttributes', 'src, href, alt, title, width, height, style, class');
            $config->set('CSS.AllowedProperties', 'color,font-weight,font-style,text-align,text-decoration,margin,padding,float');
            $config->set('AutoFormat.AutoParagraph', true);
            $config->set('AutoFormat.RemoveEmpty', true);
            $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true]);
            $config->set('HTML.TargetBlank', true);
            
            $purifier = new HTMLPurifier($config);
            return $purifier->purify($html);
        }
        
        // Fallback, wenn HTML Purifier nicht verfügbar ist
        // Nur bestimmte Tags und Attribute erlauben
        $allowed_tags = '<p><br><b><i><strong><em><u><h1><h2><h3><h4><h5><h6><blockquote><pre><a><ul><ol><li><span><img><table><thead><tbody><tr><th><td><hr><div>';
        
        // Zuerst eine grundlegende Bereinigung durchführen
        $html = strip_tags($html, $allowed_tags);
        
        // Entfernen potenziell gefährlicher Attribute
        $html = preg_replace('/(<[^>]+)(\s+on\w+\s*=\s*["\'][^"\']*["\'])/i', '$1', $html);
        $html = preg_replace('/(<[^>]+)(\s+javascript\s*:[^"\'>]*)/i', '$1', $html);
        
        // Href-Attribute bereinigen (nur http, https, mailto, tel erlauben)
        $html = preg_replace_callback('/(<a[^>]+href\s*=\s*["\'])([^"\']+)(["\'][^>]*>)/i', function($matches) {
            $url = $matches[2];
            $scheme = parse_url($url, PHP_URL_SCHEME);
            
            if (empty($scheme) || in_array(strtolower($scheme), ['http', 'https', 'mailto', 'tel'])) {
                return $matches[1] . $url . $matches[3];
            } else {
                return $matches[1] . '#' . $matches[3];
            }
        }, $html);
        
        return $html;
    }
    
    /**
     * Validiert und bereinigt eine E-Mail-Adresse
     * 
     * @param string $email Die zu validierende E-Mail-Adresse
     * @return string|false Bereinigte E-Mail-Adresse oder false, wenn ungültig
     */
    public static function validateEmail($email) {
        $email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : false;
    }
    
    /**
     * Validiert und bereinigt eine URL
     * 
     * @param string $url Die zu validierende URL
     * @param array $allowed_schemes Erlaubte URL-Schemas (Standard: http, https)
     * @return string|false Bereinigte URL oder false, wenn ungültig
     */
    public static function validateUrl($url, $allowed_schemes = ['http', 'https']) {
        $url = filter_var(trim($url), FILTER_SANITIZE_URL);
        
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }
        
        $scheme = parse_url($url, PHP_URL_SCHEME);
        
        if (!in_array(strtolower($scheme), $allowed_schemes)) {
            return false;
        }
        
        return $url;
    }
    
    /**
     * Validiert und bereinigt einen Dateinamen
     * 
     * @param string $filename Der zu validierende Dateiname
     * @return string Bereinigter Dateiname
     */
    public static function sanitizeFilename($filename) {
        // Nur alphanumerische Zeichen, Bindestrich und Unterstrich erlauben
        $filename = preg_replace('/[^\w\-\.]/', '', $filename);
        
        // Entfernen doppelter Punkte, um Directory Traversal zu verhindern
        $filename = str_replace('..', '', $filename);
        
        return $filename;
    }
    
    /**
     * Bereinigt Daten für die sichere Ausgabe in JSON
     * 
     * @param mixed $data Die zu bereinigenden Daten
     * @return mixed Bereinigte Daten
     */
    public static function sanitizeForJson($data) {
        if (is_array($data)) {
            // Array rekursiv durchlaufen
            $result = [];
            foreach ($data as $key => $value) {
                $result[$key] = self::sanitizeForJson($value);
            }
            return $result;
        } elseif (is_object($data)) {
            // Objekt in Array konvertieren und dann rekursiv durchlaufen
            return self::sanitizeForJson((array)$data);
        } elseif (is_string($data)) {
            // Ungültige UTF-8-Sequenzen entfernen oder ersetzen
            if (!mb_check_encoding($data, 'UTF-8')) {
                return mb_convert_encoding($data, 'UTF-8', 'UTF-8');
            }
            
            // Steuerzeichen entfernen (außer Tabs, Zeilenumbrüche)
            return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $data);
        } else {
            // Andere Datentypen unverändert lassen
            return $data;
        }
    }
    
    /**
     * Sicheres Parsen von JSON
     * 
     * @param string $json Die JSON-Zeichenfolge
     * @param bool $associative Ob ein Array statt Objekten zurückgegeben werden soll
     * @return mixed Geparste Daten oder null bei Fehler
     */
    public static function parseJson($json, $associative = true) {
        $data = json_decode($json, $associative);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('JSON-Parsing-Fehler: ' . json_last_error_msg());
            return null;
        }
        
        return $data;
    }
    
    /**
     * Validiert einen Datums-String
     * 
     * @param string $date Das zu validierende Datum
     * @param string $format Das erwartete Format (Standard: Y-m-d)
     * @return string|false Validiertes Datum oder false, wenn ungültig
     */
    public static function validateDate($date, $format = 'Y-m-d') {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date ? $date : false;
    }
    
    /**
     * Validiert eine Telefonnummer
     * 
     * @param string $phone Die zu validierende Telefonnummer
     * @return string|false Bereinigte Telefonnummer oder false, wenn ungültig
     */
    public static function validatePhone($phone) {
        // Entfernt alles außer Ziffern, +, und Klammern
        $phone = preg_replace('/[^\d\+\(\)]/', '', $phone);
        
        // Einfache Validierung (kann je nach Anforderungen angepasst werden)
        if (strlen($phone) < 7) {
            return false;
        }
        
        return $phone;
    }
    
    /**
     * Konvertiert HTML in sicheren Nur-Text
     * 
     * @param string $html Der HTML-Inhalt
     * @return string Nur-Text-Version
     */
    public static function htmlToPlainText($html) {
        // HTML-Tags entfernen
        $text = strip_tags($html);
        
        // HTML-Entities decodieren
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Mehrfache Leerzeichen/Zeilenumbrüche zusammenfassen
        $text = preg_replace('/\s+/', ' ', $text);
        
        return trim($text);
    }
}

// Aliasse für häufig verwendete Methoden
if (!function_exists('sanitize_text')) {
    function sanitize_text($input, $allow_newlines = false) {
        return InputSanitizer::sanitizeText($input, $allow_newlines);
    }
}

if (!function_exists('sanitize_html')) {
    function sanitize_html($html) {
        return InputSanitizer::sanitizeHtml($html);
    }
}

if (!function_exists('validate_email')) {
    function validate_email($email) {
        return InputSanitizer::validateEmail($email);
    }
}