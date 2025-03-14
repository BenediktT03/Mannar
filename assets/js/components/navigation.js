 /**
 * Navigation Component
 * Handles responsive navigation behavior, smooth scrolling, and active state management
 */
const NavigationComponent = (function() {
  // Configuration
  const config = {
    selectors: {
      navbar: '#myNavbar',
      mobileMenu: '#navDemo',
      toggleButton: '[aria-controls="navDemo"]',
      navLinks: 'a[href^="#"]',
      activeClass: 'w3-text-blue'
    },
    thresholds: {
      scroll: 100,      // When to change navbar style on scroll
      visibility: 10    // When to hide navbar on scroll up
    },
    classes: {
      scrolled: 'scrolled',
      visible: 'visible',
      mobileVisible: 'w3-show'
    }
  };
  
  // State
  let state = {
    lastScrollTop: 0,
    isMobileMenuOpen: false,
    isScrollingDown: false,
    currentSection: ''
  };
  
  // DOM elements
  let elements = {};
  
  /**
   * Initialize the navigation component
   */
  function init() {
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check initial scroll position
    handleScroll();
    
    // Set initial active link based on URL hash
    setActiveNavItem();
    
    console.log('Navigation component initialized');
  }
  
  /**
   * Cache DOM elements for better performance
   */
  function cacheElements() {
    elements = {
      navbar: document.querySelector(config.selectors.navbar),
      mobileMenu: document.querySelector(config.selectors.mobileMenu),
      toggleButton: document.querySelector(config.selectors.toggleButton),
      navLinks: document.querySelectorAll(config.selectors.navLinks)
    };
  }
  
  /**
   * Set up all required event listeners
   */
  function setupEventListeners() {
    // Window scroll event for navbar behavior
    window.addEventListener('scroll', handleScroll);
    
    // Resize event to handle responsive behavior
    window.addEventListener('resize', handleResize);
    
    // Toggle button click for mobile menu
    if (elements.toggleButton) {
      elements.toggleButton.addEventListener('click', toggleMobileMenu);
    }
    
    // Make global toggle function available for backward compatibility
    window.toggleFunction = toggleMobileMenu;
    
    // Add click handlers to navigation links for smooth scrolling
    setupSmoothScrolling();
    
    // Handle clicks outside mobile menu to close it
    document.addEventListener('click', handleOutsideClick);
    
    // Handle hash changes to update active nav item
    window.addEventListener('hashchange', setActiveNavItem);
  }
  
  /**
   * Handle scroll events
   */
  function handleScroll() {
    if (!elements.navbar) return;
    
    const scrollTop = window.scrollY;
    
    // Check if scrolling down
    state.isScrollingDown = scrollTop > state.lastScrollTop;
    
    // Add or remove scrolled class based on scroll position
    if (scrollTop > config.thresholds.scroll) {
      elements.navbar.classList.add(config.classes.scrolled);
      elements.navbar.classList.add(config.classes.visible);
    } else {
      elements.navbar.classList.remove(config.classes.scrolled);
      
      if (scrollTop <= config.thresholds.visibility) {
        elements.navbar.classList.remove(config.classes.visible);
      }
    }
    
    // Update last scroll position
    state.lastScrollTop = scrollTop;
    
    // Update active navigation item based on scroll position
    updateActiveNavOnScroll();
  }
  
  /**
   * Update active navigation item based on scroll position
   */
  function updateActiveNavOnScroll() {
    // Only run this if we have navigation links
    if (!elements.navLinks || elements.navLinks.length === 0) return;
    
    // Get all sections referenced in the navigation
    const sections = Array.from(elements.navLinks)
      .map(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href !== '#') {
          return document.querySelector(href);
        }
        return null;
      })
      .filter(section => section !== null);
    
    // Find the current section in viewport
    let currentSection = '';
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = `#${section.id}`;
      }
    });
    
    // Only update if current section has changed
    if (currentSection !== state.currentSection) {
      state.currentSection = currentSection;
      setActiveNavItem(currentSection);
    }
  }
  
  /**
   * Set active navigation item
   * @param {string|Event} hashOrEvent - Hash string or hashchange event
   */
  function setActiveNavItem(hashOrEvent) {
    // Handle both direct hash string and hashchange event
    let hash = typeof hashOrEvent === 'string' ? hashOrEvent : '';
    
    // If we received an event or no hash was provided, get it from URL
    if (typeof hashOrEvent === 'object' || !hash) {
      hash = window.location.hash || '';
    }
    
    // Default to first section if no hash
    if (!hash && elements.navLinks.length > 0) {
      const firstLink = elements.navLinks[0];
      hash = firstLink.getAttribute('href');
    }
    
    // Remove active class from all nav links
    elements.navLinks.forEach(link => {
      link.classList.remove(config.selectors.activeClass);
      link.parentElement.classList.remove(config.selectors.activeClass);
    });
    
    // Add active class to current link
    if (hash) {
      const activeLink = document.querySelector(`a[href="${hash}"]`);
      if (activeLink) {
        activeLink.classList.add(config.selectors.activeClass);
        
        // Also add to parent if it's a list item
        const parentLi = activeLink.closest('li');
        if (parentLi) {
          parentLi.classList.add(config.selectors.activeClass);
        }
      }
    }
  }
  
  /**
   * Handle window resize
   */
  function handleResize() {
    // Close mobile menu if window is resized beyond mobile breakpoint
    if (window.innerWidth > 768 && elements.mobileMenu && elements.mobileMenu.classList.contains(config.classes.mobileVisible)) {
      elements.mobileMenu.classList.remove(config.classes.mobileVisible);
      updateToggleButtonState(false);
    }
  }
  
  /**
   * Toggle mobile menu visibility
   */
  function toggleMobileMenu() {
    if (!elements.mobileMenu) return;
    
    const isVisible = elements.mobileMenu.classList.contains(config.classes.mobileVisible);
    
    // Toggle visibility
    if (isVisible) {
      elements.mobileMenu.classList.remove(config.classes.mobileVisible);
    } else {
      elements.mobileMenu.classList.add(config.classes.mobileVisible);
    }
    
    // Update state
    state.isMobileMenuOpen = !isVisible;
    
    // Update toggle button state
    updateToggleButtonState(!isVisible);
  }
  
  /**
   * Update toggle button state for accessibility
   * @param {boolean} isExpanded - Whether menu is expanded
   */
  function updateToggleButtonState(isExpanded) {
    if (!elements.toggleButton) return;
    
    elements.toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }
  
  /**
   * Handle clicks outside the mobile menu
   * @param {Event} event - Click event
   */
  function handleOutsideClick(event) {
    if (!elements.mobileMenu || !state.isMobileMenuOpen) return;
    
    // Check if click is outside mobile menu and toggle button
    if (!elements.mobileMenu.contains(event.target) && 
        !event.target.closest(config.selectors.toggleButton)) {
      
      // Close mobile menu
      elements.mobileMenu.classList.remove(config.classes.mobileVisible);
      state.isMobileMenuOpen = false;
      updateToggleButtonState(false);
    }
  }
  
  /**
   * Set up smooth scrolling for navigation links
   */
  function setupSmoothScrolling() {
    elements.navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if not an anchor link
        if (href === '#' || href === '') return;
        
        const targetElement = document.querySelector(href);
        
        if (targetElement) {
          e.preventDefault();
          
          // Check if user prefers reduced motion
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          
          // Smooth scroll to target
          window.scrollTo({
            top: targetElement.offsetTop,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
          
          // Close mobile menu if open
          if (state.isMobileMenuOpen) {
            elements.mobileMenu.classList.remove(config.classes.mobileVisible);
            state.isMobileMenuOpen = false;
            updateToggleButtonState(false);
          }
          
          // Update URL hash
          history.pushState(null, null, href);
          
          // Update active nav item
          setActiveNavItem(href);
        }
      });
    });
  }
  
  // Public API
  return {
    init,
    toggleMobileMenu
  };
})();

// Initialize automatically when DOM is ready
document.addEventListener('DOMContentLoaded', NavigationComponent.init);

// Expose globally for backward compatibility
window.NavigationComponent = NavigationComponent;