 <?php
/**
 * Content Service
 * Provides functionality to manage website content using Firebase Firestore
 */

class ContentService {
    /**
     * @var ContentService Singleton instance
     */
    private static $instance = null;
    
    /**
     * @var object Firebase Firestore instance
     */
    private $firestore = null;
    
    /**
     * @var array Content cache
     */
    private $cache = [
        'main' => null,
        'draft' => null,
        'pages' => [],
        'word_cloud' => null
    ];
    
    /**
     * @var bool Whether caching is enabled
     */
    private $cachingEnabled = true;
    
    /**
     * @var int Cache lifetime in seconds
     */
    private $cacheLifetime = 3600; // 1 hour
    
    /**
     * Private constructor for singleton pattern
     */
    private function __construct() {
        // Initialize Firebase SDK
        if (class_exists('Kreait\Firebase\Factory')) {
            try {
                // Load Firebase configuration
                $config = [];
                
                if (defined('FIREBASE_CONFIG')) {
                    $config = FIREBASE_CONFIG;
                } else {
                    // Load from configuration file if constant not defined
                    $configFile = __DIR__ . '/../config/firebase.php';
                    if (file_exists($configFile)) {
                        $config = require $configFile;
                    }
                }
                
                $factory = (new \Kreait\Firebase\Factory())
                    ->withServiceAccount($config['service_account_path'] ?? null)
                    ->withDatabaseUri($config['database_uri'] ?? null);
                
                $this->firestore = $factory->createFirestore();
                
            } catch (\Exception $e) {
                error_log('Firebase Firestore initialization error: ' . $e->getMessage());
            }
        }
        
        // Load caching configuration
        if (defined('ENABLE_CACHING')) {
            $this->cachingEnabled = ENABLE_CACHING;
        }
        
        if (defined('CACHE_LIFETIME')) {
            $this->cacheLifetime = CACHE_LIFETIME;
        }
    }
    
    /**
     * Get singleton instance
     * 
     * @return ContentService Instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * Load main website content
     * 
     * @param bool $isDraft Whether to load draft or published content
     * @param bool $useCache Whether to use cached content if available
     * @return array|null Content data or null on failure
     */
    public function loadMainContent($isDraft = false, $useCache = true) {
        $contentType = $isDraft ? 'draft' : 'main';
        
        // Check cache first if enabled and requested
        if ($this->cachingEnabled && $useCache && $this->cache[$contentType]) {
            return $this->cache[$contentType];
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            $docRef = $this->firestore->database()->collection('content')->document($contentType);
            $snapshot = $docRef->snapshot();
            
            if (!$snapshot->exists()) {
                error_log("Content document '{$contentType}' not found");
                return null;
            }
            
            $data = $snapshot->data();
            
            // Cache the result
            if ($this->cachingEnabled) {
                $this->cache[$contentType] = $data;
            }
            
            return $data;
            
        } catch (\Exception $e) {
            error_log('Error loading content: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Save main website content
     * 
     * @param array $data Content data
     * @param bool $isDraft Whether to save as draft or published content
     * @return bool Success status
     */
    public function saveMainContent($data, $isDraft = true) {
        if (!is_array($data)) {
            return false;
        }
        
        $contentType = $isDraft ? 'draft' : 'main';
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            // Add timestamp
            $data['lastUpdated'] = new \Google\Cloud\Core\Timestamp(new \DateTime());
            
            // Save to Firestore
            $docRef = $this->firestore->database()->collection('content')->document($contentType);
            $docRef->set($data, ['merge' => true]);
            
            // Update cache
            if ($this->cachingEnabled) {
                $this->cache[$contentType] = $data;
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Error saving content: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Publish draft content to live website
     * 
     * @return bool Success status
     */
    public function publishDraftContent() {
        try {
            // Load latest draft content
            $draftContent = $this->loadMainContent(true, false);
            
            if (!$draftContent) {
                throw new \Exception('No draft content to publish');
            }
            
            // Save draft content as main content
            $success = $this->saveMainContent($draftContent, false);
            
            if ($success) {
                // Update cache
                if ($this->cachingEnabled) {
                    $this->cache['main'] = $draftContent;
                }
            }
            
            return $success;
            
        } catch (\Exception $e) {
            error_log('Error publishing draft content: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Revert main content to previous version
     * 
     * @return bool Success status
     */
    public function revertMainContent() {
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            // Get backup content
            $backupRef = $this->firestore->database()->collection('content')->document('backup');
            $snapshot = $backupRef->snapshot();
            
            if (!$snapshot->exists()) {
                throw new \Exception('No backup content found');
            }
            
            $backupContent = $snapshot->data();
            
            // Save backup as main content
            $mainRef = $this->firestore->database()->collection('content')->document('main');
            $mainRef->set($backupContent);
            
            // Update cache
            if ($this->cachingEnabled) {
                $this->cache['main'] = $backupContent;
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Error reverting content: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Back up main content before publishing
     * 
     * @return bool Success status
     */
    public function backupMainContent() {
        try {
            // Load current main content
            $mainContent = $this->loadMainContent(false, false);
            
            if (!$mainContent) {
                return false;
            }
            
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            // Add backup timestamp
            $mainContent['backupTimestamp'] = new \Google\Cloud\Core\Timestamp(new \DateTime());
            
            // Save to backup document
            $backupRef = $this->firestore->database()->collection('content')->document('backup');
            $backupRef->set($mainContent);
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Error backing up content: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Load a page by ID
     * 
     * @param string $pageId Page ID
     * @param bool $useCache Whether to use cached content if available
     * @return array|null Page data or null on failure
     */
    public function loadPage($pageId, $useCache = true) {
        if (empty($pageId)) {
            return null;
        }
        
        // Check cache first if enabled and requested
        if ($this->cachingEnabled && $useCache && isset($this->cache['pages'][$pageId])) {
            return $this->cache['pages'][$pageId];
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            $docRef = $this->firestore->database()->collection('pages')->document($pageId);
            $snapshot = $docRef->snapshot();
            
            if (!$snapshot->exists()) {
                error_log("Page '{$pageId}' not found");
                return null;
            }
            
            $data = $snapshot->data();
            
            // Add ID to data
            $data['id'] = $pageId;
            
            // Format timestamps
            if (isset($data['created']) && $data['created'] instanceof \Google\Cloud\Core\Timestamp) {
                $data['created'] = $data['created']->get()->format('Y-m-d H:i:s');
            }
            
            if (isset($data['updated']) && $data['updated'] instanceof \Google\Cloud\Core\Timestamp) {
                $data['updated'] = $data['updated']->get()->format('Y-m-d H:i:s');
            }
            
            // Cache the result
            if ($this->cachingEnabled) {
                $this->cache['pages'][$pageId] = $data;
            }
            
            return $data;
            
        } catch (\Exception $e) {
            error_log('Error loading page: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Load all pages
     * 
     * @param array $options Query options
     * @param bool $useCache Whether to use cached content if available
     * @return array Array of pages
     */
    public function loadAllPages($options = [], $useCache = false) {
        // For lists, we usually want fresh data
        if (!$useCache) {
            $this->cache['pages'] = [];
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            $query = $this->firestore->database()->collection('pages');
            
            // Apply options
            if (isset($options['orderBy'])) {
                $direction = isset($options['orderDirection']) ? $options['orderDirection'] : 'asc';
                $query = $query->orderBy($options['orderBy'], $direction);
            } else {
                // Default order by title
                $query = $query->orderBy('title');
            }
            
            if (isset($options['limit'])) {
                $query = $query->limit($options['limit']);
            }
            
            // Execute query
            $snapshot = $query->documents();
            $pages = [];
            
            foreach ($snapshot as $document) {
                if (!$document->exists()) {
                    continue;
                }
                
                $pageId = $document->id();
                $pageData = $document->data();
                
                // Add ID to data
                $pageData['id'] = $pageId;
                
                // Format timestamps
                if (isset($pageData['created']) && $pageData['created'] instanceof \Google\Cloud\Core\Timestamp) {
                    $pageData['created'] = $pageData['created']->get()->format('Y-m-d H:i:s');
                }
                
                if (isset($pageData['updated']) && $pageData['updated'] instanceof \Google\Cloud\Core\Timestamp) {
                    $pageData['updated'] = $pageData['updated']->get()->format('Y-m-d H:i:s');
                }
                
                // Add to result
                $pages[] = $pageData;
                
                // Cache the page
                if ($this->cachingEnabled) {
                    $this->cache['pages'][$pageId] = $pageData;
                }
            }
            
            return $pages;
            
        } catch (\Exception $e) {
            error_log('Error loading pages: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Save a page
     * 
     * @param string $pageId Page ID
     * @param array $data Page data
     * @return bool Success status
     */
    public function savePage($pageId, $data) {
        if (empty($pageId) || !is_array($data)) {
            return false;
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            // Add/update timestamps
            if (!isset($data['created'])) {
                $data['created'] = new \Google\Cloud\Core\Timestamp(new \DateTime());
            }
            
            $data['updated'] = new \Google\Cloud\Core\Timestamp(new \DateTime());
            
            // Save to Firestore
            $docRef = $this->firestore->database()->collection('pages')->document($pageId);
            $docRef->set($data, ['merge' => true]);
            
            // Update cache
            if ($this->cachingEnabled) {
                // Format timestamps for cache
                if (isset($data['created']) && $data['created'] instanceof \Google\Cloud\Core\Timestamp) {
                    $data['created'] = $data['created']->get()->format('Y-m-d H:i:s');
                }
                
                if (isset($data['updated']) && $data['updated'] instanceof \Google\Cloud\Core\Timestamp) {
                    $data['updated'] = $data['updated']->get()->format('Y-m-d H:i:s');
                }
                
                $data['id'] = $pageId;
                $this->cache['pages'][$pageId] = $data;
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Error saving page: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete a page
     * 
     * @param string $pageId Page ID
     * @return bool Success status
     */
    public function deletePage($pageId) {
        if (empty($pageId)) {
            return false;
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            // Delete from Firestore
            $docRef = $this->firestore->database()->collection('pages')->document($pageId);
            $docRef->delete();
            
            // Remove from cache
            if ($this->cachingEnabled && isset($this->cache['pages'][$pageId])) {
                unset($this->cache['pages'][$pageId]);
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Error deleting page: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Load word cloud data
     * 
     * @param bool $useCache Whether to use cached data if available
     * @return array Word cloud data
     */
    public function loadWordCloud($useCache = true) {
        // Check cache first if enabled and requested
        if ($this->cachingEnabled && $useCache && $this->cache['word_cloud']) {
            return $this->cache['word_cloud'];
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            $docRef = $this->firestore->database()->collection('content')->document('wordCloud');
            $snapshot = $docRef->snapshot();
            
            if (!$snapshot->exists()) {
                return [];
            }
            
            $data = $snapshot->data();
            $words = $data['words'] ?? [];
            
            // Cache the result
            if ($this->cachingEnabled) {
                $this->cache['word_cloud'] = $words;
            }
            
            return $words;
            
        } catch (\Exception $e) {
            error_log('Error loading word cloud: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Save word cloud data
     * 
     * @param array $words Word cloud data
     * @return bool Success status
     */
    public function saveWordCloud($words) {
        if (!is_array($words)) {
            return false;
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            // Save to Firestore
            $docRef = $this->firestore->database()->collection('content')->document('wordCloud');
            $docRef->set([
                'words' => $words,
                'lastUpdated' => new \Google\Cloud\Core\Timestamp(new \DateTime())
            ]);
            
            // Update cache
            if ($this->cachingEnabled) {
                $this->cache['word_cloud'] = $words;
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Error saving word cloud: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear content cache
     * 
     * @param string $cacheType Type of cache to clear (null for all)
     * @return void
     */
    public function clearCache($cacheType = null) {
        if ($cacheType) {
            if ($cacheType === 'pages') {
                $this->cache['pages'] = [];
            } else {
                $this->cache[$cacheType] = null;
            }
        } else {
            $this->cache = [
                'main' => null,
                'draft' => null,
                'pages' => [],
                'word_cloud' => null
            ];
        }
    }
    
    /**
     * Get menu pages for navigation
     * 
     * @param bool $useCache Whether to use cached data if available
     * @return array Menu pages
     */
    public function getMenuPages($useCache = true) {
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            $query = $this->firestore->database()->collection('pages')
                ->where('showInMenu', '==', true)
                ->orderBy('menuOrder')
                ->limit(10);
            
            $snapshot = $query->documents();
            $menuPages = [];
            
            foreach ($snapshot as $document) {
                if (!$document->exists()) {
                    continue;
                }
                
                $pageId = $document->id();
                $pageData = $document->data();
                
                $menuPages[] = [
                    'id' => $pageId,
                    'title' => $pageData['title'] ?? '',
                    'menuOrder' => $pageData['menuOrder'] ?? 999,
                    'menuTitle' => $pageData['menuTitle'] ?? $pageData['title'] ?? '',
                    'url' => 'page.php?id=' . $pageId
                ];
            }
            
            return $menuPages;
            
        } catch (\Exception $e) {
            error_log('Error loading menu pages: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search for content
     * 
     * @param string $query Search query
     * @param array $options Search options
     * @return array Search results
     */
    public function search($query, $options = []) {
        if (empty($query)) {
            return [];
        }
        
        try {
            // Load all pages
            $pages = $this->loadAllPages([], false);
            
            // Filter by search query
            $results = [];
            $searchTerms = explode(' ', strtolower(trim($query)));
            
            foreach ($pages as $page) {
                $score = 0;
                $title = strtolower($page['title'] ?? '');
                $content = strtolower(strip_tags($page['data']['content'] ?? ''));
                
                foreach ($searchTerms as $term) {
                    // Title matches are more important
                    if (strpos($title, $term) !== false) {
                        $score += 3;
                    }
                    
                    // Content matches
                    if (strpos($content, $term) !== false) {
                        $score += 1;
                    }
                }
                
                if ($score > 0) {
                    $results[] = [
                        'id' => $page['id'],
                        'title' => $page['title'] ?? '',
                        'excerpt' => $this->generateExcerpt($content, $searchTerms),
                        'url' => 'page.php?id=' . $page['id'],
                        'score' => $score
                    ];
                }
            }
            
            // Sort by score (highest first)
            usort($results, function($a, $b) {
                return $b['score'] - $a['score'];
            });
            
            // Apply limit
            if (isset($options['limit']) && is_numeric($options['limit'])) {
                $results = array_slice($results, 0, (int)$options['limit']);
            }
            
            return $results;
            
        } catch (\Exception $e) {
            error_log('Error searching content: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Generate excerpt from content with highlighted search terms
     * 
     * @param string $content Content
     * @param array $searchTerms Search terms
     * @param int $length Maximum excerpt length
     * @return string Excerpt
     */
    private function generateExcerpt($content, $searchTerms, $length = 200) {
        // Find the position of the first search term
        $firstPosition = PHP_INT_MAX;
        
        foreach ($searchTerms as $term) {
            $pos = strpos($content, $term);
            if ($pos !== false && $pos < $firstPosition) {
                $firstPosition = $pos;
            }
        }
        
        // Get the excerpt
        $start = max(0, $firstPosition - 50);
        
        if ($start > 0) {
            // Start at a word boundary if possible
            $nextSpace = strpos($content, ' ', $start);
            if ($nextSpace !== false && $nextSpace < $firstPosition) {
                $start = $nextSpace + 1;
            }
            
            $content = '...' . substr($content, $start);
        }
        
        // Truncate to length
        if (strlen($content) > $length) {
            $content = substr($content, 0, $length);
            $lastSpace = strrpos($content, ' ');
            
            if ($lastSpace !== false) {
                $content = substr($content, 0, $lastSpace) . '...';
            } else {
                $content .= '...';
            }
        }
        
        return $content;
    }
    
    /**
     * Check if a page with the given ID exists
     * 
     * @param string $pageId Page ID
     * @return bool True if page exists
     */
    public function pageExists($pageId) {
        if (empty($pageId)) {
            return false;
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            $docRef = $this->firestore->database()->collection('pages')->document($pageId);
            $snapshot = $docRef->snapshot();
            
            return $snapshot->exists();
            
        } catch (\Exception $e) {
            error_log('Error checking page existence: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get global settings
     * 
     * @param bool $useCache Whether to use cached data if available
     * @return array Settings data
     */
    public function getGlobalSettings($useCache = true) {
        // Check cache first if enabled and requested
        if ($this->cachingEnabled && $useCache && isset($this->cache['settings'])) {
            return $this->cache['settings'];
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            $docRef = $this->firestore->database()->collection('settings')->document('global');
            $snapshot = $docRef->snapshot();
            
            if (!$snapshot->exists()) {
                return [];
            }
            
            $data = $snapshot->data();
            
            // Cache the result
            if ($this->cachingEnabled) {
                $this->cache['settings'] = $data;
            }
            
            return $data;
            
        } catch (\Exception $e) {
            error_log('Error loading global settings: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Save global settings
     * 
     * @param array $settings Settings data
     * @return bool Success status
     */
    public function saveGlobalSettings($settings) {
        if (!is_array($settings)) {
            return false;
        }
        
        try {
            if (!$this->firestore) {
                throw new \Exception('Firestore not initialized');
            }
            
            // Add timestamp
            $settings['lastUpdated'] = new \Google\Cloud\Core\Timestamp(new \DateTime());
            
            // Save to Firestore
            $docRef = $this->firestore->database()->collection('settings')->document('global');
            $docRef->set($settings, ['merge' => true]);
            
            // Update cache
            if ($this->cachingEnabled) {
                $this->cache['settings'] = $settings;
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Error saving global settings: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Format image data in a consistent way
     * 
     * @param string|array $imageData Image data
     * @return array Formatted image data
     */
    public function formatImageData($imageData) {
        if (empty($imageData)) {
            return [
                'url' => '',
                'public_id' => '',
                'alt' => ''
            ];
        }
        
        if (is_string($imageData)) {
            return [
                'url' => $imageData,
                'public_id' => '',
                'alt' => ''
            ];
        }
        
        return [
            'url' => $imageData['url'] ?? $imageData['secure_url'] ?? '',
            'public_id' => $imageData['public_id'] ?? '',
            'alt' => $imageData['alt'] ?? ''
        ];
    }
}