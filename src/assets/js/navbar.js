/**
 * Optimized Navbar Script
 * Improved performance, error handling, and accessibility
 */

// Global toggle function with error handling
function toggleFunction() {
  const navDemo = document.getElementById('navDemo');
  if (!navDemo) {
    console.error('Navigation menu element not found');
    return;
  }

  navDemo.classList.toggle('w3-show');
  
  // Improve accessibility
  const expanded = navDemo.classList.contains('w3-show');
  const toggleButton = document.querySelector('.w3-right.w3-hide-medium.w3-hide-large');
  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', expanded.toString());
  }
}

// Make toggleFunction globally available
window.toggleFunction = toggleFunction;

// Additional event listeners after DOM load
document.addEventListener('DOMContentLoaded', function() {
  // Cache DOM elements
  const navbarToggleBtn = document.querySelector('.w3-right.w3-hide-medium.w3-hide-large');
  const navDemo = document.getElementById('navDemo');
  
  // Error handling for required elements
  if (!navDemo) {
    console.warn('Mobile navigation menu not found in the DOM');
  }

  // Set up toggle button accessibility
  if (navbarToggleBtn) {
    // Add accessibility attributes
    navbarToggleBtn.setAttribute('aria-controls', 'navDemo');
    navbarToggleBtn.setAttribute('aria-expanded', 'false');
    navbarToggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Prevent default link behavior and toggle menu
    navbarToggleBtn.addEventListener('click', function(event) {
      event.preventDefault();
      toggleFunction();
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (navDemo && navDemo.classList.contains('w3-show')) {
      // Only close if clicking outside menu and toggle button
      if (!navDemo.contains(event.target) && 
          (!navbarToggleBtn || !navbarToggleBtn.contains(event.target))) {
        navDemo.classList.remove('w3-show');
        
        // Update ARIA expanded state
        if (navbarToggleBtn) {
          navbarToggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
  
  // Setup keyboard navigation for dropdown menu
  if (navDemo) {
    // Close on Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && navDemo.classList.contains('w3-show')) {
        navDemo.classList.remove('w3-show');
        if (navbarToggleBtn) {
          navbarToggleBtn.setAttribute('aria-expanded', 'false');
          navbarToggleBtn.focus(); // Return focus to toggle button
        }
      }
    });
    
    // Make menu items navigable by keyboard
    const menuItems = navDemo.querySelectorAll('a');
    menuItems.forEach(item => {
      item.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          navDemo.classList.remove('w3-show');
          if (navbarToggleBtn) {
            navbarToggleBtn.setAttribute('aria-expanded', 'false');
            navbarToggleBtn.focus();
          }
        }
      });
    });
  }
});