/**
 * Enhanced Admin Panel JavaScript
 * Complete rewrite with improved organization and error handling
 */

document.addEventListener('DOMContentLoaded', () => {
    // Firebase should already be initialized in the HTML
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // Global state
    const state = {
      currentPage: null,
      imageData: {
        offer1_image: { url: "", public_id: "" },
        offer2_image: { url: "", public_id: "" },
        offer3_image: { url: "", public_id: "" },
        contact_image: { url: "", public_id: "" }
      },
      wordCloudData: [],
      isDirty: false
    };
    
    // Initialize Cloudinary if available
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
                
                handleImageUploadSuccess(imageUrl, publicId);
            }
        });
    }
    
    // Element references
    const elements = {
      // Login elements
      loginDiv: document.getElementById('loginDiv'),
      adminDiv: document.getElementById('adminDiv'),
      emailField: document.getElementById('emailField'),
      passField: document.getElementById('passField'),
      loginBtn: document.getElementById('loginBtn'),
      loginError: document.getElementById('loginError'),
      logoutBtn: document.getElementById('logoutBtn'),
      statusMsg: document.getElementById('statusMsg'),
      
      // Tab elements
      tabButtons: document.querySelectorAll('.tab-btn'),
      tabContents: document.querySelectorAll('.tab-content'),
      
      // Content form elements
      aboutTitle: document.getElementById('aboutTitle'),
      aboutSubtitle: document.getElementById('aboutSubtitle'),
      aboutText: document.getElementById('aboutText'),
      offeringsTitle: document.getElementById('offeringsTitle'),
      offeringsSubtitle: document.getElementById('offeringsSubtitle'),
      offeringsTitleSize: document.getElementById('offeringsTitleSize'),
      offeringsTitleSizeValue: document.getElementById('offeringsTitleSizeValue'),
      offeringsSubtitleSize: document.getElementById('offeringsSubtitleSize'),
      offeringsSubtitleSizeValue: document.getElementById('offeringsSubtitleSizeValue'),
      offer1Title: document.getElementById('offer1Title'),
      offer2Title: document.getElementById('offer2Title'),
      offer3Title: document.getElementById('offer3Title'),
      contactTitle: document.getElementById('contactTitle'),
      contactSubtitle: document.getElementById('contactSubtitle'),
      contactTitleSize: document.getElementById('contactTitleSize'),
      contactTitleSizeValue: document.getElementById('contactTitleSizeValue'),
      contactSubtitleSize: document.getElementById('contactSubtitleSize'),
      contactSubtitleSizeValue: document.getElementById('contactSubtitleSizeValue'),
      
      // Image elements
      offer1Img: document.getElementById('offer1Img'),
      offer2Img: document.getElementById('offer2Img'),
      offer3Img: document.getElementById('offer3Img'),
      contactImg: document.getElementById('contactImg'),
      
      // Upload buttons
      offer1UploadBtn: document.getElementById('offer1UploadBtn'),
      offer2UploadBtn: document.getElementById('offer2UploadBtn'),
      offer3UploadBtn: document.getElementById('offer3UploadBtn'),
      contactUploadBtn: document.getElementById('contactUploadBtn'),
      
      // Save buttons
      saveDraftBtn: document.getElementById('saveDraftBtn'),
      publishBtn: document.getElementById('publishBtn'),
      
      // Word Cloud elements
      wordCloudContainer: document.getElementById('wordCloudContainer'),
      addWordBtn: document.getElementById('addWordBtn'),
      saveWordCloudBtn: document.getElementById('saveWordCloudBtn'),
      previewWordCloudBtn: document.getElementById('previewWordCloudBtn'),
      
      // Preview elements
      previewFrame: document.getElementById('previewFrame'),
      refreshPreviewBtn: document.getElementById('refreshPreviewBtn'),
      previewTypeRadios: document.getElementsByName('previewType')
    };

    // Show status message
    const showStatus = (message, isError = false, timeout = 3000) => {
      if (!elements.statusMsg) return;
      
      elements.statusMsg.textContent = message;
      elements.statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
      
      // Hide after timeout unless it's 0 (persistent)
      if (timeout > 0) {
        setTimeout(() => {
          elements.statusMsg.classList.remove('show');
        }, timeout);
      }
    };

    // Function to handle successful image upload
    const handleImageUploadSuccess = (url, publicId, uploadContext = null) => {
      // Default to the current upload element's context
      const context = uploadContext || {};
      
      // Determine which image we're dealing with
      if (context.button === elements.offer1UploadBtn || context.id === 'offer1_image') {
        state.imageData.offer1_image = { url, public_id: publicId };
        if (elements.offer1Img) {
          elements.offer1Img.src = url;
          elements.offer1Img.style.display = 'block';
        }
      } else if (context.button === elements.offer2UploadBtn || context.id === 'offer2_image') {
        state.imageData.offer2_image = { url, public_id: publicId };
        if (elements.offer2Img) {
          elements.offer2Img.src = url;
          elements.offer2Img.style.display = 'block';
        }
      } else if (context.button === elements.offer3UploadBtn || context.id === 'offer3_image') {
        state.imageData.offer3_image = { url, public_id: publicId };
        if (elements.offer3Img) {
          elements.offer3Img.src = url;
          elements.offer3Img.style.display = 'block';
        }
      } else if (context.button === elements.contactUploadBtn || context.id === 'contact_image') {
        state.imageData.contact_image = { url, public_id: publicId };
        if (elements.contactImg) {
          elements.contactImg.src = url;
          elements.contactImg.style.display = 'block';
        }
      }
      
      // Mark content as dirty (unsaved changes)
      state.isDirty = true;
    };

    // Standard file upload (fallback to PHP upload script)
    const uploadFile = async (file, callback) => {
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const response = await fetch('./api/upload.php', {
              method: 'POST',
              body: formData
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
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
            showStatus('Upload error: ' + (error.message || 'Unknown error'), true);
            throw error;
        }
    };

    // Tab-Switching
    elements.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        console.log(`Switching to tab: ${tabName}`);
        
        // Hide all tab contents and deactivate buttons
        elements.tabContents.forEach(content => {
          content.style.display = 'none';
          content.classList.remove('active');
        });
        
        elements.tabButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Activate current tab button
        button.classList.add('active');
        
        // Show the target tab content
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
          targetTab.style.display = 'block';
          targetTab.classList.add('active');
          
          // Tab-specific initialization
          if (tabName === 'preview') {
            refreshPreview();
          } 
          // Note: Pages tab is now handled by the PageEditor module
        } else {
          console.error(`Tab content with ID "${tabName}-tab" not found`);
        }
        
        // Handle TinyMCE visibility when switching tabs
        if (tabName !== 'content') {
          if (typeof tinymce !== 'undefined' && tinymce.activeEditor) {
            try {
              tinymce.activeEditor.hide();
            } catch (e) {
              console.log("Error hiding TinyMCE editor", e);
            }
          }
        } else if (tabName === 'content') {
          if (typeof tinymce !== 'undefined') {
            try {
              tinymce.editors.forEach(editor => editor.show());
            } catch (e) {
              console.log("Error showing TinyMCE editors", e);
            }
          }
        }
      });
    });

// TinyMCE Initialization with improved configuration
const initTinyMCE = () => {
  // Remove any existing instances first
  if (typeof tinymce !== 'undefined') {
    tinymce.remove();
    
    // Initialize regular editors (for longer content)
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
      formats: {
        alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-left' },
        aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-center' },
        alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-right' },
        alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-justify' }
      },
      setup: function(editor) {
        editor.on('init', function() {
          console.log('TinyMCE initialized for regular editor');
        });
        editor.on('change', function() {
          state.isDirty = true;
        });
      }
    });
    
    // Initialize for smaller title/subtitle fields
    tinymce.init({
      selector: '.tinymce-editor-small',
      height: 100,
      menubar: false,
      inline: false,
      plugins: [
        'autolink', 'link', 'charmap', 'preview'
      ],
      toolbar: 'undo redo | fontsizeselect | ' +
        'bold italic backcolor forecolor | alignleft aligncenter ' +
        'alignright alignjustify',
      content_style: 'body { font-family: "Lato", sans-serif; font-size: 16px; }',
      font_size_formats: '10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt',
      setup: function(editor) {
        editor.on('init', function() {
          console.log('TinyMCE initialized for small editor');
        });
        editor.on('change', function() {
          state.isDirty = true;
        });
      }
    });
  }
};

// Add a helper function to convert between TinyMCE and regular text inputs
function migrateToTinyMCE() {
  // Get all title and subtitle fields that should be converted
  const titleFields = document.querySelectorAll('input[id$="Title"], input[id$="Subtitle"]');
  
  // Convert each input to a textarea for TinyMCE
  titleFields.forEach(input => {
    // Create a new textarea
    const textarea = document.createElement('textarea');
    textarea.id = input.id;
    textarea.className = 'tinymce-editor-small';
    textarea.value = input.value;
    
    // Replace the input with the textarea
    if (input.parentNode) {
      input.parentNode.replaceChild(textarea, input);
    }
  });
  
  // Reinitialize TinyMCE to capture new fields
  initTinyMCE();
}

// Call migrateToTinyMCE after initial content load
document.addEventListener('DOMContentLoaded', function() {
  // Wait for auth status and initial content load first
  auth.onAuthStateChanged(user => {
    if (user) {
      // Wait a moment for other initialization to complete
      setTimeout(migrateToTinyMCE, 1500);
    }
  });
});

    // Load content data with improved error handling
    const loadContentData = async (isDraft = true) => {
      showStatus("Loading content...", false, 0);
      
      try {
        const docRef = db.collection("content").doc(isDraft ? "draft" : "main");
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
          console.warn("No content document found");
          showStatus("No content found. Please save some content first.", true);
          return;
        }
        
        const data = docSnap.data();
        console.log("Loaded data:", data);
        
        // Fill text fields
        if (elements.aboutTitle) elements.aboutTitle.value = data.aboutTitle || "";
        if (elements.aboutSubtitle) elements.aboutSubtitle.value = data.aboutSubtitle || "";
        
        // For TinyMCE editor content we need a slight delay
        setTimeout(() => {
          // About text
          if (tinymce.get('aboutText')) {
            tinymce.get('aboutText').setContent(data.aboutText || "");
          }
          
          // Offering descriptions
          if (tinymce.get('offer1Desc')) {
            tinymce.get('offer1Desc').setContent(data.offer1Desc || "");
          }
          
          if (tinymce.get('offer2Desc')) {
            tinymce.get('offer2Desc').setContent(data.offer2Desc || "");
          }
          
          if (tinymce.get('offer3Desc')) {
            tinymce.get('offer3Desc').setContent(data.offer3Desc || "");
          }
        }, 500);
        
        // Section titles and subtitles
        if (elements.offeringsTitle) elements.offeringsTitle.value = data.offeringsTitle || "";
        if (elements.offeringsSubtitle) elements.offeringsSubtitle.value = data.offeringsSubtitle || "";
        
        // Font size sliders
        if (elements.offeringsTitleSize) {
          const titleSize = data.offeringsTitleSize || 2.5;
          elements.offeringsTitleSize.value = titleSize;
          if (elements.offeringsTitleSizeValue) elements.offeringsTitleSizeValue.textContent = titleSize;
        }
        
        if (elements.offeringsSubtitleSize) {
          const subtitleSize = data.offeringsSubtitleSize || 1.2;
          elements.offeringsSubtitleSize.value = subtitleSize;
          if (elements.offeringsSubtitleSizeValue) elements.offeringsSubtitleSizeValue.textContent = subtitleSize;
        }
        
        // Offering titles
        if (elements.offer1Title) elements.offer1Title.value = data.offer1Title || "";
        if (elements.offer2Title) elements.offer2Title.value = data.offer2Title || "";
        if (elements.offer3Title) elements.offer3Title.value = data.offer3Title || "";
        
        // Contact section
        if (elements.contactTitle) elements.contactTitle.value = data.contactTitle || "";
        if (elements.contactSubtitle) elements.contactSubtitle.value = data.contactSubtitle || "";
        
        if (elements.contactTitleSize) {
          const titleSize = data.contactTitleSize || 2.5;
          elements.contactTitleSize.value = titleSize;
          if (elements.contactTitleSizeValue) elements.contactTitleSizeValue.textContent = titleSize;
        }
        
        if (elements.contactSubtitleSize) {
          const subtitleSize = data.contactSubtitleSize || 1.2;
          elements.contactSubtitleSize.value = subtitleSize;
          if (elements.contactSubtitleSizeValue) elements.contactSubtitleSizeValue.textContent = subtitleSize;
        }
        
        // Store image URLs and update previews
        updateImagePreviews(data);
        
        // Reset dirty flag
        state.isDirty = false;
        
        showStatus("Content loaded successfully");
      } catch (err) {
        console.error("Error loading data:", err);
        showStatus("Error loading data: " + err.message, true);
      }
    };
    
    // Update image previews based on loaded data
    const updateImagePreviews = (data) => {
      // Process offer1_image
      if (data.offer1_image) {
        state.imageData.offer1_image = normalizeImageData(data.offer1_image);
        if (elements.offer1Img) {
          elements.offer1Img.src = state.imageData.offer1_image.url;
          elements.offer1Img.style.display = state.imageData.offer1_image.url ? 'block' : 'none';
        }
      }
      
      // Process offer2_image
      if (data.offer2_image) {
        state.imageData.offer2_image = normalizeImageData(data.offer2_image);
        if (elements.offer2Img) {
          elements.offer2Img.src = state.imageData.offer2_image.url;
          elements.offer2Img.style.display = state.imageData.offer2_image.url ? 'block' : 'none';
        }
      }
      
      // Process offer3_image
      if (data.offer3_image) {
        state.imageData.offer3_image = normalizeImageData(data.offer3_image);
        if (elements.offer3Img) {
          elements.offer3Img.src = state.imageData.offer3_image.url;
          elements.offer3Img.style.display = state.imageData.offer3_image.url ? 'block' : 'none';
        }
      }
      
      // Process contact_image
      if (data.contact_image) {
        state.imageData.contact_image = normalizeImageData(data.contact_image);
        if (elements.contactImg) {
          elements.contactImg.src = state.imageData.contact_image.url;
          elements.contactImg.style.display = state.imageData.contact_image.url ? 'block' : 'none';
        }
      }
    };
    
    // Normalize image data to a consistent format
    const normalizeImageData = (imageData) => {
      if (typeof imageData === 'string') {
        // Convert string URL to object format
        return { url: imageData, public_id: "" };
      } else if (typeof imageData === 'object' && imageData !== null) {
        // Ensure object has required properties
        return {
          url: imageData.url || "",
          public_id: imageData.public_id || "",
          alt: imageData.alt || ""
        };
      } else {
        // Default empty object
        return { url: "", public_id: "", alt: "" };
      }
    };

    // Load wordcloud data
    const loadWordCloudData = async () => {
      if (!elements.wordCloudContainer) return;
      
      try {
        const docSnap = await db.collection("content").doc("wordCloud").get();
        if (docSnap.exists) {
          state.wordCloudData = docSnap.data().words || [];
        } else {
          // Initialize with default values
          state.wordCloudData = [
            { text: "Mindfulness", weight: 5, link: "#" },
            { text: "Meditation", weight: 8, link: "#" },
            { text: "Self-reflection", weight: 7, link: "#" },
            { text: "Consciousness", weight: 9, link: "#" },
            { text: "Spirituality", weight: 6, link: "#" }
          ];
          
          // Create the document with default data
          await db.collection("content").doc("wordCloud").set({
            words: state.wordCloudData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        
        renderWordCloudItems();
      } catch (err) {
        console.error("Error loading wordcloud:", err);
        showStatus("Error loading wordcloud: " + err.message, true);
      }
    };

  // Render wordcloud items
const renderWordCloudItems = () => {
  if (!elements.wordCloudContainer) return;
  
  elements.wordCloudContainer.innerHTML = '';
  
  if (state.wordCloudData.length === 0) {
    elements.wordCloudContainer.innerHTML = `
      <div class="w3-panel w3-pale-yellow w3-center">
        <p>Keine Worte in der Wortwolke. Klicken Sie auf "Add New Word" um Worte hinzuzufügen.</p>
      </div>
    `;
    return;
  }
  
  // Create a table for better structure
  const tableContainer = document.createElement('div');
  tableContainer.className = 'w3-responsive';
  
  const table = document.createElement('table');
  table.className = 'w3-table w3-bordered w3-striped';
  
  // Table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr class="w3-light-grey">
      <th style="width:5%">Reihenfolge</th>
      <th style="width:35%">Wort</th>
      <th style="width:15%">Gewicht (1-9)</th>
      <th style="width:35%">Link</th>
      <th style="width:10%">Aktion</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  state.wordCloudData.forEach((word, index) => {
    const tr = document.createElement('tr');
    tr.className = 'word-item';
    
    tr.innerHTML = `
      <td class="draggable-handle" style="cursor:move">
        <i class="fas fa-grip-lines"></i> ${index + 1}
      </td>
      <td>
        <input type="text" class="w3-input w3-border" value="${word.text || ''}" data-field="text" placeholder="Wort eingeben">
      </td>
      <td>
        <input type="number" class="w3-input w3-border" value="${word.weight || 5}" data-field="weight" min="1" max="9" placeholder="1-9">
      </td>
      <td>
        <input type="text" class="w3-input w3-border" value="${word.link || '#'}" data-field="link" placeholder="Link (optional)">
      </td>
      <td class="w3-center">
        <button class="w3-button w3-red w3-round delete-word-btn">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    // Event listeners for input changes
    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => {
        const field = input.getAttribute('data-field');
        const value = field === 'weight' ? parseInt(input.value) : input.value;
        state.wordCloudData[index][field] = value;
      });
      
      // Also listen for keyup events for more responsive updates
      input.addEventListener('keyup', () => {
        const field = input.getAttribute('data-field');
        const value = field === 'weight' ? parseInt(input.value) : input.value;
        state.wordCloudData[index][field] = value;
      });
    });
    
    // Event listener for delete button
    tr.querySelector('.delete-word-btn').addEventListener('click', () => {
      if (confirm('Sind Sie sicher, dass Sie dieses Wort löschen möchten?')) {
        state.wordCloudData.splice(index, 1);
        renderWordCloudItems();
      }
    });
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  elements.wordCloudContainer.appendChild(tableContainer);
};
      
      // Initialize drag-and-drop if the library is available
      if (typeof Sortable !== 'undefined') {
        Sortable.create(elements.wordCloudContainer, {
          handle: '.draggable-handle',
          animation: 150,
          onEnd: function() {
            // Update word cloud data order based on DOM order
            const newWordData = [];
            elements.wordCloudContainer.querySelectorAll('.word-item').forEach(item => {
              const text = item.querySelector('[data-field="text"]').value;
              const weight = parseInt(item.querySelector('[data-field="weight"]').value);
              const link = item.querySelector('[data-field="link"]').value;
              
              newWordData.push({ text, weight, link });
            });
            
            // Update state
            state.wordCloudData = newWordData;
          }
        });
      
    };

    // Add new word
    if (elements.addWordBtn) {
      elements.addWordBtn.addEventListener('click', () => {
        state.wordCloudData.push({ text: "", weight: 5, link: "#" });
        renderWordCloudItems();
      });
    }

    // Preview word cloud
if (elements.previewWordCloudBtn) {
  elements.previewWordCloudBtn.addEventListener('click', () => {
    // Open preview in a new tab
    const previewWindow = window.open('', '_blank');
    
    // Generate preview HTML
    const previewHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Word Cloud Preview</title>
        <link rel="stylesheet" href="./assets/css/styles.css">
        <style>
          body { padding: 2rem; font-family: 'Lato', sans-serif; }
          .preview-container { max-width: 800px; margin: 0 auto; }
          .preview-title { text-align: center; margin-bottom: 2rem; }
          .back-btn { position: fixed; top: 1rem; right: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
      </head>
      <body>
        <button class="back-btn" onclick="window.close()">Close Preview</button>
        <div class="preview-container">
          <h1 class="preview-title">Word Cloud Preview</h1>
          
          <div class="textbubble">
            <ul class="word-cloud" role="navigation" aria-label="Word Cloud">
              ${state.wordCloudData.map(word => `
                <li>
                  <a href="${word.link || '#'}" data-weight="${word.weight || 5}">${word.text || 'Word'}</a>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
    
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  });
}

    // Save wordcloud
    if (elements.saveWordCloudBtn) {
      elements.saveWordCloudBtn.addEventListener('click', async () => {
        try {
          await db.collection("content").doc("wordCloud").set({
            words: state.wordCloudData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          showStatus("Wordcloud successfully saved!");
        } catch (err) {
          console.error("Error saving wordcloud:", err);
          showStatus("Error saving wordcloud: " + err.message, true);
        }
      });
    }

    // Save content (draft or publish)
    const saveContent = async (isPublish = false) => {
      try {
        showStatus(isPublish ? "Publishing content..." : "Saving draft...", false, 0);
        
        // Get TinyMCE content with error handling
        let aboutTextContent = "";
        let offer1DescContent = "";
        let offer2DescContent = "";
        let offer3DescContent = "";
        
        try {
          if (tinymce.get('aboutText')) {
            aboutTextContent = tinymce.get('aboutText').getContent();
          }
        } catch (e) {
          console.error("Error getting aboutText content:", e);
        }
        
        try {
          if (tinymce.get('offer1Desc')) {
            offer1DescContent = tinymce.get('offer1Desc').getContent();
          }
        } catch (e) {
          console.error("Error getting offer1Desc content:", e);
        }
        
        try {
          if (tinymce.get('offer2Desc')) {
            offer2DescContent = tinymce.get('offer2Desc').getContent();
          }
        } catch (e) {
          console.error("Error getting offer2Desc content:", e);
        }
        
        try {
          if (tinymce.get('offer3Desc')) {
            offer3DescContent = tinymce.get('offer3Desc').getContent();
          }
        } catch (e) {
          console.error("Error getting offer3Desc content:", e);
        }
        
        // Compile data with null checks
        const contentData = {
          // About section
          aboutTitle: elements.aboutTitle ? elements.aboutTitle.value : "",
          aboutSubtitle: elements.aboutSubtitle ? elements.aboutSubtitle.value : "",
          aboutText: aboutTextContent,
          
          // Offerings section
          offeringsTitle: elements.offeringsTitle ? elements.offeringsTitle.value : "",
          offeringsSubtitle: elements.offeringsSubtitle ? elements.offeringsSubtitle.value : "",
          offeringsTitleSize: elements.offeringsTitleSize ? elements.offeringsTitleSize.value : 2.5,
          offeringsSubtitleSize: elements.offeringsSubtitleSize ? elements.offeringsSubtitleSize.value : 1.2,
          
          // Offering 1
          offer1Title: elements.offer1Title ? elements.offer1Title.value : "",
          offer1Desc: offer1DescContent,
          offer1_image: state.imageData.offer1_image.url ? state.imageData.offer1_image : null,
          
          // Offering 2
          offer2Title: elements.offer2Title ? elements.offer2Title.value : "",
          offer2Desc: offer2DescContent,
          offer2_image: state.imageData.offer2_image.url ? state.imageData.offer2_image : null,
          
          // Offering 3
          offer3Title: elements.offer3Title ? elements.offer3Title.value : "",
          offer3Desc: offer3DescContent,
          offer3_image: state.imageData.offer3_image.url ? state.imageData.offer3_image : null,
          
          // Contact section
          contactTitle: elements.contactTitle ? elements.contactTitle.value : "",
          contactSubtitle: elements.contactSubtitle ? elements.contactSubtitle.value : "",
          contactTitleSize: elements.contactTitleSize ? elements.contactTitleSize.value : 2.5,
          contactSubtitleSize: elements.contactSubtitleSize ? elements.contactSubtitleSize.value : 1.2,
          contact_image: state.imageData.contact_image.url ? state.imageData.contact_image : null,
          
          // Timestamp
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log("Saving content:", contentData);
        
        // Save as draft
        await db.collection("content").doc("draft").set(contentData);
        
        if (isPublish) {
          // Publish (copy to "main")
          await db.collection("content").doc("main").set(contentData);
          showStatus("Changes successfully published! 🚀");
        } else {
          showStatus("Draft successfully saved! 💾");
        }
        
        // Reset dirty flag
        state.isDirty = false;
        
        // Refresh preview if visible
        if (document.getElementById('preview-tab').classList.contains('active')) {
          refreshPreview();
        }
      } catch (err) {
        console.error("Error saving:", err);
        showStatus(`Error ${isPublish ? 'publishing' : 'saving'}: ${err.message}`, true);
      }
    };
    
    // Set up image upload handlers
    const setupImageUploads = () => {
      // For each upload button
      const setupUpload = (button, imageId) => {
        if (!button) return;
        
        button.addEventListener('click', () => {
          if (cloudinaryWidget) {
            // Use Cloudinary widget
            // Store context for callback
            window.currentUploadContext = { button, id: imageId };
            cloudinaryWidget.open();
          } else {
            // Use local file upload fallback
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            fileInput.addEventListener('change', async () => {
              if (fileInput.files && fileInput.files.length > 0) {
                try {
                  // Show loading state
                  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                  button.disabled = true;
                  
                  // Upload the file
                  await uploadFile(fileInput.files[0], (url, filename) => {
                    // Handle successful upload
                    handleImageUploadSuccess(url, filename, { button, id: imageId });
                    
                    // Reset button
                    button.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
                    button.disabled = false;
                  });
                } catch (error) {
                  // Reset button on error
                  button.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
                  button.disabled = false;
                }
                
                // Remove file input
                document.body.removeChild(fileInput);
              }
            });
            
            // Trigger file selection
            fileInput.click();
          }
        });
      };
      
      // Set up all image upload buttons
      setupUpload(elements.offer1UploadBtn, 'offer1_image');
      setupUpload(elements.offer2UploadBtn, 'offer2_image');
      setupUpload(elements.offer3UploadBtn, 'offer3_image');
      setupUpload(elements.contactUploadBtn, 'contact_image');
    };

    // Size slider event handlers
    const setupSizeSliders = () => {
      // Offerings title size
      if (elements.offeringsTitleSize && elements.offeringsTitleSizeValue) {
        elements.offeringsTitleSize.addEventListener('input', function() {
          elements.offeringsTitleSizeValue.textContent = this.value;
          state.isDirty = true;
        });
      }
      
      // Offerings subtitle size
      if (elements.offeringsSubtitleSize && elements.offeringsSubtitleSizeValue) {
        elements.offeringsSubtitleSize.addEventListener('input', function() {
          elements.offeringsSubtitleSizeValue.textContent = this.value;
          state.isDirty = true;
        });
      }
      
      // Contact title size
      if (elements.contactTitleSize && elements.contactTitleSizeValue) {
        elements.contactTitleSize.addEventListener('input', function() {
          elements.contactTitleSizeValue.textContent = this.value;
          state.isDirty = true;
        });
      }
      
      // Contact subtitle size
      if (elements.contactSubtitleSize && elements.contactSubtitleSizeValue) {
        elements.contactSubtitleSize.addEventListener('input', function() {
          elements.contactSubtitleSizeValue.textContent = this.value;
          state.isDirty = true;
        });
      }
    };

    // Refresh preview
    const refreshPreview = () => {
      if (!elements.previewFrame) return;
      
      const isDraft = Array.from(elements.previewTypeRadios)
        .find(radio => radio.checked)?.value === 'draft';
      
      elements.previewFrame.src = `preview.html?draft=${isDraft}&t=${Date.now()}`; // Cache-Busting
    };
    
    // Setup preview controls
    const setupPreviewControls = () => {
      // Preview refresh button
      if (elements.refreshPreviewBtn) {
        elements.refreshPreviewBtn.addEventListener('click', refreshPreview);
      }
      
      // Preview type radio buttons
      if (elements.previewTypeRadios.length > 0) {
        Array.from(elements.previewTypeRadios).forEach(radio => {
          radio.addEventListener('change', refreshPreview);
        });
      }
    };

    // Save draft and publish buttons
    const setupSaveButtons = () => {
      if (elements.saveDraftBtn) {
        elements.saveDraftBtn.addEventListener('click', () => saveContent(false));
      }
      
      if (elements.publishBtn) {
        elements.publishBtn.addEventListener('click', () => saveContent(true));
      }
    };

    // Setup input change tracking for dirty state
    const setupChangeTracking = () => {
      // Select all form inputs in the content tab
      const inputs = document.querySelectorAll('#content-tab input, #content-tab textarea, #content-tab select');
      
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          state.isDirty = true;
        });
        
        // For range inputs, also track input event
        if (input.type === 'range') {
          input.addEventListener('input', () => {
            state.isDirty = true;
          });
        }
      });
      
      // Track TinyMCE changes
      if (typeof tinymce !== 'undefined') {
        tinymce.on('AddEditor', function(e) {
          e.editor.on('change', function() {
            state.isDirty = true;
          });
        });
      }
      
      // Warn about unsaved changes
      window.addEventListener('beforeunload', function(e) {
        if (state.isDirty) {
          const message = 'You have unsaved changes. Are you sure you want to leave?';
          e.returnValue = message;
          return message;
        }
      });
    };

    // Auth state monitoring
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is logged in
        console.log("User logged in:", user.email);
        
        if (elements.loginDiv) elements.loginDiv.style.display = 'none';
        if (elements.adminDiv) elements.adminDiv.style.display = 'block';
        
        // Initialize TinyMCE
        initTinyMCE();
        
        // Wait for TinyMCE to initialize
        setTimeout(() => {
          // Load content
          loadContentData();
          
          // Load word cloud
          loadWordCloudData();
          
          // Setup image uploads
          setupImageUploads();
          
          // Setup size sliders
          setupSizeSliders();
          
          // Setup preview controls
          setupPreviewControls();
          
          // Setup save buttons
          setupSaveButtons();
          
          // Setup change tracking
          setupChangeTracking();
        }, 1000);
      } else {
        // User is not logged in
        console.log("User not logged in");
        
        if (elements.adminDiv) elements.adminDiv.style.display = 'none';
        if (elements.loginDiv) elements.loginDiv.style.display = 'block';
        
        // Clean up TinyMCE
        if (typeof tinymce !== 'undefined') {
          tinymce.remove();
        }
      }
    });

    // Login button event
    if (elements.loginBtn) {
      elements.loginBtn.addEventListener('click', () => {
        if (!elements.emailField || !elements.passField) {
          console.error("Email or password field not found");
          return;
        }
        
        const email = elements.emailField.value.trim();
        const pass = elements.passField.value;
        
        if (!email || !pass) {
          if (elements.loginError) elements.loginError.textContent = "Please enter email and password";
          return;
        }
        
        if (elements.loginError) elements.loginError.textContent = "";
        showStatus("Logging in...", false, 0);
        
        auth.signInWithEmailAndPassword(email, pass)
          .then(userCredential => {
            console.log("Login successful:", userCredential.user.email);
            showStatus("Login successful! Loading admin panel...");
          })
          .catch(err => {
            console.error("Login error:", err);
            if (elements.loginError) elements.loginError.textContent = "Login failed: " + err.message;
            showStatus("Login failed", true);
          });
      });
    }

    // Login with Enter key
    if (elements.passField) {
      elements.passField.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          elements.loginBtn.click();
        }
      });
    }

    // Logout button event
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', () => {
        // Check for unsaved changes
        if (state.isDirty) {
          if (!confirm('You have unsaved changes. Are you sure you want to log out?')) {
            return;
          }
        }
        
        auth.signOut().then(() => {
          showStatus("Logged out successfully");
        }).catch(err => {
          console.error("Logout error:", err);
          showStatus("Error during logout: " + err.message, true);
        });
      });
    }

    // Initialize sortable.js for word cloud if available
    const initSortable = () => {
      if (typeof Sortable !== 'undefined' && elements.wordCloudContainer) {
        Sortable.create(elements.wordCloudContainer, {
          handle: '.draggable-handle',
          animation: 150
        });
      } else {
        // Load Sortable.js dynamically if not available
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js';
        script.onload = () => {
          if (elements.wordCloudContainer) {
            Sortable.create(elements.wordCloudContainer, {
              handle: '.draggable-handle',
              animation: 150
            });
          }
        };
        document.head.appendChild(script);
      }
    };

    // Call sortable initialization
    initSortable();
}



);

function refreshPreview() {
  const previewFrame = document.getElementById('previewFrame');
  if (!previewFrame) {
    console.error("Preview frame not found");
    return;
  }
  
  // Get the preview type
  const isDraft = Array.from(document.getElementsByName('previewType'))
    .find(radio => radio.checked)?.value === 'draft';
  
  // Build the correct path with cache-busting parameter
  const timestamp = Date.now(); // Cache busting
  let previewPath = `./preview.html?draft=${isDraft ? 'true' : 'false'}&t=${timestamp}`;
  
  console.log(`Loading preview from: ${previewPath}`);
  
  // Update iframe source
  previewFrame.src = previewPath;
  
  // Show loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'preview-loading-indicator';
  loadingIndicator.innerHTML = `
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
               background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px; 
               box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 1000; text-align: center;">
      <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #3498db;"></i>
      <p>Loading preview...</p>
    </div>
  `;
  
  // Position the loading indicator over the iframe
  const previewContainer = previewFrame.parentElement;
  if (previewContainer) {
    previewContainer.style.position = 'relative';
    previewContainer.appendChild(loadingIndicator);
    
    // Remove loading indicator when iframe loads
    previewFrame.onload = function() {
      const indicator = document.getElementById('preview-loading-indicator');
      if (indicator) {
        indicator.remove();
      }
    };
  }
  
  // Use console.log instead of showStatus since this function
  // might be called from outside the scope where showStatus is defined
  console.log(`Preview refreshed (${isDraft ? 'Draft' : 'Live'} version)`);
}

// Set up preview controls
function setupPreviewControls() {
  // Preview refresh button
  const refreshBtn = document.getElementById('refreshPreviewBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshPreview);
  }
  
  // Preview type radio buttons
  const previewTypeRadios = document.getElementsByName('previewTypeRadios');
  if (previewTypeRadios.length > 0) {
    Array.from(previewTypeRadios).forEach(radio => {
      radio.addEventListener('change', refreshPreview);
    });
  }
  
  // Ensure preview tab switch triggers refresh
  const previewTabBtn = document.querySelector('.tab-btn[data-tab="preview"]');
  if (previewTabBtn) {
    previewTabBtn.addEventListener('click', function() {
      // Wait a moment for the tab to become visible
      setTimeout(refreshPreview, 300);
    });
  }
}

// Call setup on page load
document.addEventListener('DOMContentLoaded', function() {
  // Wait for auth status first
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      setupPreviewControls();
    }
  });
});