// Create new file: src/assets/js/services/firebase.js

/**
 * Firebase Service - Centralized Firebase functionality
 */
const FirebaseService = (function() {
  // Firebase config - move to environment variables in production
  const CONFIG = {
    apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    authDomain: "mannar-129a5.firebaseapp.com",
    projectId: "mannar-129a5",
    storageBucket: "mannar-129a5.firebasestorage.app",
    messagingSenderId: "687710492532",
    appId: "1:687710492532:web:c7b675da541271f8d83e21",
    measurementId: "G-NXBLYJ5CXL"
  };

  // Service instances
  let app, db, auth, storage;
  
  // Initialize Firebase
  function init() {
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not found');
      return null;
    }
    
    if (firebase.apps.length === 0) {
      app = firebase.initializeApp(CONFIG);
    } else {
      app = firebase.app();
    }
    
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    
    return { app, db, auth, storage };
  }
  
  // Content operations
  const content = {
    load: async function(path, isDraft = true) {
      const docPath = path || `content/${isDraft ? "draft" : "main"}`;
      const [collection, doc] = docPath.split('/');
      
      try {
        const snapshot = await db.collection(collection).doc(doc).get();
        return snapshot.exists ? snapshot.data() : null;
      } catch (error) {
        console.error(`Error loading content from ${docPath}:`, error);
        return null;
      }
    },
    
    save: async function(path, data, merge = true) {
      const [collection, doc] = path.split('/');
      
      // Add timestamp
      const contentData = {
        ...data,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      try {
        await db.collection(collection).doc(doc).set(contentData, { merge });
        return true;
      } catch (error) {
        console.error(`Error saving content to ${path}:`, error);
        return false;
      }
    },
    
    delete: async function(path) {
      const [collection, doc] = path.split('/');
      
      try {
        await db.collection(collection).doc(doc).delete();
        return true;
      } catch (error) {
        console.error(`Error deleting ${path}:`, error);
        return false;
      }
    }
  };
  
  // Word cloud operations
  const wordCloud = {
    load: async function() {
      try {
        const doc = await db.collection("content").doc("wordCloud").get();
        return doc.exists && doc.data().words ? doc.data().words : [];
      } catch (error) {
        console.error("Error loading word cloud:", error);
        return [];
      }
    },
    
    save: async function(words) {
      try {
        await db.collection("content").doc("wordCloud").set({
          words,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error("Error saving word cloud:", error);
        return false;
      }
    }
  };
  
  // Auth operations
  const auth = {
    login: async function(email, password) {
      try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        return { success: true, user: result.user };
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error };
      }
    },
    
    logout: async function() {
      try {
        await firebase.auth().signOut();
        return { success: true };
      } catch (error) {
        console.error("Logout error:", error);
        return { success: false, error };
      }
    },
    
    getCurrentUser: function() {
      return firebase.auth().currentUser;
    },
    
    onAuthStateChanged: function(callback) {
      return firebase.auth().onAuthStateChanged(callback);
    }
  };
  
  // Page operations
  const pages = {
    getAll: async function() {
      try {
        const snapshot = await db.collection('pages').get();
        const pages = [];
        
        snapshot.forEach(doc => {
          pages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return pages;
      } catch (error) {
        console.error("Error loading pages:", error);
        return [];
      }
    },
    
    get: async function(pageId) {
      try {
        const doc = await db.collection('pages').doc(pageId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      } catch (error) {
        console.error(`Error loading page ${pageId}:`, error);
        return null;
      }
    },
    
    save: async function(pageId, data) {
      try {
        await db.collection('pages').doc(pageId).set({
          ...data,
          updated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
      } catch (error) {
        console.error(`Error saving page ${pageId}:`, error);
        return false;
      }
    },
    
    delete: async function(pageId) {
      try {
        await db.collection('pages').doc(pageId).delete();
        return true;
      } catch (error) {
        console.error(`Error deleting page ${pageId}:`, error);
        return false;
      }
    }
  };
  
  // Utility functions
  const utils = {
    normalizeImageData: function(imageData) {
      if (typeof imageData === 'string') {
        return { url: imageData, public_id: "", alt: "" };
      } else if (typeof imageData === 'object' && imageData !== null) {
        return {
          url: imageData.url || "",
          public_id: imageData.public_id || "",
          alt: imageData.alt || ""
        };
      } else {
        return { url: "", public_id: "", alt: "" };
      }
    }
  };
  
  // Public API
  return {
    init,
    content,
    wordCloud,
    auth,
    pages,
    utils,
    getFirestore: () => db,
    getAuth: () => auth,
    getStorage: () => storage
  };
})();

// Auto-initialize when document loads
document.addEventListener('DOMContentLoaded', FirebaseService.init);

// For backwards compatibility with existing code
window.firebaseService = FirebaseService;