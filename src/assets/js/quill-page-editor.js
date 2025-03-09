 /**
 * Enhanced Page Editor with Quill Integration
 * This patch allows the page-editor-enhanced.js to work with Quill instead of TinyMCE
 */

// Function to monkey-patch the page editor to use Quill
function patchPageEditor() {
  // Wait for PageEditor to be defined
  if (!window.PageEditor) {
    console.log("Waiting for PageEditor to be defined...");
    setTimeout(patchPageEditor, 100);
    return;
  }

  console.log("Patching PageEditor to use Quill instead of TinyMCE");

  // Save original init function
  const originalInitTinyMCE = window.PageEditor.initTinyMCE;

  // Replace TinyMCE initialization with Quill
  window.PageEditor.initTinyMCE = function(selector = '.tinymce-editor', inline = false) {
    console.log("Initializing Quill editor instead of TinyMCE");
    
    // Check if quillEditor is available
    if (!window.quillEditor) {
      console.warn("Quill integration not found, using original TinyMCE init if available");
      if (typeof originalInitTinyMCE === 'function') {
        return originalInitTinyMCE(selector, inline);
      }
      return;
    }
    
    // Convert textareas to Quill editors
    return window.quillEditor.convertTextareas();
  };
  
  // Replace functions that interact with TinyMCE
  const originalCreateField = window.PageEditor.createField;
  if (originalCreateField) {
    window.PageEditor.createField = function(field, data, container) {
      // Call original implementation
      originalCreateField.call(this, field, data, container);
      
      // If this is a rich text field that should use Quill, initialize it
      if (field.editor && field.type === 'textarea') {
        const fieldId = `field_${field.name}`;
        const textarea = document.getElementById(fieldId);
        
        if (textarea && window.quillEditor) {
          // Convert the textarea to a Quill editor
          const editorDiv = document.createElement('div');
          editorDiv.id = fieldId + '_quill';
          editorDiv.className = 'quill-editor';
          editorDiv.style.minHeight = '200px';
          
          // Insert editor after the textarea
          textarea.parentNode.insertBefore(editorDiv, textarea.nextSibling);
          
          // Hide the original textarea
          textarea.style.display = 'none';
          
          // Initialize Quill on this div
          const quill = new Quill(editorDiv, {
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
            },
            placeholder: 'Write content here...'
          });
          
          // Set initial content
          quill.clipboard.dangerouslyPasteHTML(textarea.value || '');
          
          // Update textarea when editor content changes
          quill.on('text-change', () => {
            textarea.value = editorDiv.querySelector('.ql-editor').innerHTML;
            
            // Trigger change event for form validation
            const event = new Event('change', { bubbles: true });
            textarea.dispatchEvent(event);
            
            // Mark content as dirty if state tracking is available
            if (window.PageEditor && typeof window.PageEditor.setDirty === 'function') {
              window.PageEditor.setDirty(true);
            } else if (window.state && typeof window.state.isDirty !== 'undefined') {
              window.state.isDirty = true;
            }
          });
        }
      }
    };
  }
  
  // Replace getFormData to handle Quill editors
  const originalGetFormData = window.PageEditor.getFormData;
  if (originalGetFormData) {
    window.PageEditor.getFormData = function() {
      // Get Quill content first
      let quillContent = {};
      document.querySelectorAll('.quill-editor').forEach(editor => {
        const fieldId = editor.id.replace('_quill', '');
        const editorContent = editor.querySelector('.ql-editor');
        if (editorContent) {
          quillContent[fieldId] = editorContent.innerHTML;
        }
      });
      
      // Call original implementation
      const formData = originalGetFormData.call(this);
      
      // Merge with Quill content
      return { ...formData, ...quillContent };
    };
  }
  
  // Add method to mark content as dirty
  if (!window.PageEditor.setDirty) {
    window.PageEditor.setDirty = function(isDirty) {
      if (window.PageEditor.isDirty !== undefined) {
        window.PageEditor.isDirty = isDirty;
      }
    };
  }
  
  console.log("Page Editor successfully patched to use Quill!");
}

// Execute the patch when the document is ready
document.addEventListener('DOMContentLoaded', patchPageEditor);