 <?php
/**
 * Database Configuration
 * Contains database connection settings
 */

// Prevent direct access
if (!defined('APP_PATH')) {
    exit('Direct script access is not allowed.');
}

// Database connection parameters
return [
    /**
     * Database driver (mysql, pgsql, sqlite, etc.)
     */
    'driver' => 'mysql',
    
    /**
     * Database connection hostname
     */
    'host' => defined('DB_HOST') ? DB_HOST : 'localhost',
    
    /**
     * Database name
     */
    'database' => defined('DB_NAME') ? DB_NAME : 'mannar_db',
    
    /**
     * Database username
     */
    'username' => defined('DB_USER') ? DB_USER : 'mannar_user',
    
    /**
     * Database password
     */
    'password' => defined('DB_PASS') ? DB_PASS : 'secure_password',
    
    /**
     * Database charset
     */
    'charset' => 'utf8mb4',
    
    /**
     * Database collation (MySQL specific)
     */
    'collation' => 'utf8mb4_unicode_ci',
    
    /**
     * Table prefix
     * Prefix for all table names to avoid conflicts
     */
    'prefix' => 'mannar_',
    
    /**
     * Connection timeout in seconds
     */
    'timeout' => 5,
    
    /**
     * PDO connection options
     */
    'options' => [
        // Report all database errors
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        
        // Return rows as associative arrays by default
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        
        // Don't emulate prepared statements, use real ones
        PDO::ATTR_EMULATE_PREPARES => false,
        
        // Convert numeric values to native PHP types
        PDO::ATTR_STRINGIFY_FETCHES => false
    ],
    
    /**
     * Connection persistence
     * Whether to use persistent connections
     */
    'persistent' => false,
    
    /**
     * Enable query logging (development only)
     */
    'log_queries' => APP_ENV === 'development',
    
    /**
     * Database schema (PostgreSQL specific)
     */
    'schema' => 'public',
    
    /**
     * SQLite database file path (SQLite specific)
     */
    'sqlite_path' => APP_PATH . '/data/database.sqlite',
    
    /**
     * Maximum number of connections to keep in connection pool
     */
    'max_connections' => 10
];