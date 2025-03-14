/**
 * Preview Module
 * Handles content preview functionality for the Mannar website
 */
const PreviewModule = (function() {
  // Configuration
  const config = {
    selectors: {
      previewIndicator: '#previewIndicator',
      previewMode: '#previewMode',
      mainLogo: '#mainLogo',
      refreshButton: '#refreshPreviewBtn'
    },
    elements: {},
    isDraft: true, // Default to draft mode
    contentLoaded: false
  };
  
  /**
   * Initialize the preview module
   */
  function init() {
    console.log('Initializing preview module');
    
    // Cache DOM elements
    cacheElements();
    
    // Determine preview mode from URL
    parseQueryParams();
    
    // Update preview indicator
    updatePreviewIndicator();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load content
    loadContent();
  }
  
  /**
   * Cache DOM elements for better performance
   */
  function cacheElements() {
    Object.keys(config.selectors).forEach(key => {
      config.elements[key] = document.querySelector(config.selectors[key]);
    });
    
    // Also cache display elements for later updates
    config.displayElements = {
      aboutTitle: document.getElementById('aboutTitleDisplay'),
      aboutSubtitle: document.getElementById('aboutSubtitleDisplay'),
      aboutText: document.getElementById('aboutTextDisplay'),
      offeringsTitle: document.getElementById('offeringsTitleDisplay'),
      offeringsSubtitle: document.getElementById('offeringsSubtitleDisplay'),
      offer1Title: document.getElementById('offer1TitleDisplay'),
      offer1Desc: document.getElementById('offer1DescDisplay'),
      offer1Image: document.getElementById('offer1ImageDisplay'),
      offer2Title: document.getElementById('offer2TitleDisplay'),
      offer2Desc: document.getElementById('offer2DescDisplay'),
      offer2Image: document.getElementById('offer2ImageDisplay'),
      offer3Title: document.getElementById('offer3TitleDisplay'),
      offer3Desc: document.getElementById('offer3DescDisplay'),
      offer3Image: document.getElementById('offer3ImageDisplay'),
      contactTitle: document.getElementById('contactTitleDisplay'),
      contactSubtitle: document.getElementById('contactSubtitleDisplay'),
      contactImage: document.getElementById('contactImageDisplay'),
      wordCloud: document.getElementById('wordCloudList')
    };
  }
  
  /**
   * Parse query parameters from URL
   */
  function parseQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    config.isDraft = urlParams.get('draft') !== 'false'; // Default to draft if not explicitly set to false
    config.timestamp = urlParams.get('t') || Date.now(); // Cache-busting parameter
  }
  
  /**
   * Update the preview indicator based on mode
   */
  function updatePreviewIndicator() {
    if (!config.elements.previewIndicator || !config.elements.previewMode) return;
    
    if (config.isDraft) {
      config.elements.previewMode.textContent = 'Entwurf';
      config.elements.previewIndicator.classList.remove('live');
    } else {
      config.elements.previewMode.textContent = 'Live-Website';
      config.elements.previewIndicator.classList.add('live');
    }
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Refresh button (if in admin panel)
    if (config.elements.refreshButton) {
      config.elements.refreshButton.addEventListener('click', refreshPreview);
    }
    
    // Listen for postMessage events (for communication from admin panel)
    window.addEventListener('message', handleMessage);
  }
  
  /**
   * Handle messages from parent window (admin panel)
   * @param {MessageEvent} event - Message event
   */
  function handleMessage(event) {
    // Security check - only accept messages from same origin
    if (event.origin !== window.location.origin) return;
    
    const data = event.data;
    
    // Handle different message types
    switch (data.type) {
      case 'refresh':
        refreshPreview();
        break;
        
      case 'previewContent':
        updateContent(data.content);
        break;
        
      case 'setMode':
        if (data.isDraft !== undefined) {
          config.isDraft = data.isDraft;
          updatePreviewIndicator();
          loadContent();
        }
        break;
    }
  }
  
  /**
   * Refresh the preview
   */
  function refreshPreview() {
    // Clear cache and reload content
    config.contentLoaded = false;
    
    // Update URL with cache-busting parameter
    const url = new URL(window.location);
    url.searchParams.set('t', Date.now());
    window.history.replaceState({}, document.title, url);
    
    // Reload content
    loadContent();
  }
  
  /**
   * Load content for preview
   */
  function loadContent() {
    if (config.contentLoaded) return;
    
    console.log(`Loading ${config.isDraft ? 'draft' : 'live'} content for preview`);
    
    // If ContentService is available, use it to load content
    if (typeof ContentService !== 'undefined') {
      ContentService.loadMainContent(config.isDraft)
        .then(data => {
          if (!data) {
            console.warn('No content found for preview');
            return;
          }
          
          updateContent(data);
          config.contentLoaded = true;
        })
        .catch(error => {
          console.error('Error loading preview content:', error);
        });
    } else if (typeof firebase !== 'undefined') {
      // Direct Firebase fallback if ContentService is not available
      try {
        const db = firebase.firestore();
        const docRef = db.collection('content').doc(config.isDraft ? 'draft' : 'main');
        
        docRef.get().then(doc => {
          if (doc.exists) {
            updateContent(doc.data());
            config.contentLoaded = true;
          } else {
            console.warn('No content found for preview');
          }
        }).catch(error => {
          console.error('Error loading preview content:', error);
        });
      } catch (error) {
        console.error('Firebase error:', error);
      }
    } else {
      console.error('Neither ContentService nor Firebase is available for loading content');
    }
    
    // Also load word cloud if available
    loadWordCloud();
  }
  
  /**
   * Load word cloud data
   */
  function loadWordCloud() {
    const wordCloudList = config.displayElements.wordCloud;
    if (!wordCloudList) return;
    
    if (typeof ContentService !== 'undefined') {
      ContentService.loadWordCloud()
        .then(words => {
          if (!words || !words.length) {
            console.warn('No word cloud data found');
            return;
          }
          
          renderWordCloud(wordCloudList, words);
        })
        .catch(error => {
          console.error('Error loading word cloud:', error);
        });
    }
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
   * Update content in the preview
   * @param {Object} data - Content data
   */
  function updateContent(data) {
    if (!data) return;
    
    const elements = config.displayElements;
    
    // Helper function to update element content
    const updateElement = (element, content) => {
      if (element && content !== undefined) {
        element.innerHTML = content;
      }
    };
    
    // Update text content
    updateElement(elements.aboutTitle, data.aboutTitle);
    updateElement(elements.aboutSubtitle, data.aboutSubtitle);
    updateElement(elements.aboutText, data.aboutText);
    
    updateElement(elements.offeringsTitle, data.offeringsTitle);
    updateElement(elements.offeringsSubtitle, data.offeringsSubtitle);
    
    updateElement(elements.offer1Title, data.offer1Title);
    updateElement(elements.offer1Desc, data.offer1Desc);
    
    updateElement(elements.offer2Title, data.offer2Title);
    updateElement(elements.offer2Desc, data.offer2Desc);
    
    updateElement(elements.offer3Title, data.offer3Title);
    updateElement(elements.offer3Desc, data.offer3Desc);
    
    updateElement(elements.contactTitle, data.contactTitle);
    updateElement(elements.contactSubtitle, data.contactSubtitle);
    
    // Update images
    updateImages(data);
    
    // Display logo
    if (config.elements.mainLogo) {
      config.elements.mainLogo.style.display = 'block';
    }
  }
  
  /**
   * Update images in the preview
   * @param {Object} data - Content data
   */
  function updateImages(data) {
    const elements = config.displayElements;
    
    // Helper function for updating images
    const updateImage = (imgElement, imageData) => {
      if (!imgElement) return;
      
      if (imageData && (imageData.url || typeof imageData === 'string')) {
        const url = typeof imageData === 'string' ? imageData : imageData.url;
        imgElement.src = url;
        imgElement.style.display = 'block';
        
        if (imageData.alt) {
          imgElement.alt = imageData.alt;
        }
      } else {
        imgElement.style.display = 'none';
      }
    };
    
    updateImage(elements.offer1Image, data.offer1_image);
    updateImage(elements.offer2Image, data.offer2_image);
    updateImage(elements.offer3Image, data.offer3_image);
    updateImage(elements.contactImage, data.contact_image);
  }
  
  // Public API
  return {
    init,
    refreshPreview,
    updateContent
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', PreviewModule.init);