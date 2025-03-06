 /**
 * page-editor.js
 * Manages page creation, editing, and management functionality
 */

import { getFirestore, getDocument, saveDocument, deleteDocument } from '../core/firebase.js';
import { showStatus, updateElementContent, createElement, debounce, sanitize } from '../core/utils.js';
import { PAGE_TEMPLATES } from '../core/config.js';

// Module state
let currentPage = null;
let pageCache = {};
let isDirty = false;
let previewTimer = null;
let editorState = {
  selectedTemplate: '',
  currentFields: [],
  globalSettings: {}
};

/**
 * Initialize the page editor
 * @returns {Object} Page editor methods
 */
export function initPageEditor() {
  console.log("Initializing Page Editor");
  
  // Cache DOM elements
  cacheElements();
  
  // Initialize templates
  initializeTemplates();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load pages
  loadPages();
  
  return {
    loadPages,
    openEditor,
    closeEditor,
    savePage,
    createNewPage,
    deletePage,
    previewPage,
    setDirty
  };
}

// DOM element cache
const elements = {};

/**
 * Cache DOM elements for better performance
 */
function cacheElements() {
  elements.pagesListCol = document.getElementById('pagesListCol');
  elements.pagesEditorCol = document.getElementById('pagesEditorCol');
  elements.pagesList = document.getElementById('pagesList');
  elements.createPageBtn = document.getElementById('createPageBtn');
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
  elements.createPageDialog = document.getElementById('createPageDialog');
  elements.newPageId = document.getElementById('newPageId');
  elements.newPageTitle = document.getElementById('newPageTitle');
  elements.newPageTemplate = document.getElementById('newPageTemplate');
  elements.confirmCreatePageBtn = document.getElementById('confirmCreatePageBtn');
  elements.cancelCreatePageBtn = document.getElementById('cancelCreatePageBtn');
}

/**
 * Initialize template selectors and options
 */
function initializeTemplates() {
  // Populate template selector
  if (elements.templateSelector) {
    clearTemplateSelector(elements.templateSelector);
    populateTemplateSelector(elements.templateSelector);
  }
  
  // Populate new page template selector
  if (elements.newPageTemplate) {
    clearTemplateSelector(elements.newPageTemplate);
    populateTemplateSelector(elements.newPageTemplate);
  }
}

/**
 * Clear a template selector
 * @param {HTMLElement} selector - Template selector element
 */
function clearTemplateSelector(selector) {
  while (selector.options.length > 1) {
    selector.remove(1);
  }
}

/**
 * Populate a template selector with options
 * @param {HTMLElement} selector - Template selector element
 */
function populateTemplateSelector(selector) {
  for (const [id, template] of Object.entries(PAGE_TEMPLATES)) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = template.name;
    selector.appendChild(option);
  }
}

/**
 * Setup event listeners for editor elements
 */
function setupEventListeners() {
  // Create page button
  if (elements.createPageBtn) {
    elements.createPageBtn.addEventListener('click', openCreatePageDialog);
  }
  
  // Welcome create button
  const welcomeCreateBtn = document.getElementById('welcomeCreateBtn');
  if (welcomeCreateBtn) {
    welcomeCreateBtn.addEventListener('click', openCreatePageDialog);
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
    elements.previewPageBtn.addEventListener('click', previewPage);
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
  
  // Create page dialog close button
  const closePageDialogBtn = document.getElementById('closePageDialogBtn');
  if (closePageDialogBtn) {
    closePageDialogBtn.addEventListener('click', closeCreatePageDialog);
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
      this.value = sanitize(this.value);
    });
  }
  
  // Setup auto-save functionality
  setupAutoSave();
}

/**
 * Setup auto-save functionality
 */
function setupAutoSave() {
  // Add change event listeners to form elements
  document.addEventListener('change', function(e) {
    if (e.target.closest('#pageEditorContainer')) {
      setDirty(true);
    }
  });
  
  // Add input event listeners for text fields
  document.addEventListener('input', function(e) {
    if (e.target.closest('#pageEditorContainer')) {
      setDirty(true);
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
}

/**
 * Set dirty state of the editor
 * @param {boolean} dirty - Whether the content has unsaved changes
 */
export function setDirty(dirty) {
  isDirty = dirty;
  
  // Notify parent that content has changed
  if (window.AdminPanel && typeof window.AdminPanel.markDirty === 'function' && dirty) {
    window.AdminPanel.markDirty();
  }
}

/**
 * Load pages from Firestore
 */
export async function loadPages() {
  const db = getFirestore();
  if (!db || !elements.pagesList) return;
  
  // Show loading indicator
  elements.pagesList.innerHTML = '<div class="w3-center"><i class="fas fa-spinner fa-spin"></i> Loading pages...</div>';
  
  try {
    // Get pages from Firestore
    const snapshot = await db.collection('pages').get();
    
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
      const pageItem = createElement('div', { 
        className: 'page-item w3-bar w3-hover-light-grey w3-margin-bottom',
        'data-id': pageId 
      });
      
      pageItem.innerHTML = `
        <div class="w3-bar-item w3-padding">
          <span class="page-title">${pageData.title || 'Untitled Page'}</span><br>
          <small class="w3-text-grey">${PAGE_TEMPLATES[pageData.template]?.name || pageData.template}</small>
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
        
        const pageId = this.getAttribute('data-id');
        openEditor(pageId);
      });
      
      elements.pagesList.appendChild(pageItem);
    });
    
    showStatus('Pages loaded successfully');
  } catch (error) {
    console.error('Error loading pages:', error);
    elements.pagesList.innerHTML = `
      <div class="w3-panel w3-pale-red">
        <p>Error loading pages: ${error.message}</p>
        <button class="w3-button w3-red" onclick="PageEditor.loadPages()">Try Again</button>
      </div>
    `;
    showStatus('Error loading pages', true);
  }
}

/**
 * Open the create page dialog
 */
export function openCreatePageDialog() {
  if (!elements.createPageDialog) return;
  
  // Clear form
  if (elements.newPageId) elements.newPageId.value = '';
  if (elements.newPageTitle) elements.newPageTitle.value = '';
  if (elements.newPageTemplate) elements.newPageTemplate.selectedIndex = 0;
  
  const templatePreview = document.getElementById('templatePreview');
  if (templatePreview) {
    templatePreview.innerHTML = '';
  }
  
  // Show dialog
  elements.createPageDialog.style.display = 'block';
}

/**
 * Close the create page dialog
 */
export function closeCreatePageDialog() {
  if (!elements.createPageDialog) return;
  
  elements.createPageDialog.style.display = 'none';
}

/**
 * Update template preview in the create page dialog
 * @param {string} templateId - Template ID
 */
function updateTemplatePreview(templateId) {
  const templatePreview = document.getElementById('templatePreview');
  if (!templatePreview) return;
  
  // Clear preview
  templatePreview.innerHTML = '';
  
  if (!templateId || !PAGE_TEMPLATES[templateId]) return;
  
  const template = PAGE_TEMPLATES[templateId];
  
  // Create preview
  const previewContainer = createElement('div', { className: 'template-preview-container' });
  previewContainer.innerHTML = `
    <h4>${template.name}</h4>
    <p>${template.description}</p>
    <div class="template-preview">
      <div class="w3-card w3-padding">
        <h5>Template Structure</h5>
        <ul>
          ${template.fields.map(field => `<li>${field.label} (${field.type})</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  templatePreview.appendChild(previewContainer);
}

/**
 * Create a new page
 */
export async function createNewPage() {
  const db = getFirestore();
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
  
  if (!templateId || !PAGE_TEMPLATES[templateId]) {
    showStatus('Please select a template', true);
    return;
  }
  
  // Show loading status
  showStatus('Creating page...', false, 0);
  
  try {
    // Check if page ID already exists
    const pageDoc = await db.collection('pages').doc(pageId).get();
    
    if (pageDoc.exists) {
      showStatus(`Page ID "${pageId}" already exists. Please choose a different ID.`, true);
      return;
    }
    
    // Create empty data based on template
    const templateData = {};
    const template = PAGE_TEMPLATES[templateId];
    
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
        titleSize: 2.5,
        subtitleSize: 1.8,
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        bodyFont: "'Lato', sans-serif",
      },
      created: new Date(),
      updated: new Date()
    };
    
    // Save to Firestore
    await db.collection('pages').doc(pageId).set(pageData);
    
    showStatus(`Page "${pageTitle}" created successfully`);
    
    // Update page cache
    pageCache[pageId] = pageData;
    
    // Close dialog
    closeCreatePageDialog();
    
    // Reload pages
    await loadPages();
    
    // Open the editor for the new page
    setTimeout(() => {
      openEditor(pageId);
    }, 500);
  } catch (error) {
    console.error('Error creating page:', error);
    showStatus('Error creating page: ' + error.message, true);
  }
}

/**
 * Open the editor for a specific page
 * @param {string} pageId - ID of the page to edit
 */
export async function openEditor(pageId) {
  const db = getFirestore();
  if (!db || !pageId || !elements.pageEditorContainer || !elements.pageWelcomeContainer) return;
  
  // Set current editing page
  currentPage = pageId;
  
  // Show loading status
  showStatus('Loading page...', false, 0);
  
  try {
    // Check if page is in cache
    if (pageCache[pageId]) {
      // Use cached data
      displayEditor(pageId, pageCache[pageId]);
      showStatus('Page loaded', false, 2000);
    } else {
      // Load from Firestore
      const doc = await db.collection('pages').doc(pageId).get();
      
      if (!doc.exists) {
        showStatus(`Page "${pageId}" not found`, true);
        return;
      }
      
      const pageData = doc.data();
      
      // Cache the page data
      pageCache[pageId] = pageData;
      
      // Display the editor
      displayEditor(pageId, pageData);
      
      showStatus('Page loaded', false, 2000);
    }
  } catch (error) {
    console.error('Error loading page:', error);
    showStatus('Error loading page: ' + error.message, true);
    currentPage = null;
  }
}

/**
 * Display the editor for a page
 * @param {string} pageId - ID of the page
 * @param {Object} pageData - Page data
 */
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
  
  // Set editor state
  editorState.selectedTemplate = pageData.template;
  editorState.globalSettings = pageData.settings || {
    titleSize: 2.5,
    subtitleSize: 1.8,
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    bodyFont: "'Lato', sans-serif",
  };
  
  // Generate template fields
  generateTemplateFields(pageData.template, pageData.data);
  
  // Reset dirty flag
  setDirty(false);
  
  // Update preview
  updatePreview();
}

/**
 * Generate form fields based on template
 * @param {string} templateId - Template ID
 * @param {Object} data - Field data
 */
function generateTemplateFields(templateId, data) {
  if (!elements.templateFields || !PAGE_TEMPLATES[templateId]) return;
  
  const template = PAGE_TEMPLATES[templateId];
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

/**
 * Create a form field
 * @param {Object} field - Field definition
 * @param {Object} data - Field data
 * @param {HTMLElement} container - Container element
 */
function createField(field, data, container) {
  const fieldValue = data[field.name] !== undefined ? data[field.name] : '';
  const fieldId = `field_${field.name}`;
  
  const fieldContainer = createElement('div', {
    className: 'field-container w3-margin-bottom',
    'data-field-name': field.name,
    'data-field-type': field.type
  });
  
  // Create label (except for checkbox type)
  if (field.type !== 'checkbox') {
    const label = createElement('label', { for: fieldId });
    label.innerHTML = `<strong>${field.label}${field.required ? ' *' : ''}:</strong>`;
    fieldContainer.appendChild(label);
  }
  
  // Create field input based on type
  switch (field.type) {
    case 'text':
      const textInput = createElement('input', {
        type: 'text',
        id: fieldId,
        className: 'w3-input w3-border',
        value: fieldValue || '',
        required: field.required || false
      });
      fieldContainer.appendChild(textInput);
      break;
      
    case 'textarea':
      if (field.editor) {
        // Rich text editor (TinyMCE)
        const editorContainer = createElement('div', {
          className: 'editor-container'
        });
        
        const textarea = createElement('textarea', {
          id: fieldId,
          className: 'tinymce-editor',
          rows: 8,
          value: fieldValue || '',
          required: field.required || false
        });
        
        editorContainer.appendChild(textarea);
        fieldContainer.appendChild(editorContainer);
      } else {
        // Simple textarea
        const textarea = createElement('textarea', {
          id: fieldId,
          className: 'w3-input w3-border',
          rows: 4,
          value: fieldValue || '',
          required: field.required || false
        });
        fieldContainer.appendChild(textarea);
      }
      break;
      
    case 'checkbox':
      const checkboxContainer = createElement('div', {
        className: 'w3-margin-bottom'
      });
      
      const checkbox = createElement('input', {
        type: 'checkbox',
        id: fieldId,
        className: 'w3-check',
        checked: fieldValue || false
      });
      
      const checkboxLabel = createElement('label', {
        for: fieldId
      });
      checkboxLabel.textContent = ` ${field.label}`;
      
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(checkboxLabel);
      fieldContainer.appendChild(checkboxContainer);
      break;
      
    case 'image':
      const imageContainer = createElement('div', {
        className: 'image-field-container'
      });
      
      // Preview container
      const previewContainer = createElement('div', {
        className: 'image-preview',
        id: `${fieldId}_preview`
      });
      
      // Preview image
      const previewImg = createElement('img', {
        src: fieldValue && fieldValue.url ? fieldValue.url : '/api/placeholder/400/300',
        style: {
          maxWidth: '100%',
          display: fieldValue && fieldValue.url ? 'block' : 'none'
        }
      });
      
      previewContainer.appendChild(previewImg);
      
      // Upload button
      const uploadBtn = createElement('button', {
        type: 'button',
        id: `${fieldId}_upload`,
        className: 'w3-button w3-blue w3-margin-top'
      });
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
      uploadBtn.addEventListener('click', () => uploadImage(fieldId));
      
      // Hidden input for image data
      const imageInput = createElement('input', {
        type: 'hidden',
        id: fieldId,
        value: JSON.stringify(fieldValue || { url: '', alt: '' })
      });
      
      // Alt text input
      const altContainer = createElement('div', {
        className: 'w3-margin-top'
      });
      
      const altLabel = createElement('label', {
        for: `${fieldId}_alt`
      });
      altLabel.textContent = 'Image Alt Text:';
      
      const altInput = createElement('input', {
        type: 'text',
        id: `${fieldId}_alt`,
        className: 'w3-input w3-border',
        value: fieldValue && fieldValue.alt ? fieldValue.alt : '',
        placeholder: 'Describe the image for accessibility'
      });
      
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
      const galleryContainer = createElement('div', {
        className: 'gallery-field-container'
      });
      
      // Gallery preview
      const galleryPreview = createElement('div', {
        className: 'gallery-preview w3-row',
        id: `${fieldId}_preview`
      });
      
      // Add existing images
      const galleryImages = fieldValue || [];
      galleryImages.forEach((image, index) => {
        if (!image || !image.url) return;
        
        const imageCol = createGalleryImageItem(fieldId, image, index);
        galleryPreview.appendChild(imageCol);
      });
      
      // Add image button
      const addImageBtn = createElement('button', {
        type: 'button',
        id: `${fieldId}_add`,
        className: 'w3-button w3-blue w3-margin-top'
      });
      addImageBtn.innerHTML = '<i class="fas fa-plus"></i> Add Image';
      addImageBtn.addEventListener('click', () => addGalleryImage(fieldId));
      
      // Hidden input for gallery data
      const galleryInput = createElement('input', {
        type: 'hidden',
        id: fieldId,
        value: JSON.stringify(galleryImages)
      });
      
      galleryContainer.appendChild(galleryPreview);
      galleryContainer.appendChild(addImageBtn);
      galleryContainer.appendChild(galleryInput);
      
      fieldContainer.appendChild(galleryContainer);
      break;
      
    case 'date':
      const dateInput = createElement('input', {
        type: 'date',
        id: fieldId,
        className: 'w3-input w3-border',
        value: fieldValue || '',
        required: field.required || false
      });
      fieldContainer.appendChild(dateInput);
      break;
      
    case 'tags':
      const tagsContainer = createElement('div', {
        className: 'tags-container'
      });
      
      const tagsInput = createElement('input', {
        type: 'text',
        id: fieldId,
        className: 'w3-input w3-border',
        value: Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue || '',
        placeholder: 'Enter tags separated by commas'
      });
      
      const tagsHelp = createElement('small', {
        className: 'w3-text-grey'
      });
      tagsHelp.textContent = 'Enter tags separated by commas';
      
      tagsContainer.appendChild(tagsInput);
      tagsContainer.appendChild(tagsHelp);
      
      fieldContainer.appendChild(tagsContainer);
      break;
  }
  
  container.appendChild(fieldContainer);
}

/**
 * Create a gallery image item
 * @param {string} fieldId - Field ID
 * @param {Object} image - Image data
 * @param {number} index - Image index
 * @returns {HTMLElement} Gallery item element
 */
function createGalleryImageItem(fieldId, image, index) {
  const imageCol = createElement('div', {
    className: 'w3-col s6 m4 l3 w3-padding gallery-item',
    'data-index': index
  });
  
  const imageCard = createElement('div', {
    className: 'w3-card'
  });
  
  const imageWrapper = createElement('div', {
    className: 'image-wrapper',
    style: {
      position: 'relative'
    }
  });
  
  const img = createElement('img', {
    src: image.url,
    alt: image.alt || '',
    style: {
      width: '100%'
    }
  });
  
  const removeBtn = createElement('button', {
    type: 'button',
    className: 'w3-button w3-red w3-circle gallery-remove-btn'
  });
  removeBtn.innerHTML = '<i class="fas fa-times"></i>';
  removeBtn.addEventListener('click', () => removeGalleryImage(fieldId, index));
  
  const captionInput = createElement('input', {
    type: 'text',
    className: 'w3-input w3-border w3-small',
    value: image.caption || '',
    placeholder: 'Caption'
  });
  
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

/**
 * Upload an image
 * @param {string} fieldId - Field ID
 */
async function uploadImage(fieldId) {
  // Create file input
  const fileInput = createElement('input', {
    type: 'file',
    accept: 'image/*',
    style: {
      display: 'none'
    }
  });
  
  document.body.appendChild(fileInput);
  
  // Handle file selection
  fileInput.addEventListener('change', async () => {
    if (fileInput.files && fileInput.files[0]) {
      // Show loading status
      const uploadBtn = document.getElementById(`${fieldId}_upload`);
      if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        uploadBtn.disabled = true;
      }
      
      showStatus('Uploading image...', false, 0);
      
      try {
        // Create form data
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        // Upload image
        const response = await fetch('./api/upload.php', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
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
          setDirty(true);
          
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
      } catch (error) {
        console.error('Error uploading image:', error);
        showStatus('Error uploading image', true);
        
        // Reset upload button
        const uploadBtn = document.getElementById(`${fieldId}_upload`);
        if (uploadBtn) {
          uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
          uploadBtn.disabled = false;
        }
      }
      
      // Remove file input
      document.body.removeChild(fileInput);
    }
  });
  
  // Trigger file selection
  fileInput.click();
}

/**
 * Add an image to a gallery
 * @param {string} fieldId - Field ID
 */
async function addGalleryImage(fieldId) {
  // Create file input
  const fileInput = createElement('input', {
    type: 'file',
    accept: 'image/*',
    style: {
      display: 'none'
    }
  });
  
  document.body.appendChild(fileInput);
  
  // Handle file selection
  fileInput.addEventListener('change', async () => {
    if (fileInput.files && fileInput.files[0]) {
      // Show loading status
      const addBtn = document.getElementById(`${fieldId}_add`);
      if (addBtn) {
        addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        addBtn.disabled = true;
      }
      
      showStatus('Uploading image...', false, 0);
      
      try {
        // Create form data
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        // Upload image
        const response = await fetch('./api/upload.php', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
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
          setDirty(true);
          
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
      } catch (error) {
        console.error('Error uploading image:', error);
        showStatus('Error uploading image', true);
        
        // Reset add button
        const addBtn = document.getElementById(`${fieldId}_add`);
        if (addBtn) {
          addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Image';
          addBtn.disabled = false;
        }
      }
      
      // Remove file input
      document.body.removeChild(fileInput);
    }
  });
  
  // Trigger file selection
  fileInput.click();
}

/**
 * Remove an image from a gallery
 * @param {string} fieldId - Field ID
 * @param {number} index - Image index
 */
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
  setDirty(true);
  
  // Update preview
  updatePreview();
  
  showStatus('Image removed from gallery');
}

/**
 * Update a gallery image caption
 * @param {string} fieldId - Field ID
 * @param {number} index - Image index
 * @param {string} caption - New caption
 */
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
  setDirty(true);
  
  // Update preview (with delay)
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 500);
}

/**
 * Initialize TinyMCE for rich text editors
 */
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
          setDirty(true);
          if (previewTimer) clearTimeout(previewTimer);
          previewTimer = setTimeout(updatePreview, 500);
        });
      }
    });
  }
}

/**
 * Change the template of the current page
 * @param {string} templateId - New template ID
 */
function changeTemplate(templateId) {
  if (!currentPage || !PAGE_TEMPLATES[templateId]) return;
  
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
  const pageData = pageCache[currentPage];
  if (!pageData) return;
  
  // Create new data object based on template
  const templateData = {};
  const template = PAGE_TEMPLATES[templateId];
  
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
  pageCache[currentPage] = pageData;
  
  // Generate template fields
  generateTemplateFields(templateId, templateData);
  
  // Reset dirty flag
  setDirty(false);
  
  // Update preview
  updatePreview();
  
  showStatus('Template changed successfully');
}

/**
 * Update the live preview
 */
function updatePreview() {
  const livePreview = document.getElementById('livePreview');
  if (!livePreview || !currentPage) return;
  
  // Get page data
  const pageData = pageCache[currentPage];
  if (!pageData) return;
  
  // Get form data
  const formData = getFormData();
  
  // Create preview HTML
  const previewHtml = generatePreviewHtml(pageData.template, formData);
  
  // Update preview container
  livePreview.innerHTML = previewHtml;
}

/**
 * Get form data
 * @returns {Object} Form data
 */
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
    }
  });
  
  // Add TinyMCE content
  Object.assign(formData, tinymceContent);
  
  return formData;
}

/**
 * Generate preview HTML
 * @param {string} templateId - Template ID
 * @param {Object} data - Form data
 * @returns {string} Preview HTML
 */
function generatePreviewHtml(templateId, data) {
  if (!PAGE_TEMPLATES[templateId]) return '<div class="w3-panel w3-pale-red">Invalid template</div>';
  
  // Get title from page title field
  const pageTitle = elements.pageTitle ? elements.pageTitle.value : '';
  
  // Get style settings
  const settings = editorState.globalSettings || {
    titleSize: 2.5,
    subtitleSize: 1.8,
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    bodyFont: "'Lato', sans-serif"
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
                '<div class="w3-pale-blue w3-padding w3-center" style="height: 150px;">Contact Image</div>'
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

/**
 * Close the editor and return to the welcome screen
 */
export function closeEditor() {
  // Check for unsaved changes
  if (isDirty) {
    if (!confirm('You have unsaved changes. Are you sure you want to close the editor?')) {
      return;
    }
  }
  
  // Reset current editing page
  currentPage = null;
  
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

/**
 * Save the current page
 */
export async function savePage() {
  const db = getFirestore();
  if (!db || !currentPage) {
    showStatus('No page currently being edited', true);
    return null;
  }
  
  // Show loading status
  showStatus('Saving page...', false, 0);
  
  // Get page data
  const pageData = pageCache[currentPage];
  if (!pageData) {
    showStatus('Error: Page data not found', true);
    return null;
  }
  
  // Get form data
  const formData = getFormData();
  
  // Get page title
  const pageTitle = elements.pageTitle ? elements.pageTitle.value : pageData.title;
  
  try {
    // Update page data
    const updatedPageData = {
      ...pageData,
      title: pageTitle,
      data: formData,
      updated: new Date()
    };
    
    // Save to Firestore
    await db.collection('pages').doc(currentPage).update(updatedPageData);
    
    // Update cache
    pageCache[currentPage] = updatedPageData;
    
    // Update page list item
    const pageItem = document.querySelector(`.page-item[data-id="${currentPage}"] .page-title`);
    if (pageItem) {
      pageItem.textContent = pageTitle;
    }
    
    // Reset dirty flag
    setDirty(false);
    
    showStatus('Page saved successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error saving page:', error);
    showStatus('Error saving page: ' + error.message, true);
    return { success: false, error };
  }
}

/**
 * Delete the current page
 */
export async function deletePage() {
  const db = getFirestore();
  if (!db || !currentPage) {
    showStatus('No page currently being edited', true);
    return;
  }
  
  // Get page data
  const pageData = pageCache[currentPage];
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
  
  try {
    // Delete from Firestore
    await db.collection('pages').doc(currentPage).delete();
    
    // Remove from cache
    delete pageCache[currentPage];
    
    // Remove from page list
    const pageItem = document.querySelector(`.page-item[data-id="${currentPage}"]`);
    if (pageItem) {
      pageItem.remove();
    }
    
    // Reset current editing page
    currentPage = null;
    
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
  } catch (error) {
    console.error('Error deleting page:', error);
    showStatus('Error deleting page: ' + error.message, true);
  }
}

/**
 * Preview the current page in a new tab
 */
export function previewPage() {
  if (!currentPage) {
    showStatus('No page currently being edited', true);
    return;
  }
  
  // Check if there are unsaved changes
  if (isDirty) {
    if (confirm('You have unsaved changes. Save before previewing?')) {
      // Save first, then open preview
      savePage().then((result) => {
        if (result && result.success) {
          // Open in new tab
          window.open(`page.php?id=${currentPage}`, '_blank');
        }
      });
    } else {
      // Open without saving
      window.open(`page.php?id=${currentPage}`, '_blank');
    }
  } else {
    // No unsaved changes, just open preview
    window.open(`page.php?id=${currentPage}`, '_blank');
  }
}

// Initialize when this module is loaded
export default initPageEditor;