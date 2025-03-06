 /**
 * Page Editor Fix Script
 * 
 * This script ensures that page editing functionality works correctly,
 * providing fallback methods and additional utilities to handle
 * edge cases and potential DOM issues.
 */

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Page Editor Fix loaded");
    
    // Make sure we have access to Firebase
    if (typeof firebase === 'undefined') {
      console.error("Firebase not available");
      return;
    }
    
    // Global page editor state
    const state = {
      pages: {},
      currentEditingPage: null,
      db: null,
      isInitialized: false
    };
    
    // Template definitions - ensure they're consistent with main admin script
    const pageTemplates = {
      'basic': {
        name: 'Basic Template',
        description: 'Simple page with heading and text',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'textarea', name: 'content', label: 'Content', editor: true }
        ]
      },
      'text-image': {
        name: 'Text with Image',
        description: 'Text on the left, image on the right',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'textarea', name: 'content', label: 'Content', editor: true },
          { type: 'image', name: 'image', label: 'Image' }
        ]
      },
      'image-text': {
        name: 'Image with Text',
        description: 'Image on the left, text on the right',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'image', name: 'image', label: 'Image' },
          { type: 'textarea', name: 'content', label: 'Content', editor: true }
        ]
      },
      'gallery': {
        name: 'Gallery',
        description: 'Image gallery with title',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'textarea', name: 'description', label: 'Description', editor: true },
          { type: 'gallery', name: 'images', label: 'Images' }
        ]
      },
      'contact': {
        name: 'Contact',
        description: 'Contact form with text',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'textarea', name: 'content', label: 'Introductory text', editor: true },
          { type: 'checkbox', name: 'showMap', label: 'Show map' },
          { type: 'text', name: 'address', label: 'Address' },
          { type: 'text', name: 'email', label: 'Email address' },
          { type: 'text', name: 'phone', label: 'Phone number' }
        ]
      }
    };
    
    // Helper function to ensure proper display of status messages
    function showStatus(message, isError = false) {
      const statusMsg = document.getElementById('statusMsg');
      if (!statusMsg) {
        console.log(`Status: ${message}`);
        return;
      }
      
      statusMsg.textContent = message;
      statusMsg.style.display = 'block';
      statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
      
      // Hide after 5 seconds
      setTimeout(() => {
        statusMsg.classList.remove('show');
        setTimeout(() => {
          statusMsg.style.display = 'none';
        }, 300);
      }, 5000);
    }
    
    // Verify and create necessary DOM elements
    function ensureContainersExist() {
      const pagesTab = document.getElementById('pages-tab');
      if (!pagesTab) {
        console.error("pages-tab element not found");
        return false;
      }
      
      // Make sure it's visible when needed
      pagesTab.classList.add('tab-content');
      
      // Create pagesListContainer if needed
      let pagesListContainer = document.getElementById('pagesListContainer');
      if (!pagesListContainer) {
        pagesListContainer = document.createElement('div');
        pagesListContainer.id = 'pagesListContainer';
        pagesListContainer.className = 'w3-margin-bottom';
        pagesTab.appendChild(pagesListContainer);
      }
      
      // Create createPageBtn if needed
      let createPageBtn = document.getElementById('createPageBtn');
      if (!createPageBtn) {
        const createBtnContainer = document.createElement('div');
        createBtnContainer.className = 'w3-margin-bottom';
        createBtnContainer.innerHTML = `
          <button id="createPageBtn" class="w3-button w3-blue">
            <i class="fas fa-plus"></i> Create New Page
          </button>
        `;
        pagesListContainer.appendChild(createBtnContainer);
        
        // Get the newly created button
        createPageBtn = document.getElementById('createPageBtn');
        
        // Add event listener
        createPageBtn.addEventListener('click', function() {
          showNewPageForm();
        });
      }
      
      // Create pagesList if needed
      let pagesListBox = document.getElementById('pagesListBox');
      if (!pagesListBox) {
        pagesListBox = document.createElement('div');
        pagesListBox.id = 'pagesListBox';
        pagesListBox.className = 'w3-card w3-padding w3-margin-bottom';
        pagesListBox.innerHTML = '<h4>Existing Pages</h4>';
        pagesListContainer.appendChild(pagesListBox);
        
        const pagesList = document.createElement('div');
        pagesList.id = 'pagesList';
        pagesList.className = 'w3-container';
        pagesList.innerHTML = '<p class="w3-center">Loading pages...</p>';
        pagesListBox.appendChild(pagesList);
      }
      
      // Create forms if needed
      ensureFormElementsExist();
      
      return true;
    }
    
    // Create necessary form elements for page creation and editing
    function ensureFormElementsExist() {
      const pagesTab = document.getElementById('pages-tab');
      if (!pagesTab) return false;
      
      // Create newPageForm if needed
      let newPageForm = document.getElementById('newPageForm');
      if (!newPageForm) {
        newPageForm = document.createElement('div');
        newPageForm.id = 'newPageForm';
        newPageForm.className = 'w3-card w3-padding w3-margin-bottom';
        newPageForm.style.display = 'none';
        newPageForm.innerHTML = `
          <h4>Create New Page</h4>
          <div class="w3-section">
            <label><strong>Page Name:</strong></label>
            <input type="text" id="pageName" class="w3-input w3-border w3-margin-bottom" placeholder="e.g. about-me, services, contact" />
            <small class="w3-text-grey">Use lowercase letters, numbers, and hyphens only</small>
            
            <label><strong>Page Title:</strong></label>
            <input type="text" id="pageTitle" class="w3-input w3-border w3-margin-bottom" placeholder="Shown in browser tab" />
            
            <label><strong>Template:</strong></label>
            <select id="pageTemplate" class="w3-select w3-border w3-margin-bottom">
              <option value="basic">Basic Template (Title + Text)</option>
              <option value="text-image">Text with Image (right)</option>
              <option value="image-text">Image (left) with Text</option>
              <option value="gallery">Gallery Template</option>
              <option value="contact">Contact Template</option>
            </select>
            
            <div id="templatePreview" class="w3-margin-bottom">
              <!-- Template preview will be inserted here -->
            </div>
          </div>
          
          <div class="w3-section">
            <button class="w3-button w3-red" id="cancelNewPageBtn">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="w3-button w3-green w3-right" id="createNewPageBtn">
              <i class="fas fa-plus"></i> Create Page
            </button>
          </div>
        `;
        pagesTab.appendChild(newPageForm);
        
        // Add event listeners
        document.getElementById('cancelNewPageBtn').addEventListener('click', function() {
          hideNewPageForm();
        });
        
        document.getElementById('createNewPageBtn').addEventListener('click', function() {
          createNewPage();
        });
        
        document.getElementById('pageTemplate').addEventListener('change', function() {
          updateTemplatePreview(this.value);
        });
      }
      
      // Create editPageForm if needed
      let editPageForm = document.getElementById('editPageForm');
      if (!editPageForm) {
        editPageForm = document.createElement('div');
        editPageForm.id = 'editPageForm';
        editPageForm.className = 'w3-card w3-padding w3-margin-bottom';
        editPageForm.style.display = 'none';
        editPageForm.innerHTML = `
          <h4 id="editPageTitle">Edit Page</h4>
          <div id="templateFields" class="w3-section">
            <!-- Template fields will be inserted here -->
          </div>
          <div class="w3-section">
            <button class="w3-button w3-amber" id="backToListBtn">
              <i class="fas fa-arrow-left"></i> Back to List
            </button>
            <button class="w3-button w3-red w3-margin-left" id="deletePageBtn">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="w3-button w3-green w3-right" id="savePageBtn">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        `;
        pagesTab.appendChild(editPageForm);
        
        // Add event listeners
        document.getElementById('backToListBtn').addEventListener('click', function() {
          showPagesList();
        });
        
        document.getElementById('deletePageBtn').addEventListener('click', function() {
          deletePage();
        });
        
        document.getElementById('savePageBtn').addEventListener('click', function() {
          savePage();
        });
      }
      
      return true;
    }
    
    // Show form for creating a new page
    function showNewPageForm() {
      const createPageBtn = document.getElementById('createPageBtn');
      const newPageForm = document.getElementById('newPageForm');
      const pagesListBox = document.getElementById('pagesListBox');
      const editPageForm = document.getElementById('editPageForm');
      
      if (createPageBtn) createPageBtn.style.display = 'none';
      if (pagesListBox) pagesListBox.style.display = 'none';
      if (editPageForm) editPageForm.style.display = 'none';
      if (newPageForm) {
        newPageForm.style.display = 'block';
        
        // Initialize template preview
        const pageTemplate = document.getElementById('pageTemplate');
        if (pageTemplate) {
          updateTemplatePreview(pageTemplate.value);
        }
      }
    }
    
    // Hide the new page form
    function hideNewPageForm() {
      const createPageBtn = document.getElementById('createPageBtn');
      const newPageForm = document.getElementById('newPageForm');
      const pagesListBox = document.getElementById('pagesListBox');
      
      if (createPageBtn) createPageBtn.style.display = 'block';
      if (pagesListBox) pagesListBox.style.display = 'block';
      if (newPageForm) newPageForm.style.display = 'none';
      
      // Reset form fields
      const pageName = document.getElementById('pageName');
      const pageTitle = document.getElementById('pageTitle');
      const pageTemplate = document.getElementById('pageTemplate');
      
      if (pageName) pageName.value = '';
      if (pageTitle) pageTitle.value = '';
      if (pageTemplate) pageTemplate.selectedIndex = 0;
    }
    
    // Update the template preview
    function updateTemplatePreview(templateId) {
      const templatePreview = document.getElementById('templatePreview');
      if (!templatePreview || !pageTemplates[templateId]) return;
      
      const template = pageTemplates[templateId];
      templatePreview.innerHTML = `
        <h5>${template.name}</h5>
        <p>${template.description}</p>
        <div class="template-preview-container">
          <div class="template-preview">
            <!-- Template preview visualization -->
          </div>
        </div>
      `;
    }
    
    // Create a new page
    async function createNewPage() {
      const pageName = document.getElementById('pageName');
      const pageTitle = document.getElementById('pageTitle');
      const pageTemplate = document.getElementById('pageTemplate');
      
      if (!pageName || !pageTitle || !pageTemplate) {
        showStatus('Form elements not found.', true);
        return;
      }
      
      if (!state.db) {
        state.db = firebase.firestore();
      }
      
      // Validation
      if (!pageName.value.trim() || !pageTitle.value.trim()) {
        showStatus('Please fill in all fields.', true);
        return;
      }
      
      // Create URL-friendly name
      const urlName = pageName.value.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      showStatus('Creating page...');
      
      try {
        // Check if page already exists
        const existingPage = await state.db.collection('pages').doc(urlName).get();
        if (existingPage.exists) {
          showStatus(`A page with name "${urlName}" already exists.`, true);
          return;
        }
        
        // Get template
        const selectedTemplate = pageTemplate.value;
        const template = pageTemplates[selectedTemplate];
        if (!template) {
          showStatus('Invalid template selected.', true);
          return;
        }
        
        // Create empty data for template
        const templateData = {};
        template.fields.forEach(field => {
          switch (field.type) {
            case 'text':
            case 'textarea':
              templateData[field.name] = '';
              break;
            case 'checkbox':
              templateData[field.name] = false;
              break;
            case 'image':
              templateData[field.name] = { url: '', public_id: '' };
              break;
            case 'gallery':
              templateData[field.name] = [];
              break;
          }
        });
        
        // Create page object
        const pageData = {
          title: pageTitle.value.trim(),
          template: selectedTemplate,
          data: templateData,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          updated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firestore
        await state.db.collection('pages').doc(urlName).set(pageData);
        
        showStatus(`Page "${pageTitle.value}" created successfully.`);
        
        // Reset form
        hideNewPageForm();
        
        // Reload pages
        loadPages();
      } catch (error) {
        console.error('Error creating page:', error);
        showStatus('Error creating page: ' + error.message, true);
      }
    }
    
    // Edit a page
    async function editPage(pageId) {
      if (!pageId) {
        showStatus('No page ID provided.', true);
        return;
      }
      
      if (!state.db) {
        state.db = firebase.firestore();
      }
      
      showStatus('Loading page for editing...');
      
      try {
        // Get page data
        const pageDoc = await state.db.collection('pages').doc(pageId).get();
        if (!pageDoc.exists) {
          showStatus('Page not found.', true);
          return;
        }
        
        const pageData = pageDoc.data();
        state.pages[pageId] = pageData;
        state.currentEditingPage = pageId;
        
        console.log("Editing page:", pageData);
        
        // Hide list, show edit form
        const createPageBtn = document.getElementById('createPageBtn');
        const pagesListBox = document.getElementById('pagesListBox');
        const newPageForm = document.getElementById('newPageForm');
        const editPageForm = document.getElementById('editPageForm');
        
        if (createPageBtn) createPageBtn.style.display = 'none';
        if (pagesListBox) pagesListBox.style.display = 'none';
        if (newPageForm) newPageForm.style.display = 'none';
        if (editPageForm) editPageForm.style.display = 'block';
        
        // Set page title
        const editPageTitle = document.getElementById('editPageTitle');
        if (editPageTitle) {
          editPageTitle.textContent = `Edit Page: ${pageData.title}`;
        }
        
        // Generate template fields
        generateTemplateFields(pageData.template, pageData.data);
        
        showStatus('Page loaded for editing.');
      } catch (error) {
        console.error('Error loading page:', error);
        showStatus('Error loading page: ' + error.message, true);
      }
    }
    
    // Generate form fields based on template
    function generateTemplateFields(templateId, data) {
      const templateFields = document.getElementById('templateFields');
      if (!templateFields || !pageTemplates[templateId]) {
        console.error("Cannot generate fields:", 
          templateFields ? `Template "${templateId}" not found` : "templateFields element not found");
        return;
      }
      
      // Clear previous fields
      templateFields.innerHTML = '';
      
      const template = pageTemplates[templateId];
      
      // Create fields for each template property
      template.fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'w3-margin-bottom';
        
        if (field.type !== 'checkbox') {
          const fieldLabel = document.createElement('label');
          fieldLabel.setAttribute('for', `field_${field.name}`);
          fieldLabel.innerHTML = `<strong>${field.label}:</strong>`;
          fieldContainer.appendChild(fieldLabel);
        }
        
        switch (field.type) {
          case 'text':
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = `field_${field.name}`;
            textInput.className = 'w3-input w3-border w3-margin-bottom';
            textInput.value = data[field.name] || '';
            fieldContainer.appendChild(textInput);
            break;
            
          case 'textarea':
            if (field.editor) {
              // TinyMCE editor
              const editorContainer = document.createElement('div');
              editorContainer.id = `field_${field.name}_container`;
              
              const textareaField = document.createElement('textarea');
              textareaField.id = `field_${field.name}`;
              textareaField.className = 'tinymce-editor-dynamic';
              textareaField.rows = 8;
              textareaField.value = data[field.name] || '';
              
              editorContainer.appendChild(textareaField);
              fieldContainer.appendChild(editorContainer);
              
              // Initialize TinyMCE later
              setTimeout(() => {
                if (typeof tinymce !== 'undefined') {
                  // Remove any existing instance
                  if (tinymce.get(`field_${field.name}`)) {
                    tinymce.remove(`#field_${field.name}`);
                  }
                  
                  tinymce.init({
                    selector: `#field_${field.name}`,
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
                      'removeformat | h1 h2 h3 | help',
                    content_style: 'body { font-family: "Lato", sans-serif; font-size: 16px; }',
                    font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt',
                    setup: function(editor) {
                      editor.on('init', function() {
                        editor.setContent(data[field.name] || '');
                      });
                    }
                  });
                } else {
                  console.warn("TinyMCE not available. Using standard textarea.");
                  const textarea = document.createElement('textarea');
                  textarea.id = `field_${field.name}`;
                  textarea.className = 'w3-input w3-border w3-margin-bottom';
                  textarea.value = data[field.name] || '';
                  textarea.rows = 8;
                  
                  // Replace the container with the regular textarea
                  editorContainer.parentNode.replaceChild(textarea, editorContainer);
                }
              }, 100);
            } else {
              // Regular textarea
              const textarea = document.createElement('textarea');
              textarea.id = `field_${field.name}`;
              textarea.className = 'w3-input w3-border w3-margin-bottom';
              textarea.value = data[field.name] || '';
              textarea.rows = 4;
              fieldContainer.appendChild(textarea);
            }
            break;
            
          case 'checkbox':
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'w3-margin-bottom';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `field_${field.name}`;
            checkbox.className = 'w3-check';
            checkbox.checked = data[field.name] || false;
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.innerHTML += ` <label for="field_${field.name}">${field.label}</label>`;
            
            fieldContainer.innerHTML = '';
            fieldContainer.appendChild(checkboxContainer);
            break;
            
          case 'image':
            const imageContainer = document.createElement('div');
            imageContainer.className = 'w3-row w3-margin-bottom';
            
            // Image preview
            const previewCol = document.createElement('div');
            previewCol.className = 'w3-col m9';
            
            const imagePreview = document.createElement('div');
            imagePreview.id = `field_${field.name}_preview_container`;
            imagePreview.className = 'image-preview w3-margin-bottom';
            
            const previewImg = document.createElement('img');
            previewImg.id = `field_${field.name}_preview`;
            previewImg.src = data[field.name]?.url || '/api/placeholder/400/300';
            previewImg.style.maxWidth = '100%';
            previewImg.style.display = data[field.name]?.url ? 'block' : 'none';
            
            imagePreview.appendChild(previewImg);
            previewCol.appendChild(imagePreview);
            
            // Upload button
            const buttonCol = document.createElement('div');
            buttonCol.className = 'w3-col m3 w3-padding-small';
            
            const uploadBtn = document.createElement('button');
            uploadBtn.id = `field_${field.name}_upload`;
            uploadBtn.className = 'w3-button w3-blue w3-block';
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Select image';
            uploadBtn.addEventListener('click', () => {
              uploadImage(uploadBtn, `field_${field.name}`);
            });
            
            buttonCol.appendChild(uploadBtn);
            
            // Hidden input for image data
            const imageUrlInput = document.createElement('input');
            imageUrlInput.type = 'hidden';
            imageUrlInput.id = `field_${field.name}_data`;
            imageUrlInput.value = JSON.stringify(data[field.name] || { url: '', public_id: '' });
            
            imageContainer.appendChild(previewCol);
            imageContainer.appendChild(buttonCol);
            imageContainer.appendChild(imageUrlInput);
            
            fieldContainer.appendChild(imageContainer);
            break;
            
          case 'gallery':
            const galleryContainer = document.createElement('div');
            galleryContainer.className = 'gallery-container w3-margin-bottom';
            
            // Gallery preview
            const galleryPreview = document.createElement('div');
            galleryPreview.id = `field_${field.name}_preview`;
            galleryPreview.className = 'w3-row w3-margin-bottom';
            
            // Add existing images
            const galleryImages = data[field.name] || [];
            galleryImages.forEach((image, index) => {
              if (!image || !image.url) return;
              
              const imageCol = document.createElement('div');
              imageCol.className = 'w3-col m3 w3-padding';
              imageCol.dataset.index = index;
              
              const imageWrapper = document.createElement('div');
              imageWrapper.className = 'gallery-image-wrapper';
              
              const img = document.createElement('img');
              img.src = image.url;
              img.alt = 'Gallery image';
              
              const removeBtn = document.createElement('button');
              removeBtn.className = 'w3-button w3-red w3-circle';
              removeBtn.innerHTML = '<i class="fas fa-times"></i>';
              removeBtn.addEventListener('click', () => {
                removeGalleryImage(field.name, index);
              });
              
              imageWrapper.appendChild(img);
              imageWrapper.appendChild(removeBtn);
              imageCol.appendChild(imageWrapper);
              galleryPreview.appendChild(imageCol);
            });
            
            // Add image button
            const addImageBtn = document.createElement('button');
            addImageBtn.id = `field_${field.name}_add`;
            addImageBtn.className = 'w3-button w3-blue w3-margin-bottom';
            addImageBtn.innerHTML = '<i class="fas fa-plus"></i> Add image';
            addImageBtn.addEventListener('click', () => {
              addGalleryImage(field.name);
            });
            
            // Hidden field for gallery data
            const galleryDataInput = document.createElement('input');
            galleryDataInput.type = 'hidden';
            galleryDataInput.id = `field_${field.name}`;
            galleryDataInput.value = JSON.stringify(galleryImages);
            
            galleryContainer.appendChild(galleryPreview);
            galleryContainer.appendChild(addImageBtn);
            galleryContainer.appendChild(galleryDataInput);
            
            fieldContainer.appendChild(galleryContainer);
            break;
        }
        
        templateFields.appendChild(fieldContainer);
      });
    }
    
    // Upload image for a field
    function uploadImage(buttonElement, fieldId) {
      if (!state.db) {
        state.db = firebase.firestore();
      }
      
      // Use file input for upload
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      
      fileInput.addEventListener('change', async () => {
        if (fileInput.files.length > 0) {
          showStatus('Uploading image...');
          
          try {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            
            const response = await fetch('./api/upload.php', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
              // Save image URL to field
              const dataField = document.getElementById(`${fieldId}_data`);
              if (dataField) {
                dataField.value = JSON.stringify({
                  url: data.url,
                  filename: data.filename,
                  public_id: data.filename
                });
              }
              
              // Update preview
              const previewImg = document.getElementById(`${fieldId}_preview`);
              if (previewImg) {
                previewImg.src = data.url;
                previewImg.style.display = 'block';
              }
              
              showStatus('Image uploaded successfully');
            } else {
              showStatus('Error uploading image: ' + data.error, true);
            }
          } catch (error) {
            console.error('Upload error:', error);
            showStatus('Error uploading image', true);
          }
          
          document.body.removeChild(fileInput);
        }
      });
      
      fileInput.click();
    }
    
    // Add image to gallery
    function addGalleryImage(fieldName) {
      // Use file input for upload
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      
      fileInput.addEventListener('change', async () => {
        if (fileInput.files.length > 0) {
          showStatus('Uploading image...');
          
          try {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            
            const response = await fetch('./api/upload.php', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
              // Add to gallery
              const galleryField = document.getElementById(`field_${fieldName}`);
              const galleryPreview = document.getElementById(`field_${fieldName}_preview`);
              
              if (galleryField && galleryPreview) {
                // Get current gallery images
                let galleryImages = [];
                try {
                  galleryImages = JSON.parse(galleryField.value) || [];
                } catch (e) {
                  console.error("Error parsing gallery data:", e);
                  galleryImages = [];
                }
                
                // Add new image
                const newImage = {
                  url: data.url,
                  filename: data.filename,
                  public_id: data.filename
                };
                
                galleryImages.push(newImage);
                galleryField.value = JSON.stringify(galleryImages);
                
                // Add to preview
                const index = galleryImages.length - 1;
                const imageCol = document.createElement('div');
                imageCol.className = 'w3-col m3 w3-padding';
                imageCol.dataset.index = index;
                
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'gallery-image-wrapper';
                
                const img = document.createElement('img');
                img.src = newImage.url;
                img.alt = 'Gallery image';
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'w3-button w3-red w3-circle';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', () => {
                  removeGalleryImage(fieldName, index);
                });
                
                imageWrapper.appendChild(img);
                imageWrapper.appendChild(removeBtn);
                imageCol.appendChild(imageWrapper);
                galleryPreview.appendChild(imageCol);
                
                showStatus('Image added to gallery');
              } else {
                showStatus('Error: Gallery elements not found', true);
              }
            } else {
              showStatus('Error uploading image: ' + data.error, true);
            }
          } catch (error) {
            console.error('Upload error:', error);
            showStatus('Error uploading image', true);
          }
          
          document.body.removeChild(fileInput);
        }
      });
      
      fileInput.click();
    }
    
    // Remove image from gallery
    function removeGalleryImage(fieldName, index) {
      const galleryField = document.getElementById(`field_${fieldName}`);
      const galleryPreview = document.getElementById(`field_${fieldName}_preview`);
      
      if (!galleryField || !galleryPreview) {
        showStatus('Error: Gallery elements not found', true);
        return;
      }
      
      // Get current gallery images
      let galleryImages = [];
      try {
        galleryImages = JSON.parse(galleryField.value) || [];
      } catch (e) {
        console.error("Error parsing gallery data:", e);
        return;
      }
      
      // Remove image if index is valid
      if (index >= 0 && index < galleryImages.length) {
        galleryImages.splice(index, 1);
        galleryField.value = JSON.stringify(galleryImages);
        
        // Re-render gallery preview
        galleryPreview.innerHTML = '';
        
        galleryImages.forEach((image, idx) => {
          const imageCol = document.createElement('div');
          imageCol.className = 'w3-col m3 w3-padding';
          imageCol.dataset.index = idx;
          
          const imageWrapper = document.createElement('div');
          imageWrapper.className = 'gallery-image-wrapper';
          
          const img = document.createElement('img');
          img.src = image.url;
          img.alt = 'Gallery image';
          
          const removeBtn = document.createElement('button');
          removeBtn.className = 'w3-button w3-red w3-circle';
          removeBtn.innerHTML = '<i class="fas fa-times"></i>';
          
          const currentIndex = idx;
          removeBtn.addEventListener('click', () => {
            removeGalleryImage(fieldName, currentIndex);
          });
          
          imageWrapper.appendChild(img);
          imageWrapper.appendChild(removeBtn);
          imageCol.appendChild(imageWrapper);
          galleryPreview.appendChild(imageCol);
        });
        
        showStatus('Image removed from gallery');
      }
    }
    
    // Save edited page
    async function savePage() {
      if (!state.currentEditingPage) {
        showStatus('No page currently being edited', true);
        return;
      }
      
      if (!state.db) {
        state.db = firebase.firestore();
      }
      
      showStatus('Saving page...');
      
      try {
        // Get current page data
        const pageData = state.pages[state.currentEditingPage];
        if (!pageData) {
          showStatus('Error: Page data not found', true);
          return;
        }
        
        // Get template
        const template = pageTemplates[pageData.template];
        if (!template) {
          showStatus('Error: Invalid template', true);
          return;
        }
        
        // Collect data from form fields
        const updatedData = {};
        
        for (const field of template.fields) {
          switch (field.type) {
            case 'text':
              const textField = document.getElementById(`field_${field.name}`);
              updatedData[field.name] = textField ? textField.value : '';
              break;
              
            case 'textarea':
              if (field.editor && typeof tinymce !== 'undefined' && tinymce.get(`field_${field.name}`)) {
                // TinyMCE
                updatedData[field.name] = tinymce.get(`field_${field.name}`).getContent();
              } else {
                // Regular textarea
                const textareaField = document.getElementById(`field_${field.name}`);
                updatedData[field.name] = textareaField ? textareaField.value : '';
              }
              break;
              
            case 'checkbox':
              const checkboxField = document.getElementById(`field_${field.name}`);
              updatedData[field.name] = checkboxField ? checkboxField.checked : false;
              break;
              
            case 'image':
              try {
                const imageDataField = document.getElementById(`field_${field.name}_data`);
                updatedData[field.name] = imageDataField ? JSON.parse(imageDataField.value) : { url: '', public_id: '' };
              } catch (e) {
                console.error("Error parsing image data:", e);
                updatedData[field.name] = { url: '', public_id: '' };
              }
              break;
              
            case 'gallery':
              try {
                const galleryDataField = document.getElementById(`field_${field.name}`);
                updatedData[field.name] = galleryDataField ? JSON.parse(galleryDataField.value) : [];
              } catch (e) {
                console.error("Error parsing gallery data:", e);
                updatedData[field.name] = [];
              }
              break;
          }
        }
        
        // Update page
        const updatedPage = {
          ...pageData,
          data: updatedData,
          updated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firestore
        await state.db.collection('pages').doc(state.currentEditingPage).update(updatedPage);
        
        // Update local cache
        state.pages[state.currentEditingPage] = updatedPage;
        
        showStatus('Page saved successfully');
        
        // Return to pages list
        setTimeout(() => {
          showPagesList();
          loadPages();
        }, 1500);
      } catch (error) {
        console.error('Error saving page:', error);
        showStatus('Error saving page: ' + error.message, true);
      }
    }
    
    // Delete page
    async function deletePage() {
      if (!state.currentEditingPage) {
        showStatus('No page currently being edited', true);
        return;
      }
      
      if (!state.db) {
        state.db = firebase.firestore();
      }
      
      // Confirm deletion
      const pageTitle = state.pages[state.currentEditingPage]?.title || 'this page';
      if (!confirm(`Are you sure you want to delete "${pageTitle}"? This cannot be undone.`)) {
        return;
      }
      
      showStatus('Deleting page...');
      
      try {
        // Delete from Firestore
        await state.db.collection('pages').doc(state.currentEditingPage).delete();
        
        // Remove from local cache
        delete state.pages[state.currentEditingPage];
        state.currentEditingPage = null;
        
        showStatus('Page deleted successfully');
        
        // Return to pages list
        setTimeout(() => {
          showPagesList();
          loadPages();
        }, 1500);
      } catch (error) {
        console.error('Error deleting page:', error);
        showStatus('Error deleting page: ' + error.message, true);
      }
    }
    
    // Show the pages list
    function showPagesList() {
      // Clean up TinyMCE
      if (typeof tinymce !== 'undefined') {
        tinymce.remove('.tinymce-editor-dynamic');
      }
      
      // Reset current editing page
      state.currentEditingPage = null;
      
      // Show/hide UI elements
      const createPageBtn = document.getElementById('createPageBtn');
      const pagesListBox = document.getElementById('pagesListBox');
      const newPageForm = document.getElementById('newPageForm');
      const editPageForm = document.getElementById('editPageForm');
      
      if (createPageBtn) createPageBtn.style.display = 'block';
      if (pagesListBox) pagesListBox.style.display = 'block';
      if (newPageForm) newPageForm.style.display = 'none';
      if (editPageForm) editPageForm.style.display = 'none';
    }
    
    // Load pages
    async function loadPages() {
      if (!ensureContainersExist()) {
        console.error("Failed to ensure containers exist");
        return;
      }
      
      if (!state.db) {
        state.db = firebase.firestore();
      }
      
      const pagesList = document.getElementById('pagesList');
      if (!pagesList) {
        console.error("pagesList element not found");
        return;
      }
      
      // Show loading indicator
      pagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Loading pages...</p>';
      
      try {
        // Get pages from Firestore
        const snapshot = await state.db.collection('pages').get();
        
        // Clear list
        pagesList.innerHTML = '';
        
        if (snapshot.empty) {
          pagesList.innerHTML = '<p class="w3-text-grey">No pages created yet.</p>';
          return;
        }
        
        // Reset pages cache
        state.pages = {};
        
        // Add pages to list
        snapshot.forEach(doc => {
          const pageData = doc.data();
          const pageId = doc.id;
          
          // Cache page data
          state.pages[pageId] = pageData;
          
          // Create list item
          const pageItem = document.createElement('div');
          pageItem.className = 'page-item w3-bar w3-margin-bottom';
          pageItem.innerHTML = `
            <div class="w3-bar-item">
              <span class="w3-large">${pageData.title || 'Untitled'}</span><br>
              <span class="w3-small">ID: ${pageId} | Template: ${pageTemplates[pageData.template]?.name || pageData.template}</span>
            </div>
            <div class="w3-bar-item w3-right page-actions">
              <a href="page.php?id=${pageId}" target="_blank" class="w3-button w3-blue">
                <i class="fas fa-eye"></i> View
              </a>
              <button class="w3-button w3-green edit-page-btn" data-page-id="${pageId}">
                <i class="fas fa-edit"></i> Edit
              </button>
            </div>
          `;
          
          pagesList.appendChild(pageItem);
          
          // Add event listener to edit button
          const editBtn = pageItem.querySelector('.edit-page-btn');
          if (editBtn) {
            editBtn.addEventListener('click', function() {
              const pageId = this.getAttribute('data-page-id');
              editPage(pageId);
            });
          }
        });
      } catch (error) {
        console.error('Error loading pages:', error);
        pagesList.innerHTML = `<p class="w3-text-red">Error loading pages: ${error.message}</p>`;
      }
    }
    
    // Initialize on page load
    function initialize() {
      // Initialize Firebase if needed
      if (!state.db && typeof firebase !== 'undefined') {
        state.db = firebase.firestore();
      }
      
      // Create and setup containers
      if (!ensureContainersExist()) {
        console.error("Failed to initialize: containers could not be created");
        return;
      }
      
      // Export functions to window for global access
      window.editPageDirect = editPage;
      window.showPagesList = showPagesList;
      window.loadPages = loadPages;
      
      // Mark as initialized
      state.isInitialized = true;
      console.log("✅ Page Editor initialized successfully");
      
      // Add click handler for Pages tab button to ensure content loads
      const pagesTabBtn = document.querySelector('.tab-btn[data-tab="pages"]');
      if (pagesTabBtn) {
        // Add our own event listener that runs after the main tab switch
        pagesTabBtn.addEventListener('click', function() {
          setTimeout(() => {
            // Activate the pages tab
            const pagesTab = document.getElementById('pages-tab');
            if (pagesTab) {
              pagesTab.style.display = 'block';
              pagesTab.classList.add('active');
            }
            
            // Load pages
            loadPages();
          }, 200);
        });
      }
      
      // Monitor auth state
      if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            console.log("User logged in, initializing page editor");
            
            // Try to load pages if on the pages tab
            const pagesTab = document.getElementById('pages-tab');
            const pagesTabBtn = document.querySelector('.tab-btn[data-tab="pages"]');
            
            if (pagesTab && pagesTab.classList.contains('active') || 
                pagesTabBtn && pagesTabBtn.classList.contains('active')) {
              loadPages();
            }
          } else {
            console.log("User logged out");
            state.pages = {};
            state.currentEditingPage = null;
          }
        });
      }
    }
    
    // Initialize after a short delay to ensure DOM is ready
    setTimeout(initialize, 500);
  });
})();