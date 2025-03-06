 <?php
/**
 * upload.php
 * File upload handler - Redirect to unified API
 */

// This file exists for backwards compatibility and redirects to the unified API

// Set content type
header('Content-Type: application/json');

// Forward the upload to our unified API
$url = 'api.php?action=upload';

// Set up curl to forward the file
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $_FILES);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

// Execute the request
$result = curl_exec($curl);
$http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Return the result with appropriate status code
http_response_code($http_status);
echo $result;