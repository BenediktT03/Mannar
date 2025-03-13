 /**
 * UI Service
 * Centralized service for UI-related functionality
 */
const UIService = (function() {
  // Define configuration options
  const config = {
    statusMessage: {
      defaultDuration: 3000,
      container: 'statusMsg',
      errorClass: 'status-msg error show',
      successClass: 'status-msg success show'
    },
    animation: {
      enabled: true,
      defaultDuration: 300,
      defaultEasing: 'ease'
    },
    modal: {
      defaultCloseOnOverlay: true,
      zIndex: 1000
    }
  };
  
  // Current active modals
  const activeModals = [];
  
  // Active intersection observers
  const observers = {};
  
  /**
   * Initialize the UI service
   */
  function init() {
    // Check for reduced motion preference
    checkReducedMotion();
    
    // Initialize any required elements
    initStatusMessageContainer();
    
    // Set up global event listeners
    setupGlobalEventListeners();
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
   * Initialize status message container if it doesn't exist
   */
  function initStatusMessageContainer() {
    let statusMsgContainer = document.getElementById(config.statusMessage.container);
    
    if (!statusMsgContainer) {
      statusMsgContainer = document.createElement('div');
      statusMsgContainer.id = config.statusMessage.container;
      statusMsgContainer.className = 'status-msg';
      statusMsgContainer.style.display = 'none';
      
      document.body.appendChild(statusMsgContainer);
    }
  }
  
  /**
   * Set up global event listeners
   */
  function setupGlobalEventListeners() {
    // Handle escape key for modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && activeModals.length > 0) {
        const topModal = activeModals[activeModals.length - 1];
        if (topModal.closeOnEscape) {
          closeModal(topModal.id);
        }
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      // Adjust active modals if needed
      activeModals.forEach((modal) => {
        const modalElement = document.getElementById(modal.id);
        if (modalElement) {
          centerModal(modalElement);
        }
      });
    }, 200));
  }
  
  /**
   * Show a status message
   * @param {string} message - Message to display
   * @param {boolean} isError - Whether the message is an error
   * @param {number} duration - Duration to show the message in ms (0 for persistent)
   */
  function showStatus(message, isError = false, duration = config.statusMessage.defaultDuration) {
    const statusMsg = document.getElementById(config.statusMessage.container);
    if (!statusMsg) return;
    
    // Clear any existing timeout
    if (statusMsg._hideTimeout) {
      clearTimeout(statusMsg._hideTimeout);
      statusMsg._hideTimeout = null;
    }
    
    // Update message
    statusMsg.textContent = message;
    statusMsg.className = isError ? config.statusMessage.errorClass : config.statusMessage.successClass;
    statusMsg.style.display = 'block';
    
    // Auto-hide after duration (if not persistent)
    if (duration > 0) {
      statusMsg._hideTimeout = setTimeout(() => {
        hideStatus();
      }, duration);
    }
  }
  
  /**
   * Hide the status message
   */
  function hideStatus() {
    const statusMsg = document.getElementById(config.statusMessage.container);
    if (!statusMsg) return;
    
    statusMsg.classList.remove('show');
    
    // After animation completes, hide the element
    setTimeout(() => {
      statusMsg.style.display = 'none';
    }, 300);
  }
  
  /**
   * Create and show a modal
   * @param {Object} options - Modal options
   * @returns {string} Modal ID
   */
  function showModal(options = {}) {
    // Generate unique ID if not provided
    const modalId = options.id || `modal-${Date.now()}`;
    
    // Check if modal already exists
    let modalElement = document.getElementById(modalId);
    
    if (!modalElement) {
      // Create modal element
      modalElement = document.createElement('div');
      modalElement.id = modalId;
      modalElement.className = 'w3-modal';
      modalElement.style.zIndex = config.modal.zIndex + activeModals.length;
      
      // Add content
      modalElement.innerHTML = `
        <div class="w3-modal-content w3-card-4 w3-animate-zoom">
          ${options.header ? `
            <header class="w3-container ${options.headerClass || 'w3-teal'}">
              <span class="w3-button w3-display-topright modal-close">&times;</span>
              <h2>${options.header}</h2>
            </header>
          ` : ''}
          <div class="w3-container w3-padding ${options.contentClass || ''}">
            ${options.content || ''}
          </div>
          ${options.footer ? `
            <footer class="w3-container w3-padding ${options.footerClass || 'w3-light-grey'}">
              ${options.footer}
            </footer>
          ` : ''}
        </div>
      `;
      
      // Add to document
      document.body.appendChild(modalElement);
      
      // Add event listeners
      setupModalEvents(modalElement, {
        closeOnOverlay: options.closeOnOverlay !== undefined ? options.closeOnOverlay : config.modal.defaultCloseOnOverlay,
        closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
        onClose: options.onClose
      });
    }
    
    // Set to be centered
    centerModal(modalElement);
    
    // Show modal
    modalElement.style.display = 'block';
    
    // Add to active modals
    activeModals.push({
      id: modalId,
      closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
      onClose: options.onClose
    });
    
    return modalId;
  }
  
  /**
   * Center a modal on the screen
   * @param {HTMLElement} modalElement - Modal element
   */
  function centerModal(modalElement) {
    const content = modalElement.querySelector('.w3-modal-content');
    if (!content) return;
    
    // Reset any existing manual positioning
    content.style.margin = 'auto';
    content.style.top = '50%';
    content.style.left = '50%';
    content.style.transform = 'translate(-50%, -50%)';
  }
  
  /**
   * Set up event listeners for a modal
   * @param {HTMLElement} modalElement - Modal element
   * @param {Object} options - Modal options
   */
  function setupModalEvents(modalElement, options = {}) {
    // Close button
    const closeButtons = modalElement.querySelectorAll('.modal-close');
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        closeModal(modalElement.id);
      });
    });
    
    // Close on overlay click
    if (options.closeOnOverlay) {
      modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
          closeModal(modalElement.id);
        }
      });
    }
  }
  
  /**
   * Close a modal
   * @param {string} modalId - Modal ID
   */
  function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;
    
    // Find modal in active modals
    const modalIndex = activeModals.findIndex((modal) => modal.id === modalId);
    if (modalIndex === -1) return;
    
    const modal = activeModals[modalIndex];
    
    // Hide modal
    modalElement.style.display = 'none';
    
    // Remove from active modals
    activeModals.splice(modalIndex, 1);
    
    // Call onClose callback if defined
    if (modal.onClose && typeof modal.onClose === 'function') {
      modal.onClose();
    }
  }
  
  /**
   * Show a confirm dialog
   * @param {string} message - Message to display
   * @param {Object} options - Dialog options
   * @returns {Promise<boolean>} True if confirmed, false otherwise
   */
  function confirm(message, options = {}) {
    return new Promise((resolve) => {
      const modalId = showModal({
        header: options.title || 'Confirm',
        headerClass: options.headerClass || 'w3-teal',
        content: `
          <p>${message}</p>
          <div class="w3-row w3-padding-16">
            <button class="w3-button ${options.cancelButtonClass || 'w3-grey'} w3-right w3-margin-left" id="${options.cancelButtonId || 'confirmCancel'}">${options.cancelText || 'Cancel'}</button>
            <button class="w3-button ${options.confirmButtonClass || 'w3-teal'} w3-right" id="${options.confirmButtonId || 'confirmOK'}">${options.confirmText || 'OK'}</button>
          </div>
        `,
        closeOnOverlay: options.closeOnOverlay !== undefined ? options.closeOnOverlay : false,
        closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
        onClose: () => {
          resolve(false);
        }
      });
      
      // Get the modal element
      const modalElement = document.getElementById(modalId);
      
      // Add event listeners for buttons
      const confirmButton = modalElement.querySelector(`#${options.confirmButtonId || 'confirmOK'}`);
      const cancelButton = modalElement.querySelector(`#${options.cancelButtonId || 'confirmCancel'}`);
      
      if (confirmButton) {
        confirmButton.addEventListener('click', () => {
          closeModal(modalId);
          resolve(true);
        });
      }
      
      if (cancelButton) {
        cancelButton.addEventListener('click', () => {
          closeModal(modalId);
          resolve(false);
        });
      }
    });
  }
  
  /**
   * Show an alert dialog
   * @param {string} message - Message to display
   * @param {Object} options - Dialog options
   * @returns {Promise<void>}
   */
  function alert(message, options = {}) {
    return new Promise((resolve) => {
      const modalId = showModal({
        header: options.title || 'Alert',
        headerClass: options.headerClass || 'w3-teal',
        content: `
          <p>${message}</p>
          <div class="w3-row w3-padding-16">
            <button class="w3-button ${options.buttonClass || 'w3-teal'} w3-right" id="${options.buttonId || 'alertOK'}">${options.buttonText || 'OK'}</button>
          </div>
        `,
        closeOnOverlay: options.closeOnOverlay !== undefined ? options.closeOnOverlay : false,
        closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
        onClose: () => {
          resolve();
        }
      });
      
      // Get the modal element
      const modalElement = document.getElementById(modalId);
      
      // Add event listener for OK button
      const okButton = modalElement.querySelector(`#${options.buttonId || 'alertOK'}`);
      
      if (okButton) {
        okButton.addEventListener('click', () => {
          closeModal(modalId);
          resolve();
        });
      }
    });
  }
  
  /**
   * Show a prompt dialog
   * @param {string} message - Message to display
   * @param {Object} options - Dialog options
   * @returns {Promise<string|null>} User input or null if cancelled
   */
  function prompt(message, options = {}) {
    return new Promise((resolve) => {
      const inputId = `promptInput-${Date.now()}`;
      const modalId = showModal({
        header: options.title || 'Prompt',
        headerClass: options.headerClass || 'w3-teal',
        content: `
          <p>${message}</p>
          <div class="w3-row w3-padding-16">
            <input type="${options.inputType || 'text'}" id="${inputId}" class="w3-input w3-border" value="${options.defaultValue || ''}" />
          </div>
          <div class="w3-row w3-padding-16">
            <button class="w3-button ${options.cancelButtonClass || 'w3-grey'} w3-right w3-margin-left" id="${options.cancelButtonId || 'promptCancel'}">${options.cancelText || 'Cancel'}</button>
            <button class="w3-button ${options.confirmButtonClass || 'w3-teal'} w3-right" id="${options.confirmButtonId || 'promptOK'}">${options.confirmText || 'OK'}</button>
          </div>
        `,
        closeOnOverlay: options.closeOnOverlay !== undefined ? options.closeOnOverlay : false,
        closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
        onClose: () => {
          resolve(null);
        }
      });
      
      // Get the modal element
      const modalElement = document.getElementById(modalId);
      
      // Focus the input
      const input = document.getElementById(inputId);
      if (input) {
        setTimeout(() => {
          input.focus();
        }, 100);
      }
      
      // Add event listeners for buttons
      const confirmButton = modalElement.querySelector(`#${options.confirmButtonId || 'promptOK'}`);
      const cancelButton = modalElement.querySelector(`#${options.cancelButtonId || 'promptCancel'}`);
      
      if (confirmButton) {
        confirmButton.addEventListener('click', () => {
          const value = input ? input.value : null;
          closeModal(modalId);
          resolve(value);
        });
      }
      
      if (cancelButton) {
        cancelButton.addEventListener('click', () => {
          closeModal(modalId);
          resolve(null);
        });
      }
      
      // Submit on enter
      if (input) {
        input.addEventListener('keypress', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const value = input.value;
            closeModal(modalId);
            resolve(value);
          }
        });
      }
    });
  }
  
  /**
   * Initialize lazy loading for images
   */
  function initLazyLoading() {
    // Check if native lazy loading is supported
    if ('loading' in HTMLImageElement.prototype) {
      // Apply native lazy loading
      document.querySelectorAll('img:not([loading])').forEach((img) => {
        img.loading = 'lazy';
      });
    } else {
      // Use Intersection Observer as fallback
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      if (lazyImages.length === 0) return;
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
      
      // Store the observer for cleanup
      observers.lazyImages = imageObserver;
    }
  }
  
  /**
   * Initialize animations for elements with animate-item class
   */
  function initAnimations() {
    if (!config.animation.enabled) return;
    
    const animatedElements = document.querySelectorAll('.animate-item');
    
    if (animatedElements.length === 0) return;
    
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    animatedElements.forEach((element) => {
      animationObserver.observe(element);
    });
    
    // Store the observer for cleanup
    observers.animations = animationObserver;
  }
  
  /**
   * Initialize the go-to-top button
   */
  function initGoToTopButton() {
    const goTopBtn = document.getElementById('goTopBtn');
    if (!goTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        goTopBtn.classList.add('visible');
      } else {
        goTopBtn.classList.remove('visible');
      }
    });
    
    // Scroll to top when clicked
    goTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: config.animation.enabled ? 'smooth' : 'auto'
      });
    });
  }
  
  /**
   * Initialize smooth scrolling for anchor links
   */
  function initSmoothScrolling() {
    if (!config.animation.enabled) return;
    
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        
        // Skip links that don't point to an element
        if (href === '#' || href === '') return;
        
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // If mobile navigation is open, close it
          const navDemo = document.getElementById('navDemo');
          if (navDemo && navDemo.classList.contains('w3-show')) {
            navDemo.classList.remove('w3-show');
          }
        }
      });
    });
  }
  
  /**
   * Debounce function for rate-limiting callbacks
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @param {boolean} immediate - Whether to call immediately
   * @returns {Function} Debounced function
   */
  function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function(...args) {
      const context = this;
      
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
  }
  
  /**
   * Throttle function for rate-limiting callbacks
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in ms
   * @returns {Function} Throttled function
   */
  function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
  
  /**
   * Clean up all observers and event listeners
   */
  function cleanup() {
    // Clean up observers
    Object.values(observers).forEach((observer) => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    
    // Remove any active modals
    activeModals.forEach((modal) => {
      const modalElement = document.getElementById(modal.id);
      if (modalElement) {
        modalElement.remove();
      }
    });
    
    // Clear active modals array
    activeModals.length = 0;
  }
  
  // Initialize on load
  document.addEventListener('DOMContentLoaded', init);
  
  // Clean up on unload
  window.addEventListener('unload', cleanup);
  
  // Public API
  return {
    showStatus,
    hideStatus,
    showModal,
    closeModal,
    confirm,
    alert,
    prompt,
    initLazyLoading,
    initAnimations,
    initGoToTopButton,
    initSmoothScrolling,
    debounce,
    throttle,
    cleanup
  };
})();

// Make service globally available
window.UIService = UIService;

// For backwards compatibility
window.showStatus = UIService.showStatus;