/**
 * Firebase Service
 * 
 * Provides a centralized service for interacting with Firebase services
 * including Firestore, Authentication, and Storage.
 * 
 * @module FirebaseService
 */

/**
 * Firebase Service namespace
 */
export const FirebaseService = {
    /**
     * Firebase app instance
     */
    app: null,
    
    /**
     * Firebase Firestore instance
     */
    _firestore: null,
    
    /**
     * Firebase Auth instance
     */
    _auth: null,
    
    /**
     * Firebase Storage instance
     */
    _storage: null,
    
    /**
     * Configuration options
     */
    config: {
        apiKey: null,
        authDomain: null,
        projectId: null,
        storageBucket: null,
        messagingSenderId: null,
        appId: null,
        measurementId: null
    },
    
    /**
     * Initialize Firebase service
     * @param {Object} config - Firebase configuration
     */
    init: function(config = {}) {
        // Merge configuration with defaults
        this.config = { ...this.config, ...config };
        
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded');
            return;
        }
        
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            this.app = firebase.initializeApp(this.config);
        } else {
            this.app = firebase.apps[0];
        }
        
        console.log('Firebase Service initialized');
    },
    
    /**
     * Get Firestore instance
     * @returns {Object} Firestore instance
     */
    firestore: function() {
        if (!this._firestore) {
            if (!this.app) {
                console.error('Firebase not initialized. Call init() first.');
                return null;
            }
            
            this._firestore = firebase.firestore(this.app);
        }
        
        return this._firestore;
    },
    
    /**
     * Get Auth instance
     * @returns {Object} Auth instance
     */
    auth: function() {
        if (!this._auth) {
            if (!this.app) {
                console.error('Firebase not initialized. Call init() first.');
                return null;
            }
            
            this._auth = firebase.auth(this.app);
        }
        
        return this._auth;
    },
    
    /**
     * Get Storage instance
     * @returns {Object} Storage instance
     */
    storage: function() {
        if (!this._storage) {
            if (!this.app) {
                console.error('Firebase not initialized. Call init() first.');
                return null;
            }
            
            this._storage = firebase.storage(this.app);
        }
        
        return this._storage;
    },
    
    /**
     * Content-related methods
     */
    content: {
        /**
         * Load content document from Firestore
         * @param {string} contentPath - Content document path
         * @returns {Promise<Object>} Content data
         */
        load: async function(contentPath) {
            try {
                const db = FirebaseService.firestore();
                if (!db) return null;
                
                // Split path into collection and document ID
                const [collection, docId] = contentPath.split('/');
                
                const docRef = db.collection(collection).doc(docId);
                const doc = await docRef.get();
                
                if (!doc.exists) {
                    console.warn(`Document not found: ${contentPath}`);
                    return null;
                }
                
                return doc.data();
            } catch (error) {
                console.error(`Error loading content ${contentPath}:`, error);
                throw error;
            }
        },
        
        /**
         * Save content document to Firestore
         * @param {string} contentPath - Content document path
         * @param {Object} data - Content data
         * @param {boolean} merge - Whether to merge with existing data
         * @returns {Promise<boolean>} Success status
         */
        save: async function(contentPath, data, merge = true) {
            try {
                const db = FirebaseService.firestore();
                if (!db) return false;
                
                // Split path into collection and document ID
                const [collection, docId] = contentPath.split('/');
                
                // Add timestamp
                data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                
                const docRef = db.collection(collection).doc(docId);
                await docRef.set(data, { merge });
                
                return true;
            } catch (error) {
                console.error(`Error saving content ${contentPath}:`, error);
                throw error;
            }
        },
        
        /**
         * Delete content document from Firestore
         * @param {string} contentPath - Content document path
         * @returns {Promise<boolean>} Success status
         */
        delete: async function(contentPath) {
            try {
                const db = FirebaseService.firestore();
                if (!db) return false;
                
                // Split path into collection and document ID
                const [collection, docId] = contentPath.split('/');
                
                const docRef = db.collection(collection).doc(docId);
                await docRef.delete();
                
                return true;
            } catch (error) {
                console.error(`Error deleting content ${contentPath}:`, error);
                throw error;
            }
        }
    },
    
    /**
     * Pages-related methods
     */
    pages: {
        /**
         * Get a page by ID
         * @param {string} pageId - Page ID
         * @returns {Promise<Object>} Page data
         */
        get: async function(pageId) {
            try {
                const db = FirebaseService.firestore();
                if (!db) return null;
                
                const docRef = db.collection('pages').doc(pageId);
                const doc = await docRef.get();
                
                if (!doc.exists) {
                    console.warn(`Page not found: ${pageId}`);
                    return null;
                }
                
                const data = doc.data();
                
                // Add the ID to the data
                return {
                    id: pageId,
                    ...data
                };
            } catch (error) {
                console.error(`Error getting page ${pageId}:`, error);
                throw error;
            }
        },
        
        /**
         * Get all pages
         * @param {Object} options - Query options
         * @returns {Promise<Array>} Array of pages
         */
        getAll: async function(options = {}) {
            try {
                const db = FirebaseService.firestore();
                if (!db) return [];
                
                let query = db.collection('pages');
                
                // Apply options
                if (options.orderBy) {
                    query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
                }
                
                if (options.limit) {
                    query = query.limit(options.limit);
                }
                
                if (options.where) {
                    options.where.forEach(condition => {
                        query = query.where(condition.field, condition.operator, condition.value);
                    });
                }
                
                const snapshot = await query.get();
                
                const pages = [];
                
                snapshot.forEach(doc => {
                    pages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                return pages;
            } catch (error) {
                console.error('Error getting pages:', error);
                throw error;
            }
        },
        
        /**
         * Save a page
         * @param {string} pageId - Page ID
         * @param {Object} data - Page data
         * @param {boolean} merge - Whether to merge with existing data
         * @returns {Promise<boolean>} Success status
         */
        save: async function(pageId, data, merge = true) {
            try {
                const db = FirebaseService.firestore();
                if (!db) return false;
                
                // Add timestamps
                if (!data.created) {
                    data.created = firebase.firestore.FieldValue.serverTimestamp();
                }
                
                data.updated = firebase.firestore.FieldValue.serverTimestamp();
                
                const docRef = db.collection('pages').doc(pageId);
                await docRef.set(data, { merge });
                
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
        delete: async function(pageId) {
            try {
                const db = FirebaseService.firestore();
                if (!db) return false;
                
                const docRef = db.collection('pages').doc(pageId);
                await docRef.delete();
                
                return true;
            } catch (error) {
                console.error(`Error deleting page ${pageId}:`, error);
                throw error;
            }
        }
    },
    
    /**
     * Auth-related methods
     */
    userAuth: {
        /**
         * Sign in with email and password
         * @param {string} email - User email
         * @param {string} password - User password
         * @returns {Promise<Object>} User data
         */
        signIn: async function(email, password) {
            try {
                const auth = FirebaseService.auth();
                if (!auth) return null;
                
                const result = await auth.signInWithEmailAndPassword(email, password);
                return result.user;
            } catch (error) {
                console.error('Error signing in:', error);
                throw error;
            }
        },
        
        /**
         * Sign out current user
         * @returns {Promise<void>}
         */
        signOut: async function() {
            try {
                const auth = FirebaseService.auth();
                if (!auth) return;
                
                await auth.signOut();
            } catch (error) {
                console.error('Error signing out:', error);
                throw error;
            }
        },
        
        /**
         * Get current authenticated user
         * @returns {Object|null} Current user or null if not authenticated
         */
        getCurrentUser: function() {
            const auth = FirebaseService.auth();
            if (!auth) return null;
            
            return auth.currentUser;
        },
        
        /**
         * Check if a user is authenticated
         * @returns {boolean} True if user is authenticated
         */
        isAuthenticated: function() {
            const user = this.getCurrentUser();
            return user !== null;
        },
        
        /**
         * Listen for auth state changes
         * @param {Function} callback - Callback function
         * @returns {Function} Unsubscribe function
         */
        onAuthStateChanged: function(callback) {
            const auth = FirebaseService.auth();
            if (!auth) return () => {};
            
            return auth.onAuthStateChanged(callback);
        }
    },
    
    /**
     * Storage-related methods
     */
    fileStorage: {
        /**
         * Upload a file to Firebase Storage
         * @param {File} file - File to upload
         * @param {string} path - Storage path
         * @param {Object} metadata - File metadata
         * @returns {Promise<Object>} Upload result
         */
        uploadFile: async function(file, path, metadata = {}) {
            try {
                const storage = FirebaseService.storage();
                if (!storage) return null;
                
                const storageRef = storage.ref();
                const fileRef = storageRef.child(path);
                
                // Start upload
                const snapshot = await fileRef.put(file, metadata);
                
                // Get download URL
                const downloadURL = await snapshot.ref.getDownloadURL();
                
                return {
                    path: path,
                    url: downloadURL,
                    metadata: snapshot.metadata
                };
            } catch (error) {
                console.error(`Error uploading file to ${path}:`, error);
                throw error;
            }
        },
        
        /**
         * Delete a file from Firebase Storage
         * @param {string} path - Storage path
         * @returns {Promise<boolean>} Success status
         */
        deleteFile: async function(path) {
            try {
                const storage = FirebaseService.storage();
                if (!storage) return false;
                
                const storageRef = storage.ref();
                const fileRef = storageRef.child(path);
                
                await fileRef.delete();
                
                return true;
            } catch (error) {
                console.error(`Error deleting file ${path}:`, error);
                throw error;
            }
        },
        
        /**
         * Get download URL for a file
         * @param {string} path - Storage path
         * @returns {Promise<string>} Download URL
         */
        getDownloadURL: async function(path) {
            try {
                const storage = FirebaseService.storage();
                if (!storage) return null;
                
                const storageRef = storage.ref();
                const fileRef = storageRef.child(path);
                
                return await fileRef.getDownloadURL();
            } catch (error) {
                console.error(`Error getting download URL for ${path}:`, error);
                throw error;
            }
        }
    }
};

// Export the FirebaseService module
export default FirebaseService;