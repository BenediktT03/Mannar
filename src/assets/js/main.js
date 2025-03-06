 /**
 * main.js
 * Main frontend script that consolidates all website functionality
 */

// Import core modules
import { initFirebase, getFirestore } from './core/firebase.js';
import { isMobileDevice, debounce } from './core/utils.js';
import { WORD_CLOUD_DEFAULTS } from './core/config.js';

// Import functional modules
import { loadContent, updateUIWithContent } from './modules/content-manager.js';
import { initWordCloud } from './modules/word-cloud.js';
import { initUI, setupImageModals, setupScrollHandling, toggleNavigation } from './modules/ui-manager.js';

// Global state
const Website = {
  // Firebase services
  firebase: null,
  db: null,
  
  // UI state
  isInitialized: false,
  isLoading: true,
  
  // Module instances
  ui: null,
  wordCloud: null,
  
  // DOM elements
  elements: {}
};

/**
 * Initialize the website
 */
function initWebsite() {
  console.log("Initializing Website");
  
  // Initialize Firebase
  const firebase = initFirebase();
  if (firebase) {
    Website.firebase = firebase;
    Website.db = getFirestore();
  }
  
  // Cache DOM elements
  cacheElements();
  
  // Initialize UI
  Website.ui = initUI();
  
  // Setup various UI components
  setupImageModals();
  setupScrollHandling();
  setupSmoothScrolling();
  setupLazyLoading();
  
  // Load website content
  loadWebsiteContent();
  
  // Initialize word cloud
  Website.wordCloud = initWordCloud('frontend');
  
  // Mark as initialized
  Website.isInitialized = true;
  Website.isLoading = false;
  console.log("Website initialized successfully");
  
  // Hide loading indicator if present
  hideLoadingIndicator();
}

/**
 * Cache commonly used DOM elements
 */
function cacheElements() {
  Website.elements = {
    navbar: document.getElementById('myNavbar'),
    navDemo: document.getElementById('navDemo'),
    goTopBtn: document.getElementById('goTopBtn'),
    logo: document.getElementById('mainLogo'),
    wordCloudContainer: document.querySelector('.textbubble'),
    portfolioImages: document.querySelectorAll('.portfolio-item img'),
    internalLinks: document.querySelectorAll('a[href^="#"]'),
    modal: document.getElementById('modal01'),
    modalImg: document.getElementById('img01'),
    captionText: document.getElementById('caption'),
    navbarToggleBtn: document.querySelector('.w3-right.w3-hide-medium.w3-hide-large'),
    loadingIndicator: document.getElementById('loading-indicator')
  };
  
  // Show logo if it exists
  if (Website.elements.logo) {
    Website.elements.logo.style.display = 'block';
  }
}

/**
 * Load website content from Firestore
 */
async function loadWebsiteContent() {
  if (!Website.db) {
    console.warn("Firebase not initialized, using default content");
    return;
  }
  
  try {
    // Show loading indicator
    showLoadingIndicator();
    
    // Load content from Firestore
    const content = await loadContent('main');
    
    if (content) {
      // Update UI with loaded content
      updateUIWithContent(content);
    } else {
      console.warn("No content loaded from Firestore");
    }
  } catch (error) {
    console.error("Error loading content:", error);
  } finally {
    // Hide loading indicator
    hideLoadingIndicator();
  }
}

/**
 * Setup smooth scrolling for internal links
 */
function setupSmoothScrolling() {
  if (!Website.elements.internalLinks) return;
  
  Website.elements.internalLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        // Use modern scrollIntoView with fallback
        if ('scrollBehavior' in document.documentElement.style) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          // Fallback for older browsers
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
      
      // Close mobile menu if open
      if (Website.elements.navDemo && Website.elements.navDemo.classList.contains('w3-show')) {
        Website.elements.navDemo.classList.remove('w3-show');
        
        if (Website.elements.navbarToggleBtn) {
          Website.elements.navbarToggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

/**
 * Setup lazy loading for images
 */
function setupLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }
    });
  } else {
    // Fallback with IntersectionObserver
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img:not([loading])');
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Fade in effect
            img.style.opacity = '0';
            const src = img.dataset.src || img.src;
            
            const tempImg = new Image();
            tempImg.src = src;
            tempImg.onload = () => {
              img.src = src;
              img.style.transition = 'opacity 0.5s ease';
              img.style.opacity = '1';
            };
            
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
  if (Website.elements.loadingIndicator) {
    Website.elements.loadingIndicator.style.display = 'block';
  }
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
  if (Website.elements.loadingIndicator) {
    Website.elements.loadingIndicator.style.display = 'none';
  }
}

/**
 * Handle contact form submission
 * @param {Event} event - Form submission event
 */
function handleContactForm(event) {
  // Implementation depends on the form structure
  // This is a placeholder for the actual implementation
  
  // Form validation example:
  const form = event.target;
  const name = form.querySelector('[name="Name"]').value;
  const email = form.querySelector('[name="Email"]').value;
  const message = form.querySelector('[name="Message"]').value;
  
  if (!name || !email || !message) {
    event.preventDefault();
    alert('Please fill in all fields');
    return false;
  }
  
  return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initWebsite);

// Export functions for external use and HTML direct access
window.Website = {
  toggleNavigation,
  handleContactForm
};