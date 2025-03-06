/**
 * Optimized Firebase Helper Module
 */

// Centralized Firebase config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
  authDomain: "mannar-129a5.firebaseapp.com",
  projectId: "mannar-129a5",
  storageBucket: "mannar-129a5.firebasestorage.app",
  messagingSenderId: "687710492532",
  appId: "1:687710492532:web:c7b675da541271f8d83e21",
  measurementId: "G-NXBLYJ5CXL"
};

/**
 * Initialize Firebase with error handling
 */
function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded');
    return { app: null, db: null, auth: null };
  }
  
  // Use existing instance if available
  if (firebase.apps && firebase.apps.length > 0) {
    return {
      app: firebase.app(),
      db: firebase.firestore ? firebase.firestore() : null,
      auth: firebase.auth ? firebase.auth() : null
    };
  }
  
  // Initialize new instance
  firebase.initializeApp(FIREBASE_CONFIG);
  
  return {
    app: firebase.app(),
    db: firebase.firestore ? firebase.firestore() : null,
    auth: firebase.auth ? firebase.auth() : null
  };
}

/**
 * Load content with improved validation
 */
function loadContent(docPath, callback) {
  const { db } = initFirebase();
  if (!db) {
    console.error('Firestore unavailable');
    if (callback) callback(null);
    return;
  }

  // Validate path
  if (!docPath || typeof docPath !== 'string' || !docPath.includes('/')) {
    console.error('Invalid document path:', docPath);
    if (callback) callback(null);
    return;
  }

  const [collection, doc] = docPath.split('/');
  
  db.collection(collection).doc(doc).get()
    .then(docSnap => {
      if (docSnap.exists) {
        if (callback) callback(docSnap.data());
      } else {
        console.log(`Document ${docPath} not found`);
        if (callback) callback(null);
      }
    })
    .catch(error => {
      console.error(`Error loading ${docPath}:`, error);
      if (callback) callback(null);
    });
}

/**
 * Save content with improved validation
 */
function saveContent(docPath, data, merge = true, callback) {
  const { db } = initFirebase();
  if (!db) {
    console.error('Firestore unavailable');
    if (callback) callback(false, new Error('Firestore unavailable'));
    return;
  }

  // Validate inputs
  if (!docPath || typeof docPath !== 'string' || !docPath.includes('/')) {
    console.error('Invalid document path:', docPath);
    if (callback) callback(false, new Error('Invalid document path'));
    return;
  }

  if (!data || typeof data !== 'object') {
    console.error('Invalid data:', data);
    if (callback) callback(false, new Error('Invalid data'));
    return;
  }

  const [collection, doc] = docPath.split('/');
  
  // Clone data to avoid mutations
  const contentData = {...data};
  
  // Add timestamp
  if (firebase.firestore && firebase.firestore.FieldValue) {
    contentData.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
  } else {
    contentData.lastUpdated = new Date().toISOString();
  }
  
  db.collection(collection).doc(doc).set(contentData, { merge })
    .then(() => {
      console.log(`Document ${docPath} saved successfully`);
      if (callback) callback(true);
    })
    .catch(error => {
      console.error(`Error saving ${docPath}:`, error);
      if (callback) callback(false, error);
    });
}

/**
 * Auth state observer with validation
 */
function onAuthStateChanged(callback) {
  const { auth } = initFirebase();
  if (!auth) {
    console.error('Firebase Auth unavailable');
    if (callback) callback(null);
    return;
  }
  
  auth.onAuthStateChanged(user => {
    if (callback) callback(user);
  });
}

/**
 * Login with validation
 */
function login(email, password, callback) {
  const { auth } = initFirebase();
  if (!auth) {
    console.error('Firebase Auth unavailable');
    if (callback) callback(false, new Error('Firebase Auth unavailable'));
    return;
  }
  
  // Validate credentials
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.error('Invalid email address');
    if (callback) callback(false, new Error('Invalid email address'));
    return;
  }
  
  if (!password || typeof password !== 'string' || password.length < 6) {
    console.error('Invalid password (min 6 characters)');
    if (callback) callback(false, new Error('Invalid password'));
    return;
  }
  
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Login successful:', userCredential.user.email);
      if (callback) callback(true, userCredential.user);
    })
    .catch(error => {
      console.error('Login error:', error);
      if (callback) callback(false, error);
    });
}

/**
 * Logout with validation
 */
function logout(callback) {
  const { auth } = initFirebase();
  if (!auth) {
    console.error('Firebase Auth unavailable');
    if (callback) callback(false, new Error('Firebase Auth unavailable'));
    return;
  }
  
  auth.signOut()
    .then(() => {
      console.log('Logout successful');
      if (callback) callback(true);
    })
    .catch(error => {
      console.error('Logout error:', error);
      if (callback) callback(false, error);
    });
}

// Export for global use
window.firebaseHelper = {
  init: initFirebase,
  loadContent,
  saveContent,
  onAuthStateChanged,
  login,
  logout
};