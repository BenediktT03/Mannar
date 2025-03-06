 /**
 * content-manager.js
 * Manages website content loading, saving, and manipulation
 */

import { getFirestore, getDocument, saveDocument } from '../core/firebase.js';
import { showStatus, updateElementContent } from '../core/utils.js';

// Cache for content to avoid duplicate loads
let contentCache = {
  main: null,
  draft: null,
  wordCloud: null,
  lastUpdated: {
    main: null,
    draft: null,
    wordCloud: null
  }
};

/**
 * Initialize the content manager
 * @returns {Object} Content methods
 */
export function initContentManager() {
  return {
    loadContent,
    saveContent,
    updateContent,
    getContent,
    publishContent,
    loadWordCloud,
    saveWordCloud
  };
}

/**
 * Load content from Firestore
 * @param {string} contentType - 'main', 'draft', or 'wordCloud'
 * @param {boolean} forceRefresh - Whether to force refresh from the server
 * @returns {Promise<Object>} Content data
 */
export async function loadContent(contentType = 'main', forceRefresh = false) {
  // Check if we have cached content and it's less than 5 minutes old
  const now = Date.now();
  const cacheTTL = 5 * 60 * 1000; // 5 minutes
  const cachedContent = contentCache[contentType];
  const lastUpdated = contentCache.lastUpdated[contentType];
  
  if (!forceRefresh && cachedContent && lastUpdated && (now - lastUpdated) < cacheTTL) {
    return cachedContent;
  }
  
  try {
    const db = getFirestore();
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    // Determine collection and document ID
    let collection, docId;
    
    if (contentType === 'wordCloud') {
      collection = 'content';
      docId = 'wordCloud';
    } else {
      collection = 'content';
      docId = contentType;
    }
    
    // Get document from Firestore
    const doc = await getDocument(collection, docId);
    
    if (!doc) {
      console.warn(`No content found for ${contentType}`);
      return null;
    }
    
    // Update cache
    contentCache[contentType] = doc;
    contentCache.lastUpdated[contentType] = now;
    
    return doc;
  } catch (error) {
    console.error(`Error loading ${contentType} content:`, error);
    throw error;
  }
}

/**
 * Save content to Firestore
 * @param {string} contentType - 'main', 'draft', or 'wordCloud'
 * @param {Object} data - Content data to save
 * @returns {Promise<Object>} Save result
 */
export async function saveContent(contentType, data) {
  try {
    const db = getFirestore();
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    // Determine collection and document ID
    let collection, docId;
    
    if (contentType === 'wordCloud') {
      collection = 'content';
      docId = 'wordCloud';
    } else {
      collection = 'content';
      docId = contentType;
    }
    
    // Add timestamp
    const contentData = {
      ...data,
      updated: new Date()
    };
    
    // Save to Firestore
    await saveDocument(collection, docId, contentData);
    
    // Update cache
    contentCache[contentType] = contentData;
    contentCache.lastUpdated[contentType] = Date.now();
    
    return { success: true };
  } catch (error) {
    console.error(`Error saving ${contentType} content:`, error);
    throw error;
  }
}

/**
 * Get content from cache or load from server
 * @param {string} contentType - 'main', 'draft', or 'wordCloud'
 * @returns {Promise<Object>} Content data
 */
export async function getContent(contentType = 'main') {
  const cachedContent = contentCache[contentType];
  
  if (cachedContent) {
    return cachedContent;
  }
  
  return loadContent(contentType);
}

/**
 * Update existing content with new data
 * @param {string} contentType - 'main', 'draft', or 'wordCloud'
 * @param {Object} newData - New data to merge with existing content
 * @returns {Promise<Object>} Update result
 */
export async function updateContent(contentType, newData) {
  try {
    // Get existing content
    const existingContent = await getContent(contentType);
    
    // Merge with new data
    const mergedContent = {
      ...(existingContent || {}),
      ...newData,
      updated: new Date()
    };
    
    // Save merged content
    return saveContent(contentType, mergedContent);
  } catch (error) {
    console.error(`Error updating ${contentType} content:`, error);
    throw error;
  }
}

/**
 * Publish draft content to live site
 * @returns {Promise<Object>} Publish result
 */
export async function publishContent() {
  try {
    // Get draft content
    const draftContent = await getContent('draft');
    
    if (!draftContent) {
      throw new Error('No draft content to publish');
    }
    
    // Add publish timestamp
    const publishedContent = {
      ...draftContent,
      publishedAt: new Date()
    };
    
    // Save to main
    await saveContent('main', publishedContent);
    
    return { success: true };
  } catch (error) {
    console.error('Error publishing content:', error);
    throw error;
  }
}

/**
 * Load word cloud data
 * @param {boolean} forceRefresh - Whether to force refresh from the server
 * @returns {Promise<Array>} Word cloud data
 */
export async function loadWordCloud(forceRefresh = false) {
  try {
    const wordCloudData = await loadContent('wordCloud', forceRefresh);
    
    if (!wordCloudData || !wordCloudData.words || !Array.isArray(wordCloudData.words)) {
      return [];
    }
    
    return wordCloudData.words;
  } catch (error) {
    console.error('Error loading word cloud:', error);
    return [];
  }
}

/**
 * Save word cloud data
 * @param {Array} words - Word cloud items
 * @returns {Promise<Object>} Save result
 */
export async function saveWordCloud(words) {
  try {
    return saveContent('wordCloud', { words });
  } catch (error) {
    console.error('Error saving word cloud:', error);
    throw error;
  }
}

/**
 * Update DOM with content data
 * @param {Object} data - Content data
 */
export function updateUIWithContent(data) {
  if (!data) return;
  
  // About section
  updateElementContent('aboutTitle', data.aboutTitle);
  updateElementContent('aboutSubtitle', data.aboutSubtitle);
  updateElementContent('aboutText', data.aboutText);
  
  // Offerings section
  updateElementContent('offeringsTitle', data.offeringsTitle);
  updateElementContent('offeringsSubtitle', data.offeringsSubtitle);
  
  // Individual offerings
  for (let i = 1; i <= 3; i++) {
    updateOfferingSection(i, data);
  }
  
  // Contact section
  updateElementContent('contactTitle', data.contactTitle);
  updateElementContent('contactSubtitle', data.contactSubtitle);
  
  if (data.contact_image) {
    updateImageElement('contactImage', data.contact_image);
  }
}

/**
 * Update offering section in the DOM
 * @param {number} num - Offering number (1-3)
 * @param {Object} data - Content data
 */
function updateOfferingSection(num, data) {
  updateElementContent(`offer${num}Title`, data[`offer${num}Title`]);
  updateElementContent(`offer${num}Desc`, data[`offer${num}Desc`]);
  
  const imageData = data[`offer${num}_image`];
  if (imageData) {
    updateImageElement(`offer${num}Image`, imageData);
  }
}

/**
 * Update image element in the DOM
 * @param {string} id - Element ID
 * @param {Object|string} imageData - Image data or URL
 */
function updateImageElement(id, imageData) {
  const img = document.getElementById(id);
  if (!img) return;
  
  const imageUrl = typeof imageData === 'string' ? imageData : 
                  imageData.url ? imageData.url : null;
  
  if (imageUrl) {
    img.src = imageUrl;
    img.alt = imageData.alt || img.alt || '';
    
    // Ensure image is visible
    img.style.display = 'block';
  }
}

// Initialize when this module is loaded
initContentManager();