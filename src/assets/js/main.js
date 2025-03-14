/**
 * Main JavaScript
 * Core functionality for the Mannar website
 */
(function() {
  'use strict';
  
  // Configuration
  const config = {
    selectors: {
      navbar: '#myNavbar',
      navToggle: '[aria-controls="navDemo"]',
      navMenu: '#navDemo',
      goTopBtn: '#goTopBtn',
      logo: '#mainLogo',
      wordCloud: '.textbubble',
      wordItems: '.word-cloud li a',
      portfolioItems: '.portfolio-item'
    },
    thresholds: {
      navbar: 100,
      goTopButton: 300
    },
    animation: {
      enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      delay: 50
    }
  };
  
  // DOM elements cache
  const elements = {};
  
  /**
   * Initialize main functionality
   */
  function init() {
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Trigger initial checks
    handleScrollEvents();
    
    // Initialize animations
    if (config.animation.enabled) {
      initAnimations();
    }
    
    // Show logo
    if (elements.logo) {
      elements.logo.style.display = 'block';
    }
    
    console.log('Core functionality initialized');
  }
  
  /**
   * Cache DOM elements for better performance
   */
  function cacheElements() {
    Object.keys(config.selectors).forEach(key => {
      const selector = config.selectors[key];
      
      if (selector.includes(' ')) {
        // For multi-element selectors (like '.word-cloud li a'), store as NodeList
        elements[key] = document.querySelectorAll(selector);
      } else {
        // For single element selectors, store as direct reference
        elements[key] = document.querySelector(selector);
      }
    });
  }
  
  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Scroll event handling
    window.addEventListener('scroll', handleScrollEvents);
    
    // Go to top button
    if (elements.goTopBtn) {
      elements.goTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Navigation toggle (for mobile)
    if (elements.navToggle) {
      elements.navToggle.addEventListener('click', toggleNavigation);
    }
    
    // Close navigation when clicking outside
    document.addEventListener('click', closeNavOnClickOutside);
    
    // Set up modal for portfolio items
    setupPortfolioModals();
    
    // Set up smooth scrolling for anchor links
    setupSmoothScrolling();
  }
  
  /**
   * Handle scroll-based events
   */
  function handleScrollEvents() {
    const scrollY = window.scrollY;
    
    // Navbar visibility/styling
    if (elements.navbar) {
      if (scrollY > config.thresholds.navbar) {
        elements.navbar.classList.add('scrolled');
        elements.navbar.classList.add('visible');
      } else {
        elements.navbar.classList.remove('scrolled');
        
        if (scrollY <= 10) {
          elements.navbar.classList.remove('visible');
        }
      }
    }
    
    // Go to top button visibility
    if (elements.goTopBtn) {
      if (scrollY > config.thresholds.goTopButton) {
        elements.goTopBtn.classList.add('visible');
      } else {
        elements.goTopBtn.classList.remove('visible');
      }
    }
  }
  
  /**
   * Toggle mobile navigation menu
   */
  function toggleNavigation() {
    if (!elements.navMenu) return;
    
    elements.navMenu.classList.toggle('w3-show');
    
    // Update ARIA attributes
    if (elements.navToggle) {
      const isExpanded = elements.navMenu.classList.contains('w3-show');
      elements.navToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
  }
  
  /**
   * Close navigation when clicking outside
   * @param {Event} event - Click event
   */
  function closeNavOnClickOutside(event) {
    if (!elements.navMenu || !elements.navToggle) return;
    
    if (elements.navMenu.classList.contains('w3-show') && 
        !elements.navMenu.contains(event.target) && 
        !elements.navToggle.contains(event.target)) {
      
      elements.navMenu.classList.remove('w3-show');
      elements.navToggle.setAttribute('aria-expanded', 'false');
    }
  }
  
  /**
   * Scroll to top of page
   */
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: config.animation.enabled ? 'smooth' : 'auto'
    });
  }
  
  /**
   * Set up smooth scrolling for anchor links
   */
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        
        target.scrollIntoView({
          behavior: config.animation.enabled ? 'smooth' : 'auto',
          block: 'start'
        });
        
        // Close mobile menu if open
        if (elements.navMenu && elements.navMenu.classList.contains('w3-show')) {
          toggleNavigation();
        }
      });
    });
  }
  
  /**
   * Set up modals for portfolio items
   */
  function setupPortfolioModals() {
    // Find portfolio images
    const portfolioImages = document.querySelectorAll(`${config.selectors.portfolioItems} img`);
    
    // Ensure modal exists
    const modal = document.getElementById('modal01') || createImageModal();
    
    // Add click event to each image
    portfolioImages.forEach(img => {
      img.addEventListener('click', function() {
        const modalImg = document.getElementById('img01');
        const caption = document.getElementById('caption');
        
        modal.style.display = 'block';
        modalImg.src = this.src;
        
        if (caption) {
          caption.textContent = this.alt || '';
        }
      });
    });
  }
  
  /**
   * Create image modal if it doesn't exist
   * @returns {HTMLElement} Modal element
   */
  function createImageModal() {
    const modal = document.createElement('div');
    modal.id = 'modal01';
    modal.className = 'w3-modal w3-black';
    modal.onclick = function() { this.style.display = 'none'; };
    
    modal.innerHTML = `
      <span class="w3-button w3-large w3-black w3-display-topright" title="Schließen"><i class="fas fa-times"></i></span>
      <div class="w3-modal-content w3-animate-zoom w3-center w3-transparent w3-padding-64">
        <img id="img01" class="w3-image" alt="Vergrößertes Bild">
        <p id="caption" class="w3-opacity w3-large"></p>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }
  
  /**
   * Initialize animations
   */
  function initAnimations() {
    // Animate elements with class 'animate-item'
    const animateItems = document.querySelectorAll('.animate-item');
    
    if (animateItems.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      animateItems.forEach(item => {
        observer.observe(item);
      });
    }
    
    // Animate word cloud if it exists
    animateWordCloud();
  }
  
  /**
   * Animate word cloud elements
   */
  function animateWordCloud() {
    if (!elements.wordCloud || !elements.wordItems.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        Array.from(elements.wordItems).forEach((word, index) => {
          setTimeout(() => {
            word.style.opacity = '1';
            word.style.transform = 'translateY(0)';
          }, config.animation.delay * index);
        });
        
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(elements.wordCloud);
  }
  
  // Make toggleFunction globally available (for backwards compatibility)
  window.toggleFunction = toggleNavigation;
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
})();