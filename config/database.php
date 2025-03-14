<?php
/**
 * Database Configuration
 * 
 * Database connection settings for the Mannar website.
 * This file is used by the Database class to establish connections.
 */

// Database connection settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'mannar');
define('DB_USER', 'mannar_user');
define('DB_PASS', 'your_secure_password'); // Change in production

// Database connection options
define('DB_OPTIONS', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
]);

// Database charset
define('DB_CHARSET', 'utf8mb4');

// Database prefix for tables
define('DB_PREFIX', 'mnr_');

// Connection retry settings
define('DB_MAX_RETRIES', 3);
define('DB_RETRY_DELAY', 2); // seconds

return [
    'driver' => 'mysql',
    'host' => DB_HOST,
    'dbname' => DB_NAME,
    'username' => DB_USER,
    'password' => DB_PASS,
    'charset' => DB_CHARSET,
    'options' => DB_OPTIONS,
    'prefix' => DB_PREFIX,
    'max_retries' => DB_MAX_RETRIES,
    'retry_delay' => DB_RETRY_DELAY
];