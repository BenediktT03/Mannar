/**
 * utils.js
 * Shared utility functions used across the application
 */

/**
 * Display a status message to the user
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 * @param {number} timeout - Time in ms before message disappears (0 for persistent)
 */
export function showStatus(message, isError = false, timeout = 3000) {
  // Try to find existing status element
  let statusMsg = document.getElementById('statusMsg');
  
  // Create one if it doesn't exist
  if (!statusMsg) {
    statusMsg = document.createElement('div');
    statusMsg.id = 'statusMsg';
    statusMsg.className = 'status-msg';
    document.body.appendChild(statusMsg);
  }
  
  // Set message content and style
  statusMsg.textContent = message;
  statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
  
  // Auto-hide after timeout (if not 0)
  if (timeout > 0) {
    setTimeout(() => {
      statusMsg.classList.remove('show');
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 300);
    }, timeout);
  }
  
  console.log(`Status: ${isError ? 'ERROR -' : ''}`, message);
}

/**
 * Safely update content of a DOM element
 * @param {string|Element} element - Element ID or the element itself
 * @param {string} content - Content to set
 * @param {string} property - Property to set (innerHTML, textContent, value)
 * @returns {boolean} Success status
 */
export function updateElementContent(element, content, property = 'innerHTML') {
  if (!content && content !== 0) return false;
  
  const el = typeof element === 'string' ? document.getElementById(element) : element;
  if (!el) return false;
  
  el[property] = content;
  return true;
}

/**
 * Generate a unique ID (for new items, temp IDs, etc)
 * @returns {string} Unique ID string
 */
export function generateUniqueId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Format date to a readable string
 * @param {Date|timestamp} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '';
  
  try {
    const d = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) return '';
    
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined
    };
    
    return d.toLocaleDateString('de-DE', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Sanitize a string for use as an ID or URL
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitize(input) {
  if (!input) return '';
  
  return input.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')   // Remove non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')         // Trim hyphens from start
    .replace(/-+$/, '');        // Trim hyphens from end
}

/**
 * Debounce a function call
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeout;
  
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Create an element with attributes and content
 * @param {string} tag - Element tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Element|Array} children - Child elements or text
 * @returns {Element} Created element
 */
export function createElement(tag, attributes = {}, children = null) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add children
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Element) {
          element.appendChild(child);
        } else if (child) {
          element.appendChild(document.createTextNode(child.toString()));
        }
      });
    } else if (children instanceof Element) {
      element.appendChild(children);
    } else if (children) {
      element.textContent = children.toString();
    }
  }
  
  return element;
}

/**
 * Add event listeners to multiple elements
 * @param {string|NodeList|Array} selector - CSS selector or elements
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function addEventListeners(selector, event, handler) {
  const elements = typeof selector === 'string' 
    ? document.querySelectorAll(selector)
    : selector;
  
  if (!elements) return;
  
  if (elements instanceof Element) {
    elements.addEventListener(event, handler);
    return;
  }
  
  Array.from(elements).forEach(element => {
    element.addEventListener(event, handler);
  });
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
  return (window.innerWidth <= 768) || 
         (navigator.userAgent.match(/Android/i) ||
          navigator.userAgent.match(/webOS/i) ||
          navigator.userAgent.match(/iPhone/i) ||
          navigator.userAgent.match(/iPad/i) ||
          navigator.userAgent.match(/iPod/i) ||
          navigator.userAgent.match(/BlackBerry/i) ||
          navigator.userAgent.match(/Windows Phone/i));
}

/**
 * Load a script dynamically
 * @param {string} url - Script URL
 * @param {Function} callback - Callback when loaded
 */
export function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  
  if (callback) {
    script.onload = callback;
  }
  
  document.head.appendChild(script);
}

/**
 * Prevent form submission and get all form values as an object
 * @param {Event} event - Form submit event
 * @returns {Object} Form values
 */
export function getFormValues(event) {
  if (event) {
    event.preventDefault();
  }
  
  const form = event?.target || document.querySelector('form');
  if (!form) return {};
  
  const formData = new FormData(form);
  const values = {};
  
  for (const [key, value] of formData.entries()) {
    values[key] = value;
  }
  
  return values;
}

// Export more utility functions as needed 