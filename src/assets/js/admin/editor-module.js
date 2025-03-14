/**
 * Editor Module
 * Manages rich text editors in the admin panel
 * Provides a unified API for Quill editors with TinyMCE compatibility layer
 */
const EditorModule = (function() {
  // Active editors registry
  const activeEditors = new Map();
  
  // Default editor configuration options
  const defaultOptions = {
    theme: 'snow',
    placeholder: 'Enter content here...',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    }
  };
  
  // Predefined editor configurations for different field types
  const editorTypes = {
    // Editor for headings and short texts
    heading: {
      placeholder: 'Enter heading...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'header': [1, 2, 3, false] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['clean']
        ]
      }
    },
    
    // Editor for short text sections
    short: {
      placeholder: 'Enter short text...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    },
    
    // Full-featured editor for comprehensive content
    full: {
      placeholder: 'Enter content here...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ]
      }
    }
  };
  
  /**
   * Check if Quill is available
   * @returns {boolean} Availability
   */
  function isQuillAvailable() {
    return typeof Quill !== 'undefined';
  }
  
  /**
   * Initialize a Quill editor
   * @param {HTMLElement|string} container - Container or container ID
   * @param {Object} options - Editor options
   * @returns {Object|null} Quill editor instance or null on failure
   */
  function initEditor(container, options = {}) {
    if (!isQuillAvailable()) {
      console.error('Quill editor not available. Please load the Quill library.');
      return null;
    }
    
    // Get container element
    const editorContainer = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!editorContainer) {
      console.error('Editor container not found');
      return null;
    }
    
    // Get predefined options based on editorType
    let baseOptions = { ...defaultOptions };
    if (options.editorType && editorTypes[options.editorType]) {
      baseOptions = { ...baseOptions, ...editorTypes[options.editorType] };
      delete options.editorType; // Remove editorType from options
    }
    
    // Merge options
    const mergedOptions = { ...baseOptions, ...options };
    
    try {
      // Create Quill editor
      const editor = new Quill(editorContainer, mergedOptions);
      
      // Store editor in registry
      const containerId = editorContainer.id || `editor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      if (!editorContainer.id) {
        editorContainer.id = containerId;
      }
      
      activeEditors.set(containerId, editor);
      
      return editor;
    } catch (error) {
      console.error('Error initializing editor:', error);
      return null;
    }
  }
  
  /**
   * Get editor content
   * @param {string} containerId - Container ID
   * @returns {string} HTML content
   */
  function getContent(containerId) {
    const editor = activeEditors.get(containerId);
    if (!editor) return '';
    
    return editor.root.innerHTML;
  }
  
  /**
   * Set editor content
   * @param {string} containerId - Container ID
   * @param {string} content - HTML content
   * @returns {boolean} Success
   */
  function setContent(containerId, content) {
    const editor = activeEditors.get(containerId);
    if (!editor) return false;
    
    // Clear content and insert new content
    editor.root.innerHTML = '';
    editor.clipboard.dangerouslyPasteHTML(content || '');
    
    return true;
  }
  
  /**
   * Get editor instance
   * @param {string} containerId - Container ID
   * @returns {Object|null} Quill editor instance
   */
  function getEditor(containerId) {
    return activeEditors.get(containerId);
  }
  
  /**
   * Convert textarea to Quill editor
   * @param {HTMLElement|string} textarea - Textarea or textarea ID
   * @param {Object} options - Editor options
   * @returns {Object|null} Quill editor instance
   */
  function convertTextarea(textarea, options = {}) {
    if (!isQuillAvailable()) {
      console.error('Quill editor not available');
      return null;
    }
    
    // Get textarea element
    const textareaElement = typeof textarea === 'string' 
      ? document.getElementById(textarea) 
      : textarea;
    
    if (!textareaElement || textareaElement.tagName !== 'TEXTAREA') {
      console.error('No valid textarea found');
      return null;
    }
    
    // Create editor container
    const containerId = `${textareaElement.id}-editor`;
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'quill-editor';
      container.style.minHeight = options.minHeight || '200px';
      
      // Insert container after textarea
      textareaElement.insertAdjacentElement('afterend', container);
    }
    
    // Hide textarea
    textareaElement.style.display = 'none';
    
    // Initialize editor
    const editor = initEditor(container, options);
    
    if (!editor) {
      console.error('Error initializing editor');
      return null;
    }
    
    // Set initial content
    editor.clipboard.dangerouslyPasteHTML(textareaElement.value || '');
    
    // Sync changes to textarea
    editor.on('text-change', () => {
      textareaElement.value = editor.root.innerHTML;
      
      // Trigger change event on textarea
      const event = new Event('change', { bubbles: true });
      textareaElement.dispatchEvent(event);
      
      // Set dirty flag if in admin panel
      if (window.AdminCore && typeof window.AdminCore.setDirty === 'function') {
        window.AdminCore.setDirty(true);
      } else if (window.PageEditor && typeof window.PageEditor.setDirty === 'function') {
        window.PageEditor.setDirty(true);
      }
    });
    
    return editor;
  }
  
  /**
   * Convert all textareas with a specific selector to editors
   * @param {string} selector - CSS selector for textareas
   * @param {Object} options - Editor options
   * @returns {Array} Created editors
   */
  function convertAll(selector = '.tinymce-editor', options = {}) {
    const textareas = document.querySelectorAll(selector);
    const editors = [];
    
    textareas.forEach(textarea => {
      // Get specific options from data attributes
      const elementOptions = { ...options };
      
      // Get editor type from data-editor-type
      if (textarea.dataset.editorType && editorTypes[textarea.dataset.editorType]) {
        elementOptions.editorType = textarea.dataset.editorType;
      }
      
      // Get min height from data-min-height
      if (textarea.dataset.minHeight) {
        elementOptions.minHeight = textarea.dataset.minHeight;
      }
      
      // Create editor
      const editor = convertTextarea(textarea, elementOptions);
      if (editor) editors.push(editor);
    });
    
    return editors;
  }
  
  /**
   * Remove editor from DOM
   * @param {string} containerId - Container ID
   * @returns {boolean} Success
   */
  function destroyEditor(containerId) {
    const editor = activeEditors.get(containerId);
    if (!editor) return false;
    
    // Remove from registry
    activeEditors.delete(containerId);
    
    // Clear container
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      
      // Find hidden textarea and show it
      const textareaId = containerId.replace('-editor', '');
      const textarea = document.getElementById(textareaId);
      if (textarea) {
        textarea.style.display = '';
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Remove all editors
   */
  function destroyAll() {
    for (const containerId of activeEditors.keys()) {
      destroyEditor(containerId);
    }
  }
  
  /**
   * Refresh editors after DOM changes
   * (useful after AJAX loading)
   * @param {string} selector - CSS selector for textareas
   * @param {Object} options - Editor options
   * @returns {Array} Created editors
   */
  function refreshEditors(selector = '.tinymce-editor', options = {}) {
    // Note existing editor container IDs
    const existingEditors = new Set(activeEditors.keys());
    
    // Create new editors
    const editors = convertAll(selector, options);
    
    // Remove old editors that are no longer in the DOM
    for (const containerId of existingEditors) {
      if (!document.getElementById(containerId)) {
        activeEditors.delete(containerId);
      }
    }
    
    return editors;
  }
  
  /**
   * Create TinyMCE compatibility layer
   * For backwards compatibility with existing code
   * @returns {Object} TinyMCE-like API
   */
  function createTinyMCECompatLayer() {
    return {
      init: function(selector) {
        convertAll(selector);
        return this;
      },
      activeEditor: {
        getContent: function() {
          // Find active editor (simple implementation)
          for (const [id, editor] of activeEditors.entries()) {
            if (document.activeElement.closest(`#${id}`)) {
              return editor.root.innerHTML;
            }
          }
          
          // If no active editor found, use first editor
          if (activeEditors.size > 0) {
            const firstEditor = activeEditors.values().next().value;
            return firstEditor.root.innerHTML;
          }
          
          return '';
        }
      },
      get editors() {
        return Array.from(activeEditors.values());
      },
      remove: function(selector) {
        const containers = document.querySelectorAll(selector);
        containers.forEach(container => {
          const editorId = `${container.id}-editor`;
          destroyEditor(editorId);
        });
      }
    };
  }
  
  // Public API
  return {
    initEditor,
    getContent,
    setContent,
    getEditor,
    convertTextarea,
    convertAll,
    destroyEditor,
    destroyAll,
    refreshEditors,
    getActiveEditors: () => activeEditors,
    createTinyMCECompatLayer
  };
})();

// For global access
window.EditorModule = EditorModule;

// TinyMCE compatibility layer for legacy scripts
window.tinymce = EditorModule.createTinyMCECompatLayer();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Delay to ensure Quill is loaded
  setTimeout(() => {
    if (typeof Quill !== 'undefined') {
      EditorModule.convertAll();
    }
  }, 100);
});