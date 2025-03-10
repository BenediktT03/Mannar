 // Create new file: src/assets/js/utils/ui-utils.js

/**
 * UI Utilities - Common UI functionality across the application
 */
const UIUtils = (function() {
  // Status message handling
  function showStatus(message, isError = false, timeout = 3000) {
    const statusMsg = document.getElementById('statusMsg');
    if (!statusMsg) return;
    
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, timeout);
    }
  }

  // Lazy loading for images
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img:not([loading])').forEach(img => {
        img.loading = 'lazy';
      });
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
              img.src = dataSrc;
            }
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
      });
    }
  }

  // Animation handling
  function initAnimations() {
    const animatedElements = document.querySelectorAll('.animate-item');
    
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
  }

  // Go to top button
  function initGoToTopButton() {
    const goTopBtn = document.getElementById('goTopBtn');
    if (!goTopBtn) return;
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        goTopBtn.classList.add('visible');
      } else {
        goTopBtn.classList.remove('visible');
      }
    });
    
    goTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Mobile navigation
  function initMobileNav() {
    const navDemo = document.getElementById('navDemo');
    
    // Toggle mobile navigation
    window.toggleFunction = function() {
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
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (navDemo && 
          navDemo.classList.contains('w3-show') && 
          !event.target.closest('#navDemo') && 
          !event.target.closest('[aria-controls="navDemo"]')) {
        navDemo.classList.remove('w3-show');
      }
    });
  }

  // Initialize all UI enhancements
  function initAll() {
    initLazyLoading();
    initAnimations();
    initGoToTopButton();
    initMobileNav();
  }

  // Public API
  return {
    showStatus,
    initLazyLoading,
    initAnimations,
    initGoToTopButton,
    initMobileNav,
    initAll
  };
})();

// For global access
window.UIUtils = UIUtils;

// Auto-initialize when document loads
document.addEventListener('DOMContentLoaded', UIUtils.initAll);