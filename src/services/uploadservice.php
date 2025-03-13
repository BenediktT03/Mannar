 <?php
/**
 * Upload Service
 * 
 * Provides a centralized service for handling file uploads to Cloudinary or local storage
 * with validation, error handling, and security features.
 */

class UploadService {
    /**
     * @var array Configuration options
     */
    private $config;
    
    /**
     * @var array Allowed file types (MIME types)
     */
    private $allowedTypes;
    
    /**
     * @var int Maximum upload size in bytes
     */
    private $maxSize;
    
    /**
     * @var string Default upload directory for local storage
     */
    private $uploadDir;
    
    /**
     * Constructor
     * 
     * @param array $config Optional configuration overrides
     */
    public function __construct($config = []) {
        // Load default configuration from app config
        $this->config = [
            'cloudinary' => defined('CLOUDINARY_CONFIG') ? CLOUDINARY_CONFIG : [
                'cloud_name' => 'dlegnsmho',
                'api_key' => '811453586293945',
                'api_secret' => 'ygiBwVjmJJNsPmmVJ9lhAUDz9lQ',
                'upload_preset' => 'ml_default'
            ],
            'use_cloudinary' => true,
            'upload_dir' => defined('UPLOAD_DIR') ? UPLOAD_DIR : __DIR__ . '/../../public/uploads/',
            'secure_uploads' => true
        ];
        
        // Merge with provided configuration
        if (!empty($config)) {
            $this->config = array_merge($this->config, $config);
        }
        
        // Set allowed MIME types
        $this->allowedTypes = defined('ALLOWED_UPLOAD_TYPES') ? ALLOWED_UPLOAD_TYPES : [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/svg+xml'
        ];
        
        // Set maximum file size
        $this->maxSize = defined('MAX_UPLOAD_SIZE') ? MAX_UPLOAD_SIZE : 5 * 1024 * 1024; // 5MB
        
        // Set upload directory
        $this->uploadDir = $this->config['upload_dir'];
        
        // Ensure upload directory exists and is writable
        $this->ensureUploadDirectory();
    }
    
    /**
     * Ensure the upload directory exists and is writable
     * 
     * @return bool Success status
     */
    private function ensureUploadDirectory() {
        if (!is_dir($this->uploadDir)) {
            if (!mkdir($this->uploadDir, 0755, true)) {
                error_log("Failed to create upload directory: {$this->uploadDir}");
                return false;
            }
        }
        
        if (!is_writable($this->uploadDir)) {
            error_log("Upload directory is not writable: {$this->uploadDir}");
            return false;
        }
        
        // Create an .htaccess file to protect the uploads if needed
        if ($this->config['secure_uploads']) {
            $this->secureUploadDirectory();
        }
        
        return true;
    }
    
    /**
     * Add security measures to the upload directory
     */
    private function secureUploadDirectory() {
        $htaccess = $this->uploadDir . '/.htaccess';
        
        if (!file_exists($htaccess)) {
            $content = "# Protect the upload directory\n";
            $content .= "<IfModule mod_rewrite.c>\n";
            $content .= "RewriteEngine On\n";
            $content .= "# Allow only image files to be displayed directly\n";
            $content .= "RewriteCond %{REQUEST_FILENAME} -f\n";
            $content .= "RewriteCond %{REQUEST_FILENAME} !\.(jpg|jpeg|png|gif|svg|webp)$\n";
            $content .= "RewriteRule . - [F]\n";
            $content .= "</IfModule>\n\n";
            $content .= "# Deny access to dangerous file types\n";
            $content .= "<FilesMatch \"\.(php|phtml|php3|php4|php5|php7|phar|phps|cgi|pl|py|jsp|asp|htm|html|shtml|sh)$\">\n";
            $content .= "Order Allow,Deny\n";
            $content .= "Deny from all\n";
            $content .= "</FilesMatch>\n";
            
            file_put_contents($htaccess, $content);
        }
    }
    
    /**
     * Handle file upload from $_FILES
     * 
     * @param string $fileKey The key in $_FILES array
     * @param array $options Additional upload options
     * @return array Upload result with success status and data or error
     */
    public function handleUpload($fileKey = 'image', $options = []) {
        // Check if file was uploaded
        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            $error = isset($_FILES[$fileKey]) ? $this->getUploadErrorMessage($_FILES[$fileKey]['error']) : 'No file uploaded';
            return [
                'success' => false,
                'error' => $error
            ];
        }
        
        // Get file information
        $file = $_FILES[$fileKey];
        $fileName = $file['name'];
        $fileTmpName = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileType = $file['type'];
        
        // Validate file
        $validation = $this->validateFile($fileTmpName, $fileName, $fileSize, $fileType);
        if (!$validation['success']) {
            return $validation;
        }
        
        // Determine upload method based on configuration
        if ($this->config['use_cloudinary']) {
            return $this->uploadToCloudinary($fileTmpName, $fileType, $fileName, $options);
        } else {
            return $this->uploadToLocal($fileTmpName, $fileName, $options);
        }
    }
    
    /**
     * Validate uploaded file
     * 
     * @param string $filePath File temporary path
     * @param string $fileName Original file name
     * @param int $fileSize File size in bytes
     * @param string $fileType File MIME type
     * @return array Validation result with success status
     */
    public function validateFile($filePath, $fileName, $fileSize, $fileType) {
        // Check file size
        if ($fileSize > $this->maxSize) {
            return [
                'success' => false,
                'error' => 'File is too large. Maximum size is ' . $this->formatFileSize($this->maxSize)
            ];
        }
        
        // Check file type
        if (!in_array($fileType, $this->allowedTypes)) {
            return [
                'success' => false,
                'error' => 'Unsupported file type. Allowed types: ' . implode(', ', $this->allowedTypes)
            ];
        }
        
        // Verify that the file is actually an image
        if (!$this->isValidImage($filePath, $fileType)) {
            return [
                'success' => false,
                'error' => 'The uploaded file is not a valid image.'
            ];
        }
        
        // Validate file name
        $sanitizedFileName = $this->sanitizeFileName($fileName);
        if ($sanitizedFileName !== $fileName) {
            // File name was changed during sanitization
            // This isn't an error, just informational
        }
        
        return [
            'success' => true,
            'sanitized_filename' => $sanitizedFileName
        ];
    }
    
    /**
     * Check if file is a valid image
     * 
     * @param string $filePath File path
     * @param string $fileType MIME type
     * @return bool True if valid, false otherwise
     */
    private function isValidImage($filePath, $fileType) {
        // For SVG files, check for XML declaration and SVG tag
        if ($fileType === 'image/svg+xml') {
            $content = file_get_contents($filePath);
            return strpos($content, '<svg') !== false;
        }
        
        // For other image types, check with getimagesize()
        $imageInfo = @getimagesize($filePath);
        
        if ($imageInfo === false) {
            return false;
        }
        
        // Check if image type matches the claimed MIME type
        $detectedType = $imageInfo['mime'];
        return $detectedType === $fileType;
    }
    
    /**
     * Sanitize file name for security
     * 
     * @param string $fileName Original file name
     * @return string Sanitized file name
     */
    private function sanitizeFileName($fileName) {
        // Get file extension
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        
        // Get file name without extension
        $nameWithoutExt = pathinfo($fileName, PATHINFO_FILENAME);
        
        // Remove any characters that aren't alphanumeric, dash, underscore or dot
        $nameWithoutExt = preg_replace('/[^a-zA-Z0-9\-_]/', '-', $nameWithoutExt);
        
        // Ensure the name is not empty
        if (empty($nameWithoutExt)) {
            $nameWithoutExt = 'file';
        }
        
        // Add a unique identifier to prevent overwriting
        $uniqueId = substr(md5(uniqid(rand(), true)), 0, 8);
        
        // Combine parts
        return $nameWithoutExt . '-' . $uniqueId . '.' . $extension;
    }
    
    /**
     * Upload file to Cloudinary
     * 
     * @param string $filePath Temporary file path
     * @param string $fileType File MIME type
     * @param string $fileName Original file name
     * @param array $options Additional options
     * @return array Upload result with success status and data or error
     */
    public function uploadToCloudinary($filePath, $fileType, $fileName, $options = []) {
        $cloudinary = $this->config['cloudinary'];
        
        // Generate timestamp and signature
        $timestamp = time();
        $params = [
            'timestamp' => $timestamp,
            'upload_preset' => $cloudinary['upload_preset']
        ];
        
        // Add optional parameters
        if (!empty($options['folder'])) {
            $params['folder'] = $options['folder'];
        }
        
        if (!empty($options['public_id'])) {
            $params['public_id'] = $options['public_id'];
        }
        
        // Sort parameters alphabetically for signature
        ksort($params);
        
        // Generate signature string
        $signature_string = '';
        foreach ($params as $key => $value) {
            $signature_string .= $key . '=' . $value . '&';
        }
        
        // Remove the last '&' and append the API secret
        $signature_string = rtrim($signature_string, '&') . $cloudinary['api_secret'];
        $signature = sha1($signature_string);
        
        // Prepare the request to Cloudinary API
        $post_data = [
            'file' => new CURLFile($filePath, $fileType, $fileName),
            'api_key' => $cloudinary['api_key'],
            'timestamp' => $timestamp,
            'signature' => $signature,
            'upload_preset' => $cloudinary['upload_preset']
        ];
        
        // Add additional parameters
        foreach ($options as $key => $value) {
            if (!empty($value) && $key !== 'folder' && $key !== 'public_id') {
                $post_data[$key] = $value;
            }
        }
        
        try {
            // Initialize cURL session
            $url = "https://api.cloudinary.com/v1_1/{$cloudinary['cloud_name']}/image/upload";
            $ch = curl_init($url);
            
            // Set cURL options
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mannar-Website-Upload/1.0');
            
            // Execute request and get response
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            // Check for errors
            if (curl_errno($ch)) {
                throw new Exception('cURL error: ' . curl_error($ch));
            }
            
            if ($http_code != 200) {
                throw new Exception('Cloudinary API returned HTTP code ' . $http_code);
            }
            
            // Close cURL session
            curl_close($ch);
            
            // Parse response from Cloudinary
            $result = json_decode($response, true);
            
            if ($result === null) {
                throw new Exception('Failed to parse Cloudinary response: ' . $response);
            }
            
            if (isset($result['error'])) {
                throw new Exception('Cloudinary error: ' . $result['error']['message']);
            }
            
            return [
                'success' => true,
                'url' => $result['secure_url'],
                'public_id' => $result['public_id'],
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'filename' => $result['original_filename'],
                'size' => $result['bytes']
            ];
        } catch (Exception $e) {
            error_log('Cloudinary upload error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Upload file to local storage
     * 
     * @param string $filePath Temporary file path
     * @param string $fileName Original file name
     * @param array $options Additional options
     * @return array Upload result with success status and data or error
     */
    public function uploadToLocal($filePath, $fileName, $options = []) {
        try {
            // Sanitize filename
            $sanitizedFileName = $this->sanitizeFileName($fileName);
            
            // Determine the target directory
            $targetDir = $this->uploadDir;
            if (!empty($options['folder'])) {
                $targetDir .= '/' . trim($options['folder'], '/') . '/';
                
                // Create folder if it doesn't exist
                if (!is_dir($targetDir)) {
                    if (!mkdir($targetDir, 0755, true)) {
                        throw new Exception("Failed to create directory: {$targetDir}");
                    }
                }
            }
            
            // Full path to the uploaded file
            $targetPath = $targetDir . $sanitizedFileName;
            
            // Move the file
            if (!move_uploaded_file($filePath, $targetPath)) {
                throw new Exception("Failed to move uploaded file to {$targetPath}");
            }
            
            // Get file information
            $fileInfo = getimagesize($targetPath);
            $fileSize = filesize($targetPath);
            
            // Generate URL path
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            $urlPath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $targetPath);
            $url = $baseUrl . $urlPath;
            
            return [
                'success' => true,
                'url' => $url,
                'path' => $targetPath,
                'filename' => $sanitizedFileName,
                'width' => $fileInfo[0] ?? null,
                'height' => $fileInfo[1] ?? null,
                'mime' => $fileInfo['mime'] ?? null,
                'size' => $fileSize
            ];
        } catch (Exception $e) {
            error_log('Local upload error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get human-readable error message for upload errors
     * 
     * @param int $error_code PHP upload error code
     * @return string Error message
     */
    private function getUploadErrorMessage($error_code) {
        switch ($error_code) {
            case UPLOAD_ERR_INI_SIZE:
                return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
            case UPLOAD_ERR_FORM_SIZE:
                return 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form';
            case UPLOAD_ERR_PARTIAL:
                return 'The uploaded file was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing a temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'A PHP extension stopped the file upload';
            default:
                return 'Unknown upload error';
        }
    }
    
    /**
     * Format file size to human-readable format
     * 
     * @param int $bytes Size in bytes
     * @return string Formatted size
     */
    private function formatFileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
    
    /**
     * Delete a file
     * 
     * @param string $path File path (for local) or public_id (for Cloudinary)
     * @param bool $isCloudinary Whether the path is a Cloudinary public_id
     * @return array Deletion result with success status
     */
    public function deleteFile($path, $isCloudinary = null) {
        // If isCloudinary is not specified, determine based on config
        if ($isCloudinary === null) {
            $isCloudinary = $this->config['use_cloudinary'];
        }
        
        if ($isCloudinary) {
            return $this->deleteFromCloudinary($path);
        } else {
            return $this->deleteFromLocal($path);
        }
    }
    
    /**
     * Delete a file from Cloudinary
     * 
     * @param string $publicId Cloudinary public_id
     * @return array Deletion result with success status
     */
    private function deleteFromCloudinary($publicId) {
        $cloudinary = $this->config['cloudinary'];
        
        // Generate timestamp and signature
        $timestamp = time();
        $params = [
            'public_id' => $publicId,
            'timestamp' => $timestamp
        ];
        
        // Generate signature
        $signature_string = '';
        foreach ($params as $key => $value) {
            $signature_string .= $key . '=' . $value . '&';
        }
        
        $signature_string = rtrim($signature_string, '&') . $cloudinary['api_secret'];
        $signature = sha1($signature_string);
        
        try {
            // Prepare the request to Cloudinary API
            $url = "https://api.cloudinary.com/v1_1/{$cloudinary['cloud_name']}/image/destroy";
            
            $post_data = [
                'public_id' => $publicId,
                'api_key' => $cloudinary['api_key'],
                'timestamp' => $timestamp,
                'signature' => $signature
            ];
            
            // Initialize cURL session
            $ch = curl_init($url);
            
            // Set cURL options
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            // Execute request and get response
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            // Close cURL session
            curl_close($ch);
            
            // Parse response
            $result = json_decode($response, true);
            
            if (isset($result['result']) && $result['result'] === 'ok') {
                return [
                    'success' => true,
                    'message' => 'File successfully deleted'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => isset($result['error']['message']) ? $result['error']['message'] : 'Unknown error'
                ];
            }
        } catch (Exception $e) {
            error_log('Cloudinary delete error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Delete failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Delete a file from local storage
     * 
     * @param string $path File path
     * @return array Deletion result with success status
     */
    private function deleteFromLocal($path) {
        try {
            // Normalize path and check if it's within the upload directory
            $realUploadDir = realpath($this->uploadDir);
            $realPath = realpath($path);
            
            if ($realPath === false) {
                throw new Exception("File does not exist: {$path}");
            }
            
            if (strpos($realPath, $realUploadDir) !== 0) {
                throw new Exception("Cannot delete file outside the upload directory");
            }
            
            // Delete the file
            if (!unlink($realPath)) {
                throw new Exception("Failed to delete file: {$path}");
            }
            
            return [
                'success' => true,
                'message' => 'File successfully deleted'
            ];
        } catch (Exception $e) {
            error_log('Local delete error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Delete failed: ' . $e->getMessage()
            ];
        }
    }
}