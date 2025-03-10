/**
 * Enhanced Quill Editor Integration Function
 * Replaces TinyMCE with Quill editor throughout the admin panel
 * Added support for headings and titles with improved formatting options
 */

// Initialize Quill editors
const initQuillEditor = (selector = '.quill-editor', options = {}) => {
  // Find all editor containers
  const editorContainers = document.querySelectorAll(selector);
  const editors = [];

  // Default options for Quill
  const defaultOptions = {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    },
    placeholder: 'Write content here...',
  };

  // Merge default options with custom options
  const mergedOptions = { ...defaultOptions, ...options };

  // Initialize Quill for each container
  editorContainers.forEach((container) => {
    // Skip if already initialized
    if (container.querySelector('.ql-editor')) return;
    
    // Check if container is a heading/title field based on ID or parent class
    const isHeadingField = container.id.includes('Title') || container.id.includes('Subtitle') || 
                          container.closest('.field-container')?.dataset.fieldType === 'text';
    
    // Adjust toolbar options for heading fields
    let finalOptions = { ...mergedOptions };
    if (isHeadingField) {
      finalOptions.modules.toolbar = [
        ['bold', 'italic', 'underline'],
        [{ 'header': [1, 2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
      ];
      finalOptions.placeholder = 'Enter title text...';
    }
    
    // Create a hidden textarea to store the HTML value (for form submission)
    const textareaId = container.id + '_textarea';
    let textarea = document.getElementById(textareaId);
    
    if (!textarea) {
      textarea = document.createElement('textarea');
      textarea.id = textareaId;
      textarea.name = container.id + '_content';
      textarea.style.display = 'none';
      container.parentNode.insertBefore(textarea, container.nextSibling);
    }
    
    // Get initial content
    const initialContent = container.innerHTML;
    textarea.value = initialContent;
    
    // Create Quill instance
    const editor = new Quill(container, finalOptions);
    
    // Set initial content
    editor.clipboard.dangerouslyPasteHTML(initialContent);
    
    // Update hidden textarea when content changes
    editor.on('text-change', () => {
      const html = container.querySelector('.ql-editor').innerHTML;
      textarea.value = html;
      
      // Trigger change event for form validation/state tracking
      const event = new Event('change', { bubbles: true });
      textarea.dispatchEvent(event);
      
      // Mark content as dirty if state tracking is available
      if (window.state && typeof window.state.isDirty !== 'undefined') {
        window.state.isDirty = true;
      }
    });
    
    // Add editor to the list
    editors.push(editor);
  });
  
  return editors;
};

// Get content from a Quill editor
const getQuillContent = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return '';
  
  const editorContent = container.querySelector('.ql-editor');
  return editorContent ? editorContent.innerHTML : '';
};

// Set content to a Quill editor
const setQuillContent = (containerId, content) => {
  const container = document.getElementById(containerId);
  if (!container) return false;
  
  const quillInstance = Quill.find(container);
  if (quillInstance) {
    quillInstance.clipboard.dangerouslyPasteHTML(content);
    return true;
  }
  
  return false;
};

/**
 * Helper function to convert textareas to Quill editors
 * This can be used as a direct replacement for the TinyMCE initialization
 */
const convertTextareasToQuill = () => {
  // Find all textareas with the 'tinymce-editor' class
  const textareas = document.querySelectorAll('textarea.tinymce-editor');
  
  textareas.forEach((textarea) => {
    // Create a div to hold the editor
    const editorDiv = document.createElement('div');
    editorDiv.id = textarea.id + '_quill';
    editorDiv.className = 'quill-editor';
    editorDiv.style.minHeight = '200px';
    
    // Insert the div after the textarea
    textarea.parentNode.insertBefore(editorDiv, textarea.nextSibling);
    
    // Hide the original textarea
    textarea.style.display = 'none';
    
    // Determine if this is a heading field
    const isHeadingField = textarea.id.includes('Title') || textarea.id.includes('Subtitle');
    
    // Initialize Quill with appropriate toolbar based on field type
    const quill = new Quill(editorDiv, {
      theme: 'snow',
      modules: {
        toolbar: isHeadingField ? 
          [
            ['bold', 'italic', 'underline'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
          ] :
          [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ]
      },
      placeholder: isHeadingField ? 'Enter title text...' : 'Write content here...'
    });
    
    // Set initial content
    quill.clipboard.dangerouslyPasteHTML(textarea.value);
    
    // Update textarea when editor content changes
    quill.on('text-change', () => {
      textarea.value = editorDiv.querySelector('.ql-editor').innerHTML;
      
      // Trigger change event for form validation
      const event = new Event('change', { bubbles: true });
      textarea.dispatchEvent(event);
      
      // Mark content as dirty if state tracking is available
      if (window.state && typeof window.state.isDirty !== 'undefined') {
        window.state.isDirty = true;
      }
    });
  });
};

/**
 * Initialize Quill editors for all title and regular text fields in the page editor
 */
const initPageEditorQuill = () => {
  // Initialize Quill for all quill-editor elements
  const quillEditors = document.querySelectorAll('.quill-editor');
  quillEditors.forEach(editor => {
    // Skip if already initialized
    if (editor.querySelector('.ql-editor')) return;
    
    const fieldId = editor.id.replace('_quill', '');
    const hiddenInput = document.getElementById(fieldId);
    
    // Determine if it's a heading/title field
    const isHeadingField = editor.id.includes('Title') || 
                         editor.id.includes('Subtitle') || 
                         editor.closest('.field-container')?.dataset.fieldType === 'text';
    
    // Configure Quill with different toolbars based on field type
    const quillOptions = {
      theme: 'snow',
      placeholder: isHeadingField ? 'Enter title text...' : 'Write content here...',
      modules: {
        toolbar: isHeadingField ? 
          [
            ['bold', 'italic', 'underline'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
          ] :
          [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ]
      }
    };
    
    // Create Quill instance
    const quill = new Quill(editor, quillOptions);
    
    // Set initial content if hidden input has value
    if (hiddenInput && hiddenInput.value) {
      quill.clipboard.dangerouslyPasteHTML(hiddenInput.value);
    }
    
    // Update hidden input on text change
    quill.on('text-change', () => {
      if (hiddenInput) {
        hiddenInput.value = editor.querySelector('.ql-editor').innerHTML;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        hiddenInput.dispatchEvent(event);
        
        // Mark as dirty if we're in the page editor
        if (window.PageEditor && typeof window.PageEditor.setDirty === 'function') {
          window.PageEditor.setDirty(true);
        } else if (window.state && typeof window.state.isDirty !== 'undefined') {
          window.state.isDirty = true;
        }
        
        // Update preview if we're in the page editor
        if (window.previewTimer) clearTimeout(window.previewTimer);
        window.previewTimer = setTimeout(() => {
          if (typeof window.updatePreview === 'function') {
            window.updatePreview();
          }
        }, 500);
      }
    });
  });
};

/**
 * Helper function for admin panel integration
 * This replaces the TinyMCE initialization code in admin-panel.js
 */
const initRichTextEditors = () => {
  // Convert textareas to Quill editors
  convertTextareasToQuill();
  
  // Initialize any directly created Quill editors
  initPageEditorQuill();
  
  // Return an object mimicking the TinyMCE global object
  // This helps maintain compatibility with existing code
  return {
    activeEditor: {
      getContent: () => {
        const activeElement = document.activeElement;
        const quillContainer = activeElement.closest('.quill-editor');
        if (quillContainer) {
          return quillContainer.querySelector('.ql-editor').innerHTML;
        }
        return '';
      },
      hide: () => {
        // Just for compatibility
      },
      show: () => {
        // Just for compatibility
      }
    },
    editors: document.querySelectorAll('.quill-editor').length,
    remove: (selector) => {
      // For compatibility with TinyMCE.remove()
      const containers = document.querySelectorAll(selector);
      containers.forEach(container => {
        const quillContainer = container.nextElementSibling;
        if (quillContainer && quillContainer.classList.contains('quill-editor')) {
          quillContainer.remove();
          container.style.display = '';
        }
      });
    }
  };
};

// Export the API for global use
window.quillEditor = {
  init: initQuillEditor,
  convertTextareas: convertTextareasToQuill,
  initRichTextEditors: initRichTextEditors,
  initPageEditorQuill: initPageEditorQuill,
  getContent: getQuillContent,
  setContent: setQuillContent
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Delay initialization slightly to ensure all DOM elements are ready
  setTimeout(() => {
    if (typeof Quill !== 'undefined') {
      window.quillEditor.initRichTextEditors();
    } else {
      console.warn('Quill library not loaded yet');
    }
  }, 100);
});