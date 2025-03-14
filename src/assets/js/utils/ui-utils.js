/**
 * UI Utilities
 * 
 * Provides common UI-related utility functions for the Mannar website.
 * These utilities handle animations, DOM manipulation, and other UI operations.
 * 
 * @module UIUtils
 */

/**
 * UI Utilities namespace
 */
export const UIUtils = {
    /**
     * Initialize all UI utilities
     */
    initAll: function() {
        this.initAnimations();
        this.initModals();
        this.initScrollToTop();
        this.initLazyLoading();
        this.initStatusMessages();
        this.initExternalLinks();
        this.observeElementVisibility();
    },
    
    /**
     * Initialize animations on page
     */
    initAnimations: function() {
        // Check if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.animate-item').forEach(item => {
                item.classList.add('visible');
            });
            return;
        }
        
        // Use Intersection Observer if available
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('.animate-item').forEach(item => {
                observer.observe(item);
            });
        } else {
            // Fallback for browsers that don't support Intersection Observer
            document.querySelectorAll('.animate-item').forEach(item => {
                item.classList.add('visible');
            });
        }
    },
    
    /**
     * Initialize modal functionality
     */
    initModals: function() {
        // Find all modal triggers
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);
            
            if (!modal) return;
            
            // Add click event to trigger
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(modalId);
            });
            
            // Add click event to close buttons
            modal.querySelectorAll('.close-modal, [data-close-modal]').forEach(closeBtn => {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeModal(modalId);
                });
            });
            
            // Close modal when clicking outside content
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
            
            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeModal(modalId);
                }
            });
        });
    },
    
    /**
     * Open a modal
     * @param {string} modalId - ID of the modal to open
     */
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Add active class to show the modal
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Set focus to the first focusable element
        setTimeout(() => {
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length > 0) {
                focusable[0].focus();
            }
        }, 100);
        
        // Trigger modal open event
        this.triggerEvent('modalOpen', { modalId });
    },
    
    /**
     * Close a modal
     * @param {string} modalId - ID of the modal to close
     */
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Remove active class to hide the modal
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Trigger modal close event
        this.triggerEvent('modalClose', { modalId });
    },
    
    /**
     * Initialize scroll to top functionality
     */
    initScrollToTop: function() {
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
        
        // Scroll to top on click
        goTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        });
    },
    
    /**
     * Initialize lazy loading for images
     */
    initLazyLoading: function() {
        // Use native lazy loading if available
        document.querySelectorAll('img[data-src]').forEach(img => {
            if ('loading' in HTMLImageElement.prototype) {
                // Browser supports native lazy loading
                img.loading = 'lazy';
                img.src = img.dataset.src;
                
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
            } else {
                // Fallback to Intersection Observer
                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                img.src = img.dataset.src;
                                
                                if (img.dataset.srcset) {
                                    img.srcset = img.dataset.srcset;
                                }
                                
                                observer.unobserve(img);
                            }
                        });
                    });
                    
                    observer.observe(img);
                } else {
                    // Fallback for older browsers
                    img.src = img.dataset.src;
                    
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                }
            }
        });
    },
    
    /**
     * Initialize status messages
     */
    initStatusMessages: function() {
        document.querySelectorAll('.status-msg').forEach(msg => {
            if (msg.classList.contains('show')) {
                // Auto-hide status messages after a delay
                setTimeout(() => {
                    msg.classList.remove('show');
                }, 5000);
            }
            
            // Add close button functionality
            const closeBtn = msg.querySelector('.close-status');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    msg.classList.remove('show');
                });
            }
        });
    },
    
    /**
     * Initialize external links to open in new tab
     */
    initExternalLinks: function() {
        const currentHost = window.location.hostname;
        
        // Find all external links
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            const linkHost = new URL(link.href).hostname;
            
            // Check if link is external
            if (linkHost !== currentHost) {
                // Don't override links that already have target set
                if (!link.getAttribute('target')) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                }
            }
        });
    },
    
    /**
     * Observe element visibility using Intersection Observer
     */
    observeElementVisibility: function() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Add or remove 'in-view' class based on visibility
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    // Optionally remove the class when element goes out of view
                    // Uncomment the following line to enable this behavior
                    // entry.target.classList.remove('in-view');
                }
            });
        }, { threshold: 0.1 });
        
        // Observe elements with 'observe-visibility' class
        document.querySelectorAll('.observe-visibility').forEach(element => {
            observer.observe(element);
        });
    },
    
    /**
     * Trigger a custom event
     * @param {string} eventName - Name of the event
     * @param {Object} data - Event data
     */
    triggerEvent: function(eventName, data = {}) {
        const event = new CustomEvent('ui:' + eventName, { detail: data });
        document.dispatchEvent(event);
    },
    
    /**
     * Smooth scroll to an element
     * @param {string|Element} target - Target element or selector
     * @param {number} offset - Offset from the element in pixels
     */
    scrollTo: function(target, offset = 0) {
        let element;
        
        if (typeof target === 'string') {
            // If target is a selector, find the element
            element = document.querySelector(target);
        } else {
            // Otherwise, assume target is already an element
            element = target;
        }
        
        if (!element) return;
        
        // Check if user prefers reduced motion
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const behavior = reducedMotion ? 'auto' : 'smooth';
        
        // Calculate position
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetTop = rect.top + scrollTop - offset;
        
        // Scroll to position
        window.scrollTo({
            top: targetTop,
            behavior: behavior
        });
    },
    
    /**
     * Debounce a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Whether to execute at the beginning
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait, immediate) {
        let timeout;
        
        return function() {
            const context = this;
            const args = arguments;
            
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(context, args);
        };
    },
    
    /**
     * Throttle a function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle: function(func, limit) {
        let inThrottle;
        
        return function() {
            const context = this;
            const args = arguments;
            
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Update element text content
     * @param {string|Element} element - Element ID or element
     * @param {string} text - Text content
     */
    updateElementText: function(element, text) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        
        if (el && text !== undefined && text !== null) {
            el.textContent = text;
        }
    },
    
    /**
     * Update element HTML content
     * @param {string|Element} element - Element ID or element
     * @param {string} html - HTML content
     */
    updateElementHTML: function(element, html) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        
        if (el && html !== undefined && html !== null) {
            el.innerHTML = html;
        }
    },
    
    /**
     * Create an element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attrs - Element attributes
     * @param {string|Element|Array} content - Element content (string, element, or array of elements)
     * @returns {Element} Created element
     */
    createElement: function(tag, attrs = {}, content = null) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set content
        if (content !== null) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof Element) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(item => {
                    if (item instanceof Element) {
                        element.appendChild(item);
                    } else if (typeof item === 'string') {
                        element.appendChild(document.createTextNode(item));
                    }
                });
            }
        }
        
        return element;
    },
    
    /**
     * Remove all children from an element
     * @param {Element} element - Element to clear
     */
    clearElement: function(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    
    /**
     * Show a loading indicator
     * @param {string|Element} container - Container element ID or element
     * @param {string} [size='medium'] - Size of the loading indicator (small, medium, large)
     * @param {string} [message='Loading...'] - Loading message
     * @returns {Element} Loading indicator element
     */
    showLoading: function(container, size = 'medium', message = 'Loading...') {
        const containerEl = typeof container === 'string' ? document.getElementById(container) : container;
        
        if (!containerEl) return null;
        
        // Clear the container
        this.clearElement(containerEl);
        
        // Create loading indicator
        const loadingDiv = this.createElement('div', { className: `loading-indicator loading-${size}` });
        
        // Create spinner
        const spinner = this.createElement('div', { className: 'spinner' });
        loadingDiv.appendChild(spinner);
        
        // Add message if provided
        if (message) {
            const messageEl = this.createElement('p', { className: 'loading-message' }, message);
            loadingDiv.appendChild(messageEl);
        }
        
        // Add to container
        containerEl.appendChild(loadingDiv);
        
        return loadingDiv;
    },
    
    /**
     * Hide loading indicator
     * @param {string|Element} container - Container element ID or element
     */
    hideLoading: function(container) {
        const containerEl = typeof container === 'string' ? document.getElementById(container) : container;
        
        if (!containerEl) return;
        
        // Find and remove loading indicator
        const loadingIndicator = containerEl.querySelector('.loading-indicator');
        
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    },
    
    /**
     * Format a date
     * @param {Date|string|number} date - Date to format
     * @param {string} [format='d.m.Y'] - Format string
     * @returns {string} Formatted date
     */
    formatDate: function(date, format = 'd.m.Y') {
        if (!date) return '';
        
        const d = new Date(date);
        
        // Format tokens
        const tokens = {
            d: String(d.getDate()).padStart(2, '0'),
            m: String(d.getMonth() + 1).padStart(2, '0'),
            Y: d.getFullYear(),
            H: String(d.getHours()).padStart(2, '0'),
            i: String(d.getMinutes()).padStart(2, '0'),
            s: String(d.getSeconds()).padStart(2, '0')
        };
        
        // Replace tokens in format string
        let result = format;
        
        for (const [token, value] of Object.entries(tokens)) {
            result = result.replace(token, value);
        }
        
        return result;
    },
    
    /**
     * Format a number
     * @param {number} number - Number to format
     * @param {number} [decimals=0] - Number of decimal places
     * @param {string} [decPoint=','] - Decimal point character
     * @param {string} [thousandsSep='.'] - Thousands separator
     * @returns {string} Formatted number
     */
    formatNumber: function(number, decimals = 0, decPoint = ',', thousandsSep = '.') {
        // Format number with specified decimal places
        const n = parseFloat(number).toFixed(decimals);
        
        // Split into whole and decimal parts
        const parts = n.split('.');
        
        // Format whole part with thousands separator
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
        
        // Join parts with decimal point
        return parts.join(decPoint);
    }
};

// Export the UIUtils module
export default UIUtils;