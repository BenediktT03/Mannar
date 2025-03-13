 /**
 * Main Application
 * Bootstrap and initialize all components and services
 */
const App = (function() {
  // Configuration
  const config = {
    // Environment: 'development' or 'production'
    environment: 'production',
    // Debug mode
    debug: false,
    // Feature flags
    features: {
      // Enable animations
      animations: true,
      // Enable analytics
      analytics: true,
      // Enable service worker
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
      Object.assign(config, options);
      
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
    if (!FirebaseService.init()) {
      console.error('Failed to initialize Firebase');
    }
    
    // Initialize other services if they exist
    if (window.ContentService) {
      log('ContentService available');
    }
    
    if (window.AuthService) {
      log('AuthService available');
    }
    
    if (window.UploadService) {
      log('UploadService available');
    }
    
    if (window.UIService) {
      log('UIService available');
    }
    
    return true;
  }
  
  /**
   * Initialize UI components
   */
  function initUIComponents() {
    // Initialize UI utilities if available
    if (window.UIService) {
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
      }
    });
    
    // Handle navigation scroll behavior
    const navbar = document.getElementById('myNavbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          navbar.classList.add('scrolled');
          navbar.classList.add('visible');
        } else {
          navbar.classList.remove('scrolled');
          
          if (window.scrollY <= 10) {
            navbar.classList.remove('visible');
          }
        }
      });
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
   * Detect current page
   * @returns {string} Page type
   */
  function detectCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('admin-panel.php')) {
      return 'admin';
    } else if (path.includes('preview.php') || path.includes('preview.html')) {
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
    if (window.ContentService) {
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
   * Initialize admin page functionality
   */
  function initAdminPage() {
    log('Initializing admin page');
    
    // Admin functionality is handled separately in admin-specific scripts
  }
  
  /**
   * Initialize dynamic page functionality
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
    if (window.ContentService) {
      ContentService.loadPage(pageId)
        .then(pageData => {
          if (!pageData) {
            log(`Page ${pageId} not found`);
            return;
          }
          
          log(`Loaded page: ${pageData.title}`);
          
          // Update page content
          updateDynamicPageContent(pageData);
        })
        .catch(error => {
          console.error(`Error loading page ${pageId}:`, error);
        });
    }
  }
  
  /**
   * Initialize preview page functionality
   */
  function initPreviewPage() {
    log('Initializing preview page');
    
    // Get draft mode from URL
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
    if (window.ContentService) {
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
   * Initialize word cloud
   */
  function initWordCloud() {
    if (!window.ContentService) return;
    
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
        
        // Animate word cloud
        animateWordCloud(document.querySelector('.textbubble'));
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
      
      li.appendChild(a);
      container.appendChild(li);
    });
  }
  
  /**
   * Animate word cloud
   * @param {HTMLElement} container - Container element
   */
  function animateWordCloud(container) {
    if (!container) return;
    
    const wordElements = container.querySelectorAll('.word-cloud li a');
    
    wordElements.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
  
  /**
   * Update home page content
   * @param {Object} data - Content data
   */
  function updateHomePageContent(data) {
    // Update about section
    if (data.aboutTitle) {
      const aboutTitle = document.getElementById('aboutTitle');
      if (aboutTitle) aboutTitle.innerHTML = data.aboutTitle;
    }
    
    if (data.aboutSubtitle) {
      const aboutSubtitle = document.getElementById('aboutSubtitle');
      if (aboutSubtitle) aboutSubtitle.innerHTML = data.aboutSubtitle;
    }
    
    if (data.aboutText) {
      const aboutText = document.getElementById('aboutText');
      if (aboutText) aboutText.innerHTML = data.aboutText;
    }
    
    // Update offerings section
    if (data.offeringsTitle) {
      const offeringsTitle = document.getElementById('offeringsTitle');
      if (offeringsTitle) offeringsTitle.innerHTML = data.offeringsTitle;
    }
    
    if (data.offeringsSubtitle) {
      const offeringsSubtitle = document.getElementById('offeringsSubtitle');
      if (offeringsSubtitle) offeringsSubtitle.innerHTML = data.offeringsSubtitle;
    }
    
    // Update offering 1
    if (data.offer1Title) {
      const offer1Title = document.getElementById('offer1Title');
      if (offer1Title) offer1Title.innerHTML = data.offer1Title;
    }
    
    if (data.offer1Desc) {
      const offer1Desc = document.getElementById('offer1Desc');
      if (offer1Desc) offer1Desc.innerHTML = data.offer1Desc;
    }
    
    // Update offering 2
    if (data.offer2Title) {
      const offer2Title = document.getElementById('offer2Title');
      if (offer2Title) offer2Title.innerHTML = data.offer2Title;
    }
    
    if (data.offer2Desc) {
      const offer2Desc = document.getElementById('offer2Desc');
      if (offer2Desc) offer2Desc.innerHTML = data.offer2Desc;
    }
    
    // Update offering 3
    if (data.offer3Title) {
      const offer3Title = document.getElementById('offer3Title');
      if (offer3Title) offer3Title.innerHTML = data.offer3Title;
    }
    
    if (data.offer3Desc) {
      const offer3Desc = document.getElementById('offer3Desc');
      if (offer3Desc) offer3Desc.innerHTML = data.offer3Desc;
    }
    
    // Update contact section
    if (data.contactTitle) {
      const contactTitle = document.getElementById('contactTitle');
      if (contactTitle) contactTitle.innerHTML = data.contactTitle;
    }
    
    if (data.contactSubtitle) {
      const contactSubtitle = document.getElementById('contactSubtitle');
      if (contactSubtitle) contactSubtitle.innerHTML = data.contactSubtitle;
    }
    
    // Update images
    if (window.ContentService && ContentService.updateImagePreviews) {
      ContentService.updateImagePreviews(data, {
        offer1Img: document.getElementById('offer1Image'),
        offer2Img: document.getElementById('offer2Image'),
        offer3Img: document.getElementById('offer3Image'),
        contactImg: document.getElementById('contactImage')
      });
    }
  }
  
  /**
   * Update dynamic page content
   * @param {Object} pageData - Page data
   */
  function updateDynamicPageContent(pageData) {
    // Set page title
    document.title = pageData.title;
    
    // Get page content container
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) return;
    
    // Clear loading indicator
    pageContent.innerHTML = '';
    
    // Generate content based on template
    const templateId = pageData.template;
    const data = pageData.data || {};
    
    // Render template
    renderPageTemplate(templateId, data, pageContent);
  }
  
  /**
   * Update preview content
   * @param {Object} data - Content data
   */
  function updatePreviewContent(data) {
    // Update about section
    if (data.aboutTitle) {
      const aboutTitleDisplay = document.getElementById('aboutTitleDisplay');
      if (aboutTitleDisplay) aboutTitleDisplay.innerHTML = data.aboutTitle;
    }
    
    if (data.aboutSubtitle) {
      const aboutSubtitleDisplay = document.getElementById('aboutSubtitleDisplay');
      if (aboutSubtitleDisplay) aboutSubtitleDisplay.innerHTML = data.aboutSubtitle;
    }
    
    if (data.aboutText) {
      const aboutTextDisplay = document.getElementById('aboutTextDisplay');
      if (aboutTextDisplay) aboutTextDisplay.innerHTML = data.aboutText;
    }
    
    // Update offerings section
    if (data.offeringsTitle) {
      const offeringsTitleDisplay = document.getElementById('offeringsTitleDisplay');
      if (offeringsTitleDisplay) offeringsTitleDisplay.innerHTML = data.offeringsTitle;
    }
    
    if (data.offeringsSubtitle) {
      const offeringsSubtitleDisplay = document.getElementById('offeringsSubtitleDisplay');
      if (offeringsSubtitleDisplay) offeringsSubtitleDisplay.innerHTML = data.offeringsSubtitle;
    }
    
    // Update offering 1
    if (data.offer1Title) {
      const offer1TitleDisplay = document.getElementById('offer1TitleDisplay');
      if (offer1TitleDisplay) offer1TitleDisplay.innerHTML = data.offer1Title;
    }
    
    if (data.offer1Desc) {
      const offer1DescDisplay = document.getElementById('offer1DescDisplay');
      if (offer1DescDisplay) offer1DescDisplay.innerHTML = data.offer1Desc;
    }
    
    // Update offering 2
    if (data.offer2Title) {
      const offer2TitleDisplay = document.getElementById('offer2TitleDisplay');
      if (offer2TitleDisplay) offer2TitleDisplay.innerHTML = data.offer2Title;
    }
    
    if (data.offer2Desc) {
      const offer2DescDisplay = document.getElementById('offer2DescDisplay');
      if (offer2DescDisplay) offer2DescDisplay.innerHTML = data.offer2Desc;
    }
    
    // Update offering 3
    if (data.offer3Title) {
      const offer3TitleDisplay = document.getElementById('offer3TitleDisplay');
      if (offer3TitleDisplay) offer3TitleDisplay.innerHTML = data.offer3Title;
    }
    
    if (data.offer3Desc) {
      const offer3DescDisplay = document.getElementById('offer3DescDisplay');
      if (offer3DescDisplay) offer3DescDisplay.innerHTML = data.offer3Desc;
    }
    
    // Update contact section
    if (data.contactTitle) {
      const contactTitleDisplay = document.getElementById('contactTitleDisplay');
      if (contactTitleDisplay) contactTitleDisplay.innerHTML = data.contactTitle;
    }
    
    if (data.contactSubtitle) {
      const contactSubtitleDisplay = document.getElementById('contactSubtitleDisplay');
      if (contactSubtitleDisplay) contactSubtitleDisplay.innerHTML = data.contactSubtitle;
    }
    
    // Update images
    if (window.ContentService && ContentService.updateImagePreviews) {
      ContentService.updateImagePreviews(data, {
        offer1Img: document.getElementById('offer1ImageDisplay'),
        offer2Img: document.getElementById('offer2ImageDisplay'),
        offer3Img: document.getElementById('offer3ImageDisplay'),
        contactImg: document.getElementById('contactImageDisplay')
      });
    }
  }
  
  /**
   * Render page template
   * @param {string} templateId - Template ID
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderPageTemplate(templateId, data, container) {
    // Simple template rendering based on template ID
    switch (templateId) {
      case 'basic':
        renderBasicTemplate(data, container);
        break;
        
      case 'text-image':
        renderTextImageTemplate(data, container);
        break;
        
      case 'image-text':
        renderImageTextTemplate(data, container);
        break;
        
      case 'gallery':
        renderGalleryTemplate(data, container);
        break;
        
      case 'landing':
        renderLandingTemplate(data, container);
        break;
        
      case 'portfolio':
        renderPortfolioTemplate(data, container);
        break;
        
      case 'contact':
        renderContactTemplate(data, container);
        break;
        
      case 'blog':
        renderBlogTemplate(data, container);
        break;
        
      default:
        container.innerHTML = `
          <div class="w3-panel w3-pale-red">
            <h3>Error: Unknown Template</h3>
            <p>The template "${templateId}" is not supported.</p>
          </div>
        `;
    }
  }
  
  /**
   * Render basic template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderBasicTemplate(data, container) {
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      <div class="w3-container">
        ${data.content || ''}
      </div>
    `;
  }
  
  /**
   * Render text-image template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderTextImageTemplate(data, container) {
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      <div class="w3-row-padding">
        <div class="w3-col m8 w3-padding animate-item">
          <div>${data.content || ''}</div>
        </div>
        <div class="w3-col m4 w3-padding animate-item delay-1">
          <div class="image-container w3-card">
            <img src="${data.featuredImage?.url || '/api/placeholder/400/300'}" alt="${data.featuredImage?.alt || data.title || 'Bild'}" class="w3-image">
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render image-text template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderImageTextTemplate(data, container) {
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      <div class="w3-row-padding">
        <div class="w3-col m4 w3-padding animate-item">
          <div class="image-container w3-card">
            <img src="${data.featuredImage?.url || '/api/placeholder/400/300'}" alt="${data.featuredImage?.alt || data.title || 'Bild'}" class="w3-image">
          </div>
        </div>
        <div class="w3-col m8 w3-padding animate-item delay-1">
          <div>${data.content || ''}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render gallery template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderGalleryTemplate(data, container) {
    let galleryItemsHtml = '';
    
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((image, index) => {
        if (!image || !image.url) return;
        
        galleryItemsHtml += `
          <div class="w3-col m4 l3 s6 w3-padding animate-item delay-${index % 5}">
            <div class="gallery-item w3-card">
              <img src="${image.url}" alt="${image.alt || ''}" class="w3-image gallery-img" style="width:100%">
              ${image.caption ? `<div class="w3-padding-small w3-light-grey">${image.caption}</div>` : ''}
            </div>
          </div>
        `;
      });
    } else {
      galleryItemsHtml = '<div class="w3-panel w3-pale-yellow w3-center">Keine Bilder in dieser Galerie</div>';
    }
    
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      <div class="w3-container">${data.description || ''}</div>
      <div class="w3-row-padding w3-margin-top gallery-container">
        ${galleryItemsHtml}
      </div>
    `;
    
    // Add modal for gallery images
    addGalleryModal(container);
  }
  
  /**
   * Add gallery modal
   * @param {HTMLElement} container - Container element
   */
  function addGalleryModal(container) {
    // Create modal if it doesn't exist
    let galleryModal = document.getElementById('galleryModal');
    
    if (!galleryModal) {
      galleryModal = document.createElement('div');
      galleryModal.id = 'galleryModal';
      galleryModal.className = 'w3-modal';
      galleryModal.onclick = function() { this.style.display = 'none'; };
      
      galleryModal.innerHTML = `
        <div class="w3-modal-content w3-animate-zoom">
          <span class="w3-button w3-hover-red w3-xlarge w3-display-topright">&times;</span>
          <img id="modalImg" class="w3-image" style="width:100%; max-height:80vh; object-fit:contain;">
          <div id="modalCaption" class="w3-container w3-padding-16 w3-light-grey"></div>
        </div>
      `;
      
      document.body.appendChild(galleryModal);
    }
    
    // Add click event to gallery images
    const galleryImages = container.querySelectorAll('.gallery-img');
    
    galleryImages.forEach(img => {
      img.style.cursor = 'pointer';
      
      img.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const modalImg = document.getElementById('modalImg');
        const modalCaption = document.getElementById('modalCaption');
        
        if (!modalImg || !modalCaption) return;
        
        modalImg.src = this.src;
        
        // Get caption if available
        const captionElement = this.nextElementSibling;
        
        if (captionElement && captionElement.textContent) {
          modalCaption.textContent = captionElement.textContent;
          modalCaption.style.display = 'block';
        } else {
          modalCaption.textContent = '';
          modalCaption.style.display = 'none';
        }
        
        galleryModal.style.display = 'block';
      });
    });
  }
  
  /**
   * Render landing template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderLandingTemplate(data, container) {
    let featuresHtml = '';
    
    // Generate features
    if (data.features && Array.isArray(data.features) && data.features.length > 0) {
      data.features.forEach((feature, index) => {
        if (!feature) return;
        
        featuresHtml += `
          <div class="w3-col m4 s12 w3-padding animate-item delay-${index % 3}">
            <div class="feature-item w3-card w3-padding w3-center">
              ${feature.icon && feature.icon.url ? 
                `<img src="${feature.icon.url}" alt="${feature.title || 'Feature'}" style="width:64px; height:64px; margin:0 auto; display:block;">` : 
                '<div class="w3-circle w3-light-grey w3-padding w3-center" style="width:64px; height:64px; margin:0 auto; display:flex; align-items:center; justify-content:center;"><i class="fas fa-star"></i></div>'
              }
              <h3>${feature.title || 'Feature'}</h3>
              <p>${feature.description || ''}</p>
            </div>
          </div>
        `;
      });
    }
    
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      
      <!-- Hero Section -->
      <div class="w3-row-padding">
        <div class="w3-col m6 s12 w3-padding animate-item">
          <div class="w3-padding-large">
            <div class="hero-content">
              ${data.content || ''}
            </div>
            ${data.ctaButtonText ? 
              `<a href="${data.ctaButtonLink || '#'}" class="w3-button w3-padding-large w3-large w3-margin-top">${data.ctaButtonText}</a>` : 
              ''}
          </div>
        </div>
        <div class="w3-col m6 s12 w3-padding animate-item delay-1">
          <div class="hero-image-container">
            ${data.heroImage && data.heroImage.url ? 
              `<img src="${data.heroImage.url}" alt="${data.heroImage.alt || data.title || 'Hero Image'}" class="w3-image w3-card">` : 
              '<div class="w3-pale-blue w3-padding-64 w3-center w3-card"><i class="fas fa-image" style="font-size:48px"></i><p>Hero Image</p></div>'
            }
          </div>
        </div>
      </div>
      
      <!-- Features Section -->
      ${data.featuresTitle ? `<h2 class="w3-center w3-margin-top">${data.featuresTitle}</h2>` : ''}
      <div class="w3-row-padding w3-margin-top features-container">
        ${featuresHtml || '<div class="w3-col s12 w3-center w3-padding">Keine Features definiert</div>'}
      </div>
      
      <!-- CTA Section -->
      ${data.ctaText ? 
        `<div class="w3-panel w3-padding-32 w3-center w3-margin-top animate-item">
          <h3>${data.ctaText}</h3>
          ${data.ctaButtonText ? 
            `<a href="${data.ctaButtonLink || '#'}" class="w3-button w3-padding-large">${data.ctaButtonText}</a>` : 
            ''}
        </div>` : 
        ''}
    `;
  }
  
  /**
   * Render portfolio template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderPortfolioTemplate(data, container) {
    let projectsHtml = '';
    
    // Generate projects
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      data.projects.forEach((project, index) => {
        if (!project) return;
        
        projectsHtml += `
          <div class="w3-col m6 l4 w3-padding animate-item delay-${index % 3}">
            <div class="w3-card portfolio-item">
              ${project.thumbnail && project.thumbnail.url ? 
                `<img src="${project.thumbnail.url}" alt="${project.title || 'Projekt'}" class="w3-image" style="width:100%">` : 
                '<div class="w3-pale-blue w3-padding-32 w3-center"><i class="fas fa-image"></i><p>Projekt Bild</p></div>'
              }
              <div class="w3-container">
                <h3>${project.title || 'Projekt'}</h3>
                <p>${project.description || ''}</p>
                ${project.link ? `<a href="${project.link}" class="w3-button w3-margin-bottom">Mehr erfahren</a>` : ''}
              </div>
            </div>
          </div>
        `;
      });
    } else {
      projectsHtml = '<div class="w3-panel w3-pale-yellow w3-center">Keine Projekte definiert</div>';
    }
    
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      <div class="w3-container animate-item">${data.introduction || ''}</div>
      <div class="w3-row-padding w3-margin-top">
        ${projectsHtml}
      </div>
    `;
  }
  
  /**
   * Render contact template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderContactTemplate(data, container) {
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      <div class="w3-container animate-item">${data.introduction || ''}</div>
      
      <div class="w3-row w3-padding-32 w3-section">
        ${data.contactImage && data.contactImage.url ? 
          `<div class="w3-col m4 w3-container animate-item">
            <img src="${data.contactImage.url}" alt="${data.contactImage.alt || 'Kontaktbild'}" class="w3-image w3-round" style="width:100%">
          </div>` : 
          ''
        }
        
        <div class="w3-col ${data.contactImage && data.contactImage.url ? 'm8' : 's12'} w3-panel animate-item delay-1">
          <div class="w3-large w3-margin-bottom">
            ${data.address ? `<p><i class="fas fa-map-marker-alt fa-fw w3-xlarge w3-margin-right"></i> ${data.address}</p>` : ''}
            ${data.phone ? `<p><i class="fas fa-phone fa-fw w3-xlarge w3-margin-right"></i> ${data.phone}</p>` : ''}
            ${data.email ? `<p><i class="fas fa-envelope fa-fw w3-xlarge w3-margin-right"></i> ${data.email}</p>` : ''}
          </div>
          
          ${data.showForm ? 
            `<form class="w3-container contact-form" action="./api/contact.php" method="post">
              <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
                <div class="w3-half">
                  <input class="w3-input w3-border" type="text" placeholder="Name" required name="Name">
                </div>
                <div class="w3-half">
                  <input class="w3-input w3-border" type="email" placeholder="E-Mail" required name="Email">
                </div>
              </div>
              <textarea class="w3-input w3-border" placeholder="Nachricht" required name="Message" rows="5"></textarea>
              <button class="w3-button w3-right w3-section" type="submit">
                <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
              </button>
            </form>` : 
            ''
          }
        </div>
      </div>
    `;
  }
  
  /**
   * Render blog template
   * @param {Object} data - Template data
   * @param {HTMLElement} container - Container element
   */
  function renderBlogTemplate(data, container) {
    // Format categories
    let categoriesHtml = '';
    
    if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
      categoriesHtml = `
        <div class="w3-section w3-padding-small w3-light-grey w3-round">
          <i class="fas fa-tags"></i> Kategorien: 
          ${data.categories.map(cat => `<span class="w3-tag w3-small w3-margin-right">${cat}</span>`).join('')}
        </div>
      `;
    }
    
    container.innerHTML = `
      <h1 class="page-title w3-center">${data.title || ''}</h1>
      ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
      
      <!-- Blog header with meta -->
      <div class="w3-container w3-margin-bottom">
        <div class="w3-row">
          <div class="w3-col m8 s12">
            <div class="blog-meta w3-margin-bottom">
              ${data.date ? `<span class="w3-margin-right"><i class="far fa-calendar-alt"></i> ${data.date}</span>` : ''}
              ${data.author ? `<span><i class="far fa-user"></i> ${data.author}</span>` : ''}
            </div>
            ${categoriesHtml}
          </div>
        </div>
      </div>
      
      <!-- Featured image -->
      ${data.featuredImage && data.featuredImage.url ? 
        `<div class="w3-container w3-margin-bottom animate-item">
          <div class="w3-card">
            <img src="${data.featuredImage.url}" alt="${data.featuredImage.alt || data.title || 'Blog Post'}" class="w3-image" style="width:100%">
          </div>
        </div>` : 
        ''
      }
      
      <!-- Excerpt -->
      ${data.excerpt ? 
        `<div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue animate-item">
          <p><em>${data.excerpt}</em></p>
        </div>` : 
        ''
      }
      
      <!-- Main content -->
      <div class="w3-container blog-content animate-item delay-1">
        ${data.content || ''}
      </div>
    `;
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
    log
  };
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});