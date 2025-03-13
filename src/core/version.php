<?php
/**
 * Version Management
 * 
 * Provides version information for the application and
 * functions to update the version number automatically
 * when changes are made through the admin panel.
 *
 * @package Mannar
 * @subpackage Core
 */

// Current asset version for cache busting
define('ASSET_VERSION', '1.0.3');

// Last update timestamp
define('ASSET_VERSION_TIMESTAMP', time());

/**
 * Get the current asset version
 * 
 * @param bool $with_timestamp Whether to append a timestamp for additional cache busting
 * @return string Version number (with optional timestamp)
 */
function get_asset_version($with_timestamp = false) {
    if ($with_timestamp) {
        return ASSET_VERSION . '.' . ASSET_VERSION_TIMESTAMP;
    }
    
    return ASSET_VERSION;
}

/**
 * Update the asset version by incrementing the minor version
 * number when changes are made in the admin panel
 * 
 * @param bool $major Whether to increment the major version
 * @return bool Success status
 */
function increment_asset_version($major = false) {
    $current_version = ASSET_VERSION;
    $version_parts = explode('.', $current_version);
    
    // Ensure we have at least 3 parts (major.minor.patch)
    while (count($version_parts) < 3) {
        $version_parts[] = '0';
    }
    
    if ($major) {
        // Increment major version, reset minor and patch
        $version_parts[0] = (int)$version_parts[0] + 1;
        $version_parts[1] = '0';
        $version_parts[2] = '0';
    } else {
        // Increment patch version
        $version_parts[2] = (int)$version_parts[2] + 1;
    }
    
    $new_version = implode('.', $version_parts);
    $current_timestamp = time();
    
    // Update the version file
    return update_version_file($new_version, $current_timestamp);
}

/**
 * Write the updated version to the version.php file
 * 
 * @param string $new_version New version number
 * @param int $timestamp Current timestamp
 * @return bool Success status
 */
function update_version_file($new_version, $timestamp) {
    // Get the current file path
    $version_file = __FILE__;
    
    // Create the new file content
    $file_content = <<<EOT
<?php
/**
 * Version Management
 * 
 * Provides version information for the application and
 * functions to update the version number automatically
 * when changes are made through the admin panel.
 *
 * @package Mannar
 * @subpackage Core
 */

// Current asset version for cache busting
define('ASSET_VERSION', '{$new_version}');

// Last update timestamp
define('ASSET_VERSION_TIMESTAMP', {$timestamp});

/**
 * Get the current asset version
 * 
 * @param bool \$with_timestamp Whether to append a timestamp for additional cache busting
 * @return string Version number (with optional timestamp)
 */
function get_asset_version(\$with_timestamp = false) {
    if (\$with_timestamp) {
        return ASSET_VERSION . '.' . ASSET_VERSION_TIMESTAMP;
    }
    
    return ASSET_VERSION;
}

/**
 * Update the asset version by incrementing the minor version
 * number when changes are made in the admin panel
 * 
 * @param bool \$major Whether to increment the major version
 * @return bool Success status
 */
function increment_asset_version(\$major = false) {
    \$current_version = ASSET_VERSION;
    \$version_parts = explode('.', \$current_version);
    
    // Ensure we have at least 3 parts (major.minor.patch)
    while (count(\$version_parts) < 3) {
        \$version_parts[] = '0';
    }
    
    if (\$major) {
        // Increment major version, reset minor and patch
        \$version_parts[0] = (int)\$version_parts[0] + 1;
        \$version_parts[1] = '0';
        \$version_parts[2] = '0';
    } else {
        // Increment patch version
        \$version_parts[2] = (int)\$version_parts[2] + 1;
    }
    
    \$new_version = implode('.', \$version_parts);
    \$current_timestamp = time();
    
    // Update the version file
    return update_version_file(\$new_version, \$current_timestamp);
}

/**
 * Write the updated version to the version.php file
 * 
 * @param string \$new_version New version number
 * @param int \$timestamp Current timestamp
 * @return bool Success status
 */
function update_version_file(\$new_version, \$timestamp) {
    // Get the current file path
    \$version_file = __FILE__;
    
    // Create the new file content
    \$file_content = <<<EOT
<?php
// Auto-generated version file. Do not edit manually.
// Current asset version for cache busting
define('ASSET_VERSION', '{\$new_version}');

// Last update timestamp
define('ASSET_VERSION_TIMESTAMP', {\$timestamp});
EOT;
    
    // Try to write the new content to the file
    try {
        if (!is_writable(\$version_file)) {
            // If the file is not writable, log the error
            if (function_exists('error_log')) {
                error_log('Version file is not writable: ' . \$version_file);
            }
            return false;
        }
        
        return file_put_contents(\$version_file, \$file_content) !== false;
    } catch (Exception \$e) {
        if (function_exists('error_log')) {
            error_log('Error updating version file: ' . \$e->getMessage());
        }
        return false;
    }
}

EOT;
    
    // Try to write the new content to the file
    try {
        if (!is_writable($version_file)) {
            // If the file is not writable, log the error
            if (function_exists('error_log')) {
                error_log('Version file is not writable: ' . $version_file);
            }
            return false;
        }
        
        return file_put_contents($version_file, $file_content) !== false;
    } catch (Exception $e) {
        if (function_exists('error_log')) {
            error_log('Error updating version file: ' . $e->getMessage());
        }
        return false;
    }
}

/**
 * Auto-increment version when content is published
 * This function should be called from admin panel content publishing functions
 * 
 * @return bool Success status
 */
function auto_increment_version() {
    // Check if auto-versioning is enabled
    if (defined('AUTO_VERSION_INCREMENT') && AUTO_VERSION_INCREMENT) {
        return increment_asset_version(false);
    }
    
    return false;
}