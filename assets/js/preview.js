/**
 * Preview Module
 * Handles content previewing functionality for the Mannar website
 * Loads and displays content from Firebase based on preview mode (draft or live)
 */
const PreviewModule = (function() {
  // Configuration
  const config = {
    isDraft: true,
    timestamp: Date.now(),
    loadingDelay: 300,
    fadeSpeed: 500
  };
  
  // DOM elements cache
  const elements = {
    indicator: null,
    modeText: null,
    refreshBtn: null,
    loading: null,
    // Content elements will be cached on init
    contentElements: {}
  };
  
  /**
   * Initialize the preview functionality
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    // Merge options with defaults
    Object.assign(config, options);
    
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    attachEventListeners();
    
    // Load content
    loadContent();
    
    console.log('Preview initialized:', config.isDraft ? 'Draft Mode' : 'Live Mode');
  }
  
  /**
   * Cache DOM elements for better performance
   */
  function cacheElements() {
    // Preview interface elements
    elements.indicator = document.getElementById('previewIndicator');
    elements.modeText = document.getElementById('previewMode');
    elements.refreshBtn = document.getElementById('refreshPreviewBtn');
    elements.loading = document.getElementById('pageLoading');
    
    // Cache content elements for more efficient updates
    elements.contentElements = {
      // About section
      aboutTitle: document.getElementById('aboutTitleDisplay'),
      aboutSubtitle: document.getElementById('aboutSubtitleDisplay'),
      aboutText: document.getElementById('aboutTextDisplay'),
      wordCloud: document.getElementById('wordCloudList'),
      
      // Offerings section
      offeringsTitle: document.getElementById('offeringsTitleDisplay'),
      offeringsSubtitle: document.getElementById('offeringsSubtitleDisplay'),
      
      // Offering 1
      offer1Title: document.getElementById('offer1TitleDisplay'),
      offer1Desc: document.getElementById('offer1DescDisplay'),
      offer1Image: document.getElementById('offer1ImageDisplay'),
      
      // Offering 2
      offer2Title: document.getElementById('offer2TitleDisplay'),
      offer2Desc: document.getElementById('offer2DescDisplay'),
      offer2Image: document.getElementById('offer2ImageDisplay'),
      
      // Offering 3
      offer3Title: document.getElementById('offer3TitleDisplay'),
      offer3Desc: document.getElementById('offer3DescDisplay'),
      offer3Image: document.getElementById('offer3ImageDisplay'),
      
      // Contact section
      contactTitle: document.getElementById('contactTitleDisplay'),
      contactSubtitle: document.getElementById('contactSubtitleDisplay'),
      contactImage: document.getElementById('contactImageDisplay')
    };
  }
  
  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    // Refresh button
    if (elements.refreshBtn) {
      elements.refreshBtn.addEventListener('click', refreshPreview);
    }
    
    // Keyboard shortcut for refresh (F5 or Ctrl+R)
    document.addEventListener('keydown', function(e) {
      // F5 or Ctrl+R
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        refreshPreview();
      }
    });
  }
  
  /**
   * Load content based on preview mode
   */
  async function loadContent() {
    showLoading();
    
    try {
      // Check if Firebase service is available
      if (!window.FirebaseService) {
        throw new Error('Firebase service not available');
      }
      
      // Load main content based on draft mode
      const contentPath = config.isDraft ? 'content/draft' : 'content/main';
      const contentData = await FirebaseService.getDocument('content', config.isDraft ? 'draft' : 'main');
      
      if (!contentData) {
        showError('No content found. Please create content in the admin panel first.');
        return;
      }
      
      // Update page content
      updatePageContent(contentData);
      
      // Load word cloud if content service is available
      if (window.ContentService && typeof ContentService.loadWordCloud === 'function') {
        const words = await ContentService.loadWordCloud();
        if (words && words.length > 0) {
          renderWordCloud(words);
        }
      }
      
      // Hide loading indicator
      hideLoading();
    } catch (error) {
      console.error('Error loading preview content:', error);
      showError(`Error loading content: ${error.message}`);
    }
  }
  
  /**
   * Update page content with data from Firebase
   * @param {Object} data - Content data
   */
  function updatePageContent(data) {
    // Update about section
    safelyUpdateElement(elements.contentElements.aboutTitle, data.aboutTitle);
    safelyUpdateElement(elements.contentElements.aboutSubtitle, data.aboutSubtitle);
    safelyUpdateElement(elements.contentElements.aboutText, data.aboutText, true);
    
    // Update offerings section
    safelyUpdateElement(elements.contentElements.offeringsTitle, data.offeringsTitle);
    safelyUpdateElement(elements.contentElements.offeringsSubtitle, data.offeringsSubtitle);
    
    // Update offering 1
    safelyUpdateElement(elements.contentElements.offer1Title, data.offer1Title);
    safelyUpdateElement(elements.contentElements.offer1Desc, data.offer1Desc, true);
    updateImage(elements.contentElements.offer1Image, data.offer1_image);
    
    // Update offering 2
    safelyUpdateElement(elements.contentElements.offer2Title, data.offer2Title);
    safelyUpdateElement(elements.contentElements.offer2Desc, data.offer2Desc, true);
    updateImage(elements.contentElements.offer2Image, data.offer2_image);
    
    // Update offering 3
    safelyUpdateElement(elements.contentElements.offer3Title, data.offer3Title);
    safelyUpdateElement(elements.contentElements.offer3Desc, data.offer3Desc, true);
    updateImage(elements.contentElements.offer3Image, data.offer3_image);
    
    // Update contact section
    safelyUpdateElement(elements.contentElements.contactTitle, data.contactTitle);
    safelyUpdateElement(elements.contentElements.contactSubtitle, data.contactSubtitle);
    updateImage(elements.contentElements.contactImage, data.contact_image);
  }
  
  /**
   * Safely update an element's content
   * @param {HTMLElement} element - Element to update
   * @param {string} content - Content to set
   * @param {boolean} isHTML - Whether content should be set as innerHTML
   */
  function safelyUpdateElement(element, content, isHTML = false) {
    if (!element) return;
    
    if (isHTML) {
      element.innerHTML = content || '';
    } else {
      element.textContent = content || '';
    }
  }
  
  /**
   * Update an image element with new source
   * @param {HTMLImageElement} imgElement - Image element to update
   * @param {Object|string} imageData - Image data object or URL string
   */
  function updateImage(imgElement, imageData) {
    if (!imgElement) return;
    
    // Format image data consistently
    const formattedData = formatImageData(imageData);
    
    // Update image source
    imgElement.src = formattedData.url || '/assets/img/placeholder.jpg';
    
    // Update alt text if available
    if (formattedData.alt) {
      imgElement.alt = formattedData.alt;
    }
    
    // Show or hide image based on URL availability
    imgElement.style.display = formattedData.url ? 'block' : 'none';
  }
  
  /**
   * Format image data consistently
   * @param {Object|string} imageData - Image data to format
   * @returns {Object} Formatted image data
   */
  function formatImageData(imageData) {
    if (!imageData) {
      return { url: '', public_id: '', alt: '' };
    }
    
    if (typeof imageData === 'string') {
      return { url: imageData, public_id: '', alt: '' };
    }
    
    return {
      url: imageData.url || imageData.secure_url || '',
      public_id: imageData.public_id || '',
      alt: imageData.alt || ''
    };
  }
  
  /**
   * Render word cloud
   * @param {Array} words - Word cloud data
   */
  function renderWordCloud(words) {
    const cloudContainer = elements.contentElements.wordCloud;
    if (!cloudContainer) return;
    
    // Clear container
    cloudContainer.innerHTML = '';
    
    // Add words to cloud
    words.forEach(word => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = word.link || '#';
      a.textContent = word.text || '';
      a.setAttribute('data-weight', word.weight || 5);
      
      // Add animation styles
      a.style.opacity = '0';
      a.style.transform = 'translateY(20px)';
      
      li.appendChild(a);
      cloudContainer.appendChild(li);
    });
    
    // Animate words
    setTimeout(() => {
      animateWordCloud();
    }, 500);
  }
  
  /**
   * Animate word cloud items
   */
  function animateWordCloud() {
    const wordElements = document.querySelectorAll('.word-cloud li a');
    
    wordElements.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
  
  /**
   * Refresh the preview
   */
  function refreshPreview() {
    // Update timestamp for cache busting
    config.timestamp = Date.now();
    
    // Reload content
    loadContent();
    
    // Visual feedback for refresh
    if (elements.refreshBtn) {
      elements.refreshBtn.classList.add('rotating');
      setTimeout(() => {
        elements.refreshBtn.classList.remove('rotating');
      }, 1000);
    }
  }
  
  /**
   * Toggle between draft and live modes
   */
  function toggleMode() {
    config.isDraft = !config.isDraft;
    
    // Update indicator
    if (elements.indicator) {
      elements.indicator.classList.toggle('live', !config.isDraft);
    }
    
    if (elements.modeText) {
      elements.modeText.textContent = config.isDraft ? 'Draft' : 'Live';
    }
    
    // Reload content
    loadContent();
  }
  
  /**
   * Show loading indicator
   */
  function showLoading() {
    if (!elements.loading) return;
    
    elements.loading.style.display = 'flex';
    setTimeout(() => {
      elements.loading.style.opacity = '1';
    }, 10);
  }
  
  /**
   * Hide loading indicator
   */
  function hideLoading() {
    if (!elements.loading) return;
    
    elements.loading.style.opacity = '0';
    setTimeout(() => {
      elements.loading.style.display = 'none';
    }, config.fadeSpeed);
  }
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  function showError(message) {
    // Hide loading
    hideLoading();
    
    // Show error in console
    console.error('Preview error:', message);
    
    // Show error UI
    const errorContainer = document.createElement('div');
    errorContainer.className = 'preview-error w3-panel w3-red';
    errorContainer.innerHTML = `
      <h3><i class="fas fa-exclamation-circle"></i> Error</h3>
      <p>${message}</p>
      <button class="w3-button w3-white" onclick="PreviewModule.refreshPreview()">Try Again</button>
    `;
    
    // Add to document
    document.body.appendChild(errorContainer);
    
    // Remove after 10 seconds
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.parentNode.removeChild(errorContainer);
      }
    }, 10000);
  }
  
  // Public API
  return {
    init,
    refreshPreview,
    toggleMode
  };
})();

// Make available globally
window.PreviewModule = PreviewModule; 