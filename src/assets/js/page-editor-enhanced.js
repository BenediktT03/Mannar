 /**
 * Enhanced Page Editor (page-editor-enhanced.js)
 * 
 * A complete rewrite of the page editing functionality that fixes the "No Page Currently edited" bug
 * and implements template selection, live preview, and enhanced editing capabilities.
 */

// Use module pattern to avoid global scope pollution
const PageEditor = (function() {
  // Private variables
  let db;
  let currentEditingPage = null;
  let pageCache = {};
  let isDirty = false;
  let previewTimer = null;
  let editorState = {
    selectedTemplate: '',
    currentFields: [],
    globalSettings: {
      titleSize: 2.5, // in em
      subtitleSize: 1.8, // in em
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      bodyFont: 'Lato, sans-serif',
      headingFont: 'Lato, sans-serif'
    }
  };

  // Template definitions with expanded options
  const templates = {
    'basic': {
      name: 'Basic Page',
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
      description: 'Text on the left, image on the right',
      preview: '<div class="tp-text-col"></div><div class="tp-image-col"></div>',
      fields: [
        { type: 'text', name: 'title', label: 'Page Title', required: true },
        { type: 'text', name: 'subtitle', label: 'Subtitle', required: false },
        { type: 'textarea', name: 'content', label: 'Main Content', editor: true, required: false },
        { type: 'image', name: 'featuredImage', label: 'Featured Image', required: false }
      ]
    },
    'image-text': {
      name: 'Image with Text',
      description: 'Image on the left, text on the right',
      preview: '<div class="tp-image-col"></div><div class="tp-text-col"></div>',
      fields: [
        { type: 'text', name: 'title', label: 'Page Title', required: true },
        { type: 'text', name: 'subtitle', label: 'Subtitle', required: false },
        { type: 'image', name: 'featuredImage', label: 'Featured Image', required: false },
        { type: 'textarea', name: 'content', label: 'Main Content', editor: true, required: false }
      ]
    },
    'gallery': {
      name: 'Gallery Page',
      description: 'Display a collection of images in a gallery format',
      preview: '<div class="tp-header"></div><div class="tp-gallery"></div>',
      fields: [
        { type: 'text', name: 'title', label: 'Gallery Title', required: true },
        { type: 'text', name: 'subtitle', label: 'Gallery Subtitle', required: false },
        { type: 'textarea', name: 'description', label: 'Gallery Description', editor: true, required: false },
        { type: 'gallery', name: 'images', label: 'Gallery Images', required: false }
      ]
    },
    'landing': {
      name: 'Landing Page',
      description: 'Full-featured landing page with hero image, features, and call to action',
      preview: '<div class="tp-hero"></div><div class="tp-features"></div><div class="tp-cta"></div>',
      fields: [
        { type: 'text', name: 'title', label: 'Hero Title', required: true },
        { type: 'text', name: 'subtitle', label: 'Hero Subtitle', required: false },
        { type: 'image', name: 'heroImage', label: 'Hero Background Image', required: false },
        { type: 'text', name: 'ctaText', label: 'Call to Action Text', required: false },
        { type: 'text', name: 'ctaButtonText', label: 'Button Text', required: false },
        { type: 'text', name: 'ctaButtonLink', label: 'Button Link', required: false },
        { type: 'text', name: 'featuresTitle', label: 'Features Section Title', required: false },
        { type: 'repeater', name: 'features', label: 'Features', required: false, subfields: [
          { type: 'text', name: 'title', label: 'Feature Title' },
          { type: 'textarea', name: 'description', label: 'Feature Description', editor: false },
          { type: 'image', name: 'icon', label: 'Feature Icon/Image' }
        ]}
      ]
    },
    'portfolio': {
      name: 'Portfolio Page',
      description: 'Showcase your work with projects and descriptions',
      preview: '<div class="tp-header"></div><div class="tp-portfolio"></div>',
      fields: [
        { type: 'text', name: 'title', label: 'Portfolio Title', required: true },
        { type: 'text', name: 'subtitle', label: 'Portfolio Subtitle', required: false },
        { type: 'textarea', name: 'introduction', label: 'Introduction Text', editor: true, required: false },
        { type: 'repeater', name: 'projects', label: 'Portfolio Projects', required: false, subfields: [
          { type: 'text', name: 'title', label: 'Project Title' },
          { type: 'textarea', name: 'description', label: 'Project Description', editor: false },
          { type: 'image', name: 'thumbnail', label: 'Project Thumbnail' },
          { type: 'text', name: 'link', label: 'Project Link (optional)' }
        ]}
      ]
    },
    'contact': {
      name: 'Contact Page',
      description: 'Contact information with a contact form',
      preview: '<div class="tp-header"></div><div class="tp-contact-info"></div><div class="tp-form"></div>',
      fields: [
        { type: 'text', name: 'title', label: 'Contact Page Title', required: true },
        { type: 'text', name: 'subtitle', label: 'Contact Page Subtitle', required: false },
        { type: 'textarea', name: 'introduction', label: 'Introduction Text', editor: true, required: false },
        { type: 'text', name: 'address', label: 'Address', required: false },
        { type: 'text', name: 'email', label: 'Email Address', required: false },
        { type: 'text', name: 'phone', label: 'Phone Number', required: false },
        { type: 'checkbox', name: 'showForm', label: 'Show Contact Form', required: false },
        { type: 'image', name: 'contactImage', label: 'Contact Image/Map', required: false }
      ]
    },
    'blog': {
      name: 'Blog Post',
      description: 'A blog post with featured image and content sections',
      preview: '<div class="tp-header"></div><div class="tp-featured"></div><div class="tp-content"></div>',
      fields: [
        { type: 'text', name: 'title', label: 'Post Title', required: true },
        { type: 'text', name: 'subtitle', label: 'Post Subtitle', required: false },
        { type: 'date', name: 'date', label: 'Post Date', required: false },
        { type: 'text', name: 'author', label: 'Author', required: false },
        { type: 'image', name: 'featuredImage', label: 'Featured Image', required: false },
        { type: 'textarea', name: 'excerpt', label: 'Excerpt', editor: false, required: false },
        { type: 'textarea', name: 'content', label: 'Post Content', editor: true, required: false },
        { type: 'tags', name: 'categories', label: 'Categories', required: false }
      ]
    }
  };

  // DOM element cache
  const elements = {
    // Will be populated in init()
  };

  // Status message function
  function showStatus(message, isError = false, timeout = 5000) {
    const statusMsg = document.getElementById('statusMsg');
    if (!statusMsg) return;
    
    statusMsg.textContent = message;
    statusMsg.style.display = 'block';
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    // Hide after timeout unless it's 0 (persistent)
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
        setTimeout(() => {
          statusMsg.style.display = 'none';
        }, 300);
      }, timeout);
    }
  }

  // Initialization function
  function init() {
    // Initialize Firebase
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        // Firebase initialization should be done in the main file
        console.warn("Firebase not initialized, please ensure Firebase is initialized before using PageEditor");
      } else {
        db = firebase.firestore();
      }
    } else {
      console.error("Firebase not found. Please include Firebase libraries before initializing PageEditor");
      return;
    }

    // Create and insert necessary UI elements if they don't exist
    ensureUIElements();
    
    // Cache DOM elements
    cacheElements();
    
    // Attach event listeners
    attachEvents();
    
    // Load initial data
    loadPages();
    
    console.log("PageEditor initialized successfully");
  }

  // Ensure all necessary UI elements exist
  function ensureUIElements() {
    // Get pages tab
    const pagesTab = document.getElementById('pages-tab');
    if (!pagesTab) {
      console.error("Pages tab not found");
      return false;
    }
    
    // Pages container
    let pagesContainer = document.getElementById('pagesContainer');
    if (!pagesContainer) {
      pagesContainer = document.createElement('div');
      pagesContainer.id = 'pagesContainer';
      pagesContainer.className = 'w3-row';
      pagesTab.appendChild(pagesContainer);
      
      // Pages list column
      const pagesListCol = document.createElement('div');
      pagesListCol.id = 'pagesListCol';
      pagesListCol.className = 'w3-col m4 l3';
      pagesContainer.appendChild(pagesListCol);
      
      // Create page button
      const createBtnContainer = document.createElement('div');
      createBtnContainer.className = 'w3-margin-bottom';
      createBtnContainer.innerHTML = `
        <button id="createPageBtn" class="w3-button w3-blue w3-block">
          <i class="fas fa-plus"></i> Create New Page
        </button>
      `;
      pagesListCol.appendChild(createBtnContainer);
      
      // Pages list
      const pagesListCard = document.createElement('div');
      pagesListCard.id = 'pagesListCard';
      pagesListCard.className = 'w3-card w3-padding';
      pagesListCard.innerHTML = `
        <h3>Your Pages</h3>
        <div id="pagesList" class="pages-list">
          <div class="w3-center">
            <i class="fas fa-spinner fa-spin"></i> Loading pages...
          </div>
        </div>
      `;
      pagesListCol.appendChild(pagesListCard);
      
      // Pages editor column
      const pagesEditorCol = document.createElement('div');
      pagesEditorCol.id = 'pagesEditorCol';
      pagesEditorCol.className = 'w3-col m8 l9';
      pagesContainer.appendChild(pagesEditorCol);
      
      // Editor container (initially empty)
      const editorContainer = document.createElement('div');
      editorContainer.id = 'pageEditorContainer';
      editorContainer.className = 'page-editor-container';
      editorContainer.style.display = 'none';
      pagesEditorCol.appendChild(editorContainer);
      
      // Welcome message when no page is selected
      const welcomeContainer = document.createElement('div');
      welcomeContainer.id = 'pageWelcomeContainer';
      welcomeContainer.className = 'page-welcome-container w3-center w3-padding-64';
      welcomeContainer.innerHTML = `
        <div class="w3-container w3-light-grey w3-padding-32 w3-round">
          <h2><i class="fas fa-file-alt"></i> Page Manager</h2>
          <p>Select a page from the list to edit, or create a new page.</p>
          <button id="welcomeCreateBtn" class="w3-button w3-blue w3-margin-top">
            <i class="fas fa-plus"></i> Create Your First Page
          </button>
        </div>
      `;
      pagesEditorCol.appendChild(welcomeContainer);
      
      // Page editor
      editorContainer.innerHTML = `
        <div class="w3-bar w3-teal">
          <div class="w3-bar-item"><span id="editorPageTitle">Edit Page</span></div>
          <button id="closeEditorBtn" class="w3-bar-item w3-button w3-right"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="editor-main w3-row">
          <div class="w3-col m7 l8">
            <div class="w3-padding">
              <div id="editorForm" class="editor-form">
                <!-- Form fields will be inserted here -->
                <div class="w3-margin-bottom">
                  <label><strong>Page ID:</strong></label>
                  <input type="text" id="pageId" class="w3-input w3-border" readonly />
                </div>
                
                <div class="w3-margin-bottom">
                  <label><strong>Page Title:</strong></label>
                  <input type="text" id="pageTitle" class="w3-input w3-border" />
                </div>
                
                <div class="w3-margin-bottom">
                  <label><strong>Template:</strong></label>
                  <select id="templateSelector" class="w3-select w3-border">
                    <option value="">-- Select Template --</option>
                    <!-- Templates will be added here -->
                  </select>
                </div>
                
                <div id="templateFields" class="template-fields">
                  <!-- Template fields will be inserted here -->
                </div>
              </div>
              
              <div class="w3-margin-top w3-padding-16 editor-actions">
                <button id="previewPageBtn" class="w3-button w3-amber w3-margin-right">
                  <i class="fas fa-eye"></i> Preview
                </button>
                <button id="deletePageBtn" class="w3-button w3-red w3-margin-right">
                  <i class="fas fa-trash"></i> Delete
                </button>
                <button id="savePageBtn" class="w3-button w3-green">
                  <i class="fas fa-save"></i> Save
                </button>
              </div>
            </div>
          </div>
          
          <div class="w3-col m5 l4">
            <div class="w3-padding">
              <div class="style-editor w3-card w3-padding w3-margin-bottom">
                <h4>Style Options</h4>
                
                <div class="w3-margin-bottom">
                  <label><strong>Title Font Size:</strong> <span id="titleSizeValue">2.5</span>em</label>
                  <input type="range" id="titleSizeSlider" class="w3-input" min="1.5" max="4" step="0.1" value="2.5" />
                </div>
                
                <div class="w3-margin-bottom">
                  <label><strong>Subtitle Font Size:</strong> <span id="subtitleSizeValue">1.8</span>em</label>
                  <input type="range" id="subtitleSizeSlider" class="w3-input" min="1" max="3" step="0.1" value="1.8" />
                </div>
                
                <div class="w3-margin-bottom">
                  <label><strong>Primary Color:</strong></label>
                  <input type="color" id="primaryColor" class="w3-input" value="#007bff" />
                </div>
                
                <div class="w3-margin-bottom">
                  <label><strong>Secondary Color:</strong></label>
                  <input type="color" id="secondaryColor" class="w3-input" value="#6c757d" />
                </div>
                
                <div class="w3-margin-bottom">
                  <label><strong>Font Family:</strong></label>
                  <select id="fontSelector" class="w3-select w3-border">
                    <option value="Lato, sans-serif">Lato (Default)</option>
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'PT Sans', sans-serif">PT Sans</option>
                  </select>
                </div>
              </div>
              
              <div class="preview-container w3-card w3-padding">
                <h4>Live Preview</h4>
                <div id="livePreview" class="live-preview w3-white w3-border">
                  <div class="w3-center w3-padding-32">
                    <i class="fas fa-image"></i>
                    <p>Preview will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Create Page Dialog
      const pageDialog = document.createElement('div');
      pageDialog.id = 'createPageDialog';
      pageDialog.className = 'w3-modal';
      pageDialog.innerHTML = `
        <div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:600px">
          <header class="w3-container w3-teal">
            <span id="closePageDialogBtn" class="w3-button w3-display-topright">&times;</span>
            <h2>Create New Page</h2>
          </header>
          
          <div class="w3-container w3-padding">
            <div class="w3-margin-bottom">
              <label><strong>Page ID (URL-friendly name):</strong></label>
              <input type="text" id="newPageId" class="w3-input w3-border" placeholder="e.g. about-us, services, contact" />
              <small class="w3-text-grey">Use lowercase letters, numbers and hyphens only</small>
            </div>
            
            <div class="w3-margin-bottom">
              <label><strong>Page Title:</strong></label>
              <input type="text" id="newPageTitle" class="w3-input w3-border" placeholder="Page Title" />
            </div>
            
            <div class="w3-margin-bottom">
              <label><strong>Template:</strong></label>
              <select id="newPageTemplate" class="w3-select w3-border">
                <option value="">-- Select Template --</option>
                <!-- Templates will be added here -->
              </select>
            </div>
            
            <div id="templatePreview" class="w3-margin-bottom">
              <!-- Template preview will be shown here -->
            </div>
          </div>
          
          <footer class="w3-container w3-padding">
            <button id="confirmCreatePageBtn" class="w3-button w3-green w3-right">Create</button>
            <button id="cancelCreatePageBtn" class="w3-button w3-grey w3-right w3-margin-right">Cancel</button>
          </footer>
        </div>
      `;
      document.body.appendChild(pageDialog);
    }
    
    return true;
  }

  // Cache DOM elements for faster access
  function cacheElements() {
    elements.pagesContainer = document.getElementById('pagesContainer');
    elements.pagesListCol = document.getElementById('pagesListCol');
    elements.pagesEditorCol = document.getElementById('pagesEditorCol');
    elements.pagesList = document.getElementById('pagesList');
    elements.createPageBtn = document.getElementById('createPageBtn');
    elements.welcomeCreateBtn = document.getElementById('welcomeCreateBtn');
    elements.pageEditorContainer = document.getElementById('pageEditorContainer');
    elements.pageWelcomeContainer = document.getElementById('pageWelcomeContainer');
    elements.editorPageTitle = document.getElementById('editorPageTitle');
    elements.editorForm = document.getElementById('editorForm');
    elements.pageId = document.getElementById('pageId');
    elements.pageTitle = document.getElementById('pageTitle');
    elements.templateSelector = document.getElementById('templateSelector');
    elements.templateFields = document.getElementById('templateFields');
    elements.closeEditorBtn = document.getElementById('closeEditorBtn');
    elements.previewPageBtn = document.getElementById('previewPageBtn');
    elements.deletePageBtn = document.getElementById('deletePageBtn');
    elements.savePageBtn = document.getElementById('savePageBtn');
    elements.livePreview = document.getElementById('livePreview');
    elements.titleSizeSlider = document.getElementById('titleSizeSlider');
    elements.titleSizeValue = document.getElementById('titleSizeValue');
    elements.subtitleSizeSlider = document.getElementById('subtitleSizeSlider');
    elements.subtitleSizeValue = document.getElementById('subtitleSizeValue');
    elements.primaryColor = document.getElementById('primaryColor');
    elements.secondaryColor = document.getElementById('secondaryColor');
    elements.fontSelector = document.getElementById('fontSelector');
    
    // Create page dialog elements
    elements.createPageDialog = document.getElementById('createPageDialog');
    elements.closePageDialogBtn = document.getElementById('closePageDialogBtn');
    elements.newPageId = document.getElementById('newPageId');
    elements.newPageTitle = document.getElementById('newPageTitle');
    elements.newPageTemplate = document.getElementById('newPageTemplate');
    elements.templatePreview = document.getElementById('templatePreview');
    elements.confirmCreatePageBtn = document.getElementById('confirmCreatePageBtn');
    elements.cancelCreatePageBtn = document.getElementById('cancelCreatePageBtn');
    
    // Populate template selectors
    populateTemplateSelectors();
  }

  // Populate template selectors with available templates
  function populateTemplateSelectors() {
    const mainSelector = elements.templateSelector;
    const dialogSelector = elements.newPageTemplate;
    
    if (!mainSelector || !dialogSelector) return;
    
    // Clear existing options except the first one
    while (mainSelector.options.length > 1) {
      mainSelector.remove(1);
    }
    
    while (dialogSelector.options.length > 1) {
      dialogSelector.remove(1);
    }
    
    // Add template options
    for (const [id, template] of Object.entries(templates)) {
      const option1 = document.createElement('option');
      option1.value = id;
      option1.textContent = template.name;
      mainSelector.appendChild(option1);
      
      const option2 = document.createElement('option');
      option2.value = id;
      option2.textContent = template.name;
      dialogSelector.appendChild(option2);
    }
  }

  // Add event listeners to all interactive elements
  function attachEvents() {
    // Create page button
    if (elements.createPageBtn) {
      elements.createPageBtn.addEventListener('click', openCreatePageDialog);
    }
    
    // Welcome create button
    if (elements.welcomeCreateBtn) {
      elements.welcomeCreateBtn.addEventListener('click', openCreatePageDialog);
    }
    
    // Close editor button
    if (elements.closeEditorBtn) {
      elements.closeEditorBtn.addEventListener('click', closeEditor);
    }
    
    // Save page button
    if (elements.savePageBtn) {
      elements.savePageBtn.addEventListener('click', savePage);
    }
    
    // Preview page button
    if (elements.previewPageBtn) {
      elements.previewPageBtn.addEventListener('click', openPagePreview);
    }
    
    // Delete page button
    if (elements.deletePageBtn) {
      elements.deletePageBtn.addEventListener('click', deletePage);
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
    
    // Style controls
    if (elements.titleSizeSlider) {
      elements.titleSizeSlider.addEventListener('input', function() {
        if (elements.titleSizeValue) {
          elements.titleSizeValue.textContent = this.value;
        }
        editorState.globalSettings.titleSize = parseFloat(this.value);
        updatePreview();
      });
    }
    
    if (elements.subtitleSizeSlider) {
      elements.subtitleSizeSlider.addEventListener('input', function() {
        if (elements.subtitleSizeValue) {
          elements.subtitleSizeValue.textContent = this.value;
        }
        editorState.globalSettings.subtitleSize = parseFloat(this.value);
        updatePreview();
      });
    }
    
    if (elements.primaryColor) {
      elements.primaryColor.addEventListener('input', function() {
        editorState.globalSettings.primaryColor = this.value;
        updatePreview();
      });
    }
    
    if (elements.secondaryColor) {
      elements.secondaryColor.addEventListener('input', function() {
        editorState.globalSettings.secondaryColor = this.value;
        updatePreview();
      });
    }
    
    if (elements.fontSelector) {
      elements.fontSelector.addEventListener('change', function() {
        editorState.globalSettings.bodyFont = this.value;
        updatePreview();
      });
    }
    
    // Create page dialog close button
    if (elements.closePageDialogBtn) {
      elements.closePageDialogBtn.addEventListener('click', closeCreatePageDialog);
    }
    
    // Cancel create page button
    if (elements.cancelCreatePageBtn) {
      elements.cancelCreatePageBtn.addEventListener('click', closeCreatePageDialog);
    }
    
    // New page template selector (in dialog)
    if (elements.newPageTemplate) {
      elements.newPageTemplate.addEventListener('change', function() {
        updateTemplatePreview(this.value);
      });
    }
    
    // Confirm create page button
    if (elements.confirmCreatePageBtn) {
      elements.confirmCreatePageBtn.addEventListener('click', createNewPage);
    }

    // Page ID sanitization
    if (elements.newPageId) {
      elements.newPageId.addEventListener('input', function() {
        // Sanitize the input to URL-friendly format
        this.value = sanitizePageId(this.value);
      });
    }
    
    // Setup auto-save functionality
    setupAutoSave();
  }

  // Setup auto-save functionality
  function setupAutoSave() {
    // Add change event listeners to form elements
    document.addEventListener('change', function(e) {
      if (e.target.closest('#pageEditorContainer')) {
        isDirty = true;
      }
    });
    
    // Add input event listeners for text fields
    document.addEventListener('input', function(e) {
      if (e.target.closest('#pageEditorContainer')) {
        isDirty = true;
        // Delay preview update to avoid too many updates
        if (previewTimer) clearTimeout(previewTimer);
        previewTimer = setTimeout(updatePreview, 500);
      }
    });
    
    // Handle form submission
    document.addEventListener('submit', function(e) {
      const form = e.target.closest('#editorForm');
      if (form) {
        e.preventDefault();
        savePage();
      }
    });
    
    // Add warning for unsaved changes when leaving the page
    window.addEventListener('beforeunload', function(e) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
  }

  // Sanitize page ID for URL-friendly format
  function sanitizePageId(input) {
    return input.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-');     // Replace multiple hyphens with a single one
  }

  // Load all pages from Firestore
  function loadPages() {
    if (!db || !elements.pagesList) return;
    
    // Show loading indicator
    elements.pagesList.innerHTML = '<div class="w3-center"><i class="fas fa-spinner fa-spin"></i> Loading pages...</div>';
    
    db.collection('pages').get()
      .then(snapshot => {
        // Clear list
        elements.pagesList.innerHTML = '';
        pageCache = {}; // Reset cache
        
        if (snapshot.empty) {
          // No pages found
          elements.pagesList.innerHTML = `
            <div class="w3-panel w3-pale-yellow w3-center">
              <p>No pages found. Create your first page to get started.</p>
            </div>
          `;
          return;
        }
        
        // Add pages to the list
        snapshot.forEach(doc => {
          const pageData = doc.data();
          const pageId = doc.id;
          
          // Cache the page data
          pageCache[pageId] = pageData;
          
          // Create page list item
          const pageItem = document.createElement('div');
          pageItem.className = 'page-item w3-bar w3-hover-light-grey w3-margin-bottom';
          pageItem.dataset.id = pageId;
          pageItem.innerHTML = `
            <div class="w3-bar-item w3-padding">
              <span class="page-title">${pageData.title || 'Untitled Page'}</span><br>
              <small class="w3-text-grey">${templates[pageData.template]?.name || pageData.template}</small>
            </div>
            <div class="w3-bar-item w3-right">
              <a href="page.php?id=${pageId}" target="_blank" class="w3-button w3-small w3-blue">
                <i class="fas fa-eye"></i>
              </a>
            </div>
          `;
          
          // Add click event to open editor
          pageItem.addEventListener('click', function(e) {
            // Ignore if the click was on the view button
            if (e.target.closest('a')) return;
            
            const pageId = this.dataset.id;
            openEditor(pageId);
          });
          
          elements.pagesList.appendChild(pageItem);
        });
        
        showStatus('Pages loaded successfully');
      })
      .catch(error => {
        console.error('Error loading pages:', error);
        elements.pagesList.innerHTML = `
          <div class="w3-panel w3-pale-red">
            <p>Error loading pages: ${error.message}</p>
            <button class="w3-button w3-red" onclick="PageEditor.loadPages()">Try Again</button>
          </div>
        `;
        showStatus('Error loading pages', true);
      });
  }

  // Open the create page dialog
  function openCreatePageDialog() {
    if (!elements.createPageDialog) return;
    
    // Clear form
    if (elements.newPageId) elements.newPageId.value = '';
    if (elements.newPageTitle) elements.newPageTitle.value = '';
    if (elements.newPageTemplate) elements.newPageTemplate.selectedIndex = 0;
    if (elements.templatePreview) elements.templatePreview.innerHTML = '';
    
    // Show dialog
    elements.createPageDialog.style.display = 'block';
  }

  // Close the create page dialog
  function closeCreatePageDialog() {
    if (!elements.createPageDialog) return;
    
    elements.createPageDialog.style.display = 'none';
  }

  // Update template preview in the create page dialog
  function updateTemplatePreview(templateId) {
    if (!elements.templatePreview) return;
    
    // Clear preview
    elements.templatePreview.innerHTML = '';
    
    if (!templateId || !templates[templateId]) return;
    
    const template = templates[templateId];
    
    // Create preview
    const previewContainer = document.createElement('div');
    previewContainer.className = 'template-preview-container';
    previewContainer.innerHTML = `
      <h4>${template.name}</h4>
      <p>${template.description}</p>
      <div class="template-preview">
        ${template.preview}
      </div>
    `;
    
    elements.templatePreview.appendChild(previewContainer);
  }

  // Create a new page
  function createNewPage() {
    if (!db || !elements.newPageId || !elements.newPageTitle || !elements.newPageTemplate) return;
    
    const pageId = elements.newPageId.value.trim();
    const pageTitle = elements.newPageTitle.value.trim();
    const templateId = elements.newPageTemplate.value;
    
    // Validation
    if (!pageId) {
      showStatus('Please enter a page ID', true);
      return;
    }
    
    if (!pageTitle) {
      showStatus('Please enter a page title', true);
      return;
    }
    
    if (!templateId || !templates[templateId]) {
      showStatus('Please select a template', true);
      return;
    }
    
    // Show loading status
    showStatus('Creating page...', false, 0);
    
    // Check if page ID already exists
    db.collection('pages').doc(pageId).get()
      .then(doc => {
        if (doc.exists) {
          showStatus(`Page ID "${pageId}" already exists. Please choose a different ID.`, true);
          return Promise.reject(new Error('Page ID already exists'));
        }
        
        // Create empty data based on template
        const templateData = {};
        const template = templates[templateId];
        
        template.fields.forEach(field => {
          if (field.type === 'repeater' && field.subfields) {
            // Initialize repeater fields with empty array
            templateData[field.name] = [];
          } else {
            // Initialize other fields with empty values
            switch (field.type) {
              case 'checkbox':
                templateData[field.name] = false;
                break;
              case 'gallery':
                templateData[field.name] = [];
                break;
              case 'image':
                templateData[field.name] = { url: '', alt: '' };
                break;
              default:
                templateData[field.name] = '';
            }
          }
        });
        
        // Set default values for common fields
        if (templateData.title === undefined) templateData.title = pageTitle;
        
        // Create page object
        const pageData = {
          title: pageTitle,
          template: templateId,
          data: templateData,
          settings: {
            titleSize: editorState.globalSettings.titleSize,
            subtitleSize: editorState.globalSettings.subtitleSize,
            primaryColor: editorState.globalSettings.primaryColor,
            secondaryColor: editorState.globalSettings.secondaryColor,
            bodyFont: editorState.globalSettings.bodyFont,
          },
          created: firebase.firestore.FieldValue.serverTimestamp(),
          updated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firestore
        return db.collection('pages').doc(pageId).set(pageData);
      })
      .then(() => {
        showStatus(`Page "${pageTitle}" created successfully`);
        
        // Update page cache
        pageCache[pageId] = {
          title: pageTitle,
          template: templateId,
          data: {},
          settings: { ...editorState.globalSettings }
        };
        
        // Close dialog
        closeCreatePageDialog();
        
        // Reload pages
        loadPages();
        
        // Open the editor for the new page
        setTimeout(() => {
          openEditor(pageId);
        }, 500);
      })
      .catch(error => {
        if (error.message !== 'Page ID already exists') {
          console.error('Error creating page:', error);
          showStatus('Error creating page: ' + error.message, true);
        }
      });
  }

  // Open the editor for a specific page
  function openEditor(pageId) {
    if (!db || !pageId || !elements.pageEditorContainer || !elements.pageWelcomeContainer) return;
    
    // Set current editing page
    currentEditingPage = pageId;
    
    // Show loading status
    showStatus('Loading page...', false, 0);
    
    // Check if page is in cache
    if (pageCache[pageId]) {
      // Use cached data
      displayEditor(pageId, pageCache[pageId]);
      showStatus('Page loaded', false, 2000);
    } else {
      // Load from Firestore
      db.collection('pages').doc(pageId).get()
        .then(doc => {
          if (!doc.exists) {
            showStatus(`Page "${pageId}" not found`, true);
            return Promise.reject(new Error('Page not found'));
          }
          
          const pageData = doc.data();
          
          // Cache the page data
          pageCache[pageId] = pageData;
          
          // Display the editor
          displayEditor(pageId, pageData);
          
          showStatus('Page loaded', false, 2000);
        })
        .catch(error => {
          console.error('Error loading page:', error);
          showStatus('Error loading page: ' + error.message, true);
          currentEditingPage = null;
        });
    }
  }

  // Display the editor for a page
  function displayEditor(pageId, pageData) {
    if (!elements.pageEditorContainer || !elements.pageWelcomeContainer) return;
    
    console.log('Displaying editor for page:', pageId, pageData);
    
    // Hide welcome message and show editor
    elements.pageWelcomeContainer.style.display = 'none';
    elements.pageEditorContainer.style.display = 'block';
    
    // Set editor title
    if (elements.editorPageTitle) {
      elements.editorPageTitle.textContent = `Editing: ${pageData.title || 'Untitled Page'}`;
    }
    
    // Set form values
    if (elements.pageId) elements.pageId.value = pageId;
    if (elements.pageTitle) elements.pageTitle.value = pageData.title || '';
    
    // Set template selector
    if (elements.templateSelector) {
      elements.templateSelector.value = pageData.template || '';
    }
    
    // Set style controls
    if (pageData.settings) {
      if (elements.titleSizeSlider && pageData.settings.titleSize) {
        elements.titleSizeSlider.value = pageData.settings.titleSize;
        if (elements.titleSizeValue) elements.titleSizeValue.textContent = pageData.settings.titleSize;
        editorState.globalSettings.titleSize = parseFloat(pageData.settings.titleSize);
      }
      
      if (elements.subtitleSizeSlider && pageData.settings.subtitleSize) {
        elements.subtitleSizeSlider.value = pageData.settings.subtitleSize;
        if (elements.subtitleSizeValue) elements.subtitleSizeValue.textContent = pageData.settings.subtitleSize;
        editorState.globalSettings.subtitleSize = parseFloat(pageData.settings.subtitleSize);
      }
      
      if (elements.primaryColor && pageData.settings.primaryColor) {
        elements.primaryColor.value = pageData.settings.primaryColor;
        editorState.globalSettings.primaryColor = pageData.settings.primaryColor;
      }
      
      if (elements.secondaryColor && pageData.settings.secondaryColor) {
        elements.secondaryColor.value = pageData.settings.secondaryColor;
        editorState.globalSettings.secondaryColor = pageData.settings.secondaryColor;
      }
      
      if (elements.fontSelector && pageData.settings.bodyFont) {
        elements.fontSelector.value = pageData.settings.bodyFont;
        editorState.globalSettings.bodyFont = pageData.settings.bodyFont;
      }
    }
    
    // Generate template fields
    generateTemplateFields(pageData.template, pageData.data);
    
    // Reset dirty flag
    isDirty = false;
    
    // Update preview
    updatePreview();
  }

  // Generate form fields based on template
  function generateTemplateFields(templateId, data) {
    if (!elements.templateFields || !templates[templateId]) return;
    
    const template = templates[templateId];
    editorState.selectedTemplate = templateId;
    editorState.currentFields = template.fields;
    
    // Clear existing fields
    elements.templateFields.innerHTML = '';
    
    // Create fields based on template
    template.fields.forEach(field => {
      createField(field, data, elements.templateFields);
    });
    
    // Initialize TinyMCE for rich text editors
    initializeTinyMCE();
  }

  // Create a form field based on field type
  function createField(field, data, container) {
    const fieldValue = data[field.name] !== undefined ? data[field.name] : '';
    const fieldId = `field_${field.name}`;
    
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'field-container w3-margin-bottom';
    fieldContainer.dataset.fieldName = field.name;
    fieldContainer.dataset.fieldType = field.type;
    
    // Create label (except for checkbox type)
    if (field.type !== 'checkbox') {
      const label = document.createElement('label');
      label.setAttribute('for', fieldId);
      label.innerHTML = `<strong>${field.label}${field.required ? ' *' : ''}:</strong>`;
      fieldContainer.appendChild(label);
    }
    
    // Create field input based on type
    switch (field.type) {
      case 'text':
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = fieldId;
        textInput.className = 'w3-input w3-border';
        textInput.value = fieldValue || '';
        textInput.required = field.required || false;
        fieldContainer.appendChild(textInput);
        break;
        
      case 'textarea':
        if (field.editor) {
          // Rich text editor (TinyMCE)
          const editorContainer = document.createElement('div');
          editorContainer.className = 'editor-container';
          
          const textarea = document.createElement('textarea');
          textarea.id = fieldId;
          textarea.className = 'tinymce-editor';
          textarea.rows = 8;
          textarea.value = fieldValue || '';
          textarea.required = field.required || false;
          
          editorContainer.appendChild(textarea);
          fieldContainer.appendChild(editorContainer);
        } else {
          // Simple textarea
          const textarea = document.createElement('textarea');
          textarea.id = fieldId;
          textarea.className = 'w3-input w3-border';
          textarea.rows = 4;
          textarea.value = fieldValue || '';
          textarea.required = field.required || false;
          fieldContainer.appendChild(textarea);
        }
        break;
        
      case 'checkbox':
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'w3-margin-bottom';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = fieldId;
        checkbox.className = 'w3-check';
        checkbox.checked = fieldValue || false;
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', fieldId);
        checkboxLabel.textContent = ` ${field.label}`;
        
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkboxLabel);
        fieldContainer.appendChild(checkboxContainer);
        break;
        
      case 'image':
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-field-container';
        
        // Preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview';
        previewContainer.id = `${fieldId}_preview`;
        
        // Preview image
        const previewImg = document.createElement('img');
        previewImg.src = fieldValue && fieldValue.url ? fieldValue.url : '/api/placeholder/400/300';
        previewImg.style.maxWidth = '100%';
        previewImg.style.display = fieldValue && fieldValue.url ? 'block' : 'none';
        
        previewContainer.appendChild(previewImg);
        
        // Upload button
        const uploadBtn = document.createElement('button');
        uploadBtn.type = 'button';
        uploadBtn.id = `${fieldId}_upload`;
        uploadBtn.className = 'w3-button w3-blue w3-margin-top';
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
        uploadBtn.addEventListener('click', () => uploadImage(fieldId));
        
        // Hidden input for image data
        const imageInput = document.createElement('input');
        imageInput.type = 'hidden';
        imageInput.id = fieldId;
        imageInput.value = JSON.stringify(fieldValue || { url: '', alt: '' });
        
        // Alt text input
        const altContainer = document.createElement('div');
        altContainer.className = 'w3-margin-top';
        
        const altLabel = document.createElement('label');
        altLabel.setAttribute('for', `${fieldId}_alt`);
        altLabel.textContent = 'Image Alt Text:';
        
        const altInput = document.createElement('input');
        altInput.type = 'text';
        altInput.id = `${fieldId}_alt`;
        altInput.className = 'w3-input w3-border';
        altInput.value = fieldValue && fieldValue.alt ? fieldValue.alt : '';
        altInput.placeholder = 'Describe the image for accessibility';
        
        // Event listener to update the hidden input
        altInput.addEventListener('input', () => {
          try {
            const imageData = JSON.parse(imageInput.value);
            imageData.alt = altInput.value;
            imageInput.value = JSON.stringify(imageData);
          } catch (error) {
            console.error('Error updating alt text:', error);
          }
        });
        
        altContainer.appendChild(altLabel);
        altContainer.appendChild(altInput);
        
        imageContainer.appendChild(previewContainer);
        imageContainer.appendChild(uploadBtn);
        imageContainer.appendChild(imageInput);
        imageContainer.appendChild(altContainer);
        
        fieldContainer.appendChild(imageContainer);
        break;
        
      case 'gallery':
        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'gallery-field-container';
        
        // Gallery preview
        const galleryPreview = document.createElement('div');
        galleryPreview.className = 'gallery-preview w3-row';
        galleryPreview.id = `${fieldId}_preview`;
        
        // Add existing images
        const galleryImages = fieldValue || [];
        galleryImages.forEach((image, index) => {
          if (!image || !image.url) return;
          
          const imageCol = createGalleryImageItem(fieldId, image, index);
          galleryPreview.appendChild(imageCol);
        });
        
        // Add image button
        const addImageBtn = document.createElement('button');
        addImageBtn.type = 'button';
        addImageBtn.id = `${fieldId}_add`;
        addImageBtn.className = 'w3-button w3-blue w3-margin-top';
        addImageBtn.innerHTML = '<i class="fas fa-plus"></i> Add Image';
        addImageBtn.addEventListener('click', () => addGalleryImage(fieldId));
        
        // Hidden input for gallery data
        const galleryInput = document.createElement('input');
        galleryInput.type = 'hidden';
        galleryInput.id = fieldId;
        galleryInput.value = JSON.stringify(galleryImages);
        
        galleryContainer.appendChild(galleryPreview);
        galleryContainer.appendChild(addImageBtn);
        galleryContainer.appendChild(galleryInput);
        
        fieldContainer.appendChild(galleryContainer);
        break;
        
      case 'date':
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.id = fieldId;
        dateInput.className = 'w3-input w3-border';
        dateInput.value = fieldValue || '';
        dateInput.required = field.required || false;
        fieldContainer.appendChild(dateInput);
        break;
        
      case 'tags':
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        
        const tagsInput = document.createElement('input');
        tagsInput.type = 'text';
        tagsInput.id = fieldId;
        tagsInput.className = 'w3-input w3-border';
        tagsInput.value = Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue || '';
        tagsInput.placeholder = 'Enter tags separated by commas';
        
        const tagsHelp = document.createElement('small');
        tagsHelp.className = 'w3-text-grey';
        tagsHelp.textContent = 'Enter tags separated by commas';
        
        tagsContainer.appendChild(tagsInput);
        tagsContainer.appendChild(tagsHelp);
        
        fieldContainer.appendChild(tagsContainer);
        break;
        
      case 'repeater':
        const repeaterContainer = document.createElement('div');
        repeaterContainer.className = 'repeater-container w3-card w3-padding';
        
        const repeaterHeader = document.createElement('div');
        repeaterHeader.className = 'repeater-header w3-bar';
        repeaterHeader.innerHTML = `
          <div class="w3-bar-item"><strong>${field.label}</strong></div>
          <button type="button" class="w3-bar-item w3-button w3-blue w3-right" id="${fieldId}_add">
            <i class="fas fa-plus"></i> Add Item
          </button>
        `;
        
        const repeaterItems = document.createElement('div');
        repeaterItems.className = 'repeater-items';
        repeaterItems.id = `${fieldId}_items`;
        
        // Add existing items
        const items = fieldValue || [];
        items.forEach((item, index) => {
          const itemContainer = createRepeaterItem(field, item, index);
          repeaterItems.appendChild(itemContainer);
        });
        
        // Add item button event
        repeaterHeader.querySelector(`#${fieldId}_add`).addEventListener('click', () => {
          addRepeaterItem(field, repeaterItems);
        });
        
        // Hidden input for repeater data
        const repeaterInput = document.createElement('input');
        repeaterInput.type = 'hidden';
        repeaterInput.id = fieldId;
        repeaterInput.value = JSON.stringify(items);
        
        repeaterContainer.appendChild(repeaterHeader);
        repeaterContainer.appendChild(repeaterItems);
        repeaterContainer.appendChild(repeaterInput);
        
        fieldContainer.appendChild(repeaterContainer);
        break;
    }
    
    container.appendChild(fieldContainer);
  }

  // Create a gallery image item
  function createGalleryImageItem(fieldId, image, index) {
    const imageCol = document.createElement('div');
    imageCol.className = 'w3-col s6 m4 l3 w3-padding gallery-item';
    imageCol.dataset.index = index;
    
    const imageCard = document.createElement('div');
    imageCard.className = 'w3-card';
    
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-wrapper';
    imageWrapper.style.position = 'relative';
    
    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.alt || '';
    img.style.width = '100%';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'w3-button w3-red w3-circle gallery-remove-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => removeGalleryImage(fieldId, index));
    
    const captionInput = document.createElement('input');
    captionInput.type = 'text';
    captionInput.className = 'w3-input w3-border w3-small';
    captionInput.value = image.caption || '';
    captionInput.placeholder = 'Caption';
    
    // Event listener to update caption
    captionInput.addEventListener('input', () => {
      updateGalleryImageCaption(fieldId, index, captionInput.value);
    });
    
    imageWrapper.appendChild(img);
    imageWrapper.appendChild(removeBtn);
    
    imageCard.appendChild(imageWrapper);
    imageCard.appendChild(captionInput);
    
    imageCol.appendChild(imageCard);
    
    return imageCol;
  }

  // Create a repeater item
  function createRepeaterItem(field, itemData, index) {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'repeater-item w3-card w3-margin-bottom';
    itemContainer.dataset.index = index;
    
    const itemHeader = document.createElement('div');
    itemHeader.className = 'repeater-item-header w3-bar w3-light-grey';
    itemHeader.innerHTML = `
      <div class="w3-bar-item">Item #${index + 1}</div>
      <button type="button" class="w3-bar-item w3-button w3-red w3-right repeater-remove-btn">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    const itemContent = document.createElement('div');
    itemContent.className = 'repeater-item-content w3-padding';
    
    // Add subfields
    field.subfields.forEach(subfield => {
      const subfieldValue = itemData[subfield.name] !== undefined ? itemData[subfield.name] : '';
      const subfieldId = `${field.name}_${index}_${subfield.name}`;
      
      const subfieldContainer = document.createElement('div');
      subfieldContainer.className = 'w3-margin-bottom';
      
      const label = document.createElement('label');
      label.setAttribute('for', subfieldId);
      label.innerHTML = `<strong>${subfield.label}:</strong>`;
      subfieldContainer.appendChild(label);
      
      // Create subfield input based on type
      switch (subfield.type) {
        case 'text':
          const textInput = document.createElement('input');
          textInput.type = 'text';
          textInput.id = subfieldId;
          textInput.className = 'w3-input w3-border';
          textInput.value = subfieldValue || '';
          textInput.dataset.name = subfield.name;
          
          // Event listener to update repeater data
          textInput.addEventListener('input', () => {
            updateRepeaterItemData(field.name, index, subfield.name, textInput.value);
          });
          
          subfieldContainer.appendChild(textInput);
          break;
          
        case 'textarea':
          const textarea = document.createElement('textarea');
          textarea.id = subfieldId;
          textarea.className = 'w3-input w3-border';
          textarea.rows = 3;
          textarea.value = subfieldValue || '';
          textarea.dataset.name = subfield.name;
          
          // Event listener to update repeater data
          textarea.addEventListener('input', () => {
            updateRepeaterItemData(field.name, index, subfield.name, textarea.value);
          });
          
          subfieldContainer.appendChild(textarea);
          break;
          
        case 'image':
          const imageContainer = document.createElement('div');
          imageContainer.className = 'image-field-container';
          
          // Preview container
          const previewContainer = document.createElement('div');
          previewContainer.className = 'image-preview';
          
          // Preview image
          const previewImg = document.createElement('img');
          previewImg.src = subfieldValue && subfieldValue.url ? subfieldValue.url : '/api/placeholder/400/300';
          previewImg.style.maxWidth = '100%';
          previewImg.style.display = subfieldValue && subfieldValue.url ? 'block' : 'none';
          
          previewContainer.appendChild(previewImg);
          
          // Upload button
          const uploadBtn = document.createElement('button');
          uploadBtn.type = 'button';
          uploadBtn.className = 'w3-button w3-blue w3-margin-top';
          uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
          uploadBtn.addEventListener('click', () => {
            uploadRepeaterImage(field.name, index, subfield.name, uploadBtn, previewImg);
          });
          
          // Hidden input for image data
          const imageInput = document.createElement('input');
          imageInput.type = 'hidden';
          imageInput.id = subfieldId;
          imageInput.value = JSON.stringify(subfieldValue || { url: '', alt: '' });
          imageInput.dataset.name = subfield.name;
          
          imageContainer.appendChild(previewContainer);
          imageContainer.appendChild(uploadBtn);
          imageContainer.appendChild(imageInput);
          
          subfieldContainer.appendChild(imageContainer);
          break;
      }
      
      itemContent.appendChild(subfieldContainer);
    });
    
    // Remove button event
    itemHeader.querySelector('.repeater-remove-btn').addEventListener('click', () => {
      removeRepeaterItem(field.name, index);
    });
    
    itemContainer.appendChild(itemHeader);
    itemContainer.appendChild(itemContent);
    
    return itemContainer;
  }

  // Add a new repeater item
  function addRepeaterItem(field, container) {
    // Get current items
    const fieldId = `field_${field.name}`;
    const input = document.getElementById(fieldId);
    
    if (!input) return;
    
    let items = [];
    try {
      items = JSON.parse(input.value) || [];
    } catch (error) {
      console.error('Error parsing repeater data:', error);
      items = [];
    }
    
    // Create empty item data
    const newItem = {};
    field.subfields.forEach(subfield => {
      switch (subfield.type) {
        case 'image':
          newItem[subfield.name] = { url: '', alt: '' };
          break;
        default:
          newItem[subfield.name] = '';
      }
    });
    
    // Add to items array
    items.push(newItem);
    
    // Update input value
    input.value = JSON.stringify(items);
    
    // Create and add item element
    const itemContainer = createRepeaterItem(field, newItem, items.length - 1);
    container.appendChild(itemContainer);
    
    // Mark as dirty
    isDirty = true;
    
    // Update preview
    updatePreview();
  }

  // Remove a repeater item
  function removeRepeaterItem(fieldName, index) {
    // Confirm deletion
    if (!confirm('Are you sure you want to remove this item?')) {
      return;
    }
    
    const fieldId = `field_${fieldName}`;
    const input = document.getElementById(fieldId);
    const itemsContainer = document.getElementById(`${fieldId}_items`);
    
    if (!input || !itemsContainer) return;
    
    let items = [];
    try {
      items = JSON.parse(input.value) || [];
    } catch (error) {
      console.error('Error parsing repeater data:', error);
      return;
    }
    
    // Remove item from array
    items.splice(index, 1);
    
    // Update input value
    input.value = JSON.stringify(items);
    
    // Rebuild all items to update indexes
    itemsContainer.innerHTML = '';
    
    items.forEach((item, idx) => {
      const itemContainer = createRepeaterItem({ name: fieldName, subfields: getSubfields(fieldName) }, item, idx);
      itemsContainer.appendChild(itemContainer);
    });
    
    // Mark as dirty
    isDirty = true;
    
    // Update preview
    updatePreview();
  }

  // Get subfields for a repeater field
  function getSubfields(fieldName) {
    for (const field of editorState.currentFields) {
      if (field.name === fieldName && field.type === 'repeater') {
        return field.subfields || [];
      }
    }
    
    return [];
  }

  // Update repeater item data
  function updateRepeaterItemData(fieldName, index, subfieldName, value) {
    const fieldId = `field_${fieldName}`;
    const input = document.getElementById(fieldId);
    
    if (!input) return;
    
    let items = [];
    try {
      items = JSON.parse(input.value) || [];
    } catch (error) {
      console.error('Error parsing repeater data:', error);
      return;
    }
    
    // Update item data
    if (items[index]) {
      items[index][subfieldName] = value;
    }
    
    // Update input value
    input.value = JSON.stringify(items);
    
    // Mark as dirty
    isDirty = true;
    
    // Update preview (with delay)
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 500);
  }

  // Upload an image for a repeater item
  function uploadRepeaterImage(fieldName, index, subfieldName, button, previewImg) {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        // Show loading status
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        button.disabled = true;
        
        // Create form data
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        // Upload image
        fetch('./api/upload.php', {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Get repeater item data
              const fieldId = `field_${fieldName}`;
              const input = document.getElementById(fieldId);
              
              if (!input) return;
              
              let items = [];
              try {
                items = JSON.parse(input.value) || [];
              } catch (error) {
                console.error('Error parsing repeater data:', error);
                return;
              }
              
              // Update image data
              if (items[index]) {
                items[index][subfieldName] = {
                  url: data.url,
                  alt: '',
                  filename: data.filename
                };
              }
              
              // Update input value
              input.value = JSON.stringify(items);
              
              // Update preview image
              if (previewImg) {
                previewImg.src = data.url;
                previewImg.style.display = 'block';
              }
              
              // Reset button
              button.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
              button.disabled = false;
              
              // Mark as dirty
              isDirty = true;
              
              // Update preview
              updatePreview();
              
              showStatus('Image uploaded successfully');
            } else {
              console.error('Error uploading image:', data.error);
              showStatus('Error uploading image: ' + data.error, true);
              
              // Reset button
              button.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
              button.disabled = false;
            }
          })
          .catch(error => {
            console.error('Error uploading image:', error);
            showStatus('Error uploading image', true);
            
            // Reset button
            button.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
            button.disabled = false;
          });
        
        // Remove file input
        document.body.removeChild(fileInput);
      }
    });
    
    // Trigger file selection
    fileInput.click();
  }

  // Upload an image
  function uploadImage(fieldId) {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        // Show loading status
        const uploadBtn = document.getElementById(`${fieldId}_upload`);
        if (uploadBtn) {
          uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
          uploadBtn.disabled = true;
        }
        
        showStatus('Uploading image...', false, 0);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        // Upload image
        fetch('./api/upload.php', {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Update hidden input
              const input = document.getElementById(fieldId);
              const altInput = document.getElementById(`${fieldId}_alt`);
              
              if (input) {
                // Get current image data
                let imageData = { url: '', alt: '' };
                try {
                  imageData = JSON.parse(input.value);
                } catch (error) {
                  console.error('Error parsing image data:', error);
                }
                
                // Update image data
                imageData.url = data.url;
                imageData.filename = data.filename;
                
                // Preserve alt text if available
                if (altInput) {
                  imageData.alt = altInput.value || '';
                }
                
                // Update input value
                input.value = JSON.stringify(imageData);
              }
              
              // Update preview image
              const previewImg = document.querySelector(`#${fieldId}_preview img`);
              if (previewImg) {
                previewImg.src = data.url;
                previewImg.style.display = 'block';
              }
              
              // Reset upload button
              if (uploadBtn) {
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
                uploadBtn.disabled = false;
              }
              
              // Mark as dirty
              isDirty = true;
              
              // Update preview
              updatePreview();
              
              showStatus('Image uploaded successfully');
            } else {
              console.error('Error uploading image:', data.error);
              showStatus('Error uploading image: ' + data.error, true);
              
              // Reset upload button
              if (uploadBtn) {
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
                uploadBtn.disabled = false;
              }
            }
          })
          .catch(error => {
            console.error('Error uploading image:', error);
            showStatus('Error uploading image', true);
            
            // Reset upload button
            const uploadBtn = document.getElementById(`${fieldId}_upload`);
            if (uploadBtn) {
              uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
              uploadBtn.disabled = false;
            }
          });
        
        // Remove file input
        document.body.removeChild(fileInput);
      }
    });
    
    // Trigger file selection
    fileInput.click();
  }

  // Add an image to a gallery
  function addGalleryImage(fieldId) {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        // Show loading status
        const addBtn = document.getElementById(`${fieldId}_add`);
        if (addBtn) {
          addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
          addBtn.disabled = true;
        }
        
        showStatus('Uploading image...', false, 0);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        // Upload image
        fetch('./api/upload.php', {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Get gallery input
              const input = document.getElementById(fieldId);
              const preview = document.getElementById(`${fieldId}_preview`);
              
              if (!input || !preview) return;
              
              // Get current gallery data
              let gallery = [];
              try {
                gallery = JSON.parse(input.value) || [];
              } catch (error) {
                console.error('Error parsing gallery data:', error);
                gallery = [];
              }
              
              // Create new image object
              const newImage = {
                url: data.url,
                alt: '',
                caption: '',
                filename: data.filename
              };
              
              // Add to gallery
              gallery.push(newImage);
              
              // Update input value
              input.value = JSON.stringify(gallery);
              
              // Add image to preview
              const imageCol = createGalleryImageItem(fieldId, newImage, gallery.length - 1);
              preview.appendChild(imageCol);
              
              // Reset add button
              if (addBtn) {
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Image';
                addBtn.disabled = false;
              }
              
              // Mark as dirty
              isDirty = true;
              
              // Update preview
              updatePreview();
              
              showStatus('Image added to gallery');
            } else {
              console.error('Error uploading image:', data.error);
              showStatus('Error uploading image: ' + data.error, true);
              
              // Reset add button
              if (addBtn) {
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Image';
                addBtn.disabled = false;
              }
            }
          })
          .catch(error => {
            console.error('Error uploading image:', error);
            showStatus('Error uploading image', true);
            
            // Reset add button
            const addBtn = document.getElementById(`${fieldId}_add`);
            if (addBtn) {
              addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Image';
              addBtn.disabled = false;
            }
          });
        
        // Remove file input
        document.body.removeChild(fileInput);
      }
    });
    
    // Trigger file selection
    fileInput.click();
  }

  // Remove an image from a gallery
  function removeGalleryImage(fieldId, index) {
    // Confirm deletion
    if (!confirm('Are you sure you want to remove this image?')) {
      return;
    }
    
    // Get gallery input and preview
    const input = document.getElementById(fieldId);
    const preview = document.getElementById(`${fieldId}_preview`);
    
    if (!input || !preview) return;
    
    // Get current gallery data
    let gallery = [];
    try {
      gallery = JSON.parse(input.value) || [];
    } catch (error) {
      console.error('Error parsing gallery data:', error);
      return;
    }
    
    // Remove image from gallery
    gallery.splice(index, 1);
    
    // Update input value
    input.value = JSON.stringify(gallery);
    
    // Rebuild gallery preview
    preview.innerHTML = '';
    gallery.forEach((image, idx) => {
      const imageCol = createGalleryImageItem(fieldId, image, idx);
      preview.appendChild(imageCol);
    });
    
    // Mark as dirty
    isDirty = true;
    
    // Update preview
    updatePreview();
    
    showStatus('Image removed from gallery');
  }

  // Update a gallery image caption
  function updateGalleryImageCaption(fieldId, index, caption) {
    // Get gallery input
    const input = document.getElementById(fieldId);
    
    if (!input) return;
    
    // Get current gallery data
    let gallery = [];
    try {
      gallery = JSON.parse(input.value) || [];
    } catch (error) {
      console.error('Error parsing gallery data:', error);
      return;
    }
    
    // Update caption
    if (gallery[index]) {
      gallery[index].caption = caption;
    }
    
    // Update input value
    input.value = JSON.stringify(gallery);
    
    // Mark as dirty
    isDirty = true;
    
    // Update preview (with delay)
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 500);
  }

  // Initialize TinyMCE for rich text editors
  function initializeTinyMCE() {
    // Remove existing instances
    if (typeof tinymce !== 'undefined') {
      tinymce.remove('.tinymce-editor');
      
      // Initialize for all rich text editors
      tinymce.init({
        selector: '.tinymce-editor',
        height: 300,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | fontsizeselect | ' +
          'bold italic backcolor forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | link image | help',
        content_style: 'body { font-family: "Lato", sans-serif; font-size: 16px; }',
        font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt',
        // Update preview when content changes
        setup: function(editor) {
          editor.on('Change', function() {
            isDirty = true;
            if (previewTimer) clearTimeout(previewTimer);
            previewTimer = setTimeout(updatePreview, 500);
          });
        }
      });
    }
  }

  // Change the template of the current page
  function changeTemplate(templateId) {
    if (!currentEditingPage || !templates[templateId]) return;
    
    // Confirm template change
    if (isDirty) {
      if (!confirm('Changing the template will discard unsaved changes. Continue?')) {
        // Reset the template selector
        if (elements.templateSelector) {
          elements.templateSelector.value = editorState.selectedTemplate;
        }
        return;
      }
    }
    
    // Show loading status
    showStatus('Changing template...', false, 0);
    
    // Get current page data
    const pageData = pageCache[currentEditingPage];
    if (!pageData) return;
    
    // Create new data object based on template
    const templateData = {};
    const template = templates[templateId];
    
    template.fields.forEach(field => {
      if (field.type === 'repeater' && field.subfields) {
        // Initialize repeater fields with empty array
        templateData[field.name] = [];
      } else {
        // Check if field exists in current data
        if (pageData.data && pageData.data[field.name] !== undefined) {
          // Use existing data
          templateData[field.name] = pageData.data[field.name];
        } else {
          // Initialize with empty values
          switch (field.type) {
            case 'checkbox':
              templateData[field.name] = false;
              break;
            case 'gallery':
              templateData[field.name] = [];
              break;
            case 'image':
              templateData[field.name] = { url: '', alt: '' };
              break;
            default:
              templateData[field.name] = '';
          }
        }
      }
    });
    
    // Update page data
    pageData.template = templateId;
    pageData.data = templateData;
    
    // Update cache
    pageCache[currentEditingPage] = pageData;
    
    // Generate template fields
    generateTemplateFields(templateId, templateData);
    
    // Reset dirty flag
    isDirty = false;
    
    // Update preview
    updatePreview();
    
    showStatus('Template changed successfully');
  }

  // Update the live preview
  function updatePreview() {
    if (!elements.livePreview || !currentEditingPage) return;
    
    // Get page data
    const pageData = pageCache[currentEditingPage];
    if (!pageData) return;
    
    // Get form data
    const formData = getFormData();
    
    // Create preview HTML
    const previewHtml = generatePreviewHtml(pageData.template, formData);
    
    // Update preview container
    elements.livePreview.innerHTML = previewHtml;
  }

  // Get form data
  function getFormData() {
    if (!elements.templateFields) return {};
    
    // Get TinyMCE content first
    let tinymceContent = {};
    if (typeof tinymce !== 'undefined') {
      const editors = tinymce.editors;
      for (let i = 0; i < editors.length; i++) {
        const editor = editors[i];
        const fieldName = editor.id.replace('field_', '');
        tinymceContent[fieldName] = editor.getContent();
      }
    }
    
    // Collect form data
    const formData = {};
    
    // Process all field containers
    const fieldContainers = elements.templateFields.querySelectorAll('.field-container');
    fieldContainers.forEach(container => {
      const fieldName = container.dataset.fieldName;
      const fieldType = container.dataset.fieldType;
      
      if (!fieldName || !fieldType) return;
      
      switch (fieldType) {
        case 'text':
        case 'textarea':
          const input = document.getElementById(`field_${fieldName}`);
          if (input) {
            formData[fieldName] = input.value;
          }
          break;
          
        case 'checkbox':
          const checkbox = document.getElementById(`field_${fieldName}`);
          if (checkbox) {
            formData[fieldName] = checkbox.checked;
          }
          break;
          
        case 'image':
          const imageInput = document.getElementById(`field_${fieldName}`);
          if (imageInput) {
            try {
              formData[fieldName] = JSON.parse(imageInput.value);
            } catch (error) {
              console.error('Error parsing image data:', error);
              formData[fieldName] = { url: '', alt: '' };
            }
          }
          break;
          
        case 'gallery':
          const galleryInput = document.getElementById(`field_${fieldName}`);
          if (galleryInput) {
            try {
              formData[fieldName] = JSON.parse(galleryInput.value);
            } catch (error) {
              console.error('Error parsing gallery data:', error);
              formData[fieldName] = [];
            }
          }
          break;
          
        case 'date':
          const dateInput = document.getElementById(`field_${fieldName}`);
          if (dateInput) {
            formData[fieldName] = dateInput.value;
          }
          break;
          
        case 'tags':
          const tagsInput = document.getElementById(`field_${fieldName}`);
          if (tagsInput) {
            formData[fieldName] = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
          break;
          
        case 'repeater':
          const repeaterInput = document.getElementById(`field_${fieldName}`);
          if (repeaterInput) {
            try {
              formData[fieldName] = JSON.parse(repeaterInput.value);
            } catch (error) {
              console.error('Error parsing repeater data:', error);
              formData[fieldName] = [];
            }
          }
          break;
      }
    });
    
    // Add TinyMCE content
    Object.assign(formData, tinymceContent);
    
    return formData;
  }

  // Generate preview HTML based on template and data
  function generatePreviewHtml(templateId, data) {
    if (!templates[templateId]) return '<div class="w3-panel w3-pale-red">Invalid template</div>';
    
    // Get title from page title field
    const pageTitle = elements.pageTitle ? elements.pageTitle.value : '';
    
    // Get style settings
    const settings = {
      titleSize: editorState.globalSettings.titleSize,
      subtitleSize: editorState.globalSettings.subtitleSize,
      primaryColor: editorState.globalSettings.primaryColor,
      secondaryColor: editorState.globalSettings.secondaryColor,
      bodyFont: editorState.globalSettings.bodyFont
    };
    
    // Generate CSS for preview
    const previewCss = `
      <style>
        .preview-container {
          font-family: ${settings.bodyFont};
          color: #333;
          padding: 15px;
        }
        .preview-title {
          font-size: ${settings.titleSize}em;
          color: ${settings.primaryColor};
          margin-bottom: 10px;
        }
        .preview-subtitle {
          font-size: ${settings.subtitleSize}em;
          color: ${settings.secondaryColor};
          margin-bottom: 20px;
        }
        .preview-content {
          line-height: 1.6;
        }
        .preview-image {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 15px 0;
        }
        .preview-gallery {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -5px;
        }
        .preview-gallery-item {
          width: 33.33%;
          padding: 5px;
          box-sizing: border-box;
        }
        .preview-gallery-item img {
          width: 100%;
          height: auto;
          display: block;
        }
        .preview-features {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -10px;
        }
        .preview-feature {
          width: 33.33%;
          padding: 10px;
          box-sizing: border-box;
        }
        .preview-cta {
          background-color: ${settings.secondaryColor};
          color: white;
          padding: 15px;
          text-align: center;
          margin-top: 20px;
        }
        .preview-button {
          display: inline-block;
          background-color: ${settings.primaryColor};
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          font-weight: bold;
          border-radius: 4px;
        }
        .preview-contact-info {
          margin: 20px 0;
        }
        .preview-form {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
        }
      </style>
    `;
    
    // Generate template-specific HTML
    let templateHtml = '';
    
    switch (templateId) {
      case 'basic':
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <h1 class="preview-title">${data.title || pageTitle}</h1>
            ${data.subtitle ? `<h2 class="preview-subtitle">${data.subtitle}</h2>` : ''}
            <div class="preview-content">${data.content || ''}</div>
          </div>
        `;
        break;
        
      case 'text-image':
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <h1 class="preview-title">${data.title || pageTitle}</h1>
            ${data.subtitle ? `<h2 class="preview-subtitle">${data.subtitle}</h2>` : ''}
            <div class="w3-row">
              <div class="w3-col m8">
                <div class="preview-content">${data.content || ''}</div>
              </div>
              <div class="w3-col m4">
                ${data.featuredImage && data.featuredImage.url ? 
                  `<img src="${data.featuredImage.url}" alt="${data.featuredImage.alt || ''}" class="preview-image">` : 
                  '<div class="w3-pale-blue w3-padding w3-center">Featured Image Placeholder</div>'
                }
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'image-text':
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <h1 class="preview-title">${data.title || pageTitle}</h1>
            ${data.subtitle ? `<h2 class="preview-subtitle">${data.subtitle}</h2>` : ''}
            <div class="w3-row">
              <div class="w3-col m4">
                ${data.featuredImage && data.featuredImage.url ? 
                  `<img src="${data.featuredImage.url}" alt="${data.featuredImage.alt || ''}" class="preview-image">` : 
                  '<div class="w3-pale-blue w3-padding w3-center">Featured Image Placeholder</div>'
                }
              </div>
              <div class="w3-col m8">
                <div class="preview-content">${data.content || ''}</div>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'gallery':
       // Generate gallery items HTML
        let galleryItemsHtml = '';
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          data.images.forEach(image => {
            if (image && image.url) {
              galleryItemsHtml += `
                <div class="preview-gallery-item">
                  <img src="${image.url}" alt="${image.alt || ''}" class="w3-image">
                  ${image.caption ? `<div class="w3-padding-small w3-light-grey">${image.caption}</div>` : ''}
                </div>
              `;
            }
          });
        }
        
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <h1 class="preview-title">${data.title || pageTitle}</h1>
            ${data.subtitle ? `<h2 class="preview-subtitle">${data.subtitle}</h2>` : ''}
            <div class="preview-content">${data.description || ''}</div>
            <div class="preview-gallery">
              ${galleryItemsHtml || '<div class="w3-pale-blue w3-padding w3-center w3-col s12">No gallery images added</div>'}
            </div>
          </div>
        `;
        break;
        
      case 'landing':
        // Generate features HTML
        let featuresHtml = '';
        if (data.features && Array.isArray(data.features) && data.features.length > 0) {
          data.features.forEach(feature => {
            if (feature) {
              featuresHtml += `
                <div class="preview-feature">
                  <div class="w3-card w3-padding">
                    ${feature.icon && feature.icon.url ? 
                      `<img src="${feature.icon.url}" alt="${feature.icon.alt || ''}" style="width:64px; height:64px; margin:0 auto; display:block;">` : 
                      '<div class="w3-circle w3-light-grey w3-padding w3-center" style="width:64px; height:64px; margin:0 auto; display:flex; align-items:center; justify-content:center;"><i class="fas fa-star"></i></div>'
                    }
                    <h3 class="w3-center">${feature.title || 'Feature Title'}</h3>
                    <p>${feature.description || 'Feature description goes here.'}</p>
                  </div>
                </div>
              `;
            }
          });
        }
        
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <div class="w3-padding-32 w3-center" style="background-color: ${settings.primaryColor}; color: white;">
              <h1 class="preview-title" style="color: white;">${data.title || pageTitle}</h1>
              ${data.subtitle ? `<h2 class="preview-subtitle" style="color: white;">${data.subtitle}</h2>` : ''}
              ${data.heroImage && data.heroImage.url ? 
                `<img src="${data.heroImage.url}" alt="${data.heroImage.alt || ''}" class="preview-image" style="margin: 20px auto;">` : 
                '<div class="w3-pale-blue w3-padding w3-center" style="margin: 20px auto; max-width: 80%;">Hero Image Placeholder</div>'
              }
            </div>
            
            ${data.featuresTitle ? `<h2 class="w3-center" style="margin: 30px 0;">${data.featuresTitle}</h2>` : ''}
            <div class="preview-features">
              ${featuresHtml || '<div class="w3-pale-blue w3-padding w3-center w3-col s12">No features added</div>'}
            </div>
            
            <div class="preview-cta">
              <h2>${data.ctaText || 'Call to Action'}</h2>
              <a href="${data.ctaButtonLink || '#'}" class="preview-button">${data.ctaButtonText || 'Learn More'}</a>
            </div>
          </div>
        `;
        break;
        
      case 'portfolio':
        // Generate projects HTML
        let projectsHtml = '';
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          data.projects.forEach(project => {
            if (project) {
              projectsHtml += `
                <div class="w3-col m6 l4 w3-padding">
                  <div class="w3-card">
                    ${project.thumbnail && project.thumbnail.url ? 
                      `<img src="${project.thumbnail.url}" alt="${project.thumbnail.alt || ''}" style="width:100%;">` : 
                      '<div class="w3-pale-blue w3-padding w3-center" style="height: 150px;">Project Image</div>'
                    }
                    <div class="w3-padding">
                      <h3>${project.title || 'Project Title'}</h3>
                      <p>${project.description || 'Project description'}</p>
                      ${project.link ? `<a href="${project.link}" class="w3-button w3-blue">View Project</a>` : ''}
                    </div>
                  </div>
                </div>
              `;
            }
          });
        }
        
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <h1 class="preview-title">${data.title || pageTitle}</h1>
            ${data.subtitle ? `<h2 class="preview-subtitle">${data.subtitle}</h2>` : ''}
            <div class="preview-content">${data.introduction || ''}</div>
            <div class="w3-row">
              ${projectsHtml || '<div class="w3-pale-blue w3-padding w3-center w3-col s12">No projects added</div>'}
            </div>
          </div>
        `;
        break;
        
      case 'contact':
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <h1 class="preview-title">${data.title || pageTitle}</h1>
            ${data.subtitle ? `<h2 class="preview-subtitle">${data.subtitle}</h2>` : ''}
            <div class="preview-content">${data.introduction || ''}</div>
            
            <div class="w3-row">
              <div class="w3-col m6">
                <div class="preview-contact-info">
                  ${data.address ? `<p><i class="fas fa-map-marker-alt"></i> ${data.address}</p>` : ''}
                  ${data.email ? `<p><i class="fas fa-envelope"></i> ${data.email}</p>` : ''}
                  ${data.phone ? `<p><i class="fas fa-phone"></i> ${data.phone}</p>` : ''}
                </div>
              </div>
              <div class="w3-col m6">
                ${data.contactImage && data.contactImage.url ? 
                  `<img src="${data.contactImage.url}" alt="${data.contactImage.alt || ''}" class="preview-image">` : 
                  '<div class="w3-pale-blue w3-padding w3-center" style="height: 150px;">Map/Contact Image</div>'
                }
              </div>
            </div>
            
            ${data.showForm ? `
              <div class="preview-form">
                <h3>Contact Form</h3>
                <div class="w3-row-padding">
                  <div class="w3-half">
                    <input class="w3-input w3-border" type="text" placeholder="Name" disabled>
                  </div>
                  <div class="w3-half">
                    <input class="w3-input w3-border" type="text" placeholder="Email" disabled>
                  </div>
                </div>
                <textarea class="w3-input w3-border" placeholder="Message" style="margin-top: 10px;" disabled></textarea>
                <button class="w3-button w3-blue w3-margin-top" disabled>Send Message</button>
              </div>
            ` : ''}
          </div>
        `;
        break;
        
      case 'blog':
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <h1 class="preview-title">${data.title || pageTitle}</h1>
            ${data.subtitle ? `<h2 class="preview-subtitle">${data.subtitle}</h2>` : ''}
            
            <div class="w3-bar w3-light-grey w3-padding-small">
              ${data.date ? `<span class="w3-bar-item"><i class="far fa-calendar-alt"></i> ${data.date}</span>` : ''}
              ${data.author ? `<span class="w3-bar-item"><i class="far fa-user"></i> ${data.author}</span>` : ''}
              ${data.categories && Array.isArray(data.categories) && data.categories.length > 0 ? 
                `<span class="w3-bar-item"><i class="fas fa-tags"></i> ${data.categories.join(', ')}</span>` : ''}
            </div>
            
            ${data.featuredImage && data.featuredImage.url ? 
              `<img src="${data.featuredImage.url}" alt="${data.featuredImage.alt || ''}" class="preview-image">` : 
              '<div class="w3-pale-blue w3-padding w3-center" style="height: 200px;">Featured Image</div>'
            }
            
            ${data.excerpt ? `<div class="w3-panel w3-light-grey w3-leftbar w3-border-blue"><p><em>${data.excerpt}</em></p></div>` : ''}
            
            <div class="preview-content">${data.content || ''}</div>
          </div>
        `;
        break;
        
      default:
        templateHtml = `
          <div class="preview-container">
            ${previewCss}
            <div class="w3-panel w3-pale-red">
              <h3>Invalid Template</h3>
              <p>The selected template "${templateId}" is not supported.</p>
            </div>
          </div>
        `;
    }
    
    return templateHtml;
  }

  // Close the editor and return to the welcome screen
  function closeEditor() {
    // Check for unsaved changes
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to close the editor?')) {
        return;
      }
    }
    
    // Reset current editing page
    currentEditingPage = null;
    
    // Hide editor and show welcome screen
    if (elements.pageEditorContainer) {
      elements.pageEditorContainer.style.display = 'none';
    }
    
    if (elements.pageWelcomeContainer) {
      elements.pageWelcomeContainer.style.display = 'block';
    }
    
    // Clean up TinyMCE instances
    if (typeof tinymce !== 'undefined') {
      tinymce.remove('.tinymce-editor');
    }
  }

  // Save the current page
  function savePage() {
    if (!db || !currentEditingPage) {
      showStatus('No page currently being edited', true);
      return;
    }
    
    // Show loading status
    showStatus('Saving page...', false, 0);
    
    // Get page data
    const pageData = pageCache[currentEditingPage];
    if (!pageData) {
      showStatus('Error: Page data not found', true);
      return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Get page title
    const pageTitle = elements.pageTitle ? elements.pageTitle.value : pageData.title;
    
    // Get style settings
    const settings = {
      titleSize: editorState.globalSettings.titleSize,
      subtitleSize: editorState.globalSettings.subtitleSize,
      primaryColor: editorState.globalSettings.primaryColor,
      secondaryColor: editorState.globalSettings.secondaryColor,
      bodyFont: editorState.globalSettings.bodyFont
    };
    
    // Update page data
    const updatedPageData = {
      ...pageData,
      title: pageTitle,
      data: formData,
      settings: settings,
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firestore
    db.collection('pages').doc(currentEditingPage).update(updatedPageData)
      .then(() => {
        // Update cache
        pageCache[currentEditingPage] = updatedPageData;
        
        // Update page list item
        const pageItem = document.querySelector(`.page-item[data-id="${currentEditingPage}"] .page-title`);
        if (pageItem) {
          pageItem.textContent = pageTitle;
        }
        
        // Reset dirty flag
        isDirty = false;
        
        showStatus('Page saved successfully');
      })
      .catch(error => {
        console.error('Error saving page:', error);
        showStatus('Error saving page: ' + error.message, true);
      });
  }

  // Open page preview in a new tab
  function openPagePreview() {
    if (!currentEditingPage) {
      showStatus('No page currently being edited', true);
      return;
    }
    
    // Check if there are unsaved changes
    if (isDirty) {
      if (confirm('You have unsaved changes. Save before previewing?')) {
        // Save first, then open preview
        db.collection('pages').doc(currentEditingPage).get()
          .then(doc => {
            if (!doc.exists) {
              showStatus('Error: Page not found', true);
              return Promise.reject(new Error('Page not found'));
            }
            
            savePage();
            
            // Open in new tab
            setTimeout(() => {
              window.open(`page.php?id=${currentEditingPage}`, '_blank');
            }, 500);
          })
          .catch(error => {
            console.error('Error opening preview:', error);
            showStatus('Error opening preview: ' + error.message, true);
          });
      } else {
        // Open without saving
        window.open(`page.php?id=${currentEditingPage}`, '_blank');
      }
    } else {
      // No unsaved changes, just open preview
      window.open(`page.php?id=${currentEditingPage}`, '_blank');
    }
  }

  // Delete the current page
  function deletePage() {
    if (!db || !currentEditingPage) {
      showStatus('No page currently being edited', true);
      return;
    }
    
    // Get page data
    const pageData = pageCache[currentEditingPage];
    if (!pageData) {
      showStatus('Error: Page data not found', true);
      return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the page "${pageData.title}"? This action cannot be undone.`)) {
      return;
    }
    
    // Show loading status
    showStatus('Deleting page...', false, 0);
    
    // Delete from Firestore
    db.collection('pages').doc(currentEditingPage).delete()
      .then(() => {
        // Remove from cache
        delete pageCache[currentEditingPage];
        
        // Remove from page list
        const pageItem = document.querySelector(`.page-item[data-id="${currentEditingPage}"]`);
        if (pageItem) {
          pageItem.remove();
        }
        
        // Reset current editing page
        currentEditingPage = null;
        
        // Close editor
        closeEditor();
        
        showStatus('Page deleted successfully');
        
        // If no pages left, show message
        if (Object.keys(pageCache).length === 0) {
          if (elements.pagesList) {
            elements.pagesList.innerHTML = `
              <div class="w3-panel w3-pale-yellow w3-center">
                <p>No pages found. Create your first page to get started.</p>
              </div>
            `;
          }
        }
      })
      .catch(error => {
        console.error('Error deleting page:', error);
        showStatus('Error deleting page: ' + error.message, true);
      });
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
    closeCreatePageDialog
  };
})();

// Initialize PageEditor when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize PageEditor
  PageEditor.init();
});