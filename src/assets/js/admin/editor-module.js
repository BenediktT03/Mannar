 // Create new file: src/assets/js/admin/editor-module.js

/**
 * Editor Module - Handles rich text editing functionality 
 */
const EditorModule = (function() {
  // Active editors
  const activeEditors = new Map();
  
  // Initialize editor for a container
  function initEditor(container, options = {}) {
    if (!container) return null;
    
    // Default options
    const defaultOptions = {
      placeholder: 'Enter content here...',
      theme: 'snow',
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
    
    // Create editor with merged options
    const mergedOptions = { ...defaultOptions, ...options };
    const editor = new Quill(container, mergedOptions);
    
    // Store reference
    activeEditors.set(container.id, editor);
    
    return editor;
  }
  
  // Get editor content
  function getContent(containerId) {
    const editor = activeEditors.get(containerId);
    if (!editor) return '';
    
    return editor.root.innerHTML;
  }
  
  // Set editor content
  function setContent(containerId, content) {
    const editor = activeEditors.get(containerId);
    if (!editor) return false;
    
    editor.root.innerHTML = '';
    editor.clipboard.dangerouslyPasteHTML(content || '');
    return true;
  }
  
  // Create editor from textarea
  function convertTextarea(textarea, options = {}) {
    if (!textarea) return null;
    
    // Hide original textarea
    textarea.style.display = 'none';
    
    // Create editor container
    const container = document.createElement('div');
    container.id = textarea.id + '-editor';
    container.className = 'quill-editor';
    textarea.parentNode.insertBefore(container, textarea.nextSibling);
    
    // Initialize editor
    const editor = initEditor(container, options);
    
    // Set initial content
    setContent(container.id, textarea.value);
    
    // Update textarea on change
    editor.on('text-change', () => {
      textarea.value = editor.root.innerHTML;
      
      // Trigger change event
      const event = new Event('change', { bubbles: true });
      textarea.dispatchEvent(event);
    });
    
    return editor;
  }
  
  // Convert all textareas with specific class
  function convertAll(selector = '.rich-editor', options = {}) {
    const textareas = document.querySelectorAll(selector);
    const editors = [];
    
    textareas.forEach(textarea => {
      const editor = convertTextarea(textarea, options);
      if (editor) editors.push(editor);
    });
    
    return editors;
  }
  
  // Public API
  return {
    initEditor,
    getContent,
    setContent,
    convertTextarea,
    convertAll,
    getActiveEditors: () => activeEditors
  };
})();

// For backward compatibility
window.editorModule = EditorModule;