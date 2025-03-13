/**
 * Firebase Service
 * Centralized service for Firebase operations
 */
const FirebaseService = (function() {
  // Configuration
  const config = {
    apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    authDomain: "mannar-129a5.firebaseapp.com",
    projectId: "mannar-129a5",
    storageBucket: "mannar-129a5.firebasestorage.app",
    messagingSenderId: "687710492532",
    appId: "1:687710492532:web:c7b675da541271f8d83e21",
    measurementId: "G-NXBLYJ5CXL"
  };
  
  // Firebase instances
  let app, db, auth, storage;
  
  // Initialization state
  let initialized = false;
  
  /**
   * Initialize Firebase if not already initialized
   * @returns {boolean} True if initialization successful
   */
  function init() {
    if (initialized) return true;
    
    try {
      // Check if Firebase is available
      if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
      }
      
      // Initialize Firebase app
      if (!firebase.apps.length) {
        app = firebase.initializeApp(config);
      } else {
        app = firebase.app();
      }
      
      // Initialize services
      db = firebase.firestore();
      auth = firebase.auth();
      storage = firebase.storage();
      
      // Set initialization flag
      initialized = true;
      
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return false;
    }
  }
  
  /**
   * Get Firestore database instance
   * @returns {Object|null} Firestore instance or null if not initialized
   */
  function getFirestore() {
    if (!initialized) {
      if (!init()) {
        return null;
      }
    }
    
    return db;
  }
  
  /**
   * Get Auth instance
   * @returns {Object|null} Auth instance or null if not initialized
   */
  function getAuth() {
    if (!initialized) {
      if (!init()) {
        return null;
      }
    }
    
    return auth;
  }
  
  /**
   * Get Storage instance
   * @returns {Object|null} Storage instance or null if not initialized
   */
  function getStorage() {
    if (!initialized) {
      if (!init()) {
        return null;
      }
    }
    
    return storage;
  }
  
  /**
   * Get document data from Firestore
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<Object|null>} Document data or null if not found
   */
  async function getDocument(collectionName, docId) {
    if (!initialized) {
      if (!init()) {
        return null;
      }
    }
    
    try {
      const docRef = db.collection(collectionName).doc(docId);
      const doc = await docRef.get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        console.warn(`Document ${docId} not found in ${collectionName}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      return null;
    }
  }
  
  /**
   * Set document data in Firestore
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @param {Object} data - Document data
   * @param {boolean} merge - Whether to merge with existing data
   * @returns {Promise<boolean>} True if successful
   */
  async function setDocument(collectionName, docId, data, merge = true) {
    if (!initialized) {
      if (!init()) {
        return false;
      }
    }
    
    try {
      // Add server timestamp
      const dataWithTimestamp = {
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Set the document
      await db.collection(collectionName).doc(docId).set(dataWithTimestamp, { merge });
      
      return true;
    } catch (error) {
      console.error(`Error setting document ${docId} in ${collectionName}:`, error);
      return false;
    }
  }
  
  /**
   * Get documents from a collection
   * @param {string} collectionName - Collection name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of documents
   */
  async function getCollection(collectionName, options = {}) {
    if (!initialized) {
      if (!init()) {
        return [];
      }
    }
    
    try {
      let query = db.collection(collectionName);
      
      // Apply where clauses
      if (options.where && Array.isArray(options.where)) {
        options.where.forEach(([field, operator, value]) => {
          query = query.where(field, operator, value);
        });
      }
      
      // Apply order by
      if (options.orderBy) {
        if (Array.isArray(options.orderBy)) {
          options.orderBy.forEach(([field, direction = 'asc']) => {
            query = query.orderBy(field, direction);
          });
        } else {
          query = query.orderBy(options.orderBy);
        }
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Execute query
      const snapshot = await query.get();
      
      const results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return results;
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      return [];
    }
  }
  
  /**
   * Delete a document from Firestore
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<boolean>} True if successful
   */
  async function deleteDocument(collectionName, docId) {
    if (!initialized) {
      if (!init()) {
        return false;
      }
    }
    
    try {
      await db.collection(collectionName).doc(docId).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      return false;
    }
  }
  
  /**
   * Upload file to Firebase Storage
   * @param {File} file - File to upload
   * @param {string} path - Storage path
   * @param {Object} metadata - File metadata
   * @returns {Promise<Object>} Upload result
   */
  async function uploadFile(file, path, metadata = {}) {
    if (!initialized) {
      if (!init()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(path);
      
      // Upload file
      const snapshot = await fileRef.put(file, metadata);
      
      // Get download URL
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      return {
        url: downloadURL,
        path,
        metadata: snapshot.metadata
      };
    } catch (error) {
      console.error(`Error uploading file to ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * Download file from Firebase Storage
   * @param {string} path - Storage path
   * @returns {Promise<Blob>} File data
   */
  async function downloadFile(path) {
    if (!initialized) {
      if (!init()) {
        throw new Error('Firebase not initialized');
      }
    }
    
    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(path);
      
      // Get download URL
      const url = await fileRef.getDownloadURL();
      
      // Fetch file
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Get blob
      const blob = await response.blob();
      
      return blob;
    } catch (error) {
      console.error(`Error downloading file from ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete file from Firebase Storage
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} True if successful
   */
  async function deleteFile(path) {
    if (!initialized) {
      if (!init()) {
        return false;
      }
    }
    
    try {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(path);
      
      await fileRef.delete();
      
      return true;
    } catch (error) {
      console.error(`Error deleting file from ${path}:`, error);
      return false;
    }
  }
  
  /**
   * Get document with real-time updates
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  function listenDocument(collectionName, docId, callback) {
    if (!initialized) {
      if (!init()) {
        return () => {};
      }
    }
    
    try {
      const unsubscribe = db.collection(collectionName).doc(docId).onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({
              id: doc.id,
              ...doc.data()
            });
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error(`Error listening to document ${docId} in ${collectionName}:`, error);
          callback(null, error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up listener for document ${docId} in ${collectionName}:`, error);
      return () => {};
    }
  }
  
  /**
   * Get collection with real-time updates
   * @param {string} collectionName - Collection name
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  function listenCollection(collectionName, options = {}, callback) {
    if (!initialized) {
      if (!init()) {
        return () => {};
      }
    }
    
    try {
      let query = db.collection(collectionName);
      
      // Apply where clauses
      if (options.where && Array.isArray(options.where)) {
        options.where.forEach(([field, operator, value]) => {
          query = query.where(field, operator, value);
        });
      }
      
      // Apply order by
      if (options.orderBy) {
        if (Array.isArray(options.orderBy)) {
          options.orderBy.forEach(([field, direction = 'asc']) => {
            query = query.orderBy(field, direction);
          });
        } else {
          query = query.orderBy(options.orderBy);
        }
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Set up listener
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          const results = [];
          snapshot.forEach((doc) => {
            results.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          callback(results);
        },
        (error) => {
          console.error(`Error listening to collection ${collectionName}:`, error);
          callback([], error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up listener for collection ${collectionName}:`, error);
      return () => {};
    }
  }
  
  /**
   * Batch write operations
   * @param {Array} operations - Array of operations
   * @returns {Promise<boolean>} True if successful
   */
  async function batchWrite(operations) {
    if (!initialized) {
      if (!init()) {
        return false;
      }
    }
    
    try {
      const batch = db.batch();
      
      // Process operations
      operations.forEach((op) => {
        const { type, collection, doc, data } = op;
        
        const docRef = db.collection(collection).doc(doc);
        
        switch (type) {
          case 'set':
            batch.set(docRef, data, op.options || {});
            break;
            
          case 'update':
            batch.update(docRef, data);
            break;
            
          case 'delete':
            batch.delete(docRef);
            break;
            
          default:
            console.warn(`Unknown batch operation type: ${type}`);
        }
      });
      
      // Commit batch
      await batch.commit();
      
      return true;
    } catch (error) {
      console.error('Error performing batch write:', error);
      return false;
    }
  }
  
  // Initialize Firebase when service is loaded
  init();
  
  // Public API
  return {
    init,
    getFirestore,
    getAuth,
    getStorage,
    getDocument,
    setDocument,
    getCollection,
    deleteDocument,
    uploadFile,
    downloadFile,
    deleteFile,
    listenDocument,
    listenCollection,
    batchWrite
  };
})();

// Make service globally available
window.FirebaseService = FirebaseService;