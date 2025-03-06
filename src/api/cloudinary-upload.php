<?php
// SECURITY IMPROVEMENT: In production, store these in environment variables
// or a configuration file outside web root

// Prevent direct access to this file
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('HTTP/1.0 403 Forbidden');
    exit('Access forbidden');
}

// PREFERRED APPROACH (uncomment in production):
// $cloudinary_api_key = getenv('CLOUDINARY_API_KEY');
// $cloudinary_api_secret = getenv('CLOUDINARY_API_SECRET');

// Current implementation (replace in production)
$cloudinary_api_key = '811453586293945';
$cloudinary_api_secret = 'ygiBwVjmJJNsPmmVJ9lhAUDz9lQ';