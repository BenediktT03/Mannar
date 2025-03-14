/**
 * Error Handler Module
 * 
 * Provides centralized error handling for the Mannar website.
 * Handles logging, displaying user-friendly messages, and error reporting.
 * 
 * @module ErrorHandler
 */

/**
 * Error Handler namespace
 */
export const ErrorHandler = {
    /**
     * Configuration options
     */
    config: {
        logErrors: true,          // Whether to log errors to console
        showErrors: false,        // Whether to show error messages to users
        reportErrors: false,      // Whether to report errors to an error tracking service
        errorReportingEndpoint: null, // Endpoint for error reporting
        stackTraceLimit: 10,      // Limit of stack trace lines
        ignoredErrors: [          // Errors to ignore
            'ResizeObserver loop limit exceeded',
            'Script error.',
            'Request aborted'
        ]
    },
    
    /**
     * Initialize the error handler
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
        // Merge options with default config
        this.config = { ...this.config, ...options };
        
        // Set up global error handling
        this.setupGlobalErrorHandling();
        
        console.log('Error handler initialized', this.config.showErrors ? 'with error display enabled' : 'in silent mode');
    },
    
    /**
     * Set up global error event listeners
     */
    setupGlobalErrorHandling: function() {
        // Handle unhandled errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event);
        });
    },
    
    /**
     * Handle a global error event
     * @param {ErrorEvent} event - Error event
     */
    handleGlobalError: function(event) {
        // Ignore some non-critical errors
        if (this.shouldIgnoreError(event.error || event.message)) {
            return;
        }
        
        const errorInfo = {
            message: event.message || 'Unknown error',
            fileName: event.filename || 'Unknown file',
            lineNumber: event.lineno || 'Unknown line',
            columnNumber: event.colno || 'Unknown column',
            stack: event.error ? this.formatStack(event.error.stack) : null,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.processError(errorInfo);
    },
    
    /**
     * Handle an unhandled promise rejection
     * @param {PromiseRejectionEvent} event - Promise rejection event
     */
    handleUnhandledRejection: function(event) {
        // Ignore some non-critical errors
        if (this.shouldIgnoreError(event.reason)) {
            return;
        }
        
        const reason = event.reason;
        const errorInfo = {
            message: reason instanceof Error ? reason.message : String(reason),
            stack: reason instanceof Error ? this.formatStack(reason.stack) : null,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            type: 'unhandled_promise_rejection'
        };
        
        this.processError(errorInfo);
    },
    
    /**
     * Handle a caught error
     * @param {Error|Object|string} error - Error object or message
     * @param {string} context - Error context description
     * @param {Object} additionalInfo - Additional information about the error
     */
    handleError: function(error, context = 'Application error', additionalInfo = {}) {
        // Ignore some non-critical errors
        if (this.shouldIgnoreError(error)) {
            return;
        }
        
        const errorInfo = {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? this.formatStack(error.stack) : null,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...additionalInfo
        };
        
        this.processError(errorInfo);
    },
    
    /**
     * Process an error by logging, showing, and reporting it
     * @param {Object} errorInfo - Error information
     */
    processError: function(errorInfo) {
        // Log the error
        if (this.config.logErrors) {
            this.logError(errorInfo);
        }
        
        // Show error to user
        if (this.config.showErrors) {
            this.showError(errorInfo.message, errorInfo.context);
        }
        
        // Report error to error tracking service
        if (this.config.reportErrors && this.config.errorReportingEndpoint) {
            this.reportError(errorInfo);
        }
    },
    
    /**
     * Log error to console
     * @param {Object} errorInfo - Error information
     */
    logError: function(errorInfo) {
        console.group('Error: ' + (errorInfo.context || 'Application error'));
        console.error(errorInfo.message);
        
        if (errorInfo.stack) {
            console.error('Stack trace:');
            console.error(errorInfo.stack);
        }
        
        console.info('Additional information:', {
            url: errorInfo.url,
            timestamp: errorInfo.timestamp,
            userAgent: errorInfo.userAgent,
            ...errorInfo
        });
        
        console.groupEnd();
    },
    
    /**
     * Show error message to user
     * @param {string} message - Error message
     * @param {string} [context] - Error context
     */
    showError: function(message, context = null) {
        // Create or get error message container
        let statusMsg = document.getElementById('statusMsg');
        if (!statusMsg) {
            statusMsg = document.createElement('div');
            statusMsg.id = 'statusMsg';
            statusMsg.className = 'status-msg';
            statusMsg.setAttribute('role', 'alert');
            document.body.appendChild(statusMsg);
        }
        
        // Set error message with context
        statusMsg.textContent = context ? `${context}: ${message}` : message;
        statusMsg.className = 'status-msg error show';
        
        // Hide message after delay
        setTimeout(() => {
            statusMsg.classList.remove('show');
        }, 5000);
    },
    
    /**
     * Report error to error tracking service
     * @param {Object} errorInfo - Error information
     */
    reportError: function(errorInfo) {
        if (!this.config.errorReportingEndpoint) {
            return;
        }
        
        // Send error information to reporting endpoint
        fetch(this.config.errorReportingEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorInfo),
            // Use keepalive to ensure the request completes even if page navigates away
            keepalive: true
        }).catch(error => {
            // Note: we intentionally don't handle this error to avoid infinite loops
            console.warn('Failed to report error:', error.message);
        });
    },
    
    /**
     * Format error stack trace
     * @param {string} stack - Error stack trace
     * @returns {string} Formatted stack trace
     */
    formatStack: function(stack) {
        if (!stack) {
            return null;
        }
        
        // Split stack into lines
        const lines = stack.split('\n');
        
        // Limit number of lines
        const limitedLines = lines.slice(0, this.config.stackTraceLimit);
        
        // Join lines back into a string
        return limitedLines.join('\n');
    },
    
    /**
     * Check if an error should be ignored
     * @param {Error|string} error - Error to check
     * @returns {boolean} True if error should be ignored
     */
    shouldIgnoreError: function(error) {
        if (!error) {
            return false;
        }
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Check against ignored errors list
        return this.config.ignoredErrors.some(ignoredError => {
            return errorMessage.includes(ignoredError);
        });
    },
    
    /**
     * Show a success message to the user
     * @param {string} message - Success message
     */
    showSuccess: function(message) {
        // Create or get status message container
        let statusMsg = document.getElementById('statusMsg');
        if (!statusMsg) {
            statusMsg = document.createElement('div');
            statusMsg.id = 'statusMsg';
            statusMsg.className = 'status-msg';
            statusMsg.setAttribute('role', 'alert');
            document.body.appendChild(statusMsg);
        }
        
        // Set success message
        statusMsg.textContent = message;
        statusMsg.className = 'status-msg success show';
        
        // Hide message after delay
        setTimeout(() => {
            statusMsg.classList.remove('show');
        }, 3000);
    }
};

// Export the ErrorHandler module
export default ErrorHandler;