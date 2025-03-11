 <?php
/**
 * Base Controller
 * Base class for all controllers providing common functionality
 */

class Controller {
    /**
     * @var array View data
     */
    protected $viewData = [];
    
    /**
     * Render a view with data
     * 
     * @param string $view View name
     * @param array $data Data to pass to view
     * @param string $layout Layout to use
     * @return string Rendered view
     */
    protected function render($view, $data = [], $layout = 'default') {
        // Merge view data
        $this->viewData = array_merge($this->viewData, $data);
        
        // Extract view data for access in view file
        extract($this->viewData);
        
        // Start output buffering
        ob_start();
        
        // Include view file
        $viewFile = $this->getViewPath($view);
        if (!file_exists($viewFile)) {
            throw new Exception("View not found: {$view}");
        }
        
        include $viewFile;
        
        // Get view content
        $content = ob_get_clean();
        
        // Check if layout is needed
        if ($layout) {
            // Start output buffering for layout
            ob_start();
            
            // Include layout file
            $layoutFile = $this->getLayoutPath($layout);
            if (!file_exists($layoutFile)) {
                throw new Exception("Layout not found: {$layout}");
            }
            
            include $layoutFile;
            
            // Get layout content
            $layoutContent = ob_get_clean();
            
            return $layoutContent;
        }
        
        return $content;
    }
    
    /**
     * Get view file path
     * 
     * @param string $view View name
     * @return string View file path
     */
    protected function getViewPath($view) {
        return __DIR__ . '/../views/' . $view . '.php';
    }
    
    /**
     * Get layout file path
     * 
     * @param string $layout Layout name
     * @return string Layout file path
     */
    protected function getLayoutPath($layout) {
        return __DIR__ . '/../views/layouts/' . $layout . '.php';
    }
    
    /**
     * Set a view variable
     * 
     * @param string $name Variable name
     * @param mixed $value Variable value
     * @return void
     */
    protected function set($name, $value) {
        $this->viewData[$name] = $value;
    }
    
    /**
     * Render a partial view
     * 
     * @param string $partial Partial view name
     * @param array $data Data to pass to partial
     * @return string Rendered partial
     */
    protected function renderPartial($partial, $data = []) {
        // Merge view data
        $viewData = array_merge($this->viewData, $data);
        
        // Extract view data for access in partial file
        extract($viewData);
        
        // Start output buffering
        ob_start();
        
        // Include partial file
        $partialFile = $this->getPartialPath($partial);
        if (!file_exists($partialFile)) {
            throw new Exception("Partial not found: {$partial}");
        }
        
        include $partialFile;
        
        // Get partial content
        return ob_get_clean();
    }
    
    /**
     * Get partial file path
     * 
     * @param string $partial Partial name
     * @return string Partial file path
     */
    protected function getPartialPath($partial) {
        return __DIR__ . '/../views/partials/' . $partial . '.php';
    }
    
    /**
     * Redirect to a URL
     * 
     * @param string $url URL to redirect to
     * @param int $statusCode HTTP status code
     * @return void
     */
    protected function redirect($url, $statusCode = 302) {
        header('Location: ' . $url, true, $statusCode);
        exit;
    }
    
    /**
     * Get POST data
     * 
     * @param string $key POST key
     * @param mixed $default Default value if key not found
     * @param bool $sanitize Whether to sanitize the value
     * @return mixed POST value
     */
    protected function getPost($key = null, $default = null, $sanitize = true) {
        if ($key === null) {
            return $_POST;
        }
        
        $value = isset($_POST[$key]) ? $_POST[$key] : $default;
        
        if ($sanitize && is_string($value)) {
            $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }
        
        return $value;
    }
    
    /**
     * Get GET data
     * 
     * @param string $key GET key
     * @param mixed $default Default value if key not found
     * @param bool $sanitize Whether to sanitize the value
     * @return mixed GET value
     */
    protected function getQuery($key = null, $default = null, $sanitize = true) {
        if ($key === null) {
            return $_GET;
        }
        
        $value = isset($_GET[$key]) ? $_GET[$key] : $default;
        
        if ($sanitize && is_string($value)) {
            $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }
        
        return $value;
    }
    
    /**
     * Check if request is AJAX
     * 
     * @return bool True if request is AJAX
     */
    protected function isAjax() {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }
    
    /**
     * Send JSON response
     * 
     * @param mixed $data Data to send
     * @param int $statusCode HTTP status code
     * @return void
     */
    protected function json($data, $statusCode = 200) {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }
    
    /**
     * Check if request is POST
     * 
     * @return bool True if request is POST
     */
    protected function isPost() {
        return $_SERVER['REQUEST_METHOD'] === 'POST';
    }
    
    /**
     * Check if request is GET
     * 
     * @return bool True if request is GET
     */
    protected function isGet() {
        return $_SERVER['REQUEST_METHOD'] === 'GET';
    }
    
    /**
     * Get current URL
     * 
     * @return string Current URL
     */
    protected function getCurrentUrl() {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        return $protocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }
    
    /**
     * Create a CSRF token
     * 
     * @return string CSRF token
     */
    protected function createCsrfToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Verify CSRF token
     * 
     * @param string $token Token to verify
     * @return bool True if token is valid
     */
    protected function verifyCsrfToken($token) {
        if (!isset($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
}