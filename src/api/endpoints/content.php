 <?php
/**
 * content.php
 * Handles content-related API endpoints
 */

// Include required files
require_once __DIR__ . '/../config.php';

// Set CORS headers
setCorsHeaders();

// Get request method and content type
$method = $_SERVER['REQUEST_METHOD'];
$contentType = isset($_GET['type']) ? $_GET['type'] : 'main';
$action = isset($_GET['action']) ? $_GET['action'] : 'get';

// Handle OPTIONS preflight request
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Validate content type
$validContentTypes = ['main', 'draft', 'wordCloud', 'page', 'global'];
if (!in_array($contentType, $validContentTypes)) {
    sendJsonError('Invalid content type: ' . $contentType, 400);
}

// Process based on method and action
try {
    // Check authentication for non-GET requests
    if ($method !== 'GET') {
        $token = getBearerToken();
        
        if (!$token || !validateAdminToken($token)) {
            sendJsonError('Unauthorized. Authentication required for this operation.', 401);
        }
    }
    
    switch ($action) {
        case 'get':
            // Handle GET requests
            if ($method !== 'GET') {
                sendJsonError('Method not allowed. Use GET for fetching content.', 405);
            }
            getContent($contentType);
            break;
        
        case 'list':
            // Handle listing of content (e.g., for pages)
            if ($method !== 'GET') {
                sendJsonError('Method not allowed. Use GET for listing content.', 405);
            }
            listContent($contentType);
            break;
            
        case 'update':
            // Handle content updates
            if ($method !== 'POST' && $method !== 'PUT') {
                sendJsonError('Method not allowed. Use POST or PUT for updating content.', 405);
            }
            updateContent($contentType);
            break;
            
        case 'delete':
            // Handle content deletion
            if ($method !== 'DELETE') {
                sendJsonError('Method not allowed. Use DELETE for removing content.', 405);
            }
            deleteContent($contentType);
            break;
            
        case 'publish':
            // Handle publishing draft content
            if ($method !== 'POST') {
                sendJsonError('Method not allowed. Use POST for publishing content.', 405);
            }
            publishContent();
            break;
            
        default:
            sendJsonError('Unknown content action: ' . $action, 400);
    }
} catch (Exception $e) {
    sendJsonError('Error: ' . $e->getMessage(), 500);
}

/**
 * Get content by type
 * @param string $contentType Type of content to retrieve
 */
function getContent($contentType) {
    global $firebase_config;
    
    // Get content ID if provided (for pages)
    $contentId = isset($_GET['id']) ? $_GET['id'] : $contentType;
    
    // Get draft flag for preview mode
    $isDraft = isset($_GET['draft']) && $_GET['draft'] === 'true';
    
    // In a real implementation, fetch from Firestore
    // For demo, return mock data
    
    switch ($contentType) {
        case 'main':
            // Main website content
            $content = [
                'aboutTitle' => 'ÜBER MICH',
                'aboutSubtitle' => 'Peer und Genesungsbegleiter',
                'aboutText' => '<p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum.</p>',
                'offeringsTitle' => 'MEINE ANGEBOTE',
                'offeringsSubtitle' => 'Hier sind einige meiner Leistungen und Angebote',
                'offer1Title' => 'Beratung & Begleitung',
                'offer1Desc' => 'Individuelle Beratung und Begleitung bei psychischen Herausforderungen und Lebenskrisen.',
                'offer2Title' => 'Gruppenangebote',
                'offer2Desc' => 'Geleitete Gesprächsgruppen und Workshops zu verschiedenen Themen der psychischen Gesundheit.',
                'offer3Title' => 'Vorträge & Fortbildungen',
                'offer3Desc' => 'Informative Vorträge und Fortbildungen zu Recovery und Genesungsbegleitung.',
                'contactTitle' => 'KONTAKT',
                'contactSubtitle' => 'So erreichen Sie mich',
                'contactAddress' => 'Musterstraße 123, 12345 Musterstadt',
                'contactEmail' => 'info@mannar.de',
                'contactPhone' => '+49 123 456789',
                'updated' => date('Y-m-d H:i:s')
            ];
            break;
            
        case 'wordCloud':
            // Word cloud data
            $content = [
                'words' => [
                    ['text' => 'Mindfulness', 'weight' => 7, 'link' => '#'],
                    ['text' => 'Meditation', 'weight' => 9, 'link' => '#'],
                    ['text' => 'Bewusstsein', 'weight' => 6, 'link' => '#'],
                    ['text' => 'Achtsamkeit', 'weight' => 8, 'link' => '#'],
                    ['text' => 'Spiritualität', 'weight' => 5, 'link' => '#'],
                    ['text' => 'Heilung', 'weight' => 7, 'link' => '#'],
                    ['text' => 'Persönlichkeit', 'weight' => 6, 'link' => '#'],
                    ['text' => 'Reflexion', 'weight' => 8, 'link' => '#'],
                    ['text' => 'Wachstum', 'weight' => 5, 'link' => '#'],
                    ['text' => 'Psychologie', 'weight' => 9, 'link' => '#']
                ],
                'updated' => date('Y-m-d H:i:s')
            ];
            break;
            
        case 'page':
            // Get page by ID
            if (empty($contentId) || $contentId === 'page') {
                sendJsonError('Page ID is required', 400);
            }
            
            // In a real app, fetch page from Firestore
            // For demo, return a mock page
            $content = [
                'title' => 'Beispielseite',
                'template' => 'basic',
                'data' => [
                    'title' => 'Beispielseite',
                    'subtitle' => 'Ein Beispiel für eine dynamische Seite',
                    'content' => '<p>Dies ist ein Beispielinhalt für eine dynamische Seite.</p>'
                ],
                'settings' => [
                    'titleSize' => 2.5,
                    'subtitleSize' => 1.8,
                    'primaryColor' => '#3498db',
                    'secondaryColor' => '#2c3e50',
                    'bodyFont' => "'Lato', sans-serif"
                ],
                'created' => date('Y-m-d H:i:s', strtotime('-1 week')),
                'updated' => date('Y-m-d H:i:s')
            ];
            break;
            
        case 'global':
            // Global settings
            $content = [
                'siteName' => 'Mannar',
                'siteDescription' => 'Peer und Genesungsbegleiter',
                'theme' => [
                    'primaryColor' => '#3498db',
                    'secondaryColor' => '#2c3e50',
                    'accentColor' => '#e74c3c',
                    'fontFamily' => "'Lato', sans-serif",
                    'layout' => 'default'
                ],
                'contact' => [
                    'email' => 'info@mannar.de',
                    'phone' => '+49 123 456789',
                    'address' => 'Musterstraße 123, 12345 Musterstadt'
                ],
                'social' => [
                    'facebook' => 'https://facebook.com/mannar',
                    'instagram' => 'https://instagram.com/mannar',
                    'twitter' => 'https://twitter.com/mannar'
                ],
                'updated' => date('Y-m-d H:i:s')
            ];
            break;
            
        default:
            sendJsonError('Unknown content type: ' . $contentType, 400);
    }
    
    sendJsonResponse($content);
}

/**
 * List content items of a specific type
 * @param string $contentType Type of content to list
 */
function listContent($contentType) {
    // In a real app, fetch list from Firestore
    // For demo, return mock list
    
    if ($contentType !== 'page') {
        sendJsonError('Listing is only supported for pages', 400);
    }
    
    // Mock page list
    $pages = [
        [
            'id' => 'about-me',
            'title' => 'Über Mich',
            'template' => 'basic',
            'created' => date('Y-m-d H:i:s', strtotime('-2 weeks')),
            'updated' => date('Y-m-d H:i:s', strtotime('-1 day'))
        ],
        [
            'id' => 'services',
            'title' => 'Leistungen',
            'template' => 'text-image',
            'created' => date('Y-m-d H:i:s', strtotime('-1 week')),
            'updated' => date('Y-m-d H:i:s', strtotime('-2 days'))
        ],
        [
            'id' => 'gallery',
            'title' => 'Galerie',
            'template' => 'gallery',
            'created' => date('Y-m-d H:i:s', strtotime('-3 days')),
            'updated' => date('Y-m-d H:i:s')
        ]
    ];
    
    sendJsonResponse([
        'items' => $pages,
        'total' => count($pages)
    ]);
}

/**
 * Update content
 * @param string $contentType Type of content to update
 */
function updateContent($contentType) {
    // Get content ID for pages
    $contentId = isset($_GET['id']) ? $_GET['id'] : $contentType;
    
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        sendJsonError('Invalid request data', 400);
    }
    
    // Add timestamps
    $data['updated'] = date('Y-m-d H:i:s');
    
    // In a real app, save to Firestore
    // For demo, just return success
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Content updated successfully',
        'contentType' => $contentType,
        'id' => $contentId
    ]);
}

/**
 * Delete content
 * @param string $contentType Type of content to delete
 */
function deleteContent($contentType) {
    // Only pages can be deleted
    if ($contentType !== 'page') {
        sendJsonError('Only pages can be deleted', 400);
    }
    
    // Get page ID
    $pageId = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$pageId) {
        sendJsonError('Page ID is required', 400);
    }
    
    // In a real app, delete from Firestore
    // For demo, just return success
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Page deleted successfully',
        'id' => $pageId
    ]);
}

/**
 * Publish draft content to live
 */
function publishContent() {
    // In a real app, copy draft to main in Firestore
    // For demo, just return success
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Content published successfully',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Get bearer token from authorization header
 * @return string|null The token or null if not found
 */
function getBearerToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Extract token
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}
?>