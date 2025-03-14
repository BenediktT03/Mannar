/**
 * Page Editor Module
 * Manages page content editing in the admin panel
 * Handles loading, saving, and editing of pages and content
 */
const PageEditor = (function() {
  // Private variables
  let currentEditingPage = null;       // Current page ID or null
  let isEditingMainContent = false;    // Whether we're editing the main page
  let pageCache = {};                  // Cache for loaded pages
  let mainContentCache = null;         // Cache for main page content
  let editingDirty = false;            // Whether there are unsaved changes
  let templateDefinitions = {};        // Template definitions

  // DOM elements cache
  let elements = {};

  /**
   * Initialize the module
   */
  function init() {
    console.log('Initializing PageEditor');
    
    // Load templates
    initTemplates();
    
    // Cache DOM elements
    cacheElements();
    
    // Ensure UI elements exist
    ensureUIElements();
    
    // Attach event listeners
    attachEvents();
    
    // Initial page loading
    loadPages();
    
    console.log('PageEditor successfully initialized');
  }

  /**
   * Define all available page templates
   */
  function initTemplates() {
    templateDefinitions = {
      'main-content': {
        name: 'Homepage (index.php)',
        description: 'Main website content',
        preview: '<div class="tp-header"></div><div class="tp-hero"></div><div class="tp-content"></div>',
        fields: [
          // About section
          { type: 'text', name: 'aboutTitle', label: 'About Section Title', required: true },
          { type: 'text', name: 'aboutSubtitle', label: 'About Section Subtitle', required: false },
          { type: 'textarea', name: 'aboutText', label: 'About Section Content', editor: true, required: false },
          
          // Offerings section
          { type: 'text', name: 'offeringsTitle', label: 'Offerings Section Title', required: true },
          { type: 'text', name: 'offeringsSubtitle', label: 'Offerings Section Subtitle', required: false },
          
          // Offering 1
          { type: 'text', name: 'offer1Title', label: 'Offering 1 Title', required: false },
          { type: 'textarea', name: 'offer1Desc', label: 'Offering 1 Description', editor: true, required: false },
          { type: 'image', name: 'offer1_image', label: 'Offering 1 Image', required: false },
          
          // Offering 2
          { type: 'text', name: 'offer2Title', label: 'Offering 2 Title', required: false },
          { type: 'textarea', name: 'offer2Desc', label: 'Offering 2 Description', editor: true, required: false },
          { type: 'image', name: 'offer2_image', label: 'Offering 2 Image', required: false },
          
          // Offering 3
          { type: 'text', name: 'offer3Title', label: 'Offering 3 Title', required: false },
          { type: 'textarea', name: 'offer3Desc', label: 'Offering 3 Description', editor: true, required: false },
          { type: 'image', name: 'offer3_image', label: 'Offering 3 Image', required: false },
          
          // Contact section
          { type: 'text', name: 'contactTitle', label: 'Contact Section Title', required: true },
          { type: 'text', name: 'contactSubtitle', label: 'Contact Section Subtitle', required: false },
          { type: 'image', name: 'contact_image', label: 'Contact Image', required: false }
        ]
      },
      'basic': {
        name: 'Simple Page',
        description: 'Simple page with title, subtitle, and content',
        preview: '<div class="tp-header"></div><div class="tp-content"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Page Title', required: true },
          { type: 'text', name: 'subtitle', label: 'Subtitle', required: false },
          { type: 'textarea', name: 'content', label: 'Main Content', editor: true, required: false }
        ]
      },
      'text-image': {
        name: 'Text with Image',
        description: 'Text on left, image on right',
        preview: '<div class="tp-text-col"></div><div class="tp-image-col"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Page Title', required: true },
          { type: 'text', name: 'subtitle', label: 'Subtitle', required: false },
          { type: 'textarea', name: 'content', label: 'Main Content', editor: true, required: false },
          { type: 'image', name: 'featuredImage', label: 'Featured Image', required: false }
        ]
      },
      // Additional templates would be defined here...
    };
  }

  /**
   * Cache DOM elements for faster access
   */
  function cacheElements() {
    elements = {
      pagesContainer: document.getElementById('pagesContainer'),
      pagesListCol: document.getElementById('pagesListCol'),
      pagesEditorCol: document.getElementById('pagesEditorCol'),
      pagesList: document.getElementById('pagesList'),
      createPageBtn: document.getElementById('createPageBtn'),
      welcomeCreateBtn: document.getElementById('welcomeCreateBtn'),
      pageEditorContainer: document.getElementById('pageEditorContainer'),
      pageWelcomeContainer: document.getElementById('pageWelcomeContainer'),
      editorPageTitle: document.getElementById('editorPageTitle'),
      pageId: document.getElementById('pageId'),
      pageTitle: document.getElementById('pageTitle'),
      templateSelector: document.getElementById('templateSelector'),
      templateFields: document.getElementById('templateFields'),
      closeEditorBtn: document.getElementById('closeEditorBtn'),
      previewPageBtn: document.getElementById('previewPageBtn'),
      deletePageBtn: document.getElementById('deletePageBtn'),
      savePageBtn: document.getElementById('savePageBtn'),
      publishPageBtn: document.getElementById('publishPageBtn'),
      livePreview: document.getElementById('livePreview'),
      
      // Create page dialog
      createPageDialog: document.getElementById('createPageDialog'),
      closePageDialogBtn: document.getElementById('closePageDialogBtn'),
      newPageId: document.getElementById('newPageId'),
      newPageTitle: document.getElementById('newPageTitle'),
      newPageTemplate: document.getElementById('newPageTemplate'),
      templatePreview: document.getElementById('templatePreview'),
      confirmCreatePageBtn: document.getElementById('confirmCreatePageBtn'),
      cancelCreatePageBtn: document.getElementById('cancelCreatePageBtn')
    };
  }

  /**
   * Ensure required UI elements exist
   */
  function ensureUIElements() {
    // Check if main container exists
    if (!document.getElementById('pagesContainer')) {
      console.error('pagesContainer not found, UI cannot be created');
      return;
    }
    
    // Additional UI element creation would go here as needed
  }

  /**
   * Attach event listeners to UI elements
   */
  function attachEvents() {
    // Create page button
    if (elements.createPageBtn) {
      elements.createPageBtn.addEventListener('click', openCreatePageDialog);
    }
    
    // Welcome page "Create First Page" button
    if (elements.welcomeCreateBtn) {
      elements.welcomeCreateBtn.addEventListener('click', openCreatePageDialog);
    }
    
    // Close editor button
    if (elements.closeEditorBtn) {
      elements.closeEditorBtn.addEventListener('click', closeEditor);
    }
    
    // Save page button
    if (elements.savePageBtn) {
      elements.savePageBtn.addEventListener('click', () => savePage(false));
    }
    
    // Publish page button
    if (elements.publishPageBtn) {
      elements.publishPageBtn.addEventListener('click', () => savePage(true));
    }
    
    // Delete page button
    if (elements.deletePageBtn) {
      elements.deletePageBtn.addEventListener('click', deletePage);
    }
    
    // Page preview button
    if (elements.previewPageBtn) {
      elements.previewPageBtn.addEventListener('click', openPagePreview);
    }
    
    // Template selector
    if (elements.templateSelector) {
      elements.templateSelector.addEventListener('change', function() {
        const selectedTemplate = this.value;
        if (selectedTemplate) {
          changeTemplate(selectedTemplate);
        }
      });
    }
    
    // Dialog close button
    if (elements.closePageDialogBtn) {
      elements.closePageDialogBtn.addEventListener('click', closeCreatePageDialog);
    }
    
    // Dialog cancel button
    if (elements.cancelCreatePageBtn) {
      elements.cancelCreatePageBtn.addEventListener('click', closeCreatePageDialog);
    }
    
    // Template preview update
    if (elements.newPageTemplate) {
      elements.newPageTemplate.addEventListener('change', function() {
        updateTemplatePreview(this.value);
      });
    }
    
    // Create page button in dialog
    if (elements.confirmCreatePageBtn) {
      elements.confirmCreatePageBtn.addEventListener('click', createNewPage);
    }
    
    // Page ID normalization
    if (elements.newPageId) {
      elements.newPageId.addEventListener('input', function() {
        this.value = sanitizePageId(this.value);
      });
    }
    
    // Setup autosave
    setupAutosave();
  }

  /**
   * Set up auto-save functionality
   */
  function setupAutosave() {
    // Monitor changes in editor
    document.addEventListener('change', function(e) {
      if (e.target.closest('#pageEditorContainer')) {
        setDirty(true);
      }
    });
    
    // Monitor text changes
    document.addEventListener('input', function(e) {
      if (e.target.closest('#pageEditorContainer')) {
        setDirty(true);
        
        // Debounced preview update
        debounce(updatePreview, 500)();
      }
    });
  }

  /**
   * Debounce function for delayed execution
   * @param {Function} func - Function to execute
   * @param {number} wait - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  /**
   * Load all pages from Firestore
   */
  async function loadPages() {
    if (!elements.pagesList) return;
    
    // Show loading indicator
    elements.pagesList.innerHTML = '<div class="w3-center"><i class="fas fa-spinner fa-spin"></i> Loading pages...</div>';
    
    try {
      // Load pages using Firebase service
      const pages = await FirebaseService.getCollection('pages');
      
      // Clear list
      elements.pagesList.innerHTML = '';
      pageCache = {}; // Reset cache
      
      // Add special item for main content (index.php)
      const mainPageItem = document.createElement('div');
      mainPageItem.className = 'page-item w3-bar w3-hover-light-grey w3-margin-bottom w3-pale-yellow';
      mainPageItem.innerHTML = `
        <div class="w3-bar-item w3-padding">
          <span class="page-title"><i class="fas fa-home"></i> Homepage (index.php)</span><br>
          <small class="w3-text-grey">Main website content</small>
        </div>
        <div class="w3-bar-item w3-right">
          <a href="index.php" target="_blank" class="w3-button w3-small w3-blue">
            <i class="fas fa-eye"></i>
          </a>
        </div>
      `;
      
      // Click event for main page
      mainPageItem.addEventListener('click', function(e) {
        // Ignore if clicked on preview button
        if (e.target.closest('a')) return;
        
        // Edit main content
        editMainContent();
      });
      
      // Add to list
      elements.pagesList.appendChild(mainPageItem);
      
      // Add divider
      const divider = document.createElement('div');
      divider.className = 'w3-panel w3-border-bottom';
      divider.innerHTML = '<p class="w3-small w3-text-grey">Additional Pages</p>';
      elements.pagesList.appendChild(divider);
      
      if (pages.length === 0) {
        // No additional pages found
        const noPages = document.createElement('div');
        noPages.className = 'w3-panel w3-pale-yellow w3-center';
        noPages.innerHTML = '<p>No additional pages found. Create your first page!</p>';
        elements.pagesList.appendChild(noPages);
      } else {
        // Add pages to list
        pages.forEach(page => {
          // Cache page data
          pageCache[page.id] = page;
          
          // Create page list item
          const pageItem = document.createElement('div');
          pageItem.className = 'page-item w3-bar w3-hover-light-grey w3-margin-bottom';
          pageItem.dataset.id = page.id;
          pageItem.innerHTML = `
            <div class="w3-bar-item w3-padding">
              <span class="page-title">${page.title || 'Untitled Page'}</span><br>
              <small class="w3-text-grey">${getTemplateNameById(page.template) || page.template || 'Unknown Template'}</small>
            </div>
            <div class="w3-bar-item w3-right">
              <a href="page.php?id=${page.id}" target="_blank" class="w3-button w3-small w3-blue">
                <i class="fas fa-eye"></i>
              </a>
            </div>
          `;
          
          // Click event to open editor
          pageItem.addEventListener('click', function(e) {
            // Ignore if clicked on preview button
            if (e.target.closest('a')) return;
            
            const pageId = this.dataset.id;
            openEditor(pageId);
          });
          
          elements.pagesList.appendChild(pageItem);
        });
      }
      
      console.log('Pages loaded successfully', pages.length, 'pages found');
    } catch (error) {
      console.error('Error loading pages:', error);
      elements.pagesList.innerHTML = `
        <div class="w3-panel w3-pale-red">
          <p>Error loading pages: ${error.message}</p>
          <button class="w3-button w3-red" onclick="PageEditor.loadPages()">Try Again</button>
        </div>
      `;
    }
  }

  // Additional methods would go here...

  /**
   * Set dirty state for unsaved changes
   * @param {boolean} isDirty - New state
   */
  function setDirty(isDirty) {
    editingDirty = isDirty;
    
    // If AdminCore is available, update global state
    if (typeof AdminCore !== 'undefined' && typeof AdminCore.setDirty === 'function') {
      AdminCore.setDirty(isDirty);
    }
    
    // Enable/disable Save button if available
    if (elements.savePageBtn) {
      elements.savePageBtn.disabled = !isDirty;
    }
    
    // Enable/disable Publish button if available
    if (elements.publishPageBtn && isEditingMainContent) {
      elements.publishPageBtn.disabled = !isDirty;
    }
  }

  // Public API
  return {
    init,
    loadPages,
    openEditor,
    closeEditor,
    savePage,
    deletePage,
    openCreatePageDialog,
    editMainContent,
    updatePreview,
    setDirty: (isDirty) => setDirty(isDirty),
    getDirtyState: () => editingDirty,
    getPageCache: () => ({ ...pageCache }),
    getMainContentCache: () => mainContentCache ? { ...mainContentCache } : null
  };
})();

// For global access
window.PageEditor = PageEditor;

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Delayed initialization to ensure other modules are loaded
  setTimeout(PageEditor.init, 200);
});