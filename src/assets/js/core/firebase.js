 /**
 * firebase.js
 * Central management of Firebase initialization and core methods
 */

// Import configuration
import { FIREBASE_CONFIG } from './config.js';

// Firebase state
let db = null;
let auth = null;
let storage = null;

/**
 * Initialize Firebase with error handling
 * @returns {Object} Firebase services or null on failure
 */
export function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded');
      displayFirebaseError();
      return null;
    }
    
    // Initialize only once
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    
    // Initialize services
    db = firebase.firestore();
    auth = firebase.auth();
    if (firebase.storage) {
      storage = firebase.storage();
    }
    
    console.log('Firebase initialized successfully');
    return { db, auth, storage };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    displayFirebaseError();
    return null;
  }
}

/**
 * Display Firebase error message to the user
 */
function displayFirebaseError() {
  // Create an error alert if not present
  if (!document.querySelector('.firebase-error-alert')) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'w3-panel w3-red firebase-error-alert';
    errorAlert.innerHTML = `
      <p><i class="fas fa-exclamation-triangle"></i> Firebase SDK failed to load. Please check your connection and refresh the page.</p>
    `;
    
    // Insert at the top of the page or into a specific container
    const container = document.querySelector('.admin-header') || document.body.firstChild;
    if (container) {
      container.parentNode.insertBefore(errorAlert, container.nextSibling);
    } else {
      document.body.prepend(errorAlert);
    }
  }
}

/**
 * Get Firestore database instance
 * @returns {Object} Firestore database
 */
export function getFirestore() {
  if (!db) {
    const services = initFirebase();
    if (services) {
      db = services.db;
    }
  }
  return db;
}

/**
 * Get Firebase Authentication instance
 * @returns {Object} Firebase Auth
 */
export function getAuth() {
  if (!auth) {
    const services = initFirebase();
    if (services) {
      auth = services.auth;
    }
  }
  return auth;
}

/**
 * Get Firebase Storage instance
 * @returns {Object} Firebase Storage
 */
export function getStorage() {
  if (!storage) {
    const services = initFirebase();
    if (services) {
      storage = services.storage;
    }
  }
  return storage;
}

/**
 * Get a document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise} Promise resolving to document data
 */
export async function getDocument(collection, docId) {
  const firestore = getFirestore();
  if (!firestore) return null;
  
  try {
    const doc = await firestore.collection(collection).doc(docId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${collection}/${docId}:`, error);
    throw error;
  }
}

/**
 * Save a document to Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @param {boolean} merge - Whether to merge with existing document
 * @returns {Promise} Promise resolving when save completes
 */
export async function saveDocument(collection, docId, data, merge = true) {
  const firestore = getFirestore();
  if (!firestore) return null;
  
  try {
    // Add timestamp if not present
    const dataWithTimestamp = {
      ...data,
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (!data.created) {
      dataWithTimestamp.created = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    await firestore.collection(collection).doc(docId).set(dataWithTimestamp, { merge });
    return { id: docId };
  } catch (error) {
    console.error(`Error saving document ${collection}/${docId}:`, error);
    throw error;
  }
}

/**
 * Delete a document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise} Promise resolving when delete completes
 */
export async function deleteDocument(collection, docId) {
  const firestore = getFirestore();
  if (!firestore) return null;
  
  try {
    await firestore.collection(collection).doc(docId).delete();
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document ${collection}/${docId}:`, error);
    throw error;
  }
}

// Initialize Firebase when this module is loaded
initFirebase();