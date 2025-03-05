// admin-panel.js

document.addEventListener('DOMContentLoaded', () => {
    // Versteckten Admin-Link zum Footer in index.php hinzufügen
    if (window.self === window.top) { // Nur auf der Hauptseite, nicht in iframes (Preview)
        const footerCopyright = document.querySelector('footer p');
        if (footerCopyright) {
            const adminSpan = document.createElement('span');
            adminSpan.innerHTML = ' | <a href="admin-panel.php" style="opacity: 0.3; font-size: 0.8em; text-decoration: none;">Admin</a>';
            footerCopyright.appendChild(adminSpan);
        }
    }

    // Firebase sollte bereits im HTML initialisiert sein
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // Initialisiere Cloudinary
    let cloudinaryWidget;
    if (window.cloudinary) {
        // Konfiguration für Cloudinary
        cloudinaryWidget = window.cloudinary.createUploadWidget({
            cloudName: 'dlegnsmho',
            uploadPreset: 'ml_default', // WICHTIG: Upload Preset muss angegeben werden!
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
                showStatus('Fehler beim Hochladen: ' + (error.message || error.statusText || 'Unbekannter Fehler'), true);
                return;
            }
            
            if (result && result.event === "success") {
                console.log('Erfolgreich zu Cloudinary hochgeladen:', result.info);
                
                const imageUrl = result.info.secure_url;
                const publicId = result.info.public_id;
                
                // Das aktuelle Upload-Element mit den Bilddaten aktualisieren
                if (currentUploadElement) {
                    // Setze die Bildvorschau
                    const previewContainer = currentUploadElement.querySelector('[id$="ImagePreview"]');
                    const imgElement = previewContainer.querySelector('img');
                    
                    if (imgElement) {
                        imgElement.src = imageUrl;
                        imgElement.style.display = 'block';
                    }
                    
                    // Speichere die Bild-URL und Public ID
                    const imageKey = getImageKeyFromElement(currentUploadElement);
                    if (imageKey) {
                        imageData[imageKey] = { url: imageUrl, public_id: publicId };
                    }
                    
                    // Zeige Erfolgsanzeige
                    showStatus('Bild erfolgreich hochgeladen');
                }
            }
        });
    }
    
    // Helper-Funktion um den Bildschlüssel zu bestimmen
    function getImageKeyFromElement(element) {
        if (element.id && element.id.includes('offer1') || element.querySelector('[id*="offer1"]')) return 'offer1_image';
        if (element.id && element.id.includes('offer2') || element.querySelector('[id*="offer2"]')) return 'offer2_image';
        if (element.id && element.id.includes('offer3') || element.querySelector('[id*="offer3"]')) return 'offer3_image';
        if (element.id && element.id.includes('contact') || element.querySelector('[id*="contact"]')) return 'contact_image';
        return null;
    }
    
    // Globale Variable für das aktuelle Upload-Element
    let currentUploadElement = null;
    
    // Element-Referenzen
    const loginDiv     = document.getElementById('loginDiv');
    const adminDiv     = document.getElementById('adminDiv');
    const emailField   = document.getElementById('emailField');
    const passField    = document.getElementById('passField');
    const loginBtn     = document.getElementById('loginBtn');
    const loginError   = document.getElementById('loginError');
    const logoutBtn    = document.getElementById('logoutBtn');
    const statusMsg    = document.getElementById('statusMsg');
    
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Form-Felder
    const aboutTitle        = document.getElementById('aboutTitle');
    const aboutSubtitle     = document.getElementById('aboutSubtitle');
    const aboutText         = document.getElementById('aboutText');
    const offeringsTitle    = document.getElementById('offeringsTitle');
    const offeringsSubtitle = document.getElementById('offeringsSubtitle');
    const offer1Title       = document.getElementById('offer1Title');
    const offer2Title       = document.getElementById('offer2Title');
    const offer3Title       = document.getElementById('offer3Title');
    const contactTitle      = document.getElementById('contactTitle');
    const contactSubtitle   = document.getElementById('contactSubtitle');
    
    // Bild-Elemente
    const offer1Img         = document.getElementById('offer1Img');
    const offer2Img         = document.getElementById('offer2Img');
    const offer3Img         = document.getElementById('offer3Img');
    const contactImg        = document.getElementById('contactImg');
    
    // Upload-Buttons
    const offer1UploadBtn   = document.getElementById('offer1UploadBtn');
    const offer2UploadBtn   = document.getElementById('offer2UploadBtn');
    const offer3UploadBtn   = document.getElementById('offer3UploadBtn');
    const contactUploadBtn  = document.getElementById('contactUploadBtn');
    
    // Speichern-Buttons
    const saveDraftBtn      = document.getElementById('saveDraftBtn');
    const publishBtn        = document.getElementById('publishBtn');
    const saveWordCloudBtn  = document.getElementById('saveWordCloudBtn');
    const addWordBtn        = document.getElementById('addWordBtn');
    
    // Vorschau
    const previewFrame      = document.getElementById('previewFrame');
    const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
    const previewTypeRadios = document.getElementsByName('previewType');
    
    // Wordcloud
    const wordCloudContainer = document.getElementById('wordCloudContainer');

    // Bild-URLs speichern
    let imageData = {
      offer1_image: { url: "", public_id: "" },
      offer2_image: { url: "", public_id: "" },
      offer3_image: { url: "", public_id: "" },
      contact_image: { url: "", public_id: "" }
    };
    
    // Wortwolken-Daten
    let wordCloudData = [];

    // Statusmeldung anzeigen
    const showStatus = (message, isError = false) => {
      if (!statusMsg) return;
      
      statusMsg.textContent = message;
      statusMsg.style.display = 'block';
      statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
      
      // Nach 5 Sekunden ausblenden
      setTimeout(() => {
        statusMsg.classList.remove('show');
        setTimeout(() => {
          statusMsg.style.display = 'none';
        }, 300);
      }, 5000);
    };

    // Standard-Datei-Upload (fallback zu PHP Upload Skript)
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
                console.log('Upload erfolgreich:', data);
                if (callback) callback(data.url, data.filename);
                showStatus(`Bild erfolgreich hochgeladen`);
                return data;
            } else {
                console.error('Fehler beim Upload:', data.error);
                showStatus(`Fehler: ${data.error}`, true);
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Fehler beim Hochladen:', error);
            showStatus('Fehler beim Upload.', true);
            throw error;
        }
    };

    // Vorschau aktualisieren
    const refreshPreview = () => {
      if (!previewFrame) return;
      
      const isDraft = document.querySelector('input[name="previewType"]:checked').value === 'draft';
      previewFrame.src = `preview.html?draft=${isDraft}&t=${Date.now()}`; // Cache-Busting
    };

    // Tab-Wechsel
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Alle Tabs deaktivieren
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Aktuellen Tab aktivieren
        button.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Wenn Vorschau-Tab, Frame aktualisieren
        if (tabName === 'preview') {
          refreshPreview();
        }
      });
    });

    // TinyMCE Initialisierung
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

    // Daten laden
    const loadContentData = async (isDraft = true) => {
      try {
        const docSnap = await db.collection("content").doc(isDraft ? "draft" : "main").get();
        if (docSnap.exists) {
          const data = docSnap.data();
          
          // Textfelder füllen
          if (aboutTitle) aboutTitle.value = data.aboutTitle || "";
          if (aboutSubtitle) aboutSubtitle.value = data.aboutSubtitle || "";
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
          
          // Bild-URLs
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
        console.error("Fehler beim Laden der Daten:", err);
        showStatus("Fehler beim Laden der Daten: " + err.message, true);
      }
    };

    // Wortwolken-Daten laden
    const loadWordCloudData = async () => {
      if (!wordCloudContainer) return;
      
      try {
        const docSnap = await db.collection("content").doc("wordCloud").get();
        if (docSnap.exists) {
          wordCloudData = docSnap.data().words || [];
        } else {
          // Standardwerte laden, falls noch nicht vorhanden
          wordCloudData = [
            { text: "Achtsamkeit", weight: 5, link: "#" },
            { text: "Meditation", weight: 8, link: "#" },
            { text: "Selbstreflexion", weight: 7, link: "#" },
            { text: "Bewusstsein", weight: 9, link: "#" },
            { text: "Spiritualität", weight: 6, link: "#" }
          ];
        }
        
        renderWordCloudItems();
      } catch (err) {
        console.error("Fehler beim Laden der Wortwolke:", err);
        showStatus("Fehler beim Laden der Wortwolke: " + err.message, true);
      }
    };

    // Wortwolken-Items rendern
    const renderWordCloudItems = () => {
      if (!wordCloudContainer) return;
      
      wordCloudContainer.innerHTML = '';
      
      wordCloudData.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
          <span class="draggable-handle"><i class="fas fa-grip-lines"></i></span>
          <input type="text" class="w3-input" value="${word.text}" data-field="text" placeholder="Wort" />
          <input type="number" class="w3-input word-weight" value="${word.weight}" data-field="weight" min="1" max="9" placeholder="Gewicht (1-9)" />
          <input type="text" class="w3-input" value="${word.link}" data-field="link" placeholder="Link (optional)" />
          <button class="w3-button w3-red w3-margin-left delete-word-btn">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        // Event-Listener für Input-Änderungen
        wordItem.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', () => {
            const field = input.getAttribute('data-field');
            const value = field === 'weight' ? parseInt(input.value) : input.value;
            wordCloudData[index][field] = value;
          });
        });
        
        // Event-Listener für Delete-Button
        wordItem.querySelector('.delete-word-btn').addEventListener('click', () => {
          wordCloudData.splice(index, 1);
          renderWordCloudItems();
        });
        
        wordCloudContainer.appendChild(wordItem);
      });
    };

    // Neues Wort hinzufügen
    if (addWordBtn) {
      addWordBtn.addEventListener('click', () => {
        wordCloudData.push({ text: "", weight: 5, link: "#" });
        renderWordCloudItems();
      });
    }

    // Wortwolke speichern
    if (saveWordCloudBtn) {
      saveWordCloudBtn.addEventListener('click', async () => {
        try {
          await db.collection("content").doc("wordCloud").set({
            words: wordCloudData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          showStatus("Wortwolke erfolgreich gespeichert!");
        } catch (err) {
          console.error("Fehler beim Speichern der Wortwolke:", err);
          showStatus("Fehler beim Speichern der Wortwolke: " + err.message, true);
        }
      });
    }

    // Inhalt speichern
    const saveContent = async (isPublish = false) => {
      try {
        // TinyMCE-Inhalte abrufen
        const aboutTextContent = tinymce.get('aboutText')?.getContent() || "";
        const offer1DescContent = tinymce.get('offer1Desc')?.getContent() || "";
        const offer2DescContent = tinymce.get('offer2Desc')?.getContent() || "";
        const offer3DescContent = tinymce.get('offer3Desc')?.getContent() || "";
        
        // Bildpfad-Überprüfung und -Vereinfachung
        console.log("Aktuelle Bilddaten vor dem Speichern:", JSON.stringify(imageData));
        
        // Daten zusammenstellen
        const contentData = {
          aboutTitle: aboutTitle.value,
          aboutSubtitle: aboutSubtitle.value,
          aboutText: aboutTextContent,
          
          offeringsTitle: offeringsTitle.value,
          offeringsSubtitle: offeringsSubtitle.value,
          
          offer1Title: offer1Title.value,
          offer1Desc: offer1DescContent,
          // Bildpfad-Überprüfung
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
        
        console.log("Speichere folgende Daten:", contentData);
        
        // Als Entwurf speichern
        await db.collection("content").doc("draft").set(contentData);
        
        if (isPublish) {
          // Veröffentlichen (auf "main" kopieren)
          await db.collection("content").doc("main").set(contentData);
          showStatus("Änderungen wurden erfolgreich veröffentlicht! 🚀");
        } else {
          showStatus("Entwurf wurde erfolgreich gespeichert! 💾");
        }
        
        // Vorschau aktualisieren
        refreshPreview();
      } catch (err) {
        console.error("Fehler beim Speichern:", err);
        showStatus(`Fehler beim ${isPublish ? 'Veröffentlichen' : 'Speichern'}: ${err.message}`, true);
      }
    };
    
    // Bild-Upload-Handler mit verbesserter Fehlerbehandlung und Rückgabeformat
    const setupImageUpload = (buttonId, imageKey, imgElement) => {
      const button = document.getElementById(buttonId);
      if (!button) return;
      
      button.addEventListener('click', () => {
        // Das aktuelle Upload-Element für Referenz speichern
        currentUploadElement = button.closest('.w3-card') || button.closest('.w3-row');
        
        if (cloudinaryWidget) {
          try {
            // Cloudinary-Widget öffnen
            cloudinaryWidget.open();
          } catch (error) {
            console.error("Fehler beim Öffnen des Cloudinary-Widgets:", error);
            showStatus("Fehler beim Öffnen des Upload-Dialogs. Verwende stattdessen lokalen Upload.", true);
            
            // Fallback zum lokalen Upload
            useLocalUpload();
          }
        } else {
          // Fallback auf normalen Dateiupload
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
                // Bild hochladen
                await uploadFile(fileInput.files[0], (url, filename) => {
                  // Bild-URL speichern in standardisiertem Format
                  imageData[imageKey] = { 
                    url: url, 
                    filename: filename,
                    public_id: filename // Lokales Fallback-Format
                  };
                  
                  console.log(`Bild für ${imageKey} gesetzt:`, imageData[imageKey]);
                  
                  // Vorschaubild aktualisieren
                  imgElement.src = url;
                  imgElement.style.display = 'block';
                });
              } catch (error) {
                console.error('Fehler beim Hochladen:', error);
              }
              
              document.body.removeChild(fileInput);
            }
          });
          
          fileInput.click();
        }
      });
    };

    // Vorschau-Aktualisierung
    if (refreshPreviewBtn) {
      refreshPreviewBtn.addEventListener('click', refreshPreview);
    }
    
    // Vorschautyp wechseln
    if (previewTypeRadios.length > 0) {
      previewTypeRadios.forEach(radio => {
        radio.addEventListener('change', refreshPreview);
      });
    }

    // Event-Listener für Buttons
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => saveContent(false));
    }
    
    if (publishBtn) {
      publishBtn.addEventListener('click', () => saveContent(true));
    }

    // ========== SEITENVERWALTUNG ==========
    
    // Neue globale Variablen für Seitenverwaltung
    let currentPages = {};
    let currentEditingPage = null;

    // Template Definitionen
    const pageTemplates = {
      'basic': {
        name: 'Basis-Template',
        description: 'Einfache Seite mit Überschrift und Text',
        preview: '<div class="template-preview"><div class="tp-header"></div><div class="tp-content"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Überschrift' },
          { type: 'textarea', name: 'content', label: 'Inhalt', editor: true }
        ]
      },
      'text-image': {
        name: 'Text mit Bild',
        description: 'Text links, Bild rechts',
        preview: '<div class="template-preview"><div class="tp-text-col"></div><div class="tp-image-col"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Überschrift' },
          { type: 'textarea', name: 'content', label: 'Inhalt', editor: true },
          { type: 'image', name: 'image', label: 'Bild' }
        ]
      },
      'image-text': {
        name: 'Bild mit Text',
        description: 'Bild links, Text rechts',
        preview: '<div class="template-preview"><div class="tp-image-col"></div><div class="tp-text-col"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Überschrift' },
          { type: 'image', name: 'image', label: 'Bild' },
          { type: 'textarea', name: 'content', label: 'Inhalt', editor: true }
        ]
      },
      'gallery': {
        name: 'Galerie',
        description: 'Bildergalerie mit Titel',
        preview: '<div class="template-preview"><div class="tp-header"></div><div class="tp-gallery"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Überschrift' },
          { type: 'textarea', name: 'description', label: 'Beschreibung', editor: true },
          { type: 'gallery', name: 'images', label: 'Bilder' }
        ]
      },
      'contact': {
        name: 'Kontakt',
        description: 'Kontaktformular mit Text',
        preview: '<div class="template-preview"><div class="tp-header"></div><div class="tp-text-col"></div><div class="tp-form-col"></div></div>',
        fields: [
          { type: 'text', name: 'header', label: 'Überschrift' },
          { type: 'textarea', name: 'content', label: 'Einleitungstext', editor: true },
          { type: 'checkbox', name: 'showMap', label: 'Karte anzeigen' },
          { type: 'text', name: 'address', label: 'Adresse' },
          { type: 'text', name: 'email', label: 'E-Mail-Adresse' },
          { type: 'text', name: 'phone', label: 'Telefonnummer' }
        ]
      }
    };

    // CSS für Template-Vorschau hinzufügen
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

    // Seitenverwaltungslogik initialisieren
    const initPageManagement = () => {
      console.log("Initialisiere Seitenverwaltung...");
      
      // DOM-Elemente
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

      // Debug-Button hinzufügen
      const debugButton = document.createElement('button');
      debugButton.id = 'debugReloadBtn';
      debugButton.className = 'w3-button w3-orange w3-margin-bottom';
      debugButton.innerHTML = '<i class="fas fa-sync"></i> Seiten neu laden';
      debugButton.onclick = function() {
        console.log("Debug: Seiten neu laden geklickt");
        manualReloadPages();
      };
      
      const pagesTab = document.getElementById('pages-tab');
      if (pagesTab) {
        pagesTab.insertBefore(debugButton, pagesTab.firstChild);
      }

      // Events für die Buttons
      if (createPageBtn) {
        createPageBtn.addEventListener('click', () => {
          newPageForm.style.display = 'block';
          const pagesListContainer = document.getElementById('pagesListContainer');
          if (pagesListContainer) pagesListContainer.style.display = 'none';
          createPageBtn.style.display = 'none';
          document.getElementById('debugReloadBtn').style.display = 'none';
        });
      }

      if (cancelNewPageBtn) {
        cancelNewPageBtn.addEventListener('click', () => {
          newPageForm.style.display = 'none';
          const pagesListContainer = document.getElementById('pagesListContainer');
          if (pagesListContainer) pagesListContainer.style.display = 'block';
          createPageBtn.style.display = 'block';
          document.getElementById('debugReloadBtn').style.display = 'block';
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

      // Template-Vorschau aktualisieren bei Änderung
      if (pageTemplate) {
        pageTemplate.addEventListener('change', () => {
          updateTemplatePreview(pageTemplate.value);
        });
        
        // Initial die Vorschau für das erste Template anzeigen
        updateTemplatePreview(pageTemplate.value);
      }

      // Alle Seiten laden
      loadPages();
    };

    // Manuelle Funktion zum Neuladen der Seiten
    const manualReloadPages = () => {
      showStatus("Lade Seiten neu...");
      
      const pagesList = document.getElementById('pagesList');
      const noPagesMessage = document.getElementById('noPagesMessage');
      
      if (!pagesList) {
        console.error("pagesList Element nicht gefunden!");
        return;
      }
      
      // Liste leeren und Nachricht anzeigen
      pagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Lade Seiten...</p>';
      
      // Alle Seiten direkt aus Firebase laden
      db.collection('pages').get().then(snapshot => {
        pagesList.innerHTML = ''; // Liste leeren
        
        if (snapshot.empty) {
          console.log("Keine Seiten gefunden");
          if (noPagesMessage) noPagesMessage.style.display = 'block';
          return;
        }
        
        console.log(`${snapshot.size} Seiten gefunden, füge zur Liste hinzu`);
        if (noPagesMessage) noPagesMessage.style.display = 'none';
        
        // Zurücksetzen der Seiten-Liste
        currentPages = {};
        
        // Seiten zum Objekt hinzufügen und anzeigen
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
              <i class="fas fa-eye"></i> Ansehen
            </a>
            <button class="w3-bar-item w3-button w3-green w3-right direct-edit-btn">
              <i class="fas fa-edit"></i> Bearbeiten
            </button>
          `;
          
          pagesList.appendChild(pageItem);
          
          // Event-Listener für den Bearbeiten-Button
          const editBtn = pageItem.querySelector('.direct-edit-btn');
          if (editBtn) {
            editBtn.addEventListener('click', function() {
              console.log("Bearbeiten-Button geklickt für:", pageId);
              editPage(pageId);
            });
          }
        });
        
        showStatus(`${snapshot.size} Seiten geladen`);
        
      }).catch(error => {
        console.error("Fehler beim Laden der Seiten:", error);
        pagesList.innerHTML = `<p class="w3-text-red w3-center">Fehler beim Laden: ${error.message}</p>`;
        showStatus('Fehler beim Laden der Seiten: ' + error.message, true);
      });
    };

    // Template-Vorschau aktualisieren
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

    // Alle Seiten aus Firestore laden
    const loadPages = async () => {
      try {
        console.log("Versuche Seiten zu laden...");
        const pagesCollection = await db.collection('pages').get();
        console.log("Ergebnis erhalten:", pagesCollection.size, "Dokumente");
        
        const pagesList = document.getElementById('pagesList');
        const noPagesMessage = document.getElementById('noPagesMessage');
        
        if (!pagesList) {
          console.error("pagesList Element nicht gefunden!");
          return;
        }
        
        // Zurücksetzen der Seiten-Liste
        currentPages = {};
        pagesList.innerHTML = '';
        
        if (pagesCollection.empty) {
          console.log("Keine Seiten in der Datenbank gefunden");
          if (noPagesMessage) noPagesMessage.style.display = 'block';
          return;
        }
        
        console.log("Seiten gefunden, verstecke noPagesMessage");
        if (noPagesMessage) noPagesMessage.style.display = 'none';
        
        // Seiten zum Objekt hinzufügen und anzeigen
        pagesCollection.forEach(doc => {
          const pageData = doc.data();
          const pageId = doc.id;
          
          console.log("Verarbeite Seite:", pageId, pageData.title);
          
          currentPages[pageId] = pageData;
          
          const pageItem = document.createElement('div');
          pageItem.className = 'w3-bar w3-hover-light-grey w3-margin-bottom';
          pageItem.style.border = '1px solid #ddd';
          pageItem.innerHTML = `
            <div class="w3-bar-item">
              <span class="w3-large">${pageData.title}</span><br>
              <span>Template: ${pageTemplates[pageData.template]?.name || pageData.template}</span>
            </div>
            <a href="page.php?id=${pageId}" class="w3-bar-item w3-button w3-blue w3-right" style="margin-left: 5px" target="_blank">
              <i class="fas fa-eye"></i> Ansehen
            </a>
            <button class="w3-bar-item w3-button w3-green w3-right edit-page-btn" data-page-id="${pageId}">
              <i class="fas fa-edit"></i> Bearbeiten
            </button>
          `;
          
          pagesList.appendChild(pageItem);
          
          // Event-Listener für den Bearbeiten-Button
          const editBtn = pageItem.querySelector('.edit-page-btn');
          if (editBtn) {
            console.log("Edit-Button erstellt für Seite:", pageId);
            editBtn.addEventListener('click', function() {
              console.log("Edit-Button geklickt für Seite:", pageId);
              editPage(pageId);
            });
          }
        });
        
        console.log("Seiten wurden geladen und angezeigt");
        
      } catch (err) {
        console.error('Fehler beim Laden der Seiten:', err);
        showStatus('Fehler beim Laden der Seiten: ' + err.message, true);
      }
    };

    // Neue Seite erstellen
    const createNewPage = async () => {
      const pageName = document.getElementById('pageName');
      const pageTitle = document.getElementById('pageTitle');
      const pageTemplate = document.getElementById('pageTemplate');
      
      if (!pageName || !pageTitle || !pageTemplate) return;
      
      // Validierung
      if (!pageName.value || !pageTitle.value) {
        showStatus('Bitte füllen Sie alle Felder aus.', true);
        return;
      }
      
      // URL-freundlichen Namen erstellen
      const urlName = pageName.value.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')  // Sonderzeichen entfernen
        .replace(/\s+/g, '-')      // Leerzeichen durch Bindestrich ersetzen
        .replace(/-+/g, '-');      // Mehrfache Bindestriche durch einen ersetzen
      
      try {
        // Prüfen, ob es bereits eine Seite mit diesem Namen gibt
        const existingPage = await db.collection('pages').doc(urlName).get();
        if (existingPage.exists) {
          showStatus(`Eine Seite mit dem Namen "${urlName}" existiert bereits.`, true);
          return;
        }
        
        // Neue Seite erstellen
        const selectedTemplate = pageTemplate.value;
        const template = pageTemplates[selectedTemplate];
        
        if (!template) {
          showStatus('Ungültiges Template ausgewählt.', true);
          return;
        }
        
        // Leere Daten für das Template erstellen
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
        
        // Seitenobjekt erstellen
        const pageData = {
          title: pageTitle.value.trim(),
          template: selectedTemplate,
          data: templateData,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          updated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // In Firestore speichern
        await db.collection('pages').doc(urlName).set(pageData);
        
        showStatus(`Seite "${pageTitle.value}" wurde erfolgreich erstellt.`);
        
        // Formular zurücksetzen und Seiten neu laden
        pageName.value = '';
        pageTitle.value = '';
        pageTemplate.selectedIndex = 0;
        
        // Zurück zur Seitenliste
        showPagesList();
        
        // Seiten neu laden
        manualReloadPages();
        
      } catch (err) {
        console.error('Fehler beim Erstellen der Seite:', err);
        showStatus('Fehler beim Erstellen der Seite: ' + err.message, true);
      }
    };

    // Seite bearbeiten
    const editPage = async (pageId) => {
      try {
        console.log("Starte Bearbeitung für Seite:", pageId);
        
        // Seitenobjekt abrufen
        if (!currentPages[pageId]) {
          // Wenn die Seite nicht im Cache ist, dann von Firestore laden
          const pageDoc = await db.collection('pages').doc(pageId).get();
          if (!pageDoc.exists) {
            showStatus('Die Seite wurde nicht gefunden.', true);
            return;
          }
          currentPages[pageId] = pageDoc.data();
        }
        
        const pageData = currentPages[pageId];
        currentEditingPage = pageId;
        
        console.log("Seite geladen:", pageData);
        
        // Formular-Elemente anzeigen/verstecken
        document.getElementById('createPageBtn').style.display = 'none';
        document.getElementById('pagesListContainer').style.display = 'none';
        document.getElementById('newPageForm').style.display = 'none';
        document.getElementById('editPageForm').style.display = 'block';
        document.getElementById('debugReloadBtn').style.display = 'none';
        
        // Seitentitel anzeigen
        document.getElementById('editPageTitle').textContent = pageData.title;
        
        // Template-Felder generieren
        generateTemplateFields(pageData.template, pageData.data);
        
      } catch (err) {
        console.error('Fehler beim Laden der Seite:', err);
        showStatus('Fehler beim Laden der Seite: ' + err.message, true);
      }
    };

    // Template-Felder für die Bearbeitung generieren
    const generateTemplateFields = (templateId, data) => {
      const templateFields = document.getElementById('templateFields');
      if (!templateFields || !pageTemplates[templateId]) return;
      
      const template = pageTemplates[templateId];
      templateFields.innerHTML = '';
      
      // Felder basierend auf dem Template erstellen
      template.fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'w3-margin-bottom';
        
        const fieldLabel = document.createElement('label');
        fieldLabel.setAttribute('for', `field_${field.name}`);
        fieldLabel.textContent = field.label;
        fieldContainer.appendChild(fieldLabel);
        
        // Je nach Feldtyp unterschiedliche Eingabeelemente erstellen
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
              // TinyMCE-Editor
              const editorContainer = document.createElement('div');
              editorContainer.id = `field_${field.name}_container`;
              
              const textareaField = document.createElement('textarea');
              textareaField.id = `field_${field.name}`;
              textareaField.className = 'tinymce-editor';
              textareaField.rows = 8;
              textareaField.innerHTML = data[field.name] || '';
              
              editorContainer.appendChild(textareaField);
              fieldContainer.appendChild(editorContainer);
              
              // TinyMCE initialisieren
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
              // Standard-Textarea
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
            
            // Bildvorschau
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
            
            // Upload-Button
            const buttonCol = document.createElement('div');
            buttonCol.className = 'w3-col m3 w3-padding-small';
            
            const uploadBtn = document.createElement('button');
            uploadBtn.id = `field_${field.name}_upload`;
            uploadBtn.className = 'w3-button w3-blue w3-block';
            uploadBtn.textContent = 'Bild auswählen';
            uploadBtn.addEventListener('click', () => {
              // Bild-Upload-Handler aufrufen
              uploadImage(uploadBtn, `field_${field.name}`);
            });
            
            buttonCol.appendChild(uploadBtn);
            
            // Bild-URL (versteckt, wird für die Datenbank benötigt)
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
            
            // Galerie-Vorschau
            const galleryPreview = document.createElement('div');
            galleryPreview.id = `field_${field.name}_preview`;
            galleryPreview.className = 'w3-row w3-margin-bottom';
            
            // Vorhandene Bilder anzeigen
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
                // Bild aus der Galerie entfernen
                removeGalleryImage(field.name, index);
              });
              
              imageWrapper.appendChild(img);
              imageWrapper.appendChild(removeBtn);
              imageCol.appendChild(imageWrapper);
              galleryPreview.appendChild(imageCol);
            });
            
            // Button zum Hinzufügen von Bildern
            const addImageBtn = document.createElement('button');
            addImageBtn.id = `field_${field.name}_add`;
            addImageBtn.className = 'w3-button w3-blue w3-margin-bottom';
            addImageBtn.innerHTML = '<i class="fas fa-plus"></i> Bild hinzufügen';
            addImageBtn.addEventListener('click', () => {
              // Bild zur Galerie hinzufügen
              addGalleryImage(field.name);
            });
            
            // Verstecktes Feld für Galerie-Daten
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

    // Bild-Upload-Handler für Seitenfelder
    const uploadImage = (buttonElement, fieldId) => {
      // Das aktuelle Upload-Element für Referenz speichern
      currentUploadElement = buttonElement.closest('.w3-row');
      
      if (cloudinaryWidget) {
        try {
          // Cloudinary-Widget öffnen
          cloudinaryWidget.open();
          
          // Event-Handler für erfolgreichen Upload
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
                
                // Bild-URL und Public ID in das versteckte Feld speichern
                const hiddenInput = document.getElementById(fieldId);
                if (hiddenInput) {
                  hiddenInput.value = JSON.stringify({ url: imageUrl, public_id: publicId });
                }
                
                // Bildvorschau aktualisieren
                const imgElement = document.getElementById(`${fieldId}_img`);
                if (imgElement) {
                  imgElement.src = imageUrl;
                  imgElement.style.display = 'block';
                }
                
                showStatus('Bild erfolgreich hochgeladen');
              }
            }
          };
        } catch (error) {
          console.error("Fehler beim Öffnen des Cloudinary-Widgets:", error);
          showStatus("Fehler beim Öffnen des Upload-Dialogs. Verwende stattdessen lokalen Upload.", true);
          
          // Fallback zum lokalen Upload
          useLocalUpload(fieldId);
        }
      } else {
        // Fallback auf normalen Dateiupload
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
              // Bild hochladen
              await uploadFile(fileInput.files[0], (url, filename) => {
                // Bild-URL und Public ID in das versteckte Feld speichern
                const hiddenInput = document.getElementById(fieldId);
                if (hiddenInput) {
                  hiddenInput.value = JSON.stringify({ 
                    url: url, 
                    filename: filename,
                    public_id: filename // Lokales Fallback-Format
                  });
                }
                
                // Bildvorschau aktualisieren
                const imgElement = document.getElementById(`${fieldId}_img`);
                if (imgElement) {
                  imgElement.src = url;
                  imgElement.style.display = 'block';
                }
                
                showStatus('Bild erfolgreich hochgeladen');
              });
            } catch (error) {
              console.error('Fehler beim Hochladen:', error);
              showStatus('Fehler beim Hochladen: ' + error.message, true);
            }
            
            document.body.removeChild(fileInput);
          }
        });
        
        fileInput.click();
      }
    };

    // Bild zur Galerie hinzufügen
    const addGalleryImage = (fieldName) => {
      if (!currentEditingPage) return;
      // Das aktuelle Upload-Element für Referenz speichern
      currentUploadElement = document.getElementById(`field_${fieldName}_add`);
      
      if (cloudinaryWidget) {
        try {
          // Cloudinary-Widget öffnen
          cloudinaryWidget.open();
          
          // Event-Handler für erfolgreichen Upload
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
                
                // Bild zur Galerie hinzufügen
                addImageToGallery(fieldName, { url: imageUrl, public_id: publicId });
              }
            }
          };
        } catch (error) {
          console.error("Fehler beim Öffnen des Cloudinary-Widgets:", error);
          showStatus("Fehler beim Öffnen des Upload-Dialogs. Verwende stattdessen lokalen Upload.", true);
          
          // Fallback zum lokalen Upload
          useLocalGalleryUpload(fieldName);
        }
      } else {
        // Fallback auf normalen Dateiupload
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
              // Bild hochladen
              await uploadFile(fileInput.files[0], (url, filename) => {
                // Bild zur Galerie hinzufügen
                addImageToGallery(fieldName, { 
                  url: url, 
                  filename: filename,
                  public_id: filename // Lokales Fallback-Format
                });
              });
            } catch (error) {
              console.error('Fehler beim Hochladen:', error);
              showStatus('Fehler beim Hochladen: ' + error.message, true);
            }
            
            document.body.removeChild(fileInput);
          }
        });
        
        fileInput.click();
      }
    };

    // Bild zur Galerie hinzufügen
    const addImageToGallery = (fieldName, imageData) => {
      // Aktuelles Galerie-Feld abrufen
      const galleryInput = document.getElementById(`field_${fieldName}`);
      const galleryPreview = document.getElementById(`field_${fieldName}_preview`);
      
      if (!galleryInput || !galleryPreview) return;
      
      // Galerie-Daten abrufen
      let galleryImages = [];
      try {
        galleryImages = JSON.parse(galleryInput.value) || [];
      } catch (error) {
        console.error('Fehler beim Parsen der Galerie-Daten:', error);
        galleryImages = [];
      }
      
      // Bild hinzufügen
      galleryImages.push(imageData);
      
      // Galerie-Input aktualisieren
      galleryInput.value = JSON.stringify(galleryImages);
      
      // Neues Bild zur Vorschau hinzufügen
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
        // Bild aus der Galerie entfernen
        removeGalleryImage(fieldName, index);
      });
      
      imageWrapper.appendChild(img);
      imageWrapper.appendChild(removeBtn);
      imageCol.appendChild(imageWrapper);
      galleryPreview.appendChild(imageCol);
      
      showStatus('Bild zur Galerie hinzugefügt');
    };

    // Bild aus der Galerie entfernen
    const removeGalleryImage = (fieldName, index) => {
      // Aktuelles Galerie-Feld abrufen
      const galleryInput = document.getElementById(`field_${fieldName}`);
      const galleryPreview = document.getElementById(`field_${fieldName}_preview`);
      
      if (!galleryInput || !galleryPreview) return;
      
      // Galerie-Daten abrufen
      let galleryImages = [];
      try {
        galleryImages = JSON.parse(galleryInput.value) || [];
      } catch (error) {
        console.error('Fehler beim Parsen der Galerie-Daten:', error);
        return;
      }
      
      // Bild entfernen
      if (index >= 0 && index < galleryImages.length) {
        galleryImages.splice(index, 1);
        
        // Galerie-Input aktualisieren
        galleryInput.value = JSON.stringify(galleryImages);
        
        // Vorschau aktualisieren (neu rendern)
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
            // Bild aus der Galerie entfernen
            removeGalleryImage(fieldName, idx);
          });
          
          imageWrapper.appendChild(img);
          imageWrapper.appendChild(removeBtn);
          imageCol.appendChild(imageWrapper);
          galleryPreview.appendChild(imageCol);
        });
        
        showStatus('Bild aus der Galerie entfernt');
      }
    };

    // Seite speichern
    const savePage = async () => {
      if (!currentEditingPage) return;
      
      try {
        const pageData = currentPages[currentEditingPage];
        if (!pageData) {
          showStatus('Fehler: Keine Seitendaten gefunden.', true);
          return;
        }
        
        const template = pageTemplates[pageData.template];
        if (!template) {
          showStatus('Fehler: Ungültiges Template.', true);
          return;
        }
        
        // Daten aus den Formularfeldern sammeln
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
                // TinyMCE-Editor
                updatedData[field.name] = tinymce.get(`field_${field.name}`).getContent();
              } else {
                // Standard-Textarea
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
                console.error('Fehler beim Parsen der Bild-Daten:', error);
                updatedData[field.name] = { url: '', public_id: '' };
              }
              break;
              
            case 'gallery':
              try {
                updatedData[field.name] = JSON.parse(fieldElement.value);
              } catch (error) {
                console.error('Fehler beim Parsen der Galerie-Daten:', error);
                updatedData[field.name] = [];
              }
              break;
          }
        }
        
        // Daten aktualisieren
        const updatedPage = {
          ...pageData,
          data: updatedData,
          updated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // In Firestore speichern
        await db.collection('pages').doc(currentEditingPage).update(updatedPage);
        
        // Im lokalen Cache aktualisieren
        currentPages[currentEditingPage] = updatedPage;
        
        showStatus(`Seite "${pageData.title}" wurde erfolgreich gespeichert.`);
        
      } catch (err) {
        console.error('Fehler beim Speichern der Seite:', err);
        showStatus('Fehler beim Speichern der Seite: ' + err.message, true);
      }
    };

    // Seite löschen
    const deletePage = async () => {
      if (!currentEditingPage) return;
      
      // Bestätigung vom Benutzer einholen
      if (!confirm(`Möchten Sie die Seite "${currentPages[currentEditingPage]?.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
        return;
      }
      
      try {
        // Aus Firestore löschen
        await db.collection('pages').doc(currentEditingPage).delete();
        
        // Aus lokalem Cache entfernen
        delete currentPages[currentEditingPage];
        
        showStatus('Seite wurde erfolgreich gelöscht.');
        
        // Zurück zur Seitenliste
        showPagesList();
        
        // Seiten neu laden
        manualReloadPages();
        
      } catch (err) {
        console.error('Fehler beim Löschen der Seite:', err);
        showStatus('Fehler beim Löschen der Seite: ' + err.message, true);
      }
    };

    // Zurück zur Seitenliste
    const showPagesList = () => {
      // Formular-Elemente anzeigen/verstecken
      document.getElementById('createPageBtn').style.display = 'block';
      document.getElementById('pagesListContainer').style.display = 'block';
      document.getElementById('newPageForm').style.display = 'none';
      document.getElementById('editPageForm').style.display = 'none';
      document.getElementById('debugReloadBtn').style.display = 'block';
      
      // TinyMCE-Editoren entfernen
      tinymce.remove();
      
      // Aktuell bearbeitete Seite zurücksetzen
      currentEditingPage = null;
    };

    // Auth-Zustand überwachen
    auth.onAuthStateChanged(user => {
      if (user) {
        // Eingeloggt
        loginDiv.style.display = 'none';
        adminDiv.style.display = 'block';
        
        // TinyMCE initialisieren
        initTinyMCE();
        
        // Daten laden nach TinyMCE Initialisierung
        setTimeout(() => {
          loadContentData();
          loadWordCloudData();
          
          // Seitenverwaltung initialisieren, wenn der Tab existiert
          if (document.getElementById('pages-tab')) {
            addTemplatePreviewCSS();
            initPageManagement();
          }
        }, 1000);
        
        // Bild-Upload-Handler einrichten
        setupImageUpload('offer1UploadBtn', 'offer1_image', offer1Img);
        setupImageUpload('offer2UploadBtn', 'offer2_image', offer2Img);
        setupImageUpload('offer3UploadBtn', 'offer3_image', offer3Img);
        setupImageUpload('contactUploadBtn', 'contact_image', contactImg);
      } else {
        // Nicht eingeloggt
        adminDiv.style.display = 'none';
        loginDiv.style.display = 'block';
      }
    });

    // Login-Button Event
    loginBtn.addEventListener('click', () => {
      const email = emailField.value;
      const pass = passField.value;
      loginError.textContent = "";
      
      auth.signInWithEmailAndPassword(email, pass)
        .catch(err => {
          console.error("Login-Fehler:", err);
          loginError.textContent = "Login fehlgeschlagen: " + err.message;
        });
    });

    // Logout-Button Event
    logoutBtn.addEventListener('click', () => {
      auth.signOut();
    });
});

// Globale Hilfsfunktionen für die Seitenverwaltung (hilfreich für Debugging)
window.debugPages = {
  listPages: function() {
    const db = firebase.firestore();
    db.collection('pages').get().then(snapshot => {
      console.log("Seiten gefunden:", snapshot.size);
      snapshot.forEach(doc => {
        console.log("Seite:", doc.id, doc.data().title);
      });
    }).catch(error => {
      console.error("Fehler beim Laden der Seiten:", error);
    });
  },
  
  reloadPages: function() {
    const pagesList = document.getElementById('pagesList');
    if (pagesList) {
      pagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Lade Seiten...</p>';
      
      const db = firebase.firestore();
      db.collection('pages').get().then(snapshot => {
        pagesList.innerHTML = '';
        
        console.log(`${snapshot.size} Seiten gefunden`);
        document.getElementById('noPagesMessage').style.display = snapshot.empty ? 'block' : 'none';
        
        snapshot.forEach(doc => {
          const pageData = doc.data();
          const pageId = doc.id;
          
          const pageItem = document.createElement('div');
          pageItem.className = 'w3-bar w3-hover-light-grey w3-margin-bottom';
          pageItem.style.border = '1px solid #ddd';
          pageItem.innerHTML = `
            <div class="w3-bar-item">
              <span class="w3-large">${pageData.title}</span><br>
              <span>ID: ${pageId} | Template: ${pageData.template}</span>
            </div>
            <a href="page.php?id=${pageId}" class="w3-bar-item w3-button w3-blue w3-right" style="margin-left: 5px" target="_blank">
              <i class="fas fa-eye"></i> Ansehen
            </a>
            <button class="w3-bar-item w3-button w3-green w3-right direct-edit-btn-${pageId}">
              <i class="fas fa-edit"></i> Bearbeiten
            </button>
          `;
          
          pagesList.appendChild(pageItem);
          
          setTimeout(() => {
            const editBtn = document.querySelector(`.direct-edit-btn-${pageId}`);
            if (editBtn) {
              editBtn.addEventListener('click', function() {
                alert(`Seite bearbeiten: ${pageId}`);
              });
            }
          }, 100);
        });
      }).catch(error => {
        console.error("Fehler beim Laden der Seiten:", error);
      });
      
    }
  }
};

// Globale Hilfsfunktion zum direkten Anzeigen von Seiten
window.forceShowPages = function() {
  const db = firebase.firestore();
  const pagesList = document.getElementById('pagesList');
  
  if (!pagesList) {
    console.error("pagesList Element nicht gefunden!");
    return;
  }
  
  // Liste leeren
  pagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Lade Seiten...</p>';
  
  // Verstecke "Keine Seiten"-Nachricht
  const noPagesMessage = document.getElementById('noPagesMessage');
  if (noPagesMessage) noPagesMessage.style.display = 'none';
  
  // Direkt aus Firebase laden
  db.collection('pages').get().then(snapshot => {
    // Liste leeren
    pagesList.innerHTML = '';
    
    if (snapshot.empty) {
      console.log("Keine Seiten gefunden");
      if (noPagesMessage) noPagesMessage.style.display = 'block';
      return;
    }
    
    // Seiten anzeigen
    snapshot.forEach(doc => {
      const pageData = doc.data();
      const pageId = doc.id;
      
      // Einfaches Listenelement erstellen
      const item = document.createElement('div');
      item.className = 'w3-bar w3-hover-light-grey w3-margin-bottom';
      item.style.border = '2px solid #4CAF50';  // Auffälliger grüner Rand
      item.style.borderRadius = '4px';
      item.style.padding = '10px';
      item.innerHTML = `
        <div class="w3-bar-item" style="flex-grow: 1;">
          <h4 style="margin: 0;">${pageData.title}</h4>
          <p style="margin: 5px 0;">ID: ${pageId} | Template: ${pageData.template}</p>
        </div>
        <div class="w3-bar-item">
          <a href="page.php?id=${pageId}" class="w3-button w3-blue" target="_blank" style="margin-right: 5px;">
            <i class="fas fa-eye"></i> Ansehen
          </a>
          <button class="w3-button w3-green edit-simple-btn" data-page-id="${pageId}">
            <i class="fas fa-edit"></i> Bearbeiten
          </button>
        </div>
      `;
      
      pagesList.appendChild(item);
      
      // Event-Listener direkt hinzufügen
      const editBtn = item.querySelector('.edit-simple-btn');
      if (editBtn) {
        editBtn.onclick = function() {
          console.log("Edit geklickt für:", pageId);
          window.editPageDirect(pageId);
        };
      }
    });
    
    console.log(`${snapshot.size} Seiten angezeigt`);
  }).catch(error => {
    console.error("Fehler beim Laden der Seiten:", error);
    pagesList.innerHTML = `<p class="w3-text-red w3-center">Fehler: ${error.message}</p>`;
  });
};

// Direkter Aufruf zum Bearbeiten einer Seite
window.editPageDirect = async function(pageId) {
  const db = firebase.firestore();
  console.log("Bearbeite Seite direkt:", pageId);
  
  try {
    const doc = await db.collection('pages').doc(pageId).get();
    if (!doc.exists) {
      alert("Seite nicht gefunden!");
      return;
    }
    
    // Formular-Elemente anzeigen/verstecken
    document.getElementById('createPageBtn').style.display = 'none';
    document.getElementById('pagesListContainer').style.display = 'none';
    document.getElementById('newPageForm').style.display = 'none';
    document.getElementById('editPageForm').style.display = 'block';
    if (document.getElementById('debugReloadBtn')) {
      document.getElementById('debugReloadBtn').style.display = 'none';
    }
    
    const pageData = doc.data();
    
    // Seitentitel anzeigen
    document.getElementById('editPageTitle').textContent = pageData.title;
    
    // Global speichern für editPage-Funktion
    window.currentEditingPage = pageId;
    window.currentPages = window.currentPages || {};
    window.currentPages[pageId] = pageData;
    
    // Template-Felder generieren
    if (typeof generateTemplateFields === 'function') {
      generateTemplateFields(pageData.template, pageData.data);
    } else {
      alert("generateTemplateFields-Funktion nicht gefunden!");
    }
  } catch (error) {
    console.error("Fehler beim Laden der Seite:", error);
    alert("Fehler beim Laden der Seite: " + error.message);
  }
};

// DOM geladenes Event hinzufügen
document.addEventListener('DOMContentLoaded', function() {
  // Stellen Sie sicher, dass es nur einmal hinzugefügt wird
  if (!document.getElementById('force-show-btn')) {
    // Button zum Tab hinzufügen
    const pagesTab = document.getElementById('pages-tab');
    if (pagesTab) {
      const forceBtn = document.createElement('button');
      forceBtn.id = 'force-show-btn';
      forceBtn.className = 'w3-button w3-red w3-margin-bottom';
      forceBtn.style.marginLeft = '10px';
      forceBtn.innerHTML = 'Seiten direkt anzeigen';
      forceBtn.onclick = window.forceShowPages;
      
      // Nach dem Debug-Button einfügen oder am Anfang des Tabs
      const debugBtn = document.getElementById('debugReloadBtn');
      if (debugBtn) {
        pagesTab.insertBefore(forceBtn, debugBtn.nextSibling);
      } else {
        pagesTab.insertBefore(forceBtn, pagesTab.firstChild);
      }
    }
  }
});