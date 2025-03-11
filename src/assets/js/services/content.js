/**
 * Content Service
 * Centralized service for managing all website content
 */
const ContentService = (function() {
  // Cache for loaded content to improve performance
  const contentCache = {
    main: null,
    draft: null,
    pages: {},
    wordCloud: null
  };

  /**
   * Load main website content
   * @param {boolean} isDraft - Whether to load draft or published content
   * @param {boolean} useCache - Whether to use cached content if available
   * @returns {Promise<Object>} Content data
   */
  async function loadMainContent(isDraft = false, useCache = true) {
    const contentType = isDraft ? 'draft' : 'main';
    
    // Return cached content if available and requested
    if (useCache && contentCache[contentType]) {
      return contentCache[contentType];
    }
    
    try {
      const docPath = `content/${contentType}`;
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('content').doc(contentType).get();
      
      if (!snapshot.exists) {
        console.warn(`No ${contentType} content found`);
        return null;
      }
      
      // Cache the content
      contentCache[contentType] = snapshot.data();
      
      return contentCache[contentType];
    } catch (error) {
      console.error(`Error loading ${contentType} content:`, error);
      return null;
    }
  }

  /**
   * Load a specific page by ID
   * @param {string} pageId - The ID of the page to load
   * @param {boolean} useCache - Whether to use cached content if available
   * @returns {Promise<Object>} Page data
   */
  async function loadPage(pageId, useCache = true) {
    if (!pageId) return null;
    
    // Return cached page if available and requested
    if (useCache && contentCache.pages[pageId]) {
      return contentCache.pages[pageId];
    }
    
    try {
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('pages').doc(pageId).get();
      
      if (!snapshot.exists) {
        console.warn(`Page with ID ${pageId} not found`);
        return null;
      }
      
      // Cache the page
      contentCache.pages[pageId] = {
        id: pageId,
        ...snapshot.data()
      };
      
      return contentCache.pages[pageId];
    } catch (error) {
      console.error(`Error loading page ${pageId}:`, error);
      return null;
    }
  }

  /**
   * Load all pages
   * @param {boolean} useCache - Whether to use cached content if available
   * @returns {Promise<Array>} Array of page data
   */
  async function loadAllPages(useCache = false) {
    // For all pages, we usually want fresh data from the database
    if (!useCache || Object.keys(contentCache.pages).length === 0) {
      try {
        const db = FirebaseService.getFirestore();
        const snapshot = await db.collection('pages').get();
        const pages = [];
        
        snapshot.forEach(doc => {
          const pageData = {
            id: doc.id,
            ...doc.data()
          };
          
          // Cache each page
          contentCache.pages[doc.id] = pageData;
          pages.push(pageData);
        });
        
        return pages;
      } catch (error) {
        console.error('Error loading pages:', error);
        return [];
      }
    }
    
    // Return cached pages as an array
    return Object.values(contentCache.pages);
  }

  /**
   * Load word cloud data
   * @param {boolean} useCache - Whether to use cached content if available
   * @returns {Promise<Array>} Word cloud data
   */
  async function loadWordCloud(useCache = true) {
    // Return cached word cloud if available and requested
    if (useCache && contentCache.wordCloud) {
      return contentCache.wordCloud;
    }
    
    try {
      const db = FirebaseService.getFirestore();
      const doc = await db.collection('content').doc('wordCloud').get();
      
      if (!doc.exists || !doc.data().words) {
        console.warn('No word cloud data found');
        return [];
      }
      
      // Cache the word cloud
      contentCache.wordCloud = doc.data().words;
      
      return contentCache.wordCloud;
    } catch (error) {
      console.error('Error loading word cloud:', error);
      return [];
    }
  }

  /**
   * Save main website content
   * @param {Object} contentData - Content to save
   * @param {boolean} isDraft - Whether to save as draft or published content
   * @returns {Promise<boolean>} Success status
   */
  async function saveMainContent(contentData, isDraft = true) {
    if (!contentData) return false;
    
    const contentType = isDraft ? 'draft' : 'main';
    
    try {
      const db = FirebaseService.getFirestore();
      
      // Add timestamp
      const dataWithTimestamp = {
        ...contentData,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('content').doc(contentType).set(dataWithTimestamp, { merge: true });
      
      // Update cache
      contentCache[contentType] = dataWithTimestamp;
      
      return true;
    } catch (error) {
      console.error(`Error saving ${contentType} content:`, error);
      return false;
    }
  }

  /**
   * Save a page
   * @param {string} pageId - ID of the page to save
   * @param {Object} pageData - Page data to save
   * @returns {Promise<boolean>} Success status
   */
  async function savePage(pageId, pageData) {
    if (!pageId || !pageData) return false;
    
    try {
      const db = FirebaseService.getFirestore();
      
      // Add timestamp
      const dataWithTimestamp = {
        ...pageData,
        updated: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Ensure created timestamp exists
      if (!dataWithTimestamp.created) {
        dataWithTimestamp.created = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      await db.collection('pages').doc(pageId).set(dataWithTimestamp, { merge: true });
      
      // Update cache
      contentCache.pages[pageId] = {
        id: pageId,
        ...dataWithTimestamp
      };
      
      return true;
    } catch (error) {
      console.error(`Error saving page ${pageId}:`, error);
      return false;
    }
  }

  /**
   * Delete a page
   * @param {string} pageId - ID of the page to delete
   * @returns {Promise<boolean>} Success status
   */
  async function deletePage(pageId) {
    if (!pageId) return false;
    
    try {
      const db = FirebaseService.getFirestore();
      await db.collection('pages').doc(pageId).delete();
      
      // Remove from cache
      if (contentCache.pages[pageId]) {
        delete contentCache.pages[pageId];
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting page ${pageId}:`, error);
      return false;
    }
  }

  /**
   * Save word cloud data
   * @param {Array} words - Word cloud data to save
   * @returns {Promise<boolean>} Success status
   */
  async function saveWordCloud(words) {
    if (!Array.isArray(words)) return false;
    
    try {
      const db = FirebaseService.getFirestore();
      
      await db.collection('content').doc('wordCloud').set({
        words,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Update cache
      contentCache.wordCloud = words;
      
      return true;
    } catch (error) {
      console.error('Error saving word cloud:', error);
      return false;
    }
  }

  /**
   * Publish draft content to live website
   * @returns {Promise<boolean>} Success status
   */
  async function publishDraftContent() {
    try {
      // Load latest draft content
      const draftContent = await loadMainContent(true, false);
      
      if (!draftContent) {
        console.error('No draft content to publish');
        return false;
      }
      
      // Save draft content as main content
      const success = await saveMainContent(draftContent, false);
      
      return success;
    } catch (error) {
      console.error('Error publishing draft content:', error);
      return false;
    }
  }

  /**
   * Clear content cache
   * @param {string} cacheType - Type of cache to clear (optional)
   */
  function clearCache(cacheType = null) {
    if (cacheType) {
      // Clear specific cache
      if (cacheType === 'pages') {
        contentCache.pages = {};
      } else {
        contentCache[cacheType] = null;
      }
    } else {
      // Clear all cache
      contentCache.main = null;
      contentCache.draft = null;
      contentCache.pages = {};
      contentCache.wordCloud = null;
    }
  }

  /**
   * Check if content has changed by comparing with cached version
   * @param {string} contentType - Type of content ('main', 'draft', 'wordCloud')
   * @param {Object|Array} newContent - Content to compare
   * @returns {boolean} True if content has changed
   */
  function hasContentChanged(contentType, newContent) {
    if (!contentType || !newContent || !contentCache[contentType]) {
      return true;
    }
    
    // Simple JSON comparison
    return JSON.stringify(contentCache[contentType]) !== JSON.stringify(newContent);
  }

  /**
   * Format image data in a consistent way
   * @param {string|Object} imageData - Image data to format
   * @returns {Object} Formatted image data
   */
  function formatImageData(imageData) {
    if (typeof imageData === 'string') {
      return { url: imageData, public_id: '', alt: '' };
    } else if (imageData && typeof imageData === 'object') {
      return {
        url: imageData.url || imageData.secure_url || '',
        public_id: imageData.public_id || '',
        alt: imageData.alt || ''
      };
    }
    
    return { url: '', public_id: '', alt: '' };
  }

  /**
   * Update image elements with content data
   * @param {Object} data - Content data containing image information
   * @param {Object} imageElements - Map of image element references
   */
  function updateImagePreviews(data, imageElements) {
    if (!data || !imageElements) return;
    
    Object.keys(imageElements).forEach(key => {
      const imgElement = imageElements[key];
      if (!imgElement) return;
      
      const dataKey = key.replace('Img', '_image');
      if (data[dataKey]) {
        const imageData = formatImageData(data[dataKey]);
        imgElement.src = imageData.url || "/api/placeholder/400/300";
        
        if (imageData.url) {
          imgElement.style.display = "block";
          if (imageData.alt) imgElement.alt = imageData.alt;
        } else {
          imgElement.style.display = "none";
        }
      }
    });
  }

  // Public API
  return {
    loadMainContent,
    loadPage,
    loadAllPages,
    loadWordCloud,
    saveMainContent,
    savePage,
    deletePage,
    saveWordCloud,
    publishDraftContent,
    clearCache,
    formatImageData,
    updateImagePreviews,
    hasContentChanged
  };
})();

// Make service globally available
window.ContentService = ContentService;