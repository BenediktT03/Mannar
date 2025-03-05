// admin-panel.js - Optimized and fixed version

document.addEventListener('DOMContentLoaded', () => {
    // Firebase should already be initialized in the HTML
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // Initialize Cloudinary
    let cloudinaryWidget;
    if (window.cloudinary) {
        // Cloudinary configuration
        cloudinaryWidget = window.cloudinary.createUploadWidget({
            cloudName: 'dlegnsmho',
            uploadPreset: 'ml_default',
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFileSize: 5000000, // 5MB
            cropping: false,
            showAdvancedOptions: false,
            showUploadMoreButton: false,
            styles: {
                palette: {
                    window: "#FFFFFF",
                    sourceBg: "#F8F8F8",
                    windowBorder: "#DDDDDD",
                    tabIcon: "#000000",
                    inactiveTabIcon: "#555555",
                    menuIcons: "#000000",
                    link: "#0078FF",
                    action: "#339933",
                    inProgress: "#0078FF",
                    complete: "#339933",
                    error: "#CC0000",
                    textDark: "#000000",
                    textLight: "#FFFFFF"
                }
            }
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                showStatus('Upload error: ' + (error.message || error.statusText || 'Unknown error'), true);
                return;
            }
            
            if (result && result.event === "success") {
                console.log('Successfully uploaded to Cloudinary:', result.info);
                
                const imageUrl = result.info.secure_url;
                const publicId = result.info.public_id;
                
                // Update the current upload element with image data
                if (currentUploadElement) {
                    // Set the image preview
                    const previewContainer = currentUploadElement.querySelector('[id$="ImagePreview"]');
                    const imgElement = previewContainer?.querySelector('img');
                    
                    if (imgElement) {
                        imgElement.src = imageUrl;
                        imgElement.style.display = 'block';
                    }
                    
                    // Save the image URL and Public ID
                    const imageKey = getImageKeyFromElement(currentUploadElement);
                    if (imageKey) {
                        imageData[imageKey] = { url: imageUrl, public_id: publicId };
                    }
                    
                    // Show success message
                    showStatus('Image successfully uploaded');
                }
            }
        });
    }
    
    // Helper function to determine the image key
    function getImageKeyFromElement(element) {
        if (!element) return null;
        if (element.id?.includes('offer1') || element.querySelector('[id*="offer1"]')) return 'offer1_image';
        if (element.id?.includes('offer2') || element.querySelector('[id*="offer2"]')) return 'offer2_image';
        if (element.id?.includes('offer3') || element.querySelector('[id*="offer3"]')) return 'offer3_image';
        if (element.id?.includes('contact') || element.querySelector('[id*="contact"]')) return 'contact_image';
        return null;
    }
    
    // Global variable for the current upload element
    let currentUploadElement = null;
    
    // Element references
    const loginDiv = document.getElementById('loginDiv');
    const adminDiv = document.getElementById('adminDiv');
    const emailField = document.getElementById('emailField');
    const passField = document.getElementById('passField');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const statusMsg = document.getElementById('statusMsg');
    
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Form fields
    const aboutTitle = document.getElementById('aboutTitle');
    const aboutSubtitle = document.getElementById('aboutSubtitle');
    const aboutText = document.getElementById('aboutText');
    const offeringsTitle = document.getElementById('offeringsTitle');
    const offeringsSubtitle = document.getElementById('offeringsSubtitle');
    const offer1Title = document.getElementById('offer1Title');
    const offer2Title = document.getElementById('offer2Title');
    const offer3Title = document.getElementById('offer3Title');
    const contactTitle = document.getElementById('contactTitle');
    const contactSubtitle = document.getElementById('contactSubtitle');
    
    // Image elements
    const offer1Img = document.getElementById('offer1Img');
    const offer2Img = document.getElementById('offer2Img');
    const offer3Img = document.getElementById('offer3Img');
    const contactImg = document.getElementById('contactImg');
    
    // Upload buttons
    const offer1UploadBtn = document.getElementById('offer1UploadBtn');
    const offer2UploadBtn = document.getElementById('offer2UploadBtn');
    const offer3UploadBtn = document.getElementById('offer3UploadBtn');
    const contactUploadBtn = document.getElementById('contactUploadBtn');
    
    // Save buttons
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const publishBtn = document.getElementById('publishBtn');
    const saveWordCloudBtn = document.getElementById('saveWordCloudBtn');
    const addWordBtn = document.getElementById('addWordBtn');
    
    // Preview
    const previewFrame = document.getElementById('previewFrame');
    const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
    const previewTypeRadios = document.getElementsByName('previewType');
    
    // Wordcloud
    const wordCloudContainer = document.getElementById('wordCloudContainer');

    // Image URLs storage
    let imageData = {
      offer1_image: { url: "", public_id: "" },
      offer2_image: { url: "", public_id: "" },
      offer3_image: { url: "", public_id: "" },
      contact_image: { url: "", public_id: "" }
    };
    
    // Wordcloud data
    let wordCloudData = [];

    // Show status message
    const showStatus = (message, isError = false) => {
      if (!statusMsg) return;
      
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
    };

    // Standard file upload (fallback to PHP upload script)
    const uploadFile = async (file, callback) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('./api/upload.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                console.log('Upload successful:', data);
                if (callback) callback(data.url, data.filename);
                showStatus(`Image successfully uploaded`);
                return data;
            } else {
                console.error('Upload error:', data.error);
                showStatus(`Error: ${data.error}`, true);
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            showStatus('Upload error.', true);
            throw error;
        }
    };

    // Refresh preview
    const refreshPreview = () => {
      if (!previewFrame) return;
      
      const isDraft = document.querySelector('input[name="previewType"]:checked').value === 'draft';
      previewFrame.src = `preview.html?draft=${isDraft}&t=${Date.now()}`; // Cache-Busting
    };

    // Fixed Tab-Switching
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Deactivate all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate current tab
        button.classList.add('active');
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
          targetTab.classList.add('active');
        } else {
          console.error(`Tab content with ID "${tabName}-tab" not found`);
        }
        
        // If preview tab, refresh frame
        if (tabName === 'preview') {
          refreshPreview();
        }
      });
    });

    // TinyMCE Initialization
    const initTinyMCE = () => {
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
          'removeformat | h1 h2 h3 | help',
        content_style: 'body { font-family: "Lato", sans-serif; font-size: 16px; }',
        formats: {
          alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-left' },
          aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-center' },
          alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-right' },
          alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-justify' },
          bold: { inline: 'strong' },
          italic: { inline: 'em' },
          underline: { inline: 'span', styles: { textDecoration: 'underline' } },
          strikethrough: { inline: 'span', styles: { textDecoration: 'line-through' } }
        },
        font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt',
        extended_valid_elements: 'span[*],div[*],p[*],h1[*],h2[*],h3[*],h4[*],h5[*],h6[*]',
        relative_urls: false,
        convert_urls: false
      });
    };

    // Load content data
    const loadContentData = async (isDraft = true) => {
      try {
        const docSnap = await db.collection("content").doc(isDraft ? "draft" : "main").get();
        if (docSnap.exists) {
          const data = docSnap.data();
          
          // Fill text fields
          if (aboutTitle) aboutTitle.value = data.aboutTitle || "";
          if (aboutSubtitle) aboutSubtitle.value = data.aboutSubtitle || "";
          
          // For TinyMCE editor content we need a slight delay
          setTimeout(() => {
            if (tinymce.get('aboutText')) {
              tinymce.get('aboutText').setContent(data.aboutText || "");
            }
          }, 500);
          
          if (offeringsTitle) offeringsTitle.value = data.offeringsTitle || "";
          if (offeringsSubtitle) offeringsSubtitle.value = data.offeringsSubtitle || "";
          
          if (offer1Title) offer1Title.value = data.offer1Title || "";
          setTimeout(() => {
            if (tinymce.get('offer1Desc')) {
              tinymce.get('offer1Desc').setContent(data.offer1Desc || "");
            }
          }, 500);
          
          if (offer2Title) offer2Title.value = data.offer2Title || "";
          setTimeout(() => {
            if (tinymce.get('offer2Desc')) {
              tinymce.get('offer2Desc').setContent(data.offer2Desc || "");
            }
          }, 500);
          
          if (offer3Title) offer3Title.value = data.offer3Title || "";
          setTimeout(() => {
            if (tinymce.get('offer3Desc')) {
              tinymce.get('offer3Desc').setContent(data.offer3Desc || "");
            }
          }, 500);
          
          if (contactTitle) contactTitle.value = data.contactTitle || "";
          if (contactSubtitle) contactSubtitle.value = data.contactSubtitle || "";
          
          // Image URLs
          if (data.offer1_image && offer1Img) {
            imageData.offer1_image = data.offer1_image;
            if (typeof data.offer1_image === 'object' && data.offer1_image.url) {
              offer1Img.src = data.offer1_image.url;
            } else if (typeof data.offer1_image === 'string') {
              offer1Img.src = data.offer1_image;
            }
            offer1Img.style.display = 'block';
          }
          
          if (data.offer2_image && offer2Img) {
            imageData.offer2_image = data.offer2_image;
            if (typeof data.offer2_image === 'object' && data.offer2_image.url) {
              offer2Img.src = data.offer2_image.url;
            } else if (typeof data.offer2_image === 'string') {
              offer2Img.src = data.offer2_image;
            }
            offer2Img.style.display = 'block';
          }
          
          if (data.offer3_image && offer3Img) {
            imageData.offer3_image = data.offer3_image;
            if (typeof data.offer3_image === 'object' && data.offer3_image.url) {
              offer3Img.src = data.offer3_image.url;
            } else if (typeof data.offer3_image === 'string') {
              offer3Img.src = data.offer3_image;
            }
            offer3Img.style.display = 'block';
          }
          
          if (data.contact_image && contactImg) {
            imageData.contact_image = data.contact_image;
            if (typeof data.contact_image === 'object' && data.contact_image.url) {
              contactImg.src = data.contact_image.url;
            } else if (typeof data.contact_image === 'string') {
              contactImg.src = data.contact_image;
            }
            contactImg.style.display = 'block';
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        showStatus("Error loading data: " + err.message, true);
      }
    };

    // Load wordcloud data
    const loadWordCloudData = async () => {
      if (!wordCloudContainer) return;
      
      try {
        const docSnap = await db.collection("content").doc("wordCloud").get();
        if (docSnap.exists) {
          wordCloudData = docSnap.data().words || [];
        } else {
          // Load default values if not found
          wordCloudData = [
            { text: "Mindfulness", weight: 5, link: "#" },
            { text: "Meditation", weight: 8, link: "#" },
            { text: "Self-reflection", weight: 7, link: "#" },
            { text: "Consciousness", weight: 9, link: "#" },
            { text: "Spirituality", weight: 6, link: "#" }
          ];
        }
        
        renderWordCloudItems();
      } catch (err) {
        console.error("Error loading wordcloud:", err);
        showStatus("Error loading wordcloud: " + err.message, true);
      }
    };

    // Render wordcloud items
    const renderWordCloudItems = () => {
      if (!wordCloudContainer) return;
      
      wordCloudContainer.innerHTML = '';
      
      wordCloudData.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
          <span class="draggable-handle"><i class="fas fa-grip-lines"></i></span>
          <input type="text" class="w3-input" value="${word.text}" data-field="text" placeholder="Word" />
          <input type="number" class="w3-input word-weight" value="${word.weight}" data-field="weight" min="1" max="9" placeholder="Weight (1-9)" />
          <input type="text" class="w3-input" value="${word.link}" data-field="link" placeholder="Link (optional)" />
          <button class="w3-button w3-red w3-margin-left delete-word-btn">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        // Event listeners for input changes
        wordItem.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', () => {
            const field = input.getAttribute('data-field');
            const value = field === 'weight' ? parseInt(input.value) : input.value;
            wordCloudData[index][field] = value;
          });
        });
        
        // Event listener for delete button
        wordItem.querySelector('.delete-word-btn').addEventListener('click', () => {
          wordCloudData.splice(index, 1);
          renderWordCloudItems();
        });
        
        wordCloudContainer.appendChild(wordItem);
      });
    };

    // Add new word
    if (addWordBtn) {
      addWordBtn.addEventListener('click', () => {
        wordCloudData.push({ text: "", weight: 5, link: "#" });
        renderWordCloudItems();
      });
    }

    // Save wordcloud
    if (saveWordCloudBtn) {
      saveWordCloudBtn.addEventListener('click', async () => {
        try {
          await db.collection("content").doc("wordCloud").set({
            words: wordCloudData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          showStatus("Wordcloud successfully saved!");
        } catch (err) {
          console.error("Error saving wordcloud:", err);
          showStatus("Error saving wordcloud: " + err.message, true);
        }
      });
    }

    // Save content
    const saveContent = async (isPublish = false) => {
      try {
        // Get TinyMCE content
        const aboutTextContent = tinymce.get('aboutText')?.getContent() || "";
        const offer1DescContent = tinymce.get('offer1Desc')?.getContent() || "";
        const offer2DescContent = tinymce.get('offer2Desc')?.getContent() || "";
        const offer3DescContent = tinymce.get('offer3Desc')?.getContent() || "";
        
        // Image path check and simplification
        console.log("Current image data before saving:", JSON.stringify(imageData));
        
        // Compile data
        const contentData = {
          aboutTitle: aboutTitle.value,
          aboutSubtitle: aboutSubtitle.value,
          aboutText: aboutTextContent,
          
          offeringsTitle: offeringsTitle.value,
          offeringsSubtitle: offeringsSubtitle.value,
          
          offer1Title: offer1Title.value,
          offer1Desc: offer1DescContent,
          // Image path check
          offer1_image: imageData.offer1_image && imageData.offer1_image.url ? imageData.offer1_image : null,
          
          offer2Title: offer2Title.value,
          offer2Desc: offer2DescContent,
          offer2_image: imageData.offer2_image && imageData.offer2_image.url ? imageData.offer2_image : null,
          
          offer3Title: offer3Title.value,
          offer3Desc: offer3DescContent,
          offer3_image: imageData.offer3_image && imageData.offer3_image.url ? imageData.offer3_image : null,
          
          contactTitle: contactTitle.value,
          contactSubtitle: contactSubtitle.value,
          contact_image: imageData.contact_image && imageData.contact_image.url ? imageData.contact_image : null,
          
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log("Saving the following data:", contentData);
        
        // Save as draft
        await db.collection("content").doc("draft").set(contentData);
        
        if (isPublish) {
          // Publish (copy to "main")
          await db.collection("content").doc("main").set(contentData);
          showStatus("Changes successfully published! 🚀");
        } else {
          showStatus("Draft successfully saved! 💾");
        }
        
        // Refresh preview
        refreshPreview();
      } catch (err) {
        console.error("Error saving:", err);
        showStatus(`Error ${isPublish ? 'publishing' : 'saving'}: ${err.message}`, true);
      }
    };
    
    // Image upload handler with improved error handling and return format
    const setupImageUpload = (buttonId, imageKey, imgElement) => {
      const button = document.getElementById(buttonId);
      if (!button) return;
      
      button.addEventListener('click', () => {
        // Save the current upload element for reference
        currentUploadElement = button.closest('.w3-card') || button.closest('.w3-row');
        
        if (cloudinaryWidget) {
          try {
            // Open Cloudinary widget
            cloudinaryWidget.open();
          } catch (error) {
            console.error("Error opening Cloudinary widget:", error);
            showStatus("Error opening upload dialog. Using local upload instead.", true);
            
            // Fallback to local upload
            useLocalUpload();
          }
        } else {
          // Fallback to normal file upload
          useLocalUpload();
        }
        
        function useLocalUpload() {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          document.body.appendChild(fileInput);
          
          fileInput.addEventListener('change', async () => {
            if (fileInput.files.length > 0) {
              try {
                // Upload image
                await uploadFile(fileInput.files[0], (url, filename) => {
                  // Save image URL in standardized format
                  imageData[imageKey] = { 
                    url: url, 
                    filename: filename,
                    public_id: filename // Local fallback format
                  };
                  
                  console.log(`Image for ${imageKey} set:`, imageData[imageKey]);
                  
                  // Update preview image
                  imgElement.src = url;
                  imgElement.style.display = 'block';
                });
              } catch (error) {
                console.error('Upload error:', error);
              }
              
              document.body.removeChild(fileInput);
            }
          });
          
          fileInput.click();
        }
      });
    };

    // Preview refresh
    if (refreshPreviewBtn) {
      refreshPreviewBtn.addEventListener('click', refreshPreview);
    }
    
    // Change preview type
    if (previewTypeRadios.length > 0) {
      previewTypeRadios.forEach(radio => {
        radio.addEventListener('change', refreshPreview);
      });
    }

    // Event listeners for buttons
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => saveContent(false));
    }
    
    if (publishBtn) {
      publishBtn.addEventListener('click', () => saveContent(true));
    }

    // ========== PAGE MANAGEMENT ==========
    
    // New global variables for page management
    let currentPages = {};
    let currentEditingPage = null;

    // Template definitions
    const pageTemplates = {
      'basic': {
        name: 'Basic Template',
        description: 'Simple page with heading and text',
        preview: '<div class="template-preview"><div class="tp-header"></div><div class="tp-content"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'textarea', name: 'content', label: 'Content', editor: true }
        ]
      },
      'text-image': {
        name: 'Text with Image',
        description: 'Text on the left, image on the right',
        preview: '<div class="template-preview"><div class="tp-text-col"></div><div class="tp-image-col"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'textarea', name: 'content', label: 'Content', editor: true },
          { type: 'image', name: 'image', label: 'Image' }
        ]
      },
      'image-text': {
        name: 'Image with Text',
        description: 'Image on the left, text on the right',
        preview: '<div class="template-preview"><div class="tp-image-col"></div><div class="tp-text-col"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'image', name: 'image', label: 'Image' },
          { type: 'textarea', name: 'content', label: 'Content', editor: true }
        ]
      },
      'gallery': {
        name: 'Gallery',
        description: 'Image gallery with title',
        preview: '<div class="template-preview"><div class="tp-header"></div><div class="tp-gallery"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Heading' },
          { type: 'textarea', name: 'description', label: 'Description', editor: true },
          { type: 'gallery', name: 'images', label: 'Images' }
        ]
      },
      'contact': {
        name: 'Contact',
        description: 'Contact form with text',
        preview: '<div class="template-preview"><div class="tp-header"></div><div class="tp-text-col"></div><div class="tp-form-col"></div></div>',
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

    // Add CSS for template preview
    const addTemplatePreviewCSS = () => {
      if (document.getElementById('template-preview-css')) return;
      
      const style = document.createElement('style');
      style.id = 'template-preview-css';
      style.textContent = `
        .template-preview-container {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        
        .template-preview {
          display: flex;
          flex-wrap: wrap;
          min-height: 100px;
        }
        
        .tp-header {
          width: 100%;
          height: 30px;
          background-color: #ddd;
          margin-bottom: 10px;
        }
        
        .tp-content {
          width: 100%;
          height: 80px;
          background-color: #e6e6e6;
        }
        
        .tp-text-col {
          width: 60%;
          height: 100px;
          background-color: #e6e6e6;
          margin-right: 2%;
        }
        
        .tp-image-col {
          width: 38%;
          height: 100px;
          background-color: #ccc;
        }
        
        .tp-gallery {
          width: 100%;
          height: 80px;
          background-color: #e6e6e6;
          display: flex;
          justify-content: space-between;
        }
        
        .tp-gallery:before,
        .tp-gallery:after {
          content: '';
          width: 23%;
          height: 100%;
          background-color: #ccc;
        }
        
        .tp-gallery:after {
          background-color: #bbb;
        }
        
        .tp-form-col {
          width: 40%;
          height: 100px;
          background-color: #e6e6e6;
        }
        
        .gallery-image-wrapper {
          position: relative;
          margin-bottom: 15px;
        }
      `;
      document.head.appendChild(style);
    };

    // Initialize page management logic
    const initPageManagement = () => {
      console.log("Initializing page management...");
      
      // DOM elements
      const createPageBtn = document.getElementById('createPageBtn');
      const newPageForm = document.getElementById('newPageForm');
      const editPageForm = document.getElementById('editPageForm');
      const pagesList = document.getElementById('pagesList');
      const noPagesMessage = document.getElementById('noPagesMessage');
      const pageName = document.getElementById('pageName');
      const pageTitle = document.getElementById('pageTitle');
      const pageTemplate = document.getElementById('pageTemplate');
      const templatePreview = document.getElementById('templatePreview');
      const cancelNewPageBtn = document.getElementById('cancelNewPageBtn');
      const createNewPageBtn = document.getElementById('createNewPageBtn');
      const templateFields = document.getElementById('templateFields');
      const editPageTitle = document.getElementById('editPageTitle');
      const backToListBtn = document.getElementById('backToListBtn');
      const deletePageBtn = document.getElementById('deletePageBtn');
      const savePageBtn = document.getElementById('savePageBtn');

      // Events for buttons
      if (createPageBtn) {
        createPageBtn.addEventListener('click', () => {
          newPageForm.style.display = 'block';
          const pagesListContainer = document.getElementById('pagesListContainer');
          if (pagesListContainer) pagesListContainer.style.display = 'none';
          createPageBtn.style.display = 'none';
        });
      }

      if (cancelNewPageBtn) {
        cancelNewPageBtn.addEventListener('click', () => {
          newPageForm.style.display = 'none';
          const pagesListContainer = document.getElementById('pagesListContainer');
          if (pagesListContainer) pagesListContainer.style.display = 'block';
          createPageBtn.style.display = 'block';
          pageName.value = '';
          pageTitle.value = '';
          pageTemplate.selectedIndex = 0;
        });
      }

      if (createNewPageBtn) {
        createNewPageBtn.addEventListener('click', createNewPage);
      }

      if (backToListBtn) {
        backToListBtn.addEventListener('click', showPagesList);
      }

      if (deletePageBtn) {
        deletePageBtn.addEventListener('click', deletePage);
      }

      if (savePageBtn) {
        savePageBtn.addEventListener('click', savePage);
      }

      // Update template preview on change
      if (pageTemplate) {
        pageTemplate.addEventListener('change', () => {
          updateTemplatePreview(pageTemplate.value);
        });
        
        // Initially show the preview for the first template
        updateTemplatePreview(pageTemplate.value);
      }

      // Load all pages
      loadPages();
    };

    // Function to reload pages manually
    const loadPages = () => {
      showStatus("Loading pages...");
      
      let pagesList = document.getElementById('pagesList');
      if (!pagesList) {
        console.error("pagesList element not found!");
        // Create element if it doesn't exist
        const container = document.getElementById('pagesListContainer');
        if (container) {
          const newPagesList = document.createElement('div');
          newPagesList.id = 'pagesList';
          newPagesList.className = 'w3-container';
          container.appendChild(newPagesList);
          pagesList = newPagesList;
        } else {
          return; // Cannot continue without container
        }
      }
      
      // Fix missing message
      let noPagesMessage = document.getElementById('noPagesMessage');
      if (!noPagesMessage) {
        noPagesMessage = document.createElement('p');
        noPagesMessage.id = 'noPagesMessage';
        noPagesMessage.className = 'w3-text-grey';
        noPagesMessage.textContent = 'No pages created yet.';
        pagesList.appendChild(noPagesMessage);
      }
      
      // Empty list and show loading message
      pagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Loading pages...</p>';
      
      // Load all pages directly from Firebase
      db.collection('pages').get().then(snapshot => {
        pagesList.innerHTML = ''; // Empty list
        
        if (snapshot.empty) {
          console.log("No pages found");
          if (noPagesMessage) noPagesMessage.style.display = 'block';
          return;
        }
        
        console.log(`${snapshot.size} pages found, adding to list`);
        if (noPagesMessage) noPagesMessage.style.display = 'none';
        
        // Reset page list
        currentPages = {};
        
        // Add pages to object and display
        snapshot.docs.forEach(doc => {
          const pageData = doc.data();
          const pageId = doc.id;
          
          currentPages[pageId] = pageData;
          
          const pageItem = document.createElement('div');
          pageItem.className = 'w3-bar w3-hover-light-grey w3-margin-bottom';
          pageItem.style.border = '1px solid #ddd';
          pageItem.innerHTML = `
            <div class="w3-bar-item">
              <span class="w3-large">${pageData.title}</span><br>
              <span>ID: ${pageId} | Template: ${pageTemplates[pageData.template]?.name || pageData.template}</span>
            </div>
            <a href="page.php?id=${pageId}" class="w3-bar-item w3-button w3-blue w3-right" style="margin-left: 5px" target="_blank">
              <i class="fas fa-eye"></i> View
            </a>
            <button class="w3-bar-item w3-button w3-green w3-right edit-page-btn" data-page-id="${pageId}">
              <i class="fas fa-edit"></i> Edit
            </button>
          `;
          
          pagesList.appendChild(pageItem);
          
          // Event listener for edit button
          const editBtn = pageItem.querySelector('.edit-page-btn');
          if (editBtn) {
            editBtn.addEventListener('click', function() {
              console.log("Edit button clicked for:", pageId);
              editPage(pageId);
            });
          }
        });
        
        showStatus(`${snapshot.size} pages loaded`);
        
      }).catch(error => {
        console.error("Error loading pages:", error);
        pagesList.innerHTML = `<p class="w3-text-red w3-center">Error loading: ${error.message}</p>`;
        showStatus('Error loading pages: ' + error.message, true);
      });
    };

    // Update template preview
    const updateTemplatePreview = (templateId) => {
      const templatePreview = document.getElementById('templatePreview');
      if (!templatePreview || !pageTemplates[templateId]) return;
      
      const template = pageTemplates[templateId];
      templatePreview.innerHTML = `
        <h5>${template.name}</h5>
        <p>${template.description}</p>
        <div class="template-preview-container">
          ${template.preview}
        </div>
      `;
    };

    // Create new page
    const createNewPage = async () => {
      const pageName = document.getElementById('pageName');
      const pageTitle = document.getElementById('pageTitle');
      const pageTemplate = document.getElementById('pageTemplate');
      
      if (!pageName || !pageTitle || !pageTemplate) return;
      
      // Validation
      if (!pageName.value || !pageTitle.value) {
        showStatus('Please fill in all fields.', true);
        return;
      }
      
      // Create URL-friendly name
      const urlName = pageName.value.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')  // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-');      // Replace multiple hyphens with a single one
      
      try {
        // Check if a page with this name already exists
        const existingPage = await db.collection('pages').doc(urlName).get();
        if (existingPage.exists) {
          showStatus(`A page with the name "${urlName}" already exists.`, true);
          return;
        }
        
        // Create new page
        const selectedTemplate = pageTemplate.value;
        const template = pageTemplates[selectedTemplate];
        
        if (!template) {
          showStatus('Invalid template selected.', true);
          return;
        }
        
        // Create empty data for the template
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
        
        // Save in Firestore
        await db.collection('pages').doc(urlName).set(pageData);
        
        showStatus(`Page "${pageTitle.value}" was created successfully.`);
        
        // Reset form and reload pages
        pageName.value = '';
        pageTitle.value = '';
        pageTemplate.selectedIndex = 0;
        
        // Back to page list
        showPagesList();
        
        // Reload pages
        loadPages();
        
      } catch (err) {
        console.error('Error creating page:', err);
        showStatus('Error creating page: ' + err.message, true);
      }
    };

    // Edit page
    const editPage = async (pageId) => {
      try {
        console.log("Starting edit for page:", pageId);
        
        // Get page object
        if (!currentPages[pageId]) {
          // If the page is not in cache, load from Firestore
          const pageDoc = await db.collection('pages').doc(pageId).get();
          if (!pageDoc.exists) {
            showStatus('The page was not found.', true);
            return;
          }
          currentPages[pageId] = pageDoc.data();
        }
        
        const pageData = currentPages[pageId];
        currentEditingPage = pageId;
        
        console.log("Page loaded:", pageData);
        
        // Show/hide form elements
        document.getElementById('createPageBtn').style.display = 'none';
        document.getElementById('pagesListContainer').style.display = 'none';
        document.getElementById('newPageForm').style.display = 'none';
        document.getElementById('editPageForm').style.display = 'block';
        
        // Show page title
        document.getElementById('editPageTitle').textContent = pageData.title;
        
        // Generate template fields
        generateTemplateFields(pageData.template, pageData.data);
        
      } catch (err) {
        console.error('Error loading page:', err);
        showStatus('Error loading page: ' + err.message, true);
      }
    };

    // Generate template fields for editing
    const generateTemplateFields = (templateId, data) => {
      const templateFields = document.getElementById('templateFields');
      if (!templateFields || !pageTemplates[templateId]) return;
      
      const template = pageTemplates[templateId];
      templateFields.innerHTML = '';
      
      // Create fields based on template
      template.fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'w3-margin-bottom';
        
        const fieldLabel = document.createElement('label');
        fieldLabel.setAttribute('for', `field_${field.name}`);
        fieldLabel.textContent = field.label;
        fieldContainer.appendChild(fieldLabel);
        
        // Create different input elements depending on field type
        switch (field.type) {
          case 'text':
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = `field_${field.name}`;
            textInput.className = 'w3-input w3-margin-bottom';
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
              textareaField.className = 'tinymce-editor';
              textareaField.rows = 8;
              textareaField.innerHTML = data[field.name] || '';
              
              editorContainer.appendChild(textareaField);
              fieldContainer.appendChild(editorContainer);
              
              // Initialize TinyMCE
              setTimeout(() => {
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
                  font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt 48pt'
                });
              }, 100);
            } else {
              // Standard textarea
              const textarea = document.createElement('textarea');
              textarea.id = `field_${field.name}`;
              textarea.className = 'w3-input w3-margin-bottom';
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
            checkboxContainer.appendChild(document.createTextNode(' ' + field.label));
            
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
            imagePreview.id = `field_${field.name}_preview`;
            imagePreview.className = 'w3-margin-bottom';
            imagePreview.style.maxHeight = '150px';
            imagePreview.style.overflow = 'hidden';
            
            const previewImg = document.createElement('img');
            previewImg.id = `field_${field.name}_img`;
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
            uploadBtn.textContent = 'Select image';
            uploadBtn.addEventListener('click', () => {
              // Call image upload handler
              uploadImage(uploadBtn, `field_${field.name}`);
            });
            
            buttonCol.appendChild(uploadBtn);
            
            // Image URL (hidden, needed for database)
            const imageUrlInput = document.createElement('input');
            imageUrlInput.type = 'hidden';
            imageUrlInput.id = `field_${field.name}`;
            imageUrlInput.value = JSON.stringify(data[field.name] || { url: '', public_id: '' });
            
            imageContainer.appendChild(previewCol);
            imageContainer.appendChild(buttonCol);
            imageContainer.appendChild(imageUrlInput);
            
            fieldContainer.appendChild(imageContainer);
            break;
            
          case 'gallery':
            const galleryContainer = document.createElement('div');
            galleryContainer.className = 'w3-margin-bottom';
            
            // Gallery preview
            const galleryPreview = document.createElement('div');
            galleryPreview.id = `field_${field.name}_preview`;
            galleryPreview.className = 'w3-row w3-margin-bottom';
            
            // Show existing images
            const galleryImages = data[field.name] || [];
            galleryImages.forEach((image, index) => {
              const imageCol = document.createElement('div');
              imageCol.className = 'w3-col m3 w3-padding';
              
              const imageWrapper = document.createElement('div');
              imageWrapper.className = 'gallery-image-wrapper';
              imageWrapper.style.position = 'relative';
              
              const img = document.createElement('img');
              img.src = image.url;
              img.style.width = '100%';
              img.style.borderRadius = '4px';
              
              const removeBtn = document.createElement('button');
              removeBtn.className = 'w3-button w3-red w3-circle';
              removeBtn.style.position = 'absolute';
              removeBtn.style.top = '5px';
              removeBtn.style.right = '5px';
              removeBtn.style.padding = '0';
              removeBtn.style.width = '30px';
              removeBtn.style.height = '30px';
              removeBtn.innerHTML = '<i class="fas fa-times"></i>';
              removeBtn.addEventListener('click', () => {
                // Remove image from gallery
                removeGalleryImage(field.name, index);
              });
              
              imageWrapper.appendChild(img);
              imageWrapper.appendChild(removeBtn);
              imageCol.appendChild(imageWrapper);
              galleryPreview.appendChild(imageCol);
            });
            
            // Button to add images
            const addImageBtn = document.createElement('button');
            addImageBtn.id = `field_${field.name}_add`;
            addImageBtn.className = 'w3-button w3-blue w3-margin-bottom';
            addImageBtn.innerHTML = '<i class="fas fa-plus"></i> Add image';
            addImageBtn.addEventListener('click', () => {
              // Add image to gallery
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
    };

    // Image upload handler for page fields
    const uploadImage = (buttonElement, fieldId) => {
      // Save the current upload element for reference
      currentUploadElement = buttonElement.closest('.w3-row');
      
      if (cloudinaryWidget) {
        try {
          // Open Cloudinary widget
          cloudinaryWidget.open();
          
          // Event handler for successful upload
          const originalCallback = cloudinaryWidget.options.callbacks;
          cloudinaryWidget.options.callbacks = {
            ...originalCallback,
            success: (result) => {
              if (originalCallback && originalCallback.success) {
                originalCallback.success(result);
              }
              
              if (result && result.event === "success") {
                const imageUrl = result.info.secure_url;
                const publicId = result.info.public_id;
                
                // Save image URL and Public ID in hidden field
                const hiddenInput = document.getElementById(fieldId);
                if (hiddenInput) {
                  hiddenInput.value = JSON.stringify({ url: imageUrl, public_id: publicId });
                }
                
                // Update image preview
                const imgElement = document.getElementById(`${fieldId}_img`);
                if (imgElement) {
                  imgElement.src = imageUrl;
                  imgElement.style.display = 'block';
                }
                
                showStatus('Image successfully uploaded');
              }
            }
          };
        } catch (error) {
          console.error("Error opening Cloudinary widget:", error);
          showStatus("Error opening upload dialog. Using local upload instead.", true);
          
          // Fallback to local upload
          useLocalUpload(fieldId);
        }
      } else {
        // Fallback to normal file upload
        useLocalUpload(fieldId);
      }
      
      function useLocalUpload(fieldId) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', async () => {
          if (fileInput.files.length > 0) {
            try {
              // Upload image
              await uploadFile(fileInput.files[0], (url, filename) => {
                // Save image URL and Public ID in hidden field
                const hiddenInput = document.getElementById(fieldId);
                if (hiddenInput) {
                  hiddenInput.value = JSON.stringify({ 
                    url: url, 
                    filename: filename,
                    public_id: filename // Local fallback format
                  });
                }
                
                // Update image preview
                const imgElement = document.getElementById(`${fieldId}_img`);
                if (imgElement) {
                  imgElement.src = url;
                  imgElement.style.display = 'block';
                }
                
                showStatus('Image successfully uploaded');
              });
            } catch (error) {
              console.error('Upload error:', error);
              showStatus('Upload error: ' + error.message, true);
            }
            
            document.body.removeChild(fileInput);
          }
        });
        
        fileInput.click();
      }
    };

    // Add image to gallery
    const addGalleryImage = (fieldName) => {
      if (!currentEditingPage) return;
      // Save the current upload element for reference
      currentUploadElement = document.getElementById(`field_${fieldName}_add`);
      
      if (cloudinaryWidget) {
        try {
          // Open Cloudinary widget
          cloudinaryWidget.open();
          
          // Event handler for successful upload
          const originalCallback = cloudinaryWidget.options.callbacks;
          cloudinaryWidget.options.callbacks = {
            ...originalCallback,
            success: (result) => {
              if (originalCallback && originalCallback.success) {
                originalCallback.success(result);
              }
              
              if (result && result.event === "success") {
                const imageUrl = result.info.secure_url;
                const publicId = result.info.public_id;
                
                // Add image to gallery
                addImageToGallery(fieldName, { url: imageUrl, public_id: publicId });
              }
            }
          };
        } catch (error) {
          console.error("Error opening Cloudinary widget:", error);
          showStatus("Error opening upload dialog. Using local upload instead.", true);
          
          // Fallback to local upload
          useLocalGalleryUpload(fieldName);
        }
      } else {
        // Fallback to normal file upload
        useLocalGalleryUpload(fieldName);
      }
      
      function useLocalGalleryUpload(fieldName) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', async () => {
          if (fileInput.files.length > 0) {
            try {
              // Upload image
              await uploadFile(fileInput.files[0], (url, filename) => {
                // Add image to gallery
                addImageToGallery(fieldName, { 
                  url: url, 
                  filename: filename,
                  public_id: filename // Local fallback format
                });
              });
            } catch (error) {
              console.error('Upload error:', error);
              showStatus('Upload error: ' + error.message, true);
            }
            
            document.body.removeChild(fileInput);
          }
        });
        
        fileInput.click();
      }
    };

    // Add image to gallery
    const addImageToGallery = (fieldName, imageData) => {
      // Get current gallery field
      const galleryInput = document.getElementById(`field_${fieldName}`);
      const galleryPreview = document.getElementById(`field_${fieldName}_preview`);
      
      if (!galleryInput || !galleryPreview) return;
      
      // Get gallery data
      let galleryImages = [];
      try {
        galleryImages = JSON.parse(galleryInput.value) || [];
      } catch (error) {
        console.error('Error parsing gallery data:', error);
        galleryImages = [];
      }
      
      // Add image
      galleryImages.push(imageData);
      
      // Update gallery input
      galleryInput.value = JSON.stringify(galleryImages);
      
      // Add new image to preview
      const imageCol = document.createElement('div');
      imageCol.className = 'w3-col m3 w3-padding';
      
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'gallery-image-wrapper';
      imageWrapper.style.position = 'relative';
      
      const img = document.createElement('img');
      img.src = imageData.url;
      img.style.width = '100%';
      img.style.borderRadius = '4px';
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'w3-button w3-red w3-circle';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '5px';
      removeBtn.style.right = '5px';
      removeBtn.style.padding = '0';
      removeBtn.style.width = '30px';
      removeBtn.style.height = '30px';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      
      const index = galleryImages.length - 1;
      removeBtn.addEventListener('click', () => {
        // Remove image from gallery
        removeGalleryImage(fieldName, index);
      });
      
      imageWrapper.appendChild(img);
      imageWrapper.appendChild(removeBtn);
      imageCol.appendChild(imageWrapper);
      galleryPreview.appendChild(imageCol);
      
      showStatus('Image added to gallery');
    };

    // Remove image from gallery
    const removeGalleryImage = (fieldName, index) => {
      // Get current gallery field
      const galleryInput = document.getElementById(`field_${fieldName}`);
      const galleryPreview = document.getElementById(`field_${fieldName}_preview`);
      
      if (!galleryInput || !galleryPreview) return;
      
      // Get gallery data
      let galleryImages = [];
      try {
        galleryImages = JSON.parse(galleryInput.value) || [];
      } catch (error) {
        console.error('Error parsing gallery data:', error);
        return;
      }
      
      // Remove image
      if (index >= 0 && index < galleryImages.length) {
        galleryImages.splice(index, 1);
        
        // Update gallery input
        galleryInput.value = JSON.stringify(galleryImages);
        
        // Update preview (re-render)
        galleryPreview.innerHTML = '';
        
        galleryImages.forEach((image, idx) => {
          const imageCol = document.createElement('div');
          imageCol.className = 'w3-col m3 w3-padding';
          
          const imageWrapper = document.createElement('div');
          imageWrapper.className = 'gallery-image-wrapper';
          imageWrapper.style.position = 'relative';
          
          const img = document.createElement('img');
          img.src = image.url;
          img.style.width = '100%';
          img.style.borderRadius = '4px';
          
          const removeBtn = document.createElement('button');
          removeBtn.className = 'w3-button w3-red w3-circle';
          removeBtn.style.position = 'absolute';
          removeBtn.style.top = '5px';
          removeBtn.style.right = '5px';
          removeBtn.style.padding = '0';
          removeBtn.style.width = '30px';
          removeBtn.style.height = '30px';
          removeBtn.innerHTML = '<i class="fas fa-times"></i>';
          
          removeBtn.addEventListener('click', () => {
            // Remove image from gallery
            removeGalleryImage(fieldName, idx);
          });
          
          imageWrapper.appendChild(img);
          imageWrapper.appendChild(removeBtn);
          imageCol.appendChild(imageWrapper);
          galleryPreview.appendChild(imageCol);
        });
        
        showStatus('Image removed from gallery');
      }
    };

    // Save page
    const savePage = async () => {
      if (!currentEditingPage) return;
      
      try {
        const pageData = currentPages[currentEditingPage];
        if (!pageData) {
          showStatus('Error: No page data found.', true);
          return;
        }
        
        const template = pageTemplates[pageData.template];
        if (!template) {
          showStatus('Error: Invalid template.', true);
          return;
        }
        
        // Collect data from form fields
        const updatedData = {};
        
        for (const field of template.fields) {
          const fieldElement = document.getElementById(`field_${field.name}`);
          if (!fieldElement) continue;
          
          switch (field.type) {
            case 'text':
              updatedData[field.name] = fieldElement.value;
              break;
              
            case 'textarea':
              if (field.editor && tinymce.get(`field_${field.name}`)) {
                // TinyMCE editor
                updatedData[field.name] = tinymce.get(`field_${field.name}`).getContent();
              } else {
                // Standard textarea
                updatedData[field.name] = fieldElement.value;
              }
              break;
              
            case 'checkbox':
              updatedData[field.name] = fieldElement.checked;
              break;
              
            case 'image':
              try {
                updatedData[field.name] = JSON.parse(fieldElement.value);
              } catch (error) {
                console.error('Error parsing image data:', error);
                updatedData[field.name] = { url: '', public_id: '' };
              }
              break;
              
            case 'gallery':
              try {
                updatedData[field.name] = JSON.parse(fieldElement.value);
              } catch (error) {
                console.error('Error parsing gallery data:', error);
                updatedData[field.name] = [];
              }
              break;
          }
        }
        
        // Update data
        const updatedPage = {
          ...pageData,
          data: updatedData,
          updated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save in Firestore
        await db.collection('pages').doc(currentEditingPage).update(updatedPage);
        
        // Update in local cache
        currentPages[currentEditingPage] = updatedPage;
        
        showStatus(`Page "${pageData.title}" was saved successfully.`);
        
      } catch (err) {
        console.error('Error saving page:', err);
        showStatus('Error saving page: ' + err.message, true);
      }
    };

    // Delete page
    const deletePage = async () => {
      if (!currentEditingPage) return;
      
      // Get confirmation from user
      if (!confirm(`Do you really want to delete the page "${currentPages[currentEditingPage]?.title}"? This action cannot be undone.`)) {
        return;
      }
      
      try {
        // Delete from Firestore
        await db.collection('pages').doc(currentEditingPage).delete();
        
        // Remove from local cache
        delete currentPages[currentEditingPage];
        
        showStatus('Page was deleted successfully.');
        
        // Back to page list
        showPagesList();
        
        // Reload pages
        loadPages();
        
      } catch (err) {
        console.error('Error deleting page:', err);
        showStatus('Error deleting page: ' + err.message, true);
      }
    };

    // Back to page list
    const showPagesList = () => {
      // Show/hide form elements
      document.getElementById('createPageBtn').style.display = 'block';
      document.getElementById('pagesListContainer').style.display = 'block';
      document.getElementById('newPageForm').style.display = 'none';
      document.getElementById('editPageForm').style.display = 'none';
      
      // Remove TinyMCE editors
      tinymce.remove();
      
      // Reset currently edited page
      currentEditingPage = null;
    };

    // Monitor auth state
    auth.onAuthStateChanged(user => {
      if (user) {
        // Logged in
        loginDiv.style.display = 'none';
        adminDiv.style.display = 'block';
        
        // Initialize TinyMCE
        initTinyMCE();
        
        // Load data after TinyMCE initialization
        setTimeout(() => {
          loadContentData();
          loadWordCloudData();
          
          // Initialize page management if tab exists
          if (document.getElementById('pages-tab')) {
            addTemplatePreviewCSS();
            initPageManagement();
          }
        }, 1000);
        
        // Set up image upload handlers
        setupImageUpload('offer1UploadBtn', 'offer1_image', offer1Img);
        setupImageUpload('offer2UploadBtn', 'offer2_image', offer2Img);
        setupImageUpload('offer3UploadBtn', 'offer3_image', offer3Img);
        setupImageUpload('contactUploadBtn', 'contact_image', contactImg);
      } else {
        // Not logged in
        adminDiv.style.display = 'none';
        loginDiv.style.display = 'block';
      }
    });

    // Login button event
    loginBtn.addEventListener('click', () => {
      const email = emailField.value;
      const pass = passField.value;
      loginError.textContent = "";
      
      auth.signInWithEmailAndPassword(email, pass)
        .catch(err => {
          console.error("Login error:", err);
          loginError.textContent = "Login failed: " + err.message;
        });
    });

    // Logout button event
    logoutBtn.addEventListener('click', () => {
      auth.signOut();
    });
});