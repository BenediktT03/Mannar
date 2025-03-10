/**
 * Enhanced Admin Panel JavaScript
 * Modified to use Quill.js instead of TinyMCE
 */

document.addEventListener('DOMContentLoaded', () => {
    // Firebase should already be initialized in the HTML
    let db;
    let auth;

    // Initialize Firebase if available
    if (typeof firebase !== 'undefined') {
        db = firebase.firestore();
        auth = firebase.auth();
        console.log("Firebase initialized successfully");
    } else {
        console.error("Firebase is not available! Check script loading.");
    }
    
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
    
    // Make state available globally for Quill integration
    window.state = state;
    
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
    
    // Make showStatus globally available
    window.showStatus = showStatus;

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
          formData.append('csrf_token', window.csrfToken || '');
          
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
          } else if (tabName === 'pages') {
            // Initialize PageEditor if not already initialized
            if (typeof PageEditor !== 'undefined' && typeof PageEditor.loadPages === 'function') {
              console.log('Reloading pages...');
              PageEditor.loadPages();
            }
          }
        } else {
          console.error(`Tab content with ID "${tabName}-tab" not found`);
        }
      });
    });

    // Load content data from Firestore
    const loadContentData = async (isDraft = true) => {
      showStatus("Loading content...", false, 0);
      
      try {
        // Use the Firebase Helper
        window.firebaseHelper.loadContent(`content/${isDraft ? "draft" : "main"}`, (data) => {
          if (!data) {
            showStatus("No content found. Please save some content first.", true);
            return;
          }
          
          console.log("Loaded data:", data);
          
          // Fill text fields
          if (elements.aboutTitle) elements.aboutTitle.value = data.aboutTitle || "";
          if (elements.aboutSubtitle) elements.aboutSubtitle.value = data.aboutSubtitle || "";
          
          // Fill Quill editor content (replacing TinyMCE)
          if (elements.aboutText) {
            // For Quill - use our integration function
            if (window.quillEditor && window.quillEditor.setContent) {
              window.quillEditor.setContent('aboutText_quill', data.aboutText || "");
            }
          }
          
          // Offerings
          if (elements.offeringsTitle) elements.offeringsTitle.value = data.offeringsTitle || "";
          if (elements.offeringsSubtitle) elements.offeringsSubtitle.value = data.offeringsSubtitle || "";
          
          // Font size sliders
          if (elements.offeringsTitleSize && data.offeringsTitleSize) {
            elements.offeringsTitleSize.value = data.offeringsTitleSize;
            if (elements.offeringsTitleSizeValue) {
              elements.offeringsTitleSizeValue.textContent = data.offeringsTitleSize;
            }
          }
          
          if (elements.offeringsSubtitleSize && data.offeringsSubtitleSize) {
            elements.offeringsSubtitleSize.value = data.offeringsSubtitleSize;
            if (elements.offeringsSubtitleSizeValue) {
              elements.offeringsSubtitleSizeValue.textContent = data.offeringsSubtitleSize;
            }
          }
          
          // Offerings titles
          if (elements.offer1Title) elements.offer1Title.value = data.offer1Title || "";
          if (elements.offer2Title) elements.offer2Title.value = data.offer2Title || "";
          if (elements.offer3Title) elements.offer3Title.value = data.offer3Title || "";
          
          // Offerings descriptions - Quill editors
          if (window.quillEditor && window.quillEditor.setContent) {
            window.quillEditor.setContent('offer1Desc_quill', data.offer1Desc || "");
            window.quillEditor.setContent('offer2Desc_quill', data.offer2Desc || "");
            window.quillEditor.setContent('offer3Desc_quill', data.offer3Desc || "");
          }
          
          // Contact
          if (elements.contactTitle) elements.contactTitle.value = data.contactTitle || "";
          if (elements.contactSubtitle) elements.contactSubtitle.value = data.contactSubtitle || "";
          
          if (elements.contactTitleSize && data.contactTitleSize) {
            elements.contactTitleSize.value = data.contactTitleSize;
            if (elements.contactTitleSizeValue) {
              elements.contactTitleSizeValue.textContent = data.contactTitleSize;
            }
          }
          
          if (elements.contactSubtitleSize && data.contactSubtitleSize) {
            elements.contactSubtitleSize.value = data.contactSubtitleSize;
            if (elements.contactSubtitleSizeValue) {
              elements.contactSubtitleSizeValue.textContent = data.contactSubtitleSize;
            }
          }
          
          // Update images
          updateImagePreviews(data);
          
          // Reset dirty flag
          state.isDirty = false;
          
          showStatus("Content loaded successfully");
        });
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
        if (docSnap.exists && docSnap.data().words) {
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
      
      state.wordCloudData.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
          <span class="draggable-handle"><i class="fas fa-grip-lines"></i></span>
          <input type="text" class="w3-input" value="${word.text || ''}" data-field="text" placeholder="Word" />
          <input type="number" class="w3-input word-weight" value="${word.weight || 5}" data-field="weight" min="1" max="9" placeholder="Weight (1-9)" />
          <input type="text" class="w3-input" value="${word.link || '#'}" data-field="link" placeholder="Link (optional)" />
          <button class="w3-button w3-red w3-margin-left delete-word-btn">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        // Event listeners for input changes
        wordItem.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', () => {
            const field = input.getAttribute('data-field');
            const value = field === 'weight' ? parseInt(input.value) : input.value;
            state.wordCloudData[index][field] = value;
          });
        });
        
        // Event listener for delete button
        wordItem.querySelector('.delete-word-btn').addEventListener('click', () => {
          state.wordCloudData.splice(index, 1);
          renderWordCloudItems();
        });
        
        elements.wordCloudContainer.appendChild(wordItem);
      });
      
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
      }
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

    // Save content - using Quill editor instead of TinyMCE
    const saveContent = async (isPublish = false) => {
      try {
        showStatus(isPublish ? "Publishing content..." : "Saving draft...", false, 0);
        
        // Collect data from the form
        const contentData = {
          aboutTitle: elements.aboutTitle ? elements.aboutTitle.value : "",
          aboutSubtitle: elements.aboutSubtitle ? elements.aboutSubtitle.value : "",
          // Get content from Quill
          aboutText: window.quillEditor ? window.quillEditor.getContent('aboutText_quill') : (elements.aboutText ? elements.aboutText.value : ""),
          
          offeringsTitle: elements.offeringsTitle ? elements.offeringsTitle.value : "",
          offeringsSubtitle: elements.offeringsSubtitle ? elements.offeringsSubtitle.value : "",
          offeringsTitleSize: elements.offeringsTitleSize ? elements.offeringsTitleSize.value : 2.5,
          offeringsSubtitleSize: elements.offeringsSubtitleSize ? elements.offeringsSubtitleSize.value : 1.2,
          
          offer1Title: elements.offer1Title ? elements.offer1Title.value : "",
          offer1Desc: window.quillEditor ? window.quillEditor.getContent('offer1Desc_quill') : (elements.offer1Desc ? elements.offer1Desc.value : ""),
          offer1_image: state.imageData.offer1_image,
          
          offer2Title: elements.offer2Title ? elements.offer2Title.value : "",
          offer2Desc: window.quillEditor ? window.quillEditor.getContent('offer2Desc_quill') : (elements.offer2Desc ? elements.offer2Desc.value : ""),
          offer2_image: state.imageData.offer2_image,
          
          offer3Title: elements.offer3Title ? elements.offer3Title.value : "",
          offer3Desc: window.quillEditor ? window.quillEditor.getContent('offer3Desc_quill') : (elements.offer3Desc ? elements.offer3Desc.value : ""),
          offer3_image: state.imageData.offer3_image,
          
          contactTitle: elements.contactTitle ? elements.contactTitle.value : "",
          contactSubtitle: elements.contactSubtitle ? elements.contactSubtitle.value : "",
          contactTitleSize: elements.contactTitleSize ? elements.contactTitleSize.value : 2.5,
          contactSubtitleSize: elements.contactSubtitleSize ? elements.contactSubtitleSize.value : 1.2,
          contact_image: state.imageData.contact_image,
          
          // Add timestamp
          lastUpdated: new Date().toISOString()
        };
        
        // Add CSRF token if available
        const csrfToken = window.csrfToken || document.getElementById('csrfToken')?.value;
        if (csrfToken) {
          contentData.csrf_token = csrfToken;
        }
        
        console.log("Saving content:", contentData);
        
        // Save with Firebase Helper
        window.firebaseHelper.saveContent("content/draft", contentData, true, (success, error) => {
          if (success) {
            if (isPublish) {
              // Copy to "main" when publishing
              window.firebaseHelper.saveContent("content/main", contentData, true, (success, error) => {
                if (success) {
                  showStatus("Changes successfully published! 🚀");
                } else {
                  console.error("Error publishing:", error);
                  showStatus(`Error publishing: ${error.message}`, true);
                }
              });
            } else {
              showStatus("Draft successfully saved! 💾");
            }
            
            // Reset dirty flag
            state.isDirty = false;
            
            // Refresh preview if visible
            if (document.getElementById('preview-tab').classList.contains('active')) {
              refreshPreview();
            }
          } else {
            console.error("Error saving:", error);
            showStatus(`Error saving: ${error.message}`, true);
          }
        });
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
      
      // Quill editor change tracking is handled in the Quill initialization
      
      // Warn about unsaved changes
      window.addEventListener('beforeunload', function(e) {
        if (state.isDirty) {
          const message = 'You have unsaved changes. Are you sure you want to leave?';
          e.returnValue = message;
          return message;
        }
      });
    };

    // Initialize Firebase PageEditor
    const initializePageEditor = () => {
      if (typeof PageEditor !== 'undefined' && typeof PageEditor.init === 'function') {
        console.log('Initializing PageEditor...');
        setTimeout(() => {
          PageEditor.init();
        }, 500);
      } else {
        console.warn('PageEditor not available or missing init function');
      }
    };

    // Auth state monitoring
    if (auth) {
      auth.onAuthStateChanged(user => {
        if (user) {
          // User is logged in
          console.log("User logged in:", user.email);
          
          if (elements.loginDiv) elements.loginDiv.style.display = 'none';
          if (elements.adminDiv) elements.adminDiv.style.display = 'block';
          
          // Initialize Quill editors (replacing TinyMCE)
          if (window.quillEditor && window.quillEditor.convertTextareas) {
            window.quillEditor.convertTextareas();
          }
          
          // Initialize PageEditor if available
          initializePageEditor();
          
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
        } else {
          // User is not logged in
          console.log("User not logged in");
          
          if (elements.adminDiv) elements.adminDiv.style.display = 'none';
          if (elements.loginDiv) elements.loginDiv.style.display = 'block';
        }
      });
    } else {
      console.error("Firebase Auth not available");
    }

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
        
        console.log("Login attempt with:", email);
        if (elements.loginError) elements.loginError.textContent = "";
        
        // Make sure we're using the correct auth method
        if (auth) {
          auth.signInWithEmailAndPassword(email, pass)
            .then(userCredential => {
              console.log("Login successful:", userCredential.user.email);
              // Explicitly update UI
              if (elements.loginDiv) elements.loginDiv.style.display = 'none';
              if (elements.adminDiv) elements.adminDiv.style.display = 'block';
            })
            .catch(err => {
              console.error("Login error:", err);
              if (elements.loginError) elements.loginError.textContent = "Login failed: " + err.message;
            });
        } else {
          console.error("Firebase auth not available");
          if (elements.loginError) elements.loginError.textContent = "Firebase authentication not available";
        }
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
        
        if (auth) {
          auth.signOut().then(() => {
            showStatus("Logged out successfully");
          }).catch(err => {
            console.error("Logout error:", err);
            showStatus("Error during logout: " + err.message, true);
          });
        } else {
          console.error("Firebase auth not available");
          showStatus("Firebase authentication not available", true);
        }
      });
    }

    // Initialize sortable.js for word cloud if available
    const initSortable = () => {
      if (typeof Sortable !== 'undefined' && elements.wordCloudContainer) {
        Sortable.create(elements.wordCloudContainer, {
          handle: '.draggable-handle',
          animation: 150
        });
      }
    };

    // Call sortable initialization
    initSortable();
    
    // Make sure PageEditor is initialized when Firebase loads
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      initializePageEditor();
    }
});

// Add debugging helpers
const debugAdminPanel = () => {
  console.log('Admin Panel Debug Info:');
  console.log('Firebase available:', typeof firebase !== 'undefined');
  if (typeof firebase !== 'undefined') {
    console.log('Firebase initialized:', firebase.apps.length > 0);
    console.log('Firestore available:', typeof firebase.firestore === 'function');
    console.log('Auth available:', typeof firebase.auth === 'function');
  }
  
  console.log('PageEditor available:', typeof PageEditor !== 'undefined');
  if (typeof PageEditor !== 'undefined') {
    console.log('PageEditor methods:', Object.keys(PageEditor).filter(k => typeof PageEditor[k] === 'function'));
  }
  
  console.log('Elements available:');
  console.log('- pagesContainer:', document.getElementById('pagesContainer'));
  console.log('- pagesList:', document.getElementById('pagesList'));
  console.log('- pages-tab:', document.getElementById('pages-tab'));
};

// Run debug on page load
setTimeout(debugAdminPanel, 2000);