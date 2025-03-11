 <?php
/**
 * Database Connection
 * Singleton database connection using PDO
 */

class Database {
    /**
     * @var Database Singleton instance
     */
    private static $instance = null;
    
    /**
     * @var PDO PDO connection
     */
    private $connection;
    
    /**
     * @var array Config for database connection
     */
    private $config = [
        'driver' => 'mysql',
        'host' => 'localhost',
        'dbname' => 'mannar',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    ];
    
    /**
     * Private constructor for singleton pattern
     * 
     * @param array $config Database configuration
     */
    private function __construct($config = []) {
        // Merge config
        $this->config = array_merge($this->config, $config);
        
        // Create DSN string
        $dsn = sprintf(
            '%s:host=%s;dbname=%s;charset=%s',
            $this->config['driver'],
            $this->config['host'],
            $this->config['dbname'],
            $this->config['charset']
        );
        
        try {
            // Create PDO connection
            $this->connection = new PDO(
                $dsn,
                $this->config['username'],
                $this->config['password'],
                $this->config['options']
            );
        } catch (PDOException $e) {
            // Log error
            error_log('Database connection failed: ' . $e->getMessage());
            
            // Rethrow exception
            throw new Exception('Database connection failed. Please check the configuration.');
        }
    }
    
    /**
     * Get singleton instance
     * 
     * @param array $config Database configuration
     * @return Database Database instance
     */
    public static function getInstance($config = []) {
        if (self::$instance === null) {
            self::$instance = new self($config);
        }
        
        return self::$instance;
    }
    
    /**
     * Get PDO connection
     * 
     * @return PDO PDO connection
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Execute a query
     * 
     * @param string $sql SQL query
     * @param array $params Query parameters
     * @return PDOStatement|false PDO statement or false on failure
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            // Log error
            error_log('Query failed: ' . $e->getMessage());
            
            // Return false
            return false;
        }
    }
    
    /**
     * Fetch all rows from a query
     * 
     * @param string $sql SQL query
     * @param array $params Query parameters
     * @param int $fetchMode PDO fetch mode
     * @return array|false Rows or false on failure
     */
    public function fetchAll($sql, $params = [], $fetchMode = null) {
        $stmt = $this->query($sql, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        if ($fetchMode !== null) {
            return $stmt->fetchAll($fetchMode);
        }
        
        return $stmt->fetchAll();
    }
    
    /**
     * Fetch a single row from a query
     * 
     * @param string $sql SQL query
     * @param array $params Query parameters
     * @param int $fetchMode PDO fetch mode
     * @return array|false Row or false on failure
     */
    public function fetch($sql, $params = [], $fetchMode = null) {
        $stmt = $this->query($sql, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        if ($fetchMode !== null) {
            return $stmt->fetch($fetchMode);
        }
        
        return $stmt->fetch();
    }
    
    /**
     * Fetch a single column from a query
     * 
     * @param string $sql SQL query
     * @param array $params Query parameters
     * @param int $column Column number (0-indexed)
     * @return mixed|false Column value or false on failure
     */
    public function fetchColumn($sql, $params = [], $column = 0) {
        $stmt = $this->query($sql, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        return $stmt->fetchColumn($column);
    }
    
    /**
     * Execute an INSERT query
     * 
     * @param string $table Table name
     * @param array $data Data to insert
     * @return int|false Last insert ID or false on failure
     */
    public function insert($table, $data) {
        // Build query
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        
        $stmt = $this->query($sql, array_values($data));
        
        if ($stmt === false) {
            return false;
        }
        
        return $this->connection->lastInsertId();
    }
    
    /**
     * Execute an UPDATE query
     * 
     * @param string $table Table name
     * @param array $data Data to update
     * @param string $where WHERE clause
     * @param array $params WHERE parameters
     * @return int|false Number of affected rows or false on failure
     */
    public function update($table, $data, $where, $params = []) {
        // Build query
        $set = [];
        foreach ($data as $column => $value) {
            $set[] = "{$column} = ?";
        }
        
        $sql = "UPDATE {$table} SET " . implode(', ', $set);
        
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        $stmt = $this->query($sql, array_merge(array_values($data), $params));
        
        if ($stmt === false) {
            return false;
        }
        
        return $stmt->rowCount();
    }
    
    /**
     * Execute a DELETE query
     * 
     * @param string $table Table name
     * @param string $where WHERE clause
     * @param array $params WHERE parameters
     * @return int|false Number of affected rows or false on failure
     */
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table}";
        
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        $stmt = $this->query($sql, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        return $stmt->rowCount();
    }
    
    /**
     * Begin a transaction
     * 
     * @return bool True on success or false on failure
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Commit a transaction
     * 
     * @return bool True on success or false on failure
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * Roll back a transaction
     * 
     * @return bool True on success or false on failure
     */
    public function rollBack() {
        return $this->connection->rollBack();
    }
    
    /**
     * Prevent cloning of the instance
     */
    private function __clone() {}
    
    /**
     * Prevent unserializing of the instance
     */
    private function __wakeup() {}
}