/**
 * Gallery Component
 * Handles image gallery functionality including:
 * - Responsive image galleries
 * - Lightbox/modal functionality
 * - Image navigation
 * - Lazy loading
 */
const GalleryComponent = (function() {
  // Configuration
  const config = {
    selectors: {
      galleryContainer: '.gallery-container',
      galleryItem: '.gallery-item',
      galleryImage: '.gallery-img',
      modalContainer: '#galleryModal',
      modalImage: '#modalImg',
      modalCaption: '#modalCaption',
      modalPrev: '.gallery-nav-prev',
      modalNext: '.gallery-nav-next',
      modalClose: '.gallery-modal-close'
    },
    classes: {
      active: 'active',
      visible: 'visible',
      lazyLoaded: 'lazy-loaded',
      fadeIn: 'fade-in'
    },
    animation: {
      enabled: true,
      duration: 300
    }
  };
  
  // State
  let state = {
    currentIndex: 0,
    galleryItems: [],
    isModalOpen: false
  };
  
  // DOM Elements Cache
  let elements = {
    galleries: [],
    modal: null,
    modalImage: null,
    modalCaption: null,
    modalPrev: null,
    modalNext: null,
    modalClose: null
  };
  
  /**
   * Initialize the gallery component
   * @param {Object} options - Optional configuration overrides
   */
  function init(options = {}) {
    // Merge configuration
    Object.assign(config, options);
    
    // Check for reduced motion preference
    checkReducedMotion();
    
    // Cache DOM elements
    cacheElements();
    
    // Create modal if needed
    ensureModalExists();
    
    // Attach event listeners
    attachEventListeners();
    
    // Initialize lazy loading
    initLazyLoading();
    
    console.log('Gallery component initialized');
  }
  
  /**
   * Check if user prefers reduced motion
   */
  function checkReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      config.animation.enabled = false;
    }
  }
  
  /**
   * Cache DOM elements for better performance
   */
  function cacheElements() {
    // Get all galleries
    elements.galleries = document.querySelectorAll(config.selectors.galleryContainer);
    
    // Modal elements (might not exist yet)
    elements.modal = document.querySelector(config.selectors.modalContainer);
    if (elements.modal) {
      elements.modalImage = elements.modal.querySelector(config.selectors.modalImage);
      elements.modalCaption = elements.modal.querySelector(config.selectors.modalCaption);
      elements.modalPrev = elements.modal.querySelector(config.selectors.modalPrev);
      elements.modalNext = elements.modal.querySelector(config.selectors.modalNext);
      elements.modalClose = elements.modal.querySelector(config.selectors.modalClose);
    }
  }
  
  /**
   * Ensure the modal/lightbox exists, create if needed
   */
  function ensureModalExists() {
    if (elements.modal) return;
    
    // Create the modal
    const modal = document.createElement('div');
    modal.id = config.selectors.modalContainer.substring(1); // Remove the # from the ID
    modal.className = 'gallery-modal w3-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    
    // Create modal content
    modal.innerHTML = `
      <div class="w3-modal-content w3-animate-zoom">
        <span class="gallery-modal-close w3-button w3-hover-red w3-xlarge w3-display-topright" aria-label="Close">&times;</span>
        <div class="gallery-nav">
          <button class="gallery-nav-prev w3-button" aria-label="Previous image">&lsaquo;</button>
          <button class="gallery-nav-next w3-button" aria-label="Next image">&rsaquo;</button>
        </div>
        <img id="${config.selectors.modalImage.substring(1)}" class="w3-image" alt="">
        <div id="${config.selectors.modalCaption.substring(1)}" class="w3-container w3-padding-16"></div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Update elements cache
    elements.modal = modal;
    elements.modalImage = modal.querySelector(config.selectors.modalImage);
    elements.modalCaption = modal.querySelector(config.selectors.modalCaption);
    elements.modalPrev = modal.querySelector(config.selectors.modalPrev);
    elements.modalNext = modal.querySelector(config.selectors.modalNext);
    elements.modalClose = modal.querySelector(config.selectors.modalClose);
  }
  
  /**
   * Attach event listeners to gallery and modal elements
   */
  function attachEventListeners() {
    // Click event for gallery items
    document.addEventListener('click', function(e) {
      const galleryItem = e.target.closest(config.selectors.galleryItem);
      if (galleryItem) {
        e.preventDefault();
        openModal(galleryItem);
      }
    });
    
    // Modal events
    if (elements.modal) {
      // Close button
      if (elements.modalClose) {
        elements.modalClose.addEventListener('click', closeModal);
      }
      
      // Click outside to close
      elements.modal.addEventListener('click', function(e) {
        if (e.target === elements.modal) {
          closeModal();
        }
      });
      
      // Navigation buttons
      if (elements.modalPrev) {
        elements.modalPrev.addEventListener('click', showPreviousImage);
      }
      
      if (elements.modalNext) {
        elements.modalNext.addEventListener('click', showNextImage);
      }
      
      // Keyboard navigation
      document.addEventListener('keydown', handleKeyboardNavigation);
    }
    
    // Handle window resize
    window.addEventListener('resize', debounce(function() {
      if (state.isModalOpen) {
        // Adjust modal content if needed
        centerModalContent();
      }
    }, 200));
  }
  
  /**
   * Initialize lazy loading for gallery images
   */
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            
            if (src) {
              // Set a load event to add fade-in class
              img.onload = function() {
                img.classList.add(config.classes.lazyLoaded);
                img.classList.add(config.classes.fadeIn);
              };
              
              img.src = src;
              img.removeAttribute('data-src');
            }
            
            imageObserver.unobserve(img);
          }
        });
      });
      
      // Observe all gallery images with data-src
      document.querySelectorAll(`${config.selectors.galleryImage}[data-src]`).forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      document.querySelectorAll(`${config.selectors.galleryImage}[data-src]`).forEach(img => {
        img.src = img.getAttribute('data-src');
        img.classList.add(config.classes.lazyLoaded);
        img.removeAttribute('data-src');
      });
    }
  }
  
  /**
   * Open the gallery modal with a specific item
   * @param {HTMLElement} item - Gallery item element
   */
  function openModal(item) {
    if (!elements.modal || !elements.modalImage) return;
    
    // Get all items in the gallery
    const gallery = item.closest(config.selectors.galleryContainer);
    state.galleryItems = Array.from(gallery.querySelectorAll(config.selectors.galleryItem));
    
    // Set current index
    state.currentIndex = state.galleryItems.indexOf(item);
    
    // Update modal content
    updateModalContent();
    
    // Show modal
    elements.modal.style.display = 'block';
    elements.modal.setAttribute('aria-hidden', 'false');
    state.isModalOpen = true;
    
    // Add animation classes if enabled
    if (config.animation.enabled) {
      setTimeout(() => {
        elements.modal.classList.add(config.classes.visible);
      }, 10);
    }
    
    // Focus trap for accessibility
    elements.modalClose.focus();
  }
  
  /**
   * Close the gallery modal
   */
  function closeModal() {
    if (!elements.modal) return;
    
    // Remove animation classes if enabled
    if (config.animation.enabled) {
      elements.modal.classList.remove(config.classes.visible);
      
      // Delay hiding to allow animation to complete
      setTimeout(() => {
        elements.modal.style.display = 'none';
        elements.modal.setAttribute('aria-hidden', 'true');
        state.isModalOpen = false;
      }, config.animation.duration);
    } else {
      elements.modal.style.display = 'none';
      elements.modal.setAttribute('aria-hidden', 'true');
      state.isModalOpen = false;
    }
  }
  
  /**
   * Show the previous image in the gallery
   */
  function showPreviousImage() {
    if (state.galleryItems.length <= 1) return;
    
    // Decrement index with wrap-around
    state.currentIndex = (state.currentIndex - 1 + state.galleryItems.length) % state.galleryItems.length;
    
    // Update modal content
    updateModalContent();
  }
  
  /**
   * Show the next image in the gallery
   */
  function showNextImage() {
    if (state.galleryItems.length <= 1) return;
    
    // Increment index with wrap-around
    state.currentIndex = (state.currentIndex + 1) % state.galleryItems.length;
    
    // Update modal content
    updateModalContent();
  }
  
  /**
   * Update modal content based on current index
   */
  function updateModalContent() {
    if (state.galleryItems.length === 0 || state.currentIndex < 0) return;
    
    const currentItem = state.galleryItems[state.currentIndex];
    const img = currentItem.querySelector('img');
    
    if (img) {
      // Set image source
      const src = img.getAttribute('data-src') || img.getAttribute('src');
      elements.modalImage.src = src;
      elements.modalImage.alt = img.alt || '';
      
      // Set caption if available
      const caption = currentItem.querySelector('.gallery-caption');
      if (caption && elements.modalCaption) {
        elements.modalCaption.textContent = caption.textContent;
        elements.modalCaption.style.display = 'block';
      } else if (elements.modalCaption) {
        elements.modalCaption.textContent = '';
        elements.modalCaption.style.display = 'none';
      }
      
      // Show/hide navigation buttons based on gallery size
      if (elements.modalPrev && elements.modalNext) {
        if (state.galleryItems.length <= 1) {
          elements.modalPrev.style.display = 'none';
          elements.modalNext.style.display = 'none';
        } else {
          elements.modalPrev.style.display = 'block';
          elements.modalNext.style.display = 'block';
        }
      }
    }
  }
  
  /**
   * Center the modal content for better viewing
   */
  function centerModalContent() {
    if (!elements.modal || !elements.modalImage) return;
    
    // Ensure modal content is centered with proper dimensions
    const modalContent = elements.modal.querySelector('.w3-modal-content');
    if (modalContent) {
      modalContent.style.maxHeight = (window.innerHeight * 0.9) + 'px';
      modalContent.style.maxWidth = (window.innerWidth * 0.9) + 'px';
    }
  }
  
  /**
   * Handle keyboard navigation for the modal
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleKeyboardNavigation(e) {
    if (!state.isModalOpen) return;
    
    switch (e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        showPreviousImage();
        break;
      case 'ArrowRight':
        showNextImage();
        break;
    }
  }
  
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Debounce delay in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  /**
   * Initialize a specific gallery
   * @param {string|HTMLElement} selector - Gallery selector or element
   */
  function initGallery(selector) {
    const gallery = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!gallery) {
      console.error('Gallery not found:', selector);
      return;
    }
    
    // Set up gallery items
    const items = gallery.querySelectorAll(config.selectors.galleryItem);
    
    // Add event listeners
    items.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        openModal(item);
      });
      
      // Ensure the item is properly styled
      item.style.cursor = 'pointer';
    });
    
    // Initialize lazy loading for this gallery
    const lazyImages = gallery.querySelectorAll(`${config.selectors.galleryImage}[data-src]`);
    if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            
            if (src) {
              img.onload = function() {
                img.classList.add(config.classes.lazyLoaded);
              };
              
              img.src = src;
              img.removeAttribute('data-src');
            }
            
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
  
  /**
   * Get current gallery state
   * @returns {Object} Current state
   */
  function getState() {
    return { ...state };
  }
  
  /**
   * Reset gallery state
   */
  function reset() {
    state = {
      currentIndex: 0,
      galleryItems: [],
      isModalOpen: false
    };
    
    if (elements.modal) {
      closeModal();
    }
  }
  
  /**
   * Refresh galleries (useful after dynamic content loading)
   */
  function refresh() {
    // Recache elements
    cacheElements();
    
    // Reinitialize lazy loading
    initLazyLoading();
    
    console.log('Gallery component refreshed');
  }
  
  // Initialize component when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  // Public API
  return {
    init,
    initGallery,
    openModal,
    closeModal,
    refresh,
    getState,
    reset
  };
})();

// For global access
window.GalleryComponent = GalleryComponent;