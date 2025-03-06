 <?php
/**
 * ResponsiveImage.php
 * Komponente zur optimierten Anzeige von responsiven Bildern mit modernen Formaten
 */

class ResponsiveImage {
    /**
     * Standardbildgrößen für responsive Bilder
     * @var array
     */
    private static $defaultSizes = [
        'xs' => 480,
        'sm' => 768,
        'md' => 992,
        'lg' => 1200,
        'xl' => 1600,
        '2xl' => 2000
    ];
    
    /**
     * Standardbildformate in Reihenfolge der Präferenz
     * @var array
     */
    private static $defaultFormats = ['webp', 'avif', 'jpeg'];
    
    /**
     * Rendert ein responsives Bild mit allen optimierten Attributen
     *
     * @param string $src Pfad zum Originalbild
     * @param string $alt Alt-Text für das Bild
     * @param array $options Zusätzliche Optionen für das Bild
     * @return string HTML für das optimierte Bild
     */
    public static function render($src, $alt = '', $options = []) {
        // Optionen mit Standardwerten zusammenführen
        $options = array_merge([
            'class' => '',
            'id' => '',
            'sizes' => '(max-width: 768px) 100vw, 50vw',
            'loading' => 'lazy',
            'width' => null,
            'height' => null,
            'breakpoints' => self::$defaultSizes,
            'formats' => self::$defaultFormats,
            'preloadLargest' => false,
            'lazyload' => true,
            'placeholder' => true,
            'placeholderSize' => 64, // Größe des Platzhalters in Pixeln
            'blurhash' => null, // BlurHash für sehr kleine Vorschau
            'fit' => 'cover', // Bildzuschnitt (cover, contain, fill)
            'quality' => 80, // Bildqualität (0-100)
            'focalPoint' => null, // Fokuspunkt für Zuschnitt (x,y)
            'caption' => '',
            'lightbox' => false,
            'additionalAttributes' => []
        ], $options);
        
        // Bild-URL bereinigen und überprüfen
        $src = self::getImagePath($src);
        if (!$src) {
            return self::renderFallback($alt, $options);
        }
        
        // Bild-Abmessungen ermitteln
        list($originalWidth, $originalHeight) = self::getImageDimensions($src, $options['width'], $options['height']);
        
        // Wenn es ein SVG ist, vereinfachen wir die Ausgabe
        if (self::isSvg($src)) {
            return self::renderSvg($src, $alt, $originalWidth, $originalHeight, $options);
        }
        
        // Responsives Picture-Element mit unterschiedlichen Quellen generieren
        $html = '<picture>';
        
        // Für jedes Format und jeden Breakpoint eine <source> erstellen
        foreach ($options['formats'] as $format) {
            // Überprüfen, ob das Format unterstützt wird
            if (!in_array($format, ['webp', 'avif', 'jpeg', 'png', 'jpg'])) {
                continue;
            }
            
            $sourceUrls = [];
            foreach ($options['breakpoints'] as $name => $width) {
                // URL für diese Größe und dieses Format generieren
                $resizedUrl = self::getResizedImageUrl($src, [
                    'width' => $width,
                    'format' => $format,
                    'quality' => $options['quality'],
                    'fit' => $options['fit'],
                    'focalPoint' => $options['focalPoint']
                ]);
                
                if ($resizedUrl) {
                    $sourceUrls[] = "$resizedUrl {$width}w";
                }
            }
            
            if (!empty($sourceUrls)) {
                $mimeType = self::getMimeType($format);
                $html .= '<source type="' . $mimeType . '" srcset="' . implode(', ', $sourceUrls) . '" sizes="' . $options['sizes'] . '">';
            }
        }
        
        // Basis-Bild-Tag für Fallback
        $imgAttributes = [
            'src' => $src,
            'alt' => $alt,
            'class' => $options['class'],
            'sizes' => $options['sizes']
        ];
        
        // Width und Height für CLS-Prävention, wenn bekannt
        if ($originalWidth && $originalHeight) {
            $imgAttributes['width'] = $originalWidth;
            $imgAttributes['height'] = $originalHeight;
        }
        
        // ID-Attribut hinzufügen, wenn vorhanden
        if (!empty($options['id'])) {
            $imgAttributes['id'] = $options['id'];
        }
        
        // Lazy-Loading-Attribut
        if ($options['lazyload']) {
            $imgAttributes['loading'] = $options['loading'];
            if ($options['loading'] === 'lazy') {
                // Für JavaScript-basiertes Lazy-Loading
                $imgAttributes['data-src'] = $src;
                $imgAttributes['src'] = self::getPlaceholderImage($src, $options);
                $imgAttributes['class'] .= ' lazyload';
            }
        }
        
        // Title für Tooltip, wenn nicht vorhanden
        if (!empty($options['title'])) {
            $imgAttributes['title'] = $options['title'];
        }
        
        // Zusätzliche benutzerdefinierte Attribute
        foreach ($options['additionalAttributes'] as $attr => $value) {
            $imgAttributes[$attr] = $value;
        }
        
        // Attribute zu String umwandeln
        $attributesString = self::buildAttributesString($imgAttributes);
        
        // Img-Tag hinzufügen
        $html .= "<img {$attributesString}>";
        
        // Picture-Tag schließen
        $html .= '</picture>';
        
        // Figcaption für Bildunterschrift hinzufügen, wenn vorhanden
        if (!empty($options['caption'])) {
            $html = "<figure class=\"image-figure\">{$html}<figcaption>{$options['caption']}</figcaption></figure>";
        }
        
        // Lightbox-Wrapper hinzufügen, wenn aktiviert
        if ($options['lightbox']) {
            $lightboxId = !empty($options['id']) ? $options['id'] . '-lightbox' : 'img-' . md5($src) . '-lightbox';
            $html = "<a href=\"{$src}\" class=\"lightbox-link\" data-lightbox=\"{$lightboxId}\">{$html}</a>";
        }
        
        return $html;
    }
    
    /**
     * Rendert ein SVG-Bild direkt
     *
     * @param string $src Pfad zum SVG
     * @param string $alt Alt-Text
     * @param int $width Bildbreite
     * @param int $height Bildhöhe
     * @param array $options Zusätzliche Optionen
     * @return string HTML für das SVG
     */
    private static function renderSvg($src, $alt, $width, $height, $options) {
        $attributes = [
            'src' => $src,
            'alt' => $alt,
            'class' => $options['class']
        ];
        
        // Width und Height hinzufügen, wenn bekannt
        if ($width && $height) {
            $attributes['width'] = $width;
            $attributes['height'] = $height;
        }
        
        // ID hinzufügen, wenn vorhanden
        if (!empty($options['id'])) {
            $attributes['id'] = $options['id'];
        }
        
        // Zusätzliche benutzerdefinierte Attribute
        foreach ($options['additionalAttributes'] as $attr => $value) {
            $attributes[$attr] = $value;
        }
        
        // Attribute zu String umwandeln
        $attributesString = self::buildAttributesString($attributes);
        
        // SVG-Tag erstellen
        $html = "<img {$attributesString}>";
        
        // Figcaption für Bildunterschrift hinzufügen, wenn vorhanden
        if (!empty($options['caption'])) {
            $html = "<figure class=\"image-figure\">{$html}<figcaption>{$options['caption']}</figcaption></figure>";
        }
        
        return $html;
    }
    
    /**
     * Rendert ein Fallback-Bild oder Platzhalter
     *
     * @param string $alt Alt-Text
     * @param array $options Optionen
     * @return string HTML für den Platzhalter
     */
    private static function renderFallback($alt, $options) {
        $width = $options['width'] ?: 300;
        $height = $options['height'] ?: 200;
        
        // Platzhalter-Bildinformationen
        $bgColor = '#f5f5f5';
        $textColor = '#333333';
        
        // SVG-Platzhalter generieren
        $svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '">';
        $svgContent .= '<rect width="100%" height="100%" fill="' . $bgColor . '"/>';
        $svgContent .= '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="' . $textColor . '">';
        $svgContent .= $alt ?: 'Bild nicht verfügbar';
        $svgContent .= '</text>';
        $svgContent .= '</svg>';
        
        // Base64-Kodierung für direktes Einbetten
        $base64 = base64_encode($svgContent);
        $dataUri = 'data:image/svg+xml;base64,' . $base64;
        
        $attributes = [
            'src' => $dataUri,
            'alt' => $alt,
            'width' => $width,
            'height' => $height,
            'class' => $options['class'] . ' placeholder-image'
        ];
        
        // ID hinzufügen, wenn vorhanden
        if (!empty($options['id'])) {
            $attributes['id'] = $options['id'];
        }
        
        // Attribute zu String umwandeln
        $attributesString = self::buildAttributesString($attributes);
        
        return "<img {$attributesString}>";
    }
    
    /**
     * Erzeugt einen HTML-Attribut-String
     *
     * @param array $attributes Assoziatives Array mit Attributen
     * @return string Attributstring
     */
    private static function buildAttributesString($attributes) {
        $result = [];
        
        foreach ($attributes as $key => $value) {
            if ($value === null || $value === false) {
                continue;
            }
            
            if ($value === true) {
                $result[] = $key;
            } else {
                $result[] = $key . '="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"';
            }
        }
        
        return implode(' ', $result);
    }
    
    /**
     * Holt den vollständigen Pfad zum Bild
     *
     * @param string $src Bild-URL oder -Pfad
     * @return string|bool Vollständiger Pfad oder false bei Fehler
     */
    private static function getImagePath($src) {
        // Prüfen, ob es eine absolute URL ist
        if (filter_var($src, FILTER_VALIDATE_URL)) {
            return $src;
        }
        
        // Relative URL zur absoluten machen
        if (strpos($src, '/') === 0) {
            // Absoluter Pfad vom Stammverzeichnis
            return $src;
        }
        
        // Relativer Pfad
        $basePath = defined('SITE_URL') ? SITE_URL : '';
        $basePath = rtrim($basePath, '/');
        
        return $basePath . '/' . ltrim($src, '/');
    }
    
    /**
     * Ermittelt die Dimensionen eines Bildes
     *
     * @param string $src Bildpfad
     * @param int|null $width Übergebene Breite
     * @param int|null $height Übergebene Höhe
     * @return array Array mit [Breite, Höhe]
     */
    private static function getImageDimensions($src, $width, $height) {
        // Wenn beide Dimensionen übergeben wurden, diese verwenden
        if ($width && $height) {
            return [$width, $height];
        }
        
        // Versuchen, die Dimensionen aus dem Bild zu lesen
        if (file_exists($_SERVER['DOCUMENT_ROOT'] . parse_url($src, PHP_URL_PATH))) {
            $imagePath = $_SERVER['DOCUMENT_ROOT'] . parse_url($src, PHP_URL_PATH);
            $size = getimagesize($imagePath);
            if ($size) {
                return [$size[0], $size[1]];
            }
        }
        
        // Standardwerte zurückgeben, wenn nichts anderes verfügbar ist
        return [$width ?: 0, $height ?: 0];
    }
    
    /**
     * Erstellt eine URL für ein optimiertes Bild
     *
     * @param string $src Originalbild-URL
     * @param array $options Optionen für die Bildtransformation
     * @return string Transformierte Bild-URL
     */
    private static function getResizedImageUrl($src, $options) {
        // Prüfen, ob Bildprozessierer verfügbar ist
        // Hier könnte eine Anbindung an einen Bildoptimierer wie Cloudinary, Imgix, etc. erfolgen
        
        // Standardmäßig URL mit Breiten-Parameter zurückgeben
        $width = $options['width'] ?? 0;
        
        // Wenn es eine externe URL ist, unverändert zurückgeben
        if (filter_var($src, FILTER_VALIDATE_URL)) {
            return $src;
        }
        
        // Einfache lokale URL-Transformation (kann durch professionellere Lösungen ersetzt werden)
        $parsedUrl = parse_url($src);
        $path = $parsedUrl['path'] ?? '';
        $pathInfo = pathinfo($path);
        
        $filename = $pathInfo['filename'];
        $extension = $pathInfo['extension'] ?? '';
        
        // Format transformieren, wenn nötig
        $format = $options['format'] ?? $extension;
        
        // Neue Dateiendung erstellen
        $transformedPath = $pathInfo['dirname'] . '/' . $filename;
        
        // Größeninformationen hinzufügen
        if ($width) {
            $transformedPath .= "-{$width}";
        }
        
        // Qualität hinzufügen, wenn angegeben
        if (isset($options['quality']) && $options['quality'] < 100) {
            $transformedPath .= "-q{$options['quality']}";
        }
        
        // Format hinzufügen
        $transformedPath .= ".{$format}";
        
        // In diesem Beispiel geben wir einfach die Originalquelle zurück,
        // da wir keine tatsächliche Bildtransformation durchführen
        return $src;
    }
    
    /**
     * Gibt den MIME-Typ für ein Bildformat zurück
     *
     * @param string $format Bildformat
     * @return string MIME-Typ
     */
    private static function getMimeType($format) {
        $mimeTypes = [
            'jpeg' => 'image/jpeg',
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'avif' => 'image/avif',
            'svg' => 'image/svg+xml'
        ];
        
        return $mimeTypes[$format] ?? 'image/jpeg';
    }
    
    /**
     * Prüft, ob eine Datei eine SVG ist
     *
     * @param string $src Bildpfad
     * @return bool Ob es sich um eine SVG handelt
     */
    private static function isSvg($src) {
        // Prüfen, ob die Dateiendung .svg ist
        $pathInfo = pathinfo(parse_url($src, PHP_URL_PATH));
        return strtolower($pathInfo['extension'] ?? '') === 'svg';
    }
    
    /**
     * Erstellt ein Platzhalter-Bild für Lazy-Loading
     *
     * @param string $src Originalbild-URL
     * @param array $options Optionen
     * @return string Platzhalter-URL
     */
    private static function getPlaceholderImage($src, $options) {
        // Wenn ein BlurHash angegeben ist, diesen verwenden
        if (!empty($options['blurhash'])) {
            return self::getBlurHashPlaceholder($options['blurhash'], $options['width'], $options['height']);
        }
        
        // Alternativ ein sehr kleines Vorschaubild verwenden
        if ($options['placeholder']) {
            // Könnte durch einen tatsächlichen Platzhalter ersetzt werden
            // Hier würde man eine stark verkleinerte Version des Bildes generieren
            
            // Für dieses Beispiel verwenden wir ein einfaches SVG als Platzhalter
            $width = $options['width'] ?: 300;
            $height = $options['height'] ?: 200;
            
            $svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '">';
            $svgContent .= '<rect width="100%" height="100%" fill="#f5f5f5"/>';
            $svgContent .= '</svg>';
            
            $base64 = base64_encode($svgContent);
            return 'data:image/svg+xml;base64,' . $base64;
        }
        
        // Transparentes 1x1-Pixel-GIF als absoluter Fallback
        return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    }
    
    /**
     * Erstellt ein Platzhalter-Bild aus einem BlurHash
     *
     * @param string $blurHash BlurHash-String
     * @param int $width Bildbreite
     * @param int $height Bildhöhe
     * @return string Data-URI für das Platzhalter-Bild
     */
    private static function getBlurHashPlaceholder($blurHash, $width, $height) {
        // BlurHash-Implementierung erfordert zusätzliche Bibliotheken
        // Hier würde man eine BlurHash-zu-Bild-Konvertierung implementieren
        
        // Als Fallback ein einfaches Platzhalter-SVG
        $width = $width ?: 300;
        $height = $height ?: 200;
        
        $svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '">';
        $svgContent .= '<rect width="100%" height="100%" fill="#f0f0f0"/>';
        $svgContent .= '</svg>';
        
        $base64 = base64_encode($svgContent);
        return 'data:image/svg+xml;base64,' . $base64;
    }
    
    /**
     * Rendert ein Bild als Hintergrund eines Elements
     *
     * @param string $src Bildpfad
     * @param array $options Optionen
     * @return string CSS-Style-Attribut für den Hintergrund
     */
    public static function renderBackground($src, $options = []) {
        // Optionen mit Standardwerten zusammenführen
        $options = array_merge([
            'formats' => ['webp', 'jpeg'],
            'sizes' => self::$defaultSizes,
            'position' => 'center center',
            'repeat' => 'no-repeat',
            'size' => 'cover',
            'quality' => 80
        ], $options);
        
        // Bild-URL bereinigen
        $src = self::getImagePath($src);
        if (!$src) {
            return 'background-color: #f5f5f5;';
        }
        
        // CSS-Regel erstellen
        $style = "background-image: url('{$src}');";
        $style .= "background-position: {$options['position']};";
        $style .= "background-repeat: {$options['repeat']};";
        $style .= "background-size: {$options['size']};";
        
        return $style;
    }
}