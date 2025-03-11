 <?php
/**
 * Router System
 * Simple routing system for handling page requests and executing appropriate controllers
 */

class Router {
    /**
     * @var array Routes configuration
     */
    private $routes = [];
    
    /**
     * @var string Base path for controllers
     */
    private $controllerPath = 'controllers/';
    
    /**
     * @var string Default controller if no route matches
     */
    private $defaultController = 'home';
    
    /**
     * @var string Default method to call on controller
     */
    private $defaultMethod = 'index';
    
    /**
     * @var array Request details
     */
    private $request = [
        'uri' => '',
        'method' => '',
        'params' => [],
        'query' => []
    ];
    
    /**
     * Constructor
     * 
     * @param string $controllerPath Path to controllers directory
     */
    public function __construct($controllerPath = null) {
        if ($controllerPath) {
            $this->controllerPath = rtrim($controllerPath, '/') . '/';
        }
        
        $this->parseRequest();
    }
    
    /**
     * Add a route
     * 
     * @param string $method HTTP method (GET, POST, etc.)
     * @param string $path URL pattern to match
     * @param string|callable $handler Controller or callback function
     * @return self
     */
    public function add($method, $path, $handler) {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler
        ];
        
        return $this;
    }
    
    /**
     * Add a GET route
     * 
     * @param string $path URL pattern to match
     * @param string|callable $handler Controller or callback function
     * @return self
     */
    public function get($path, $handler) {
        return $this->add('GET', $path, $handler);
    }
    
    /**
     * Add a POST route
     * 
     * @param string $path URL pattern to match
     * @param string|callable $handler Controller or callback function
     * @return self
     */
    public function post($path, $handler) {
        return $this->add('POST', $path, $handler);
    }
    
    /**
     * Parse the current request
     */
    private function parseRequest() {
        // Get request URI and clean it up
        $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = trim($uri, '/');
        
        // Get request method
        $method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';
        
        // Store request data
        $this->request = [
            'uri' => $uri,
            'method' => $method,
            'params' => [], // Will be filled when matching route
            'query' => $_GET
        ];
    }
    
    /**
     * Match a route pattern against the request URI
     * 
     * @param string $pattern Route pattern
     * @return array|false Matched parameters or false if no match
     */
    private function matchRoute($pattern) {
        // Convert route pattern to regex for matching
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $pattern);
        $pattern = "#^{$pattern}$#";
        
        // Try to match the URI against the pattern
        if (preg_match($pattern, $this->request['uri'], $matches)) {
            // Extract named parameters
            $params = [];
            foreach ($matches as $key => $value) {
                if (is_string($key)) {
                    $params[$key] = $value;
                }
            }
            
            return $params;
        }
        
        return false;
    }
    
    /**
     * Run the router and dispatch request to appropriate handler
     */
    public function run() {
        // Try to match a route
        foreach ($this->routes as $route) {
            // Check if method matches
            if ($route['method'] !== $this->request['method'] && $route['method'] !== 'ANY') {
                continue;
            }
            
            // If path is exact match
            if ($route['path'] === $this->request['uri']) {
                return $this->dispatch($route['handler'], []);
            }
            
            // Check if route pattern matches
            $params = $this->matchRoute($route['path']);
            if ($params !== false) {
                $this->request['params'] = $params;
                return $this->dispatch($route['handler'], $params);
            }
        }
        
        // No route found, try default controller
        return $this->dispatchController($this->defaultController, $this->defaultMethod, []);
    }
    
    /**
     * Dispatch a request to the appropriate handler
     * 
     * @param string|callable $handler Controller or callback function
     * @param array $params Parameters to pass to handler
     * @return mixed Handler result
     */
    private function dispatch($handler, $params) {
        // If handler is a callable, call it directly
        if (is_callable($handler)) {
            return call_user_func_array($handler, array_values($params));
        }
        
        // If handler is a string, try to dispatch to controller
        if (is_string($handler)) {
            if (strpos($handler, '@') !== false) {
                // Format: "ControllerName@methodName"
                list($controller, $method) = explode('@', $handler);
                return $this->dispatchController($controller, $method, $params);
            } else {
                // Just controller name, use default method
                return $this->dispatchController($handler, $this->defaultMethod, $params);
            }
        }
        
        // Unsupported handler type
        $this->handleError(500, 'Invalid route handler');
    }
    
    /**
     * Dispatch a request to a controller
     * 
     * @param string $controller Controller name
     * @param string $method Method name
     * @param array $params Parameters to pass to controller method
     * @return mixed Controller method result
     */
    private function dispatchController($controller, $method, $params) {
        // Build controller class name
        $controllerClass = ucfirst($controller) . 'Controller';
        
        // Check if controller file exists
        $controllerFile = $this->controllerPath . $controllerClass . '.php';
        if (!file_exists($controllerFile)) {
            return $this->handleError(404, "Controller not found: {$controller}");
        }
        
        // Include controller file
        require_once $controllerFile;
        
        // Check if controller class exists
        if (!class_exists($controllerClass)) {
            return $this->handleError(500, "Controller class not found: {$controllerClass}");
        }
        
        // Create controller instance
        $controllerInstance = new $controllerClass();
        
        // Check if method exists
        if (!method_exists($controllerInstance, $method)) {
            return $this->handleError(404, "Method not found: {$method}");
        }
        
        // Call controller method with parameters
        return call_user_func_array([$controllerInstance, $method], array_values($params));
    }
    
    /**
     * Handle router errors
     * 
     * @param int $code HTTP status code
     * @param string $message Error message
     * @return void
     */
    private function handleError($code, $message) {
        http_response_code($code);
        
        // Try to load error controller
        $errorController = $this->controllerPath . 'ErrorController.php';
        if (file_exists($errorController)) {
            require_once $errorController;
            if (class_exists('ErrorController')) {
                $errorHandler = new ErrorController();
                if (method_exists($errorHandler, 'error')) {
                    return $errorHandler->error($code, $message);
                }
            }
        }
        
        // Default error handling
        echo "<h1>Error {$code}</h1>";
        echo "<p>{$message}</p>";
        exit;
    }
    
    /**
     * Get current request data
     * 
     * @return array Request data
     */
    public function getRequest() {
        return $this->request;
    }
    
    /**
     * Get current route parameters
     * 
     * @return array Route parameters
     */
    public function getParams() {
        return $this->request['params'];
    }
    
    /**
     * Get query parameters
     * 
     * @return array Query parameters
     */
    public function getQuery() {
        return $this->request['query'];
    }
    
    /**
     * Get parameter value
     * 
     * @param string $name Parameter name
     * @param mixed $default Default value if parameter not found
     * @return mixed Parameter value
     */
    public function getParam($name, $default = null) {
        return isset($this->request['params'][$name]) ? $this->request['params'][$name] : $default;
    }
    
    /**
     * Get query parameter value
     * 
     * @param string $name Parameter name
     * @param mixed $default Default value if parameter not found
     * @return mixed Parameter value
     */
    public function getQueryParam($name, $default = null) {
        return isset($this->request['query'][$name]) ? $this->request['query'][$name] : $default;
    }
    
    /**
     * Redirect to a URL
     * 
     * @param string $url URL to redirect to
     * @param int $code HTTP status code
     * @return void
     */
    public function redirect($url, $code = 302) {
        header("Location: {$url}", true, $code);
        exit;
    }
}