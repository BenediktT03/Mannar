 /**
 * ui-manager.js
 * Handles UI interactions like tabs, navigation, modals, and scroll effects
 */

import { debounce, isMobileDevice } from '../core/utils.js';
import { ADMIN_TABS } from '../core/config.js';

// State
let activeTab = null;
let tabListeners = [];

/**
 * Initialize UI manager
 * @param {Object} options - UI options
 * @returns {Object} UI methods
 */
export function initUI(options = {}) {
  // Set default active tab
  activeTab = options.defaultTab || 'pages';
  
  // Initialize components based on detected page type
  if (document.getElementById('adminDiv')) {
    initAdminUI();
  } else {
    initFrontendUI();
  }
  
  return {
    switchTab,
    registerTabListener,
    showModal,
    hideModal,
    scrollToElement,
    setupImageModals,
    setupScrollHandling
  };
}

/**
 * Initialize UI for the admin panel
 */
function initAdminUI() {
  // Cache admin-specific elements
  cacheAdminElements();
  
  // Setup tab navigation
  setupTabs();
  
  // Setup responsive behavior
  setupResponsiveness();
  
  // Add go-to-top button if not present
  ensureGoToTopButton();
  
  // Setup scroll handling
  setupScrollHandling();
}

/**
 * Initialize UI for the frontend
 */
function initFrontendUI() {
  // Cache frontend-specific elements
  cacheFrontendElements();
  
  // Setup navigation
  setupNavigation();
  
  // Setup image modals
  setupImageModals();
  
  // Add go-to-top button if not present
  ensureGoToTopButton();
  
  // Setup scroll handling
  setupScrollHandling();
  
  // Setup smooth scrolling
  setupSmoothScrolling();
}

// DOM element caches
const adminElements = {};
const frontendElements = {};

/**
 * Cache admin UI elements
 */
function cacheAdminElements() {
  adminElements.tabButtons = document.querySelectorAll('.tab-btn');
  adminElements.tabContents = document.querySelectorAll('.tab-content');
  adminElements.statusMsg = document.getElementById('statusMsg');
  adminElements.loginDiv = document.getElementById('loginDiv');
  adminElements.adminDiv = document.getElementById('adminDiv');
  adminElements.goTopBtn = document.getElementById('goTopBtn');
  adminElements.previewFrame = document.getElementById('previewFrame');
  adminElements.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
}

/**
 * Cache frontend UI elements
 */
function cacheFrontendElements() {
  frontendElements.navbar = document.getElementById('myNavbar');
  frontendElements.navDemo = document.getElementById('navDemo');
  frontendElements.navbarToggleBtn = document.querySelector('.w3-right.w3-hide-medium.w3-hide-large');
  frontendElements.internalLinks = document.querySelectorAll('a[href^="#"]');
  frontendElements.portfolioImages = document.querySelectorAll('.portfolio-item img');
  frontendElements.modal = document.getElementById('modal01');
  frontendElements.modalImg = document.getElementById('img01');
  frontendElements.captionText = document.getElementById('caption');
  frontendElements.goTopBtn = document.getElementById('goTopBtn');
}

/**
 * Setup tab navigation
 */
function setupTabs() {
  if (!adminElements.tabButtons || !adminElements.tabContents) return;
  
  // Add click handlers to tab buttons
  adminElements.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      if (tabName) {
        switchTab(tabName);
      }
    });
  });
  
  // Set default active tab if none is active
  const activeTabBtn = document.querySelector('.tab-btn.active');
  if (activeTabBtn) {
    activeTab = activeTabBtn.getAttribute('data-tab');
    // Make sure tab content is visible
    showTabContent(activeTab);
  } else {
    // Activate first tab
    const firstTabBtn = adminElements.tabButtons[0];
    if (firstTabBtn) {
      activeTab = firstTabBtn.getAttribute('data-tab');
      firstTabBtn.classList.add('active');
      showTabContent(activeTab);
    }
  }
}

/**
 * Switch to a different tab
 * @param {string} tabName - Tab name to switch to
 */
export function switchTab(tabName) {
  if (!tabName || activeTab === tabName) return;
  
  // Update active tab
  activeTab = tabName;
  
  // Update tab buttons
  adminElements.tabButtons.forEach(btn => {
    const btnTabName = btn.getAttribute('data-tab');
    if (btnTabName === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show active tab content, hide others
  adminElements.tabContents.forEach(content => {
    const contentId = content.id.replace('-tab', '');
    if (contentId === tabName) {
      content.style.display = 'block';
      content.classList.add('active');
    } else {
      content.style.display = 'none';
      content.classList.remove('active');
    }
  });
  
  // Notify tab listeners
  notifyTabListeners(tabName);
}

/**
 * Show a specific tab content
 * @param {string} tabName - Tab name
 */
function showTabContent(tabName) {
  const tabContent = document.getElementById(`${tabName}-tab`);
  if (tabContent) {
    // Hide all tabs
    adminElements.tabContents.forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    
    // Show selected tab
    tabContent.style.display = 'block';
    tabContent.classList.add('active');
  }
}

/**
 * Register a listener for tab changes
 * @param {Function} listener - Function to call when tab changes
 */
export function registerTabListener(listener) {
  if (typeof listener !== 'function') return;
  
  // Don't add the same listener twice
  if (!tabListeners.includes(listener)) {
    tabListeners.push(listener);
  }
}

/**
 * Notify all tab listeners of a tab change
 * @param {string} tabName - Name of the new active tab
 */
function notifyTabListeners(tabName) {
  tabListeners.forEach(listener => {
    try {
      listener(tabName);
    } catch (error) {
      console.error('Error in tab listener:', error);
    }
  });
}

/**
 * Setup responsive behavior
 */
function setupResponsiveness() {
  // Check screen size and adjust UI
  const handleResize = debounce(() => {
    const isMobile = window.innerWidth < 768;
    
    // Adjust tab display for mobile
    if (isMobile) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.add('w3-block');
      });
    } else {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('w3-block');
      });
    }
  }, 200);
  
  // Initialize and listen for changes
  handleResize();
  window.addEventListener('resize', handleResize);
}

/**
 * Setup navigation for frontend
 */
function setupNavigation() {
  // Toggle button for mobile navigation
  if (frontendElements.navbarToggleBtn) {
    // Add accessibility attributes
    frontendElements.navbarToggleBtn.setAttribute('aria-controls', 'navDemo');
    frontendElements.navbarToggleBtn.setAttribute('aria-expanded', 'false');
    frontendElements.navbarToggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Prevent default link behavior
    frontendElements.navbarToggleBtn.addEventListener('click', function(event) {
      event.preventDefault();
      toggleNavigation();
    });
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (frontendElements.navDemo && frontendElements.navDemo.classList.contains('w3-show')) {
      // Only close if clicking outside menu and toggle button
      if (!frontendElements.navDemo.contains(event.target) && 
          (!frontendElements.navbarToggleBtn || !frontendElements.navbarToggleBtn.contains(event.target))) {
        frontendElements.navDemo.classList.remove('w3-show');
        
        // Update ARIA expanded state
        if (frontendElements.navbarToggleBtn) {
          frontendElements.navbarToggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && frontendElements.navDemo && frontendElements.navDemo.classList.contains('w3-show')) {
      frontendElements.navDemo.classList.remove('w3-show');
      if (frontendElements.navbarToggleBtn) {
        frontendElements.navbarToggleBtn.setAttribute('aria-expanded', 'false');
        frontendElements.navbarToggleBtn.focus(); // Return focus to toggle button
      }
    }
  });
}

/**
 * Toggle mobile navigation menu
 */
export function toggleNavigation() {
  if (!frontendElements.navDemo) {
    console.error('Navigation menu element not found');
    return;
  }
  
  frontendElements.navDemo.classList.toggle('w3-show');
  
  // Update accessibility attributes
  const expanded = frontendElements.navDemo.classList.contains('w3-show');
  if (frontendElements.navbarToggleBtn) {
    frontendElements.navbarToggleBtn.setAttribute('aria-expanded', expanded.toString());
  }
}

/**
 * Setup image modal functionality
 */
export function setupImageModals() {
  if (!frontendElements.modal || !frontendElements.modalImg || !frontendElements.portfolioImages) return;
  
  // Add click handlers to images
  frontendElements.portfolioImages.forEach(img => {
    img.addEventListener('click', function() {
      frontendElements.modal.style.display = 'block';
      frontendElements.modalImg.src = this.src;
      
      if (frontendElements.captionText) {
        frontendElements.captionText.innerHTML = this.alt;
      }
    });
  });
  
  // Add close functionality
  const closeBtn = frontendElements.modal.querySelector('.w3-button');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      frontendElements.modal.style.display = 'none';
    });
  }
  
  // Close modal when clicking anywhere
  frontendElements.modal.addEventListener('click', function() {
    this.style.display = 'none';
  });
  
  // Prevent closing when clicking modal content
  const modalContent = frontendElements.modal.querySelector('.w3-modal-content');
  if (modalContent) {
    modalContent.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}

/**
 * Show a modal dialog
 * @param {string} modalId - Modal element ID
 */
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
  }
}

/**
 * Hide a modal dialog
 * @param {string} modalId - Modal element ID
 */
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Ensure go-to-top button exists
 */
function ensureGoToTopButton() {
  let goTopBtn = document.getElementById('goTopBtn');
  
  if (!goTopBtn) {
    goTopBtn = document.createElement('div');
    goTopBtn.id = 'goTopBtn';
    goTopBtn.className = 'go-top';
    goTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    goTopBtn.setAttribute('aria-label', 'Go to top');
    goTopBtn.setAttribute('role', 'button');
    goTopBtn.setAttribute('tabindex', '0');
    
    document.body.appendChild(goTopBtn);
    
    // Add click handler
    goTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Add keyboard handler for accessibility
    goTopBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }
  
  return goTopBtn;
}

/**
 * Setup scroll handling for navbar and back-to-top button
 */
export function setupScrollHandling() {
  const navbar = frontendElements.navbar || document.getElementById('myNavbar');
  const goTopBtn = frontendElements.goTopBtn || document.getElementById('goTopBtn');
  
  if (!navbar && !goTopBtn) return;
  
  const handleScroll = debounce(() => {
    const scrollY = window.scrollY;
    
    // Navbar visibility
    if (navbar) {
      if (scrollY > 100) {
        navbar.classList.add('scrolled');
        navbar.classList.add('visible');
      } else {
        navbar.classList.remove('scrolled');
        if (scrollY <= 10) {
          navbar.classList.remove('visible');
        }
      }
    }
    
    // Go-to-top button
    if (goTopBtn) {
      if (scrollY > 300) {
        goTopBtn.classList.add('visible');
      } else {
        goTopBtn.classList.remove('visible');
      }
    }
  }, 100);
  
  // Initial check
  handleScroll();
  
  // Listen for scroll events
  window.addEventListener('scroll', handleScroll);
}

/**
 * Setup smooth scrolling for internal links
 */
function setupSmoothScrolling() {
  if (!frontendElements.internalLinks) return;
  
  frontendElements.internalLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      scrollToElement(targetId);
      
      // Close mobile menu if open
      if (frontendElements.navDemo && frontendElements.navDemo.classList.contains('w3-show')) {
        frontendElements.navDemo.classList.remove('w3-show');
        
        if (frontendElements.navbarToggleBtn) {
          frontendElements.navbarToggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

/**
 * Scroll to an element
 * @param {string} selector - Element selector
 */
export function scrollToElement(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  
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

/**
 * Refresh the preview iframe
 */
export function refreshPreview() {
  if (!adminElements.previewFrame) return;
  
  const previewTypeRadios = document.getElementsByName('previewType');
  const isDraft = Array.from(previewTypeRadios)
    .find(radio => radio.checked)?.value === 'draft';
  
  const timestamp = Date.now(); // Cache-busting
  adminElements.previewFrame.src = `preview.html?draft=${isDraft}&t=${timestamp}`;
  
  console.log(`Preview refreshed (${isDraft ? 'Draft' : 'Live'} version)`);
}

// Export toggleFunction globally for HTML handlers
window.toggleFunction = toggleNavigation;

// Initialize when this module is loaded
initUI();