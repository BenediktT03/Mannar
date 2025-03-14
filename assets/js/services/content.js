/**
 * Content Service
 * 
 * Manages content loading, caching, and updating for the Mannar website.
 * Interacts with Firebase Firestore to fetch and store content data.
 * 
 * @module ContentService
 */

/**
 * Content Service namespace
 */
export const ContentService = {
    /**
     * Service configuration
     */
    config: {
        firebaseService: null,    // Reference to Firebase service
        enableCaching: true,      // Whether to cache content
        cacheLifetime: 3600,      // Cache lifetime in seconds (1 hour)
        defaultCollection: 'content'  // Default Firestore collection
    },
    
    /**
     * Cache storage
     */
    cache: {
        main: null,               // Main content
        draft: null,              // Draft content
        pages: {},                // Individual pages
        wordCloud: null,          // Word cloud data
        settings: null,           // Global settings
        expires: {}               // Cache expiration timestamps
    },
    
    /**
     * Initialize the content service
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
        // Merge options with default config
        this.config = { ...this.config, ...options };
        
        console.log('Content service initialized', 
            this.config.enableCaching ? 'with caching enabled' : 'without caching');
    },
    
    /**
     * Load main website content
     * @param {string} contentType - Content type (main or draft)
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Object>} Content data
     */
    loadContent: async function(contentType = 'main', useCache = true) {
        // Check cache first if enabled and requested
        if (this.config.enableCaching && useCache && this.cache[contentType] && 
            this.cache.expires[contentType] && this.cache.expires[contentType] > Date.now()) {
            console.log(`Using cached ${contentType} content`);
            return this.cache[contentType];
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection(this.config.defaultCollection).doc(contentType);
            
            // Get document data
            const doc = await docRef.get();
            
            if (!doc.exists) {
                console.warn(`Content document '${contentType}' not found`);
                return null;
            }
            
            const data = doc.data();
            
            // Cache the content if caching is enabled
            if (this.config.enableCaching) {
                this.cache[contentType] = data;
                this.cache.expires[contentType] = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return data;
        } catch (error) {
            console.error('Error loading content:', error);
            throw error;
        }
    },
    
    /**
     * Save main website content
     * @param {Object} data - Content data to save
     * @param {boolean} isDraft - Whether to save as draft
     * @returns {Promise<boolean>} Success status
     */
    saveContent: async function(data, isDraft = true) {
        if (!data) {
            return false;
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            const contentType = isDraft ? 'draft' : 'main';
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection(this.config.defaultCollection).doc(contentType);
            
            // Add timestamp
            data.lastUpdated = new Date();
            
            // Save to Firestore
            await docRef.set(data, { merge: true });
            
            // Update cache
            if (this.config.enableCaching) {
                this.cache[contentType] = data;
                this.cache.expires[contentType] = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving content:', error);
            throw error;
        }
    },
    
    /**
     * Publish draft content to live website
     * @returns {Promise<boolean>} Success status
     */
    publishDraftContent: async function() {
        try {
            // Load draft content
            const draftContent = await this.loadContent('draft', false);
            
            if (!draftContent) {
                throw new Error('No draft content to publish');
            }
            
            // Save draft as main content
            const success = await this.saveContent(draftContent, false);
            
            return success;
        } catch (error) {
            console.error('Error publishing draft content:', error);
            throw error;
        }
    },
    
    /**
     * Load a page by ID
     * @param {string} pageId - Page ID
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Object>} Page data
     */
    loadPage: async function(pageId, useCache = true) {
        if (!pageId) {
            return null;
        }
        
        // Check cache first if enabled and requested
        if (this.config.enableCaching && useCache && 
            this.cache.pages[pageId] && 
            this.cache.expires[`page_${pageId}`] && 
            this.cache.expires[`page_${pageId}`] > Date.now()) {
            console.log(`Using cached page: ${pageId}`);
            return this.cache.pages[pageId];
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection('pages').doc(pageId);
            
            // Get document data
            const doc = await docRef.get();
            
            if (!doc.exists) {
                console.warn(`Page '${pageId}' not found`);
                return null;
            }
            
            const data = {
                id: pageId,
                ...doc.data()
            };
            
            // Format timestamps
            if (data.created && data.created.toDate) {
                data.created = data.created.toDate();
            }
            
            if (data.updated && data.updated.toDate) {
                data.updated = data.updated.toDate();
            }
            
            // Cache the page if caching is enabled
            if (this.config.enableCaching) {
                this.cache.pages[pageId] = data;
                this.cache.expires[`page_${pageId}`] = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return data;
        } catch (error) {
            console.error(`Error loading page ${pageId}:`, error);
            throw error;
        }
    },
    
    /**
     * Load all pages
     * @param {Object} options - Query options
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Array>} Array of pages
     */
    loadAllPages: async function(options = {}, useCache = false) {
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            let query = db.collection('pages');
            
            // Apply options
            if (options.orderBy) {
                const direction = options.orderDirection || 'asc';
                query = query.orderBy(options.orderBy, direction);
            } else {
                // Default order by title
                query = query.orderBy('title');
            }
            
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            // Execute query
            const snapshot = await query.get();
            
            const pages = [];
            
            snapshot.forEach(doc => {
                const pageId = doc.id;
                const pageData = doc.data();
                
                // Format timestamps
                if (pageData.created && pageData.created.toDate) {
                    pageData.created = pageData.created.toDate();
                }
                
                if (pageData.updated && pageData.updated.toDate) {
                    pageData.updated = pageData.updated.toDate();
                }
                
                // Add page to result
                const pageWithId = {
                    id: pageId,
                    ...pageData
                };
                
                pages.push(pageWithId);
                
                // Cache the page if caching is enabled
                if (this.config.enableCaching) {
                    this.cache.pages[pageId] = pageWithId;
                    this.cache.expires[`page_${pageId}`] = Date.now() + (this.config.cacheLifetime * 1000);
                }
            });
            
            return pages;
        } catch (error) {
            console.error('Error loading pages:', error);
            throw error;
        }
    },
    
    /**
     * Save a page
     * @param {string} pageId - Page ID
     * @param {Object} data - Page data
     * @returns {Promise<boolean>} Success status
     */
    savePage: async function(pageId, data) {
        if (!pageId || !data) {
            return false;
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection('pages').doc(pageId);
            
            // Add/update timestamps
            if (!data.created) {
                data.created = new Date();
            }
            
            data.updated = new Date();
            
            // Save to Firestore
            await docRef.set(data, { merge: true });
            
            // Update cache
            if (this.config.enableCaching) {
                const pageWithId = {
                    id: pageId,
                    ...data
                };
                
                this.cache.pages[pageId] = pageWithId;
                this.cache.expires[`page_${pageId}`] = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return true;
        } catch (error) {
            console.error(`Error saving page ${pageId}:`, error);
            throw error;
        }
    },
    
    /**
     * Delete a page
     * @param {string} pageId - Page ID
     * @returns {Promise<boolean>} Success status
     */
    deletePage: async function(pageId) {
        if (!pageId) {
            return false;
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection('pages').doc(pageId);
            
            // Delete from Firestore
            await docRef.delete();
            
            // Remove from cache
            if (this.config.enableCaching && this.cache.pages[pageId]) {
                delete this.cache.pages[pageId];
                delete this.cache.expires[`page_${pageId}`];
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting page ${pageId}:`, error);
            throw error;
        }
    },
    
    /**
     * Load word cloud data
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Array>} Word cloud data
     */
    loadWordCloud: async function(useCache = true) {
        // Check cache first if enabled and requested
        if (this.config.enableCaching && useCache && 
            this.cache.wordCloud && 
            this.cache.expires.wordCloud && 
            this.cache.expires.wordCloud > Date.now()) {
            console.log('Using cached word cloud');
            return this.cache.wordCloud;
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection(this.config.defaultCollection).doc('wordCloud');
            
            // Get document data
            const doc = await docRef.get();
            
            if (!doc.exists) {
                console.warn('Word cloud document not found');
                return [];
            }
            
            const data = doc.data();
            const words = data.words || [];
            
            // Cache the word cloud if caching is enabled
            if (this.config.enableCaching) {
                this.cache.wordCloud = words;
                this.cache.expires.wordCloud = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return words;
        } catch (error) {
            console.error('Error loading word cloud:', error);
            throw error;
        }
    },
    
    /**
     * Save word cloud data
     * @param {Array} words - Word cloud data
     * @returns {Promise<boolean>} Success status
     */
    saveWordCloud: async function(words) {
        if (!Array.isArray(words)) {
            return false;
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection(this.config.defaultCollection).doc('wordCloud');
            
            // Save to Firestore
            await docRef.set({
                words: words,
                lastUpdated: new Date()
            });
            
            // Update cache
            if (this.config.enableCaching) {
                this.cache.wordCloud = words;
                this.cache.expires.wordCloud = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving word cloud:', error);
            throw error;
        }
    },
    
    /**
     * Get global settings
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Object>} Settings data
     */
    getGlobalSettings: async function(useCache = true) {
        // Check cache first if enabled and requested
        if (this.config.enableCaching && useCache && 
            this.cache.settings && 
            this.cache.expires.settings && 
            this.cache.expires.settings > Date.now()) {
            console.log('Using cached settings');
            return this.cache.settings;
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection('settings').doc('global');
            
            // Get document data
            const doc = await docRef.get();
            
            if (!doc.exists) {
                console.warn('Settings document not found');
                return {};
            }
            
            const data = doc.data();
            
            // Cache the settings if caching is enabled
            if (this.config.enableCaching) {
                this.cache.settings = data;
                this.cache.expires.settings = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return data;
        } catch (error) {
            console.error('Error loading settings:', error);
            throw error;
        }
    },
    
    /**
     * Save global settings
     * @param {Object} settings - Settings data
     * @returns {Promise<boolean>} Success status
     */
    saveGlobalSettings: async function(settings) {
        if (!settings || typeof settings !== 'object') {
            return false;
        }
        
        try {
            // Ensure Firebase service is available
            if (!this.config.firebaseService || !this.config.firebaseService.firestore) {
                throw new Error('Firebase service not initialized');
            }
            
            // Get Firestore reference
            const db = this.config.firebaseService.firestore();
            const docRef = db.collection('settings').doc('global');
            
            // Add timestamp
            settings.lastUpdated = new Date();
            
            // Save to Firestore
            await docRef.set(settings, { merge: true });
            
            // Update cache
            if (this.config.enableCaching) {
                this.cache.settings = settings;
                this.cache.expires.settings = Date.now() + (this.config.cacheLifetime * 1000);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },
    
    /**
     * Clear content cache
     * @param {string} cacheType - Type of cache to clear (null for all)
     */
    clearCache: function(cacheType = null) {
        if (cacheType) {
            if (cacheType === 'pages') {
                this.cache.pages = {};
                
                // Clear page-specific expiration timestamps
                for (const key in this.cache.expires) {
                    if (key.startsWith('page_')) {
                        delete this.cache.expires[key];
                    }
                }
            } else {
                this.cache[cacheType] = null;
                delete this.cache.expires[cacheType];
            }
        } else {
            // Clear all caches
            this.cache = {
                main: null,
                draft: null,
                pages: {},
                wordCloud: null,
                settings: null,
                expires: {}
            };
        }
        
        console.log(`Cache cleared: ${cacheType || 'all'}`);
    }
};

// Export the ContentService module
export default ContentService;