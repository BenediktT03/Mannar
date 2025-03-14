/**
 * Main Application JavaScript
 * 
 * This is the main JavaScript file that initializes all core functionality
 * for the Mannar website. It loads and configures modules, sets up event listeners,
 * and manages application state.
 */

// Import utility modules
import { UIUtils } from './utils/ui-utils.js';
import { ErrorHandler } from './utils/error-handler.js';

// Import service modules
import { FirebaseService } from './services/firebase.js';
import { ContentService } from './services/content.js';
import { AuthService } from './services/auth.js';
import { UploadService } from './services/upload.js';
import { UIService } from './services/ui.js';

// Import component modules
import { Navigation } from './components/navigation.js';
import { WordCloud } from './components/wordcloud.js';
import { Gallery } from './components/gallery.js';

/**
 * Application namespace
 * @namespace App
 */
const App = {
    /**
     * Current application state
     * @type {Object}
     */
    state: {
        initialized: false,
        loading: true,
        authenticated: false,
        userData: null,
        currentPage: null,
        darkMode: false
    },
    
    /**
     * Initialize the application
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
        // Prevent multiple initializations
        if (this.state.initialized) {
            return;
        }
        
        // Configure error handling
        ErrorHandler.init({
            logErrors: true,
            showErrors: options.debug || false
        });
        
        try {
            // Set initial application state
            this.state.currentPage = document.body.id || 'unknown';
            
            // Initialize services
            this.initServices(options);
            
            // Initialize UI components
            this.initUI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Perform page-specific initialization
            this.initPageSpecific();
            
            // Mark as initialized
            this.state.initialized = true;
            this.state.loading = false;
            
            // Log initialization complete
            console.log('Mannar application initialized');
        } catch (error) {
            ErrorHandler.handleError(error, 'App initialization failed');
        }
    },
    
    /**
     * Initialize application services
     * @param {Object} options - Configuration options
     */
    initServices: function(options) {
        // Initialize Firebase service
        FirebaseService.init({
            apiKey: options.firebaseApiKey || "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
            authDomain: options.firebaseAuthDomain || "mannar-129a5.firebaseapp.com",
            projectId: options.firebaseProjectId || "mannar-129a5",
            storageBucket: options.firebaseStorageBucket || "mannar-129a5.firebasestorage.app",
            messagingSenderId: options.firebaseMessagingSenderId || "687710492532",
            appId: options.firebaseAppId || "1:687710492532:web:c7b675da541271f8d83e21",
            measurementId: options.firebaseMeasurementId || "G-NXBLYJ5CXL"
        });
        
        // Initialize content service
        ContentService.init({
            firebaseService: FirebaseService,
            enableCaching: options.enableContentCaching || true
        });
        
        // Initialize auth service if needed
        if (options.authEnabled) {
            AuthService.init({
                firebaseService: FirebaseService,
                onAuthStateChanged: (user) => {
                    this.state.authenticated = !!user;
                    this.state.userData = user;
                    
                    // Trigger auth state change event
                    this.triggerEvent('authStateChanged', { user });
                }
            });
        }
        
        // Initialize upload service if needed
        if (options.uploadEnabled) {
            UploadService.init({
                firebaseService: FirebaseService,
                cloudinaryEnabled: options.cloudinaryEnabled || true,
                cloudinaryConfig: options.cloudinaryConfig || null
            });
        }
        
        // Initialize UI service
        UIService.init();
    },
    
    /**
     * Initialize UI components
     */
    initUI: function() {
        // Initialize navigation
        Navigation.init();
        
        // Initialize word cloud if element exists
        if (document.querySelector('.word-cloud')) {
            WordCloud.init();
        }
        
        // Initialize gallery if element exists
        if (document.querySelector('.gallery-container')) {
            Gallery.init();
        }
        
        // Initialize UI utilities
        UIUtils.initAll();
    },
    
    /**
     * Set up global event listeners
     */
    setupEventListeners: function() {
        // Listen for dark mode changes
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.state.darkMode = darkModeMediaQuery.matches;
        
        darkModeMediaQuery.addEventListener('change', (e) => {
            this.state.darkMode = e.matches;
            this.triggerEvent('darkModeChanged', { darkMode: e.matches });
        });
        
        // Handle scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Handle resize events
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        
        // Handle visibility change events
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    },
    
    /**
     * Initialize page-specific functionality
     */
    initPageSpecific: function() {
        const pageId = this.state.currentPage;
        
        switch (pageId) {
            case 'home-page':
                this.initHomePage();
                break;
                
            case 'contact-page':
                this.initContactPage();
                break;
                
            case 'admin-login-page':
                this.initAdminLoginPage();
                break;
                
            default:
                // Check if this is a dynamic page
                if (document.querySelector('.dynamic-page')) {
                    this.initDynamicPage();
                }
                break;
        }
    },
    
    /**
     * Initialize home page specific functionality
     */
    initHomePage: function() {
        // Load content from Firebase
        ContentService.loadContent('main')
            .then(data => {
                if (data) {
                    this.updatePageContent(data);
                }
            })
            .catch(error => {
                ErrorHandler.handleError(error, 'Error loading home page content');
            });
        
        // Load word cloud data if element exists
        if (document.getElementById('wordCloudList')) {
            ContentService.loadWordCloud()
                .then(words => {
                    WordCloud.renderWordCloud(words);
                })
                .catch(error => {
                    ErrorHandler.handleError(error, 'Error loading word cloud');
                });
        }
    },
    
    /**
     * Initialize contact page specific functionality
     */
    initContactPage: function() {
        // Initialize contact form handling
        const contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactFormSubmit.bind(this));
        }
    },
    
    /**
     * Initialize admin login page specific functionality
     */
    initAdminLoginPage: function() {
        // If already authenticated, redirect to admin panel
        if (this.state.authenticated) {
            window.location.href = 'admin.php';
        }
        
        // Initialize login form handling
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLoginFormSubmit.bind(this));
        }
    },
    
    /**
     * Initialize dynamic page specific functionality
     */
    initDynamicPage: function() {
        // Get page ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const pageId = urlParams.get('id');
        
        if (pageId) {
            ContentService.loadPage(pageId)
                .then(data => {
                    if (data) {
                        this.renderDynamicPage(data);
                    } else {
                        ErrorHandler.showError('Page not found');
                    }
                })
                .catch(error => {
                    ErrorHandler.handleError(error, 'Error loading page content');
                });
        }
    },
    
    /**
     * Update home page content with data from Firebase
     * @param {Object} data - Content data
     */
    updatePageContent: function(data) {
        // Update about section
        UIUtils.updateElementText('aboutTitle', data.aboutTitle);
        UIUtils.updateElementText('aboutSubtitle', data.aboutSubtitle);
        UIUtils.updateElementHTML('aboutText', data.aboutText);
        
        // Update offerings section
        UIUtils.updateElementText('offeringsTitle', data.offeringsTitle);
        UIUtils.updateElementText('offeringsSubtitle', data.offeringsSubtitle);
        
        // Update offerings
        this.updateOffering(1, data);
        this.updateOffering(2, data);
        this.updateOffering(3, data);
        
        // Update contact section
        UIUtils.updateElementText('contactTitle', data.contactTitle);
        UIUtils.updateElementText('contactSubtitle', data.contactSubtitle);
        
        // Update images
        this.updateImages(data);
    },
    
    /**
     * Update an offering section
     * @param {number} index - Offering index (1-3)
     * @param {Object} data - Content data
     */
    updateOffering: function(index, data) {
        const titleKey = `offer${index}Title`;
        const descKey = `offer${index}Desc`;
        
        UIUtils.updateElementText(titleKey, data[titleKey]);
        UIUtils.updateElementHTML(descKey, data[descKey]);
    },
    
    /**
     * Update images with content data
     * @param {Object} data - Content data
     */
    updateImages: function(data) {
        // Map of image elements and their data keys
        const imageMap = {
            "offer1Image": "offer1_image",
            "offer2Image": "offer2_image", 
            "offer3Image": "offer3_image",
            "contactImage": "contact_image"
        };
        
        for (const [elemId, dataKey] of Object.entries(imageMap)) {
            if (data[dataKey] && data[dataKey].url) {
                const imgElement = document.getElementById(elemId);
                if (imgElement) {
                    imgElement.src = data[dataKey].url;
                    if (data[dataKey].alt) {
                        imgElement.alt = data[dataKey].alt;
                    }
                }
            }
        }
    },
    
    /**
     * Render dynamic page content
     * @param {Object} data - Page data
     */
    renderDynamicPage: function(data) {
        // This function would render a dynamic page based on its template
        // It's a placeholder for the actual implementation
        console.log('Rendering dynamic page with data:', data);
    },
    
    /**
     * Handle contact form submission
     * @param {Event} event - Form submit event
     */
    handleContactFormSubmit: function(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Get form elements
        const submitBtn = form.querySelector('[type="submit"]');
        const formMessage = document.getElementById('formMessage');
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Senden...';
        }
        
        if (formMessage) {
            formMessage.style.display = 'none';
        }
        
        // Send form data via fetch API
        fetch(form.action || 'api/contact.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Nachricht senden';
            }
            
            // Handle response
            if (data.success) {
                // Show success message
                if (formMessage) {
                    formMessage.className = 'form-message success';
                    formMessage.textContent = data.message || 'Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei Ihnen melden.';
                    formMessage.style.display = 'block';
                }
                
                // Reset form
                form.reset();
            } else {
                // Show error message
                if (formMessage) {
                    formMessage.className = 'form-message error';
                    formMessage.textContent = data.error || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
                    formMessage.style.display = 'block';
                }
            }
            
            // Scroll to message
            if (formMessage) {
                formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        })
        .catch(error => {
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Nachricht senden';
            }
            
            // Show error message
            if (formMessage) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
                formMessage.style.display = 'block';
            }
            
            ErrorHandler.handleError(error, 'Contact form submission error');
        });
    },
    
    /**
     * Handle login form submission
     * @param {Event} event - Form submit event
     */
    handleLoginFormSubmit: function(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = form.querySelector('#emailField').value.trim();
        const password = form.querySelector('#passField').value;
        const csrfToken = form.querySelector('#csrfToken').value;
        
        // Get form elements
        const submitBtn = form.querySelector('[type="submit"]');
        const loginError = document.getElementById('loginError');
        
        // Validate form data
        if (!email || !password) {
            if (loginError) {
                loginError.textContent = 'Bitte füllen Sie alle Felder aus.';
                loginError.style.display = 'block';
            }
            return;
        }
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
        }
        
        if (loginError) {
            loginError.style.display = 'none';
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('csrf_token', csrfToken);
        
        // Send login request
        fetch('admin.php?action=login', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to admin panel
                window.location.href = 'admin.php';
            } else {
                // Show error message
                if (loginError) {
                    loginError.textContent = data.error || 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
                    loginError.style.display = 'block';
                }
                
                // Reset form
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Anmelden';
                }
                
                form.querySelector('#passField').value = '';
                form.querySelector('#passField').focus();
            }
        })
        .catch(error => {
            // Show error message
            if (loginError) {
                loginError.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
                loginError.style.display = 'block';
            }
            
            // Reset form
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Anmelden';
            }
            
            ErrorHandler.handleError(error, 'Login form submission error');
        });
    },
    
    /**
     * Handle scroll events
     * @param {Event} event - Scroll event
     */
    handleScroll: function(event) {
        // Handle scroll-based functionality like showing/hiding the go-to-top button
        const goTopBtn = document.getElementById('goTopBtn');
        
        if (goTopBtn) {
            if (window.scrollY > 300) {
                goTopBtn.classList.add('visible');
            } else {
                goTopBtn.classList.remove('visible');
            }
        }
        
        // Handle navigation bar styling on scroll
        const navbar = document.getElementById('myNavbar');
        
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
                navbar.classList.add('visible');
            } else {
                navbar.classList.remove('scrolled');
                if (window.scrollY <= 10) {
                    navbar.classList.remove('visible');
                }
            }
        }
        
        // Trigger scroll event for other components
        this.triggerEvent('scroll', { scrollY: window.scrollY });
    },
    
    /**
     * Handle resize events
     * @param {Event} event - Resize event
     */
    handleResize: function(event) {
        // Update state with new window dimensions
        this.state.windowWidth = window.innerWidth;
        this.state.windowHeight = window.innerHeight;
        
        // Trigger resize event for other components
        this.triggerEvent('resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    },
    
    /**
     * Handle visibility change events
     * @param {Event} event - Visibility change event
     */
    handleVisibilityChange: function(event) {
        if (document.visibilityState === 'visible') {
            // Page is now visible, refresh content if needed
            this.triggerEvent('visibilityVisible');
        } else {
            // Page is now hidden
            this.triggerEvent('visibilityHidden');
        }
    },
    
    /**
     * Trigger a custom event
     * @param {string} eventName - Name of the event
     * @param {Object} data - Event data
     */
    triggerEvent: function(eventName, data = {}) {
        const event = new CustomEvent('app:' + eventName, { detail: data });
        document.dispatchEvent(event);
    },
    
    /**
     * Debounce a function to prevent excessive calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get configuration from global variable or use defaults
    const config = window.mannarConfig || {};
    
    // Initialize the application
    App.init({
        debug: config.debug || false,
        enableContentCaching: config.enableContentCaching || true,
        authEnabled: config.authEnabled || false,
        uploadEnabled: config.uploadEnabled || false,
        cloudinaryEnabled: config.cloudinaryEnabled || false,
        cloudinaryConfig: config.cloudinaryConfig || null,
        
        // Firebase configuration
        firebaseApiKey: config.firebaseApiKey,
        firebaseAuthDomain: config.firebaseAuthDomain,
        firebaseProjectId: config.firebaseProjectId,
        firebaseStorageBucket: config.firebaseStorageBucket,
        firebaseMessagingSenderId: config.firebaseMessagingSenderId,
        firebaseAppId: config.firebaseAppId,
        firebaseMeasurementId: config.firebaseMeasurementId
    });
});

// Export the App namespace
export default App;