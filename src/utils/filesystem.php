<?php
/**
 * Filesystem Utilities
 * Provides common file and directory operations with error handling
 */

/**
 * Create a directory recursively with proper permissions
 * 
 * @param string $path Directory path to create
 * @param int $permissions Directory permissions (octal)
 * @param bool $recursive Create parent directories if needed
 * @return bool Success status
 */
function create_directory($path, $permissions = 0755, $recursive = true) {
    if (is_dir($path)) {
        return true;
    }
    
    $result = mkdir($path, $permissions, $recursive);
    
    if (!$result) {
        error_log("Failed to create directory: $path");
    }
    
    return $result;
}

/**
 * Delete a file safely
 * 
 * @param string $path File path
 * @return bool Success status
 */
function delete_file($path) {
    if (!file_exists($path)) {
        return true; // File doesn't exist, so consider it deleted
    }
    
    $result = unlink($path);
    
    if (!$result) {
        error_log("Failed to delete file: $path");
    }
    
    return $result;
}

/**
 * Delete a directory and its contents recursively
 * 
 * @param string $path Directory path
 * @return bool Success status
 */
function delete_directory($path) {
    if (!is_dir($path)) {
        return true; // Directory doesn't exist, so consider it deleted
    }
    
    // Get all files and subdirectories
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    
    // Delete files and subdirectories
    foreach ($items as $item) {
        if ($item->isDir()) {
            if (!rmdir($item->getRealPath())) {
                error_log("Failed to delete directory: " . $item->getRealPath());
                return false;
            }
        } else {
            if (!unlink($item->getRealPath())) {
                error_log("Failed to delete file: " . $item->getRealPath());
                return false;
            }
        }
    }
    
    // Delete the main directory
    $result = rmdir($path);
    
    if (!$result) {
        error_log("Failed to delete directory: $path");
    }
    
    return $result;
}

/**
 * Get file extension
 * 
 * @param string $path File path
 * @return string File extension (lowercase)
 */
function get_file_extension($path) {
    return strtolower(pathinfo($path, PATHINFO_EXTENSION));
}

/**
 * Get file MIME type
 * 
 * @param string $path File path
 * @return string MIME type or 'application/octet-stream' if unknown
 */
function get_file_mime_type($path) {
    if (!file_exists($path)) {
        return 'application/octet-stream';
    }
    
    // Try fileinfo extension first (most reliable)
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $path);
        finfo_close($finfo);
        return $mime;
    }
    
    // Fallback to mime_content_type function
    if (function_exists('mime_content_type')) {
        return mime_content_type($path);
    }
    
    // Fallback to mapping from extension
    $extension = get_file_extension($path);
    $mime_types = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'pdf' => 'application/pdf',
        'txt' => 'text/plain',
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'xml' => 'application/xml',
        'zip' => 'application/zip',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls' => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt' => 'application/vnd.ms-powerpoint',
        'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    return $mime_types[$extension] ?? 'application/octet-stream';
}

/**
 * Read file contents safely
 * 
 * @param string $path File path
 * @param bool $use_include_path Search in include path
 * @return string|false File contents or false on failure
 */
function read_file($path, $use_include_path = false) {
    if (!file_exists($path) && !$use_include_path) {
        error_log("File not found: $path");
        return false;
    }
    
    $contents = file_get_contents($path, $use_include_path);
    
    if ($contents === false) {
        error_log("Failed to read file: $path");
    }
    
    return $contents;
}

/**
 * Write to file safely
 * 
 * @param string $path File path
 * @param string $contents File contents
 * @param int $flags File write flags
 * @return bool Success status
 */
function write_file($path, $contents, $flags = 0) {
    // Ensure directory exists
    $directory = dirname($path);
    if (!is_dir($directory)) {
        if (!create_directory($directory)) {
            return false;
        }
    }
    
    $result = file_put_contents($path, $contents, $flags);
    
    if ($result === false) {
        error_log("Failed to write to file: $path");
        return false;
    }
    
    return true;
}

/**
 * Copy file safely
 * 
 * @param string $source Source file path
 * @param string $destination Destination file path
 * @param bool $overwrite Overwrite if destination exists
 * @return bool Success status
 */
function copy_file($source, $destination, $overwrite = true) {
    if (!file_exists($source)) {
        error_log("Source file not found: $source");
        return false;
    }
    
    if (file_exists($destination) && !$overwrite) {
        error_log("Destination file already exists: $destination");
        return false;
    }
    
    // Ensure destination directory exists
    $directory = dirname($destination);
    if (!is_dir($directory)) {
        if (!create_directory($directory)) {
            return false;
        }
    }
    
    $result = copy($source, $destination);
    
    if (!$result) {
        error_log("Failed to copy file from $source to $destination");
    }
    
    return $result;
}

/**
 * Move file safely
 * 
 * @param string $source Source file path
 * @param string $destination Destination file path
 * @param bool $overwrite Overwrite if destination exists
 * @return bool Success status
 */
function move_file($source, $destination, $overwrite = true) {
    if (!file_exists($source)) {
        error_log("Source file not found: $source");
        return false;
    }
    
    if (file_exists($destination) && !$overwrite) {
        error_log("Destination file already exists: $destination");
        return false;
    }
    
    // Ensure destination directory exists
    $directory = dirname($destination);
    if (!is_dir($directory)) {
        if (!create_directory($directory)) {
            return false;
        }
    }
    
    $result = rename($source, $destination);
    
    if (!$result) {
        error_log("Failed to move file from $source to $destination");
    }
    
    return $result;
}

/**
 * Get all files in a directory
 * 
 * @param string $directory Directory path
 * @param string $pattern File pattern (glob pattern)
 * @param bool $recursive Include subdirectories
 * @return array List of file paths
 */
function get_files($directory, $pattern = '*', $recursive = false) {
    if (!is_dir($directory)) {
        return [];
    }
    
    $files = [];
    
    if ($recursive) {
        // Recursively get all files
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile() && fnmatch($pattern, $file->getFilename())) {
                $files[] = $file->getPathname();
            }
        }
    } else {
        // Get files in current directory only
        $glob_pattern = rtrim($directory, '/') . '/' . $pattern;
        $glob_files = glob($glob_pattern);
        
        if ($glob_files !== false) {
            foreach ($glob_files as $file) {
                if (is_file($file)) {
                    $files[] = $file;
                }
            }
        }
    }
    
    return $files;
}

/**
 * Get file size
 * 
 * @param string $path File path
 * @return int File size in bytes or 0 if file not found
 */
function get_file_size($path) {
    if (!file_exists($path) || !is_file($path)) {
        return 0;
    }
    
    return filesize($path);
}

/**
 * Get file modification time
 * 
 * @param string $path File path
 * @param bool $formatted Return as formatted date string
 * @param string $format Date format for formatted option
 * @return int|string Timestamp or formatted date
 */
function get_file_modified_time($path, $formatted = false, $format = 'Y-m-d H:i:s') {
    if (!file_exists($path)) {
        return $formatted ? '' : 0;
    }
    
    $time = filemtime($path);
    
    if ($formatted) {
        return date($format, $time);
    }
    
    return $time;
}

/**
 * Check if a file is writable
 * 
 * @param string $path File path
 * @return bool True if writable
 */
function is_file_writable($path) {
    // If file doesn't exist, check if directory is writable
    if (!file_exists($path)) {
        return is_writable(dirname($path));
    }
    
    return is_writable($path);
}

/**
 * Get available space in a directory
 * 
 * @param string $directory Directory path
 * @return int Available space in bytes
 */
function get_available_space($directory = '.') {
    return disk_free_space($directory);
}