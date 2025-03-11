<?php
/**
 * Formatting Utilities
 * Provides common formatting functions for the Mannar website
 */

/**
 * Format a date in the locale's format
 * 
 * @param int|string $timestamp Timestamp or date string
 * @param string $format PHP date format string
 * @return string Formatted date
 */
function format_date($timestamp, $format = 'd.m.Y') {
    if (!is_numeric($timestamp)) {
        $timestamp = strtotime($timestamp);
    }
    
    return date($format, $timestamp);
}

/**
 * Format a date and time in the locale's format
 * 
 * @param int|string $timestamp Timestamp or date string
 * @param string $format PHP date format string
 * @return string Formatted date and time
 */
function format_datetime($timestamp, $format = 'd.m.Y H:i') {
    if (!is_numeric($timestamp)) {
        $timestamp = strtotime($timestamp);
    }
    
    return date($format, $timestamp);
}

/**
 * Format a number with thousands separator
 * 
 * @param float $number Number to format
 * @param int $decimals Number of decimal places
 * @return string Formatted number
 */
function format_number($number, $decimals = 0) {
    return number_format($number, $decimals, ',', '.');
}

/**
 * Format a currency amount
 * 
 * @param float $amount Amount to format
 * @param string $currency Currency code (e.g., 'EUR')
 * @param int $decimals Number of decimal places
 * @return string Formatted currency amount
 */
function format_currency($amount, $currency = 'EUR', $decimals = 2) {
    $formatted = number_format($amount, $decimals, ',', '.');
    
    switch ($currency) {
        case 'EUR':
            return $formatted . ' €';
        case 'USD':
            return '$' . $formatted;
        case 'GBP':
            return '£' . $formatted;
        default:
            return $formatted . ' ' . $currency;
    }
}

/**
 * Format file size in human-readable format
 * 
 * @param int $bytes Size in bytes
 * @param int $precision Number of decimal places
 * @return string Formatted file size
 */
function format_filesize($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= pow(1024, $pow);
    
    return round($bytes, $precision) . ' ' . $units[$pow];
}

/**
 * Truncate text to a certain length, preserving whole words
 * 
 * @param string $text Text to truncate
 * @param int $length Maximum length
 * @param string $append String to append if truncated
 * @return string Truncated text
 */
function truncate_text($text, $length = 100, $append = '...') {
    if (mb_strlen($text) <= $length) {
        return $text;
    }
    
    $text = mb_substr($text, 0, $length);
    $last_space = mb_strrpos($text, ' ');
    
    if ($last_space !== false) {
        $text = mb_substr($text, 0, $last_space);
    }
    
    return $text . $append;
}

/**
 * Convert plain text to HTML with paragraphs and line breaks
 * 
 * @param string $text Plain text
 * @return string HTML
 */
function text_to_html($text) {
    // Convert line breaks to HTML
    $text = nl2br(htmlspecialchars($text, ENT_QUOTES, 'UTF-8'));
    
    // Convert URLs to clickable links
    $text = preg_replace(
        '/(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/i',
        '<a href="$0" target="_blank" rel="noopener noreferrer">$0</a>',
        $text
    );
    
    return $text;
}

/**
 * Generate slug from text (URL-friendly string)
 * 
 * @param string $text Text to convert
 * @param string $separator Word separator
 * @return string Slug
 */
function generate_slug($text, $separator = '-') {
    // Convert special chars to their ASCII equivalents
    $text = transliterator_transliterate('Any-Latin; Latin-ASCII', $text);
    
    // Convert to lowercase
    $text = strtolower($text);
    
    // Remove unwanted characters
    $text = preg_replace('/[^a-z0-9\-\s]/', '', $text);
    
    // Replace spaces with separator
    $text = preg_replace('/[\s]+/', $separator, $text);
    
    // Remove duplicate separators
    $text = preg_replace('/' . preg_quote($separator) . '+/', $separator, $text);
    
    // Trim separator from beginning and end
    return trim($text, $separator);
}

/**
 * Format a phone number for display
 * 
 * @param string $phone Phone number
 * @param string $format Format pattern (e.g., '+49 (XXX) XXX-XXXX')
 * @return string Formatted phone number
 */
function format_phone($phone, $format = null) {
    // Remove all non-numeric characters
    $number = preg_replace('/[^0-9]/', '', $phone);
    
    // If no format specified, use default formatting
    if ($format === null) {
        // Example formatting for German numbers
        if (strlen($number) == 11 && substr($number, 0, 2) == '49') {
            // +49 format (international German)
            return '+' . substr($number, 0, 2) . ' ' . 
                   substr($number, 2, 3) . ' ' . 
                   substr($number, 5, 4) . ' ' . 
                   substr($number, 9);
        } elseif (strlen($number) == 10) {
            // 0XXX format (domestic German)
            return '0' . substr($number, 0, 3) . ' ' . 
                   substr($number, 3, 4) . ' ' . 
                   substr($number, 7);
        } else {
            // Just add spaces for unknown formats
            return chunk_split($number, 4, ' ');
        }
    }
    
    // Apply custom format (replace X with digits)
    $formatted = $format;
    for ($i = 0; $i < strlen($number); $i++) {
        $formatted = preg_replace('/X/', $number[$i], $formatted, 1);
    }
    
    return $formatted;
}

/**
 * Convert a string to title case with exceptions
 * 
 * @param string $text Text to convert
 * @return string Title case text
 */
function title_case($text) {
    // Words that should not be capitalized (articles, prepositions, etc.)
    $small_words = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 
                    'of', 'on', 'or', 'the', 'to', 'via', 'vs', 'with'];
    
    // Split into words
    $words = explode(' ', strtolower($text));
    
    // Capitalize each word unless it's in the exception list
    foreach ($words as $key => $word) {
        // Always capitalize the first and last word
        if ($key === 0 || $key === count($words) - 1) {
            $words[$key] = ucfirst($word);
        } elseif (!in_array($word, $small_words)) {
            $words[$key] = ucfirst($word);
        }
    }
    
    return implode(' ', $words);
}

/**
 * Format bytes as base-2 units (KiB, MiB, etc.)
 * 
 * @param int $bytes Size in bytes
 * @param int $precision Number of decimal places
 * @return string Formatted size
 */
function format_bytes_binary($bytes, $precision = 2) {
    $units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= pow(1024, $pow);
    
    return round($bytes, $precision) . ' ' . $units[$pow];
}