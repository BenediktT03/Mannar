/**
 * Application Module
 * Central initialization and management of the Mannar website
 */
const App = (function() {
  // Configuration
  const config = {
    // Environment: 'development' or 'production'
    environment: window.location.hostname === 'localhost' ? 'development' : 'production',
    // Debug mode (enabled in development by default)
    debug: window.location.hostname === 'localhost',
    // Feature flags
    features: {
      // Enable animations by default, but respect user preferences
      animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      // Enable analytics in production only
      analytics: window.location.hostname !== 'localhost',
      // Enable dynamic content loading
      dynamicContent: true,
      // Enable service worker (for offline support - currently disabled)
      serviceWorker: false
    }
  };
  
  // Initialization state
  let initialized = false;
  
  /**
   * Initialize the application
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} True if initialization successful
   */
  async function init(options = {}) {
    if (initialized) return true;
    
    try {
      // Merge options with default config
      if (options.config) {
        Object.assign(config, options.config);
      }
      
      // Configure logging based on environment
      configureLogging();
      
      // Initialize services
      await initServices();
      
      // Initialize UI components
      initUIComponents();
      
      // Initialize page-specific functionality
      initPageFunctionality();
      
      // Mark as initialized
      initialized = true;
      
      log('Application initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing application:', error);
      return false;
    }
  }
  
  /**
   * Configure logging based on environment
   */
  function configureLogging() {
    if (config.environment !== 'development' && !config.debug) {
      // Disable console.log in production unless debug mode is enabled
      const noop = () => {};
      
      // Store original console methods
      const originalConsole = {
        log: console.log,
        info: console.info,
        debug: console.debug
      };
      
      // Override non-critical console methods
      console.log = noop;
      console.info = noop;
      console.debug = noop;
      
      // Add method to restore console
      console.enableLogging = () => {
        console.log = originalConsole.log;
        console.info = originalConsole.info;
        console.debug = originalConsole.debug;
        console.log('Logging enabled');
      };
    }
  }
  
  /**
   * Initialize services
   * @returns {Promise<boolean>} True if services initialized successfully
   */
  async function initServices() {
    // Initialize Firebase
    if (typeof FirebaseService !== 'undefined') {
      if (!FirebaseService.init()) {
        console.error('Failed to initialize Firebase');
      }
    } else {
      log('FirebaseService not available');
    }
    
    // Initialize other services if they exist
    const services = [
      'ContentService',
      'AuthService',
      'UploadService',
      'UIService'
    ];
    
    services.forEach(service => {
      if (typeof window[service] !== 'undefined') {
        log(`${service} available`);
        if (typeof window[service].init === 'function') {
          window[service].init();
        }
      }
    });
    
    return true;
  }
  
  /**
   * Initialize UI components
   */
  function initUIComponents() {
    // Initialize UI utilities if available
    if (typeof UIService !== 'undefined') {
      // Initialize lazy loading for images
      UIService.initLazyLoading();
      
      // Initialize animations if enabled
      if (config.features.animations) {
        UIService.initAnimations();
      }
      
      // Initialize go-to-top button
      UIService.initGoToTopButton();
      
      // Initialize smooth scrolling
      UIService.initSmoothScrolling();
    } else if (typeof UIUtils !== 'undefined') {
      // Fallback to UIUtils if UIService isn't available
      UIUtils.initAll();
    }
    
    // Initialize navigation
    initNavigation();
  }
  
  /**
   * Initialize navigation functionality
   */
  function initNavigation() {
    // Mobile navigation toggle
    window.toggleFunction = function() {
      const navDemo = document.getElementById('navDemo');
      if (!navDemo) return;
      
      navDemo.classList.toggle('w3-show');
      
      // Update ARIA attributes
      const toggleBtn = document.querySelector('[aria-controls="navDemo"]');
      if (toggleBtn) {
        toggleBtn.setAttribute(
          'aria-expanded', 
          navDemo.classList.contains('w3-show') ? 'true' : 'false'
        );
      }
    };
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      const navDemo = document.getElementById('navDemo');
      
      if (navDemo && 
          navDemo.classList.contains('w3-show') && 
          !event.target.closest('#navDemo') && 
          !event.target.closest('[aria-controls="navDemo"]')) {
        navDemo.classList.remove('w3-show');
        
        // Update ARIA attributes
        const toggleBtn = document.querySelector('[aria-controls="navDemo"]');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
    
    // Handle navigation scroll behavior
    const navbar = document.getElementById('myNavbar');
    if (navbar) {
      const handleScroll = () => {
        if (window.scrollY > 100) {
          navbar.classList.add('scrolled');
          navbar.classList.add('visible');
        } else {
          navbar.classList.remove('scrolled');
          
          if (window.scrollY <= 10) {
            navbar.classList.remove('visible');
          }
        }
      };
      
      // Initial call and event listener
      handleScroll();
      window.addEventListener('scroll', handleScroll);
    }
  }
  
  /**
   * Initialize page-specific functionality
   */
  function initPageFunctionality() {
    // Detect current page
    const currentPage = detectCurrentPage();
    
    // Initialize based on page type
    switch (currentPage) {
      case 'home':
        initHomePage();
        break;
        
      case 'admin':
        initAdminPage();
        break;
        
      case 'page':
        initDynamicPage();
        break;
        
      case 'preview':
        initPreviewPage();
        break;
    }
  }
  
  /**
   * Detect current page based on URL
   * @returns {string} Page type identifier
   */
  function detectCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('admin') || path.includes('admin-panel.php')) {
      return 'admin';
    } else if (path.includes('preview') || path.includes('preview.html')) {
      return 'preview';
    } else if (path.includes('page.php')) {
      return 'page';
    } else {
      return 'home';
    }
  }
  
  /**
   * Initialize home page functionality
   */
  function initHomePage() {
    log('Initializing home page');
    
    // Initialize word cloud if present
    const wordCloudContainer = document.querySelector('.textbubble');
    if (wordCloudContainer) {
      initWordCloud();
    }
    
    // Initialize main content from Firebase if not in admin mode
    if (typeof ContentService !== 'undefined' && config.features.dynamicContent) {
      ContentService.loadMainContent(false)
        .then(data => {
          if (!data) {
            log('No content found for home page');
            return;
          }
          
          // Update page content
          updateHomePageContent(data);
        })
        .catch(error => {
          console.error('Error loading home page content:', error);
        });
    }
  }
  
  /**
   * Initialize word cloud
   */
  function initWordCloud() {
    if (typeof ContentService === 'undefined') return;
    
    const wordCloudList = document.getElementById('wordCloudList');
    if (!wordCloudList) return;
    
    // Load word cloud data
    ContentService.loadWordCloud()
      .then(words => {
        if (!words || !words.length) {
          log('No word cloud data found');
          return;
        }
        
        // Render word cloud
        renderWordCloud(wordCloudList, words);
        
        // Animate word cloud if animations are enabled
        if (config.features.animations) {
          animateWordCloud(document.querySelector('.textbubble'));
        }
      })
      .catch(error => {
        console.error('Error loading word cloud:', error);
      });
  }
  
  /**
   * Render word cloud
   * @param {HTMLElement} container - Container element
   * @param {Array} words - Word cloud data
   */
  function renderWordCloud(container, words) {
    if (!container || !words || !words.length) return;
    
    container.innerHTML = '';
    
    words.forEach(word => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = word.link || '#';
      a.textContent = word.text || '';
      a.setAttribute('data-weight', word.weight || 5);
      
      // Add appropriate ARIA attributes for accessibility
      a.setAttribute('role', 'button');
      if (word.description) {
        a.setAttribute('aria-label', word.description);
      }
      
      li.appendChild(a);
      container.appendChild(li);
    });
  }
  
  /**
   * Animate word cloud appearance
   * @param {HTMLElement} container - Container element
   */
  function animateWordCloud(container) {
    if (!container || !config.features.animations) return;
    
    const wordElements = container.querySelectorAll('.word-cloud li a');
    
    wordElements.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
  
  /**
   * Update home page content with loaded data
   * @param {Object} data - Content data
   */
  function updateHomePageContent(data) {
    const updateElement = (id, property, value) => {
      const element = document.getElementById(id);
      if (element && value) {
        if (property === 'innerHTML') {
          element.innerHTML = value;
        } else if (property === 'textContent') {
          element.textContent = value;
        } else {
          element[property] = value;
        }
      }
    };
    
    // Update section titles and content
    updateElement('aboutTitle', 'innerHTML', data.aboutTitle);
    updateElement('aboutSubtitle', 'innerHTML', data.aboutSubtitle);
    updateElement('aboutText', 'innerHTML', data.aboutText);
    
    updateElement('offeringsTitle', 'innerHTML', data.offeringsTitle);
    updateElement('offeringsSubtitle', 'innerHTML', data.offeringsSubtitle);
    
    // Update offerings
    for (let i = 1; i <= 3; i++) {
      updateElement(`offer${i}Title`, 'innerHTML', data[`offer${i}Title`]);
      updateElement(`offer${i}Desc`, 'innerHTML', data[`offer${i}Desc`]);
    }
    
    // Update contact section
    updateElement('contactTitle', 'innerHTML', data.contactTitle);
    updateElement('contactSubtitle', 'innerHTML', data.contactSubtitle);
    
    // Update images if ContentService has the method
    if (typeof ContentService !== 'undefined' && typeof ContentService.updateImagePreviews === 'function') {
      ContentService.updateImagePreviews(data, {
        offer1Img: document.getElementById('offer1Image'),
        offer2Img: document.getElementById('offer2Image'),
        offer3Img: document.getElementById('offer3Image'),
        contactImg: document.getElementById('contactImage')
      });
    } else {
      // Fallback image updating
      updateImages(data);
    }
  }
  
  /**
   * Update images on the page (fallback method)
   * @param {Object} data - Content data with image information
   */
  function updateImages(data) {
    const updateImage = (id, imageData) => {
      const img = document.getElementById(id);
      if (!img) return;
      
      if (imageData && (imageData.url || typeof imageData === 'string')) {
        const url = typeof imageData === 'string' ? imageData : imageData.url;
        img.src = url;
        img.style.display = 'block';
        
        if (imageData.alt) {
          img.alt = imageData.alt;
        }
      } else {
        img.style.display = 'none';
      }
    };
    
    updateImage('offer1Image', data.offer1_image);
    updateImage('offer2Image', data.offer2_image);
    updateImage('offer3Image', data.offer3_image);
    updateImage('contactImage', data.contact_image);
  }
  
  /**
   * Initialize admin page
   */
  function initAdminPage() {
    log('Initializing admin page');
    // Admin functionality is handled in separate admin-specific scripts
    // This just ensures they're properly triggered
    
    // Make sure AdminCore is initialized if available
    if (typeof AdminCore !== 'undefined' && typeof AdminCore.init === 'function') {
      setTimeout(() => AdminCore.init(), 100);
    }
  }
  
  /**
   * Initialize dynamic page
   */
  function initDynamicPage() {
    log('Initializing dynamic page');
    
    // Get page ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get('id');
    
    if (!pageId) {
      log('No page ID found');
      return;
    }
    
    // Load page content if ContentService is available
    if (typeof ContentService !== 'undefined') {
      ContentService.loadPage(pageId)
        .then(pageData => {
          if (!pageData) {
            log(`Page ${pageId} not found`);
            showPageError('Die angeforderte Seite wurde nicht gefunden.');
            return;
          }
          
          log(`Loaded page: ${pageData.title}`);
          
          // Update page content
          updateDynamicPageContent(pageData);
        })
        .catch(error => {
          console.error(`Error loading page ${pageId}:`, error);
          showPageError(`Fehler beim Laden der Seite: ${error.message}`);
        });
    }
  }
  
  /**
   * Show page error message
   * @param {string} message - Error message to display
   */
  function showPageError(message) {
    const pageContent = document.getElementById('pageContent');
    const pageLoading = document.getElementById('pageLoading');
    
    if (pageLoading) {
      pageLoading.style.display = 'none';
    }
    
    if (pageContent) {
      pageContent.innerHTML = `
        <div class="w3-container w3-padding-64">
          <div class="w3-panel w3-red">
            <h3>Fehler</h3>
            <p>${message}</p>
            <a href="index.php" class="w3-button w3-blue">Zurück zur Startseite</a>
          </div>
        </div>
      `;
      pageContent.style.opacity = '1';
    }
  }
  
  /**
   * Update dynamic page content
   * @param {Object} pageData - Page data
   */
  function updateDynamicPageContent(pageData) {
    // Set page title
    document.title = pageData.title + ' - Mannar';
    
    // Get page content container
    const pageContent = document.getElementById('pageContent');
    const pageLoading = document.getElementById('pageLoading');
    
    if (pageLoading) {
      pageLoading.style.opacity = '0';
      setTimeout(() => {
        pageLoading.style.display = 'none';
      }, 300);
    }
    
    if (!pageContent) return;
    
    // Show content container
    pageContent.style.opacity = '1';
    
    // Generate content based on template
    const templateId = pageData.template;
    const data = pageData.data || {};
    
    // Set the page title and subtitle in the content
    const titleEl = document.createElement('h1');
    titleEl.className = 'page-title w3-center';
    titleEl.textContent = pageData.title || '';
    
    pageContent.innerHTML = '';
    pageContent.appendChild(titleEl);
    
    if (data.subtitle) {
      const subtitleEl = document.createElement('h2');
      subtitleEl.className = 'page-subtitle w3-center';
      subtitleEl.textContent = data.subtitle;
      pageContent.appendChild(subtitleEl);
    }
    
    // Create a container for the main content
    const contentContainer = document.createElement('div');
    pageContent.appendChild(contentContainer);
    
    // Render the template content
    try {
      contentContainer.innerHTML = renderTemplate(templateId, data);
      
      // Initialize any template-specific functionality
      initTemplateComponents(templateId, data);
    } catch (error) {
      console.error('Error rendering template:', error);
      contentContainer.innerHTML = `
        <div class="w3-panel w3-red">
          <h3>Fehler beim Rendern der Seite</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
  
  /**
   * Render a template with data
   * @param {string} templateId - Template identifier
   * @param {Object} data - Template data
   * @returns {string} Rendered HTML
   */
  function renderTemplate(templateId, data) {
    // This would be a switch statement or function calls to different template renderers
    // Simplified here, but in the real implementation you would have template-specific renderers
    return `
      <div class="w3-container w3-padding">
        <div class="w3-content">
          ${data.content || 'No content available'}
        </div>
      </div>
    `;
  }
  
  /**
   * Initialize template-specific components
   * @param {string} templateId - Template identifier
   * @param {Object} data - Template data
   */
  function initTemplateComponents(templateId, data) {
    // Initialize components based on template type
    // This is where you would add template-specific initialization
    switch (templateId) {
      case 'gallery':
        initGallery();
        break;
      case 'contact':
        initContactForm();
        break;
    }
  }
  
  /**
   * Initialize preview page
   */
  function initPreviewPage() {
    log('Initializing preview page');
    
    // If PreviewModule exists, use it
    if (typeof PreviewModule !== 'undefined' && typeof PreviewModule.init === 'function') {
      PreviewModule.init();
      return;
    }
    
    // Otherwise handle preview functionality directly
    const urlParams = new URLSearchParams(window.location.search);
    const isDraft = urlParams.get('draft') === 'true';
    
    // Update preview indicator
    const previewIndicator = document.getElementById('previewIndicator');
    const previewMode = document.getElementById('previewMode');
    
    if (previewIndicator && previewMode) {
      if (isDraft) {
        previewMode.textContent = 'Entwurf';
        previewIndicator.classList.remove('live');
      } else {
        previewMode.textContent = 'Live-Website';
        previewIndicator.classList.add('live');
      }
    }
    
    // Load preview content
    if (typeof ContentService !== 'undefined') {
      ContentService.loadMainContent(isDraft)
        .then(data => {
          if (!data) {
            log('No content found for preview');
            return;
          }
          
          // Update preview content
          updatePreviewContent(data);
        })
        .catch(error => {
          console.error('Error loading preview content:', error);
        });
    }
  }
  
  /**
   * Update preview content
   * @param {Object} data - Content data
   */
  function updatePreviewContent(data) {
    // Helper function to update elements
    const updateElement = (id, content) => {
      const element = document.getElementById(id);
      if (element && content) {
        element.innerHTML = content;
      }
    };
    
    // Update about section
    updateElement('aboutTitleDisplay', data.aboutTitle);
    updateElement('aboutSubtitleDisplay', data.aboutSubtitle);
    updateElement('aboutTextDisplay', data.aboutText);
    
    // Update offerings section
    updateElement('offeringsTitleDisplay', data.offeringsTitle);
    updateElement('offeringsSubtitleDisplay', data.offeringsSubtitle);
    
    // Update offerings
    for (let i = 1; i <= 3; i++) {
      updateElement(`offer${i}TitleDisplay`, data[`offer${i}Title`]);
      updateElement(`offer${i}DescDisplay`, data[`offer${i}Desc`]);
    }
    
    // Update contact section
    updateElement('contactTitleDisplay', data.contactTitle);
    updateElement('contactSubtitleDisplay', data.contactSubtitle);
    
    // Update images
    if (typeof ContentService !== 'undefined' && typeof ContentService.updateImagePreviews === 'function') {
      ContentService.updateImagePreviews(data, {
        offer1Img: document.getElementById('offer1ImageDisplay'),
        offer2Img: document.getElementById('offer2ImageDisplay'),
        offer3Img: document.getElementById('offer3ImageDisplay'),
        contactImg: document.getElementById('contactImageDisplay')
      });
    }
  }
  
  /**
   * Log message if in development or debug mode
   * @param {...any} args - Arguments to log
   */
  function log(...args) {
    if (config.environment === 'development' || config.debug) {
      console.log('[App]', ...args);
    }
  }
  
  // Public API
  return {
    init,
    config,
    log,
    updateHomePageContent,
    updatePreviewContent
  };
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init().catch(error => {
    console.error('Failed to initialize application:', error);
  });
});