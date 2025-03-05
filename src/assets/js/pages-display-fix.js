// Endgültig korrigierte Version der pages-display-fix.js
// Behebt das Problem mit "pagesList element not found!"

// Hauptfunktion zum Anzeigen der Seiten
function forceDisplayPages() {
  console.log("forceDisplayPages wird ausgeführt");
  
  // Firebase sollte bereits initialisiert sein
  const db = firebase.firestore();
  
  // Zuerst den Tab finden und sichtbar machen
  const pagesTab = document.getElementById('pages-tab');
  if (pagesTab) {
    // Sicherstellen, dass der Tab sichtbar ist
    pagesTab.style.display = 'block';
    pagesTab.classList.add('active');
    
    // Tab-Button aktivieren
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === 'pages') {
        btn.classList.add('active');
      }
    });
  }
  
  // Container für die Seiten finden oder erstellen
  let pagesListContainer = document.getElementById('pagesListContainer');
  
  // Falls der Container nicht existiert, erstellen wir ihn
  if (!pagesListContainer) {
    console.log("pagesListContainer nicht gefunden, wird erstellt");
    pagesListContainer = document.createElement('div');
    pagesListContainer.id = 'pagesListContainer';
    pagesListContainer.className = 'w3-margin-bottom';
    
    if (pagesTab) {
      pagesTab.appendChild(pagesListContainer);
    } else {
      // Fallback, falls pagesTab nicht gefunden wird
      const adminDiv = document.getElementById('adminDiv');
      if (adminDiv) {
        adminDiv.appendChild(pagesListContainer);
      } else {
        // Letzte Rettung: an body anhängen
        document.body.appendChild(pagesListContainer);
      }
    }
  }
  
  // Stelle sicher, dass der Container sichtbar ist
  pagesListContainer.style.display = 'block';
  pagesListContainer.style.visibility = 'visible';
  pagesListContainer.style.opacity = '1';

  // Inhalt für den Container erstellen
  pagesListContainer.innerHTML = `
    <div class="w3-margin-bottom">
      <button id="createPageBtn" class="w3-button w3-blue">
        <i class="fas fa-plus"></i> Neue Seite erstellen
      </button>
    </div>
    
    <div class="w3-card w3-padding w3-margin-bottom" id="pagesListBox">
      <h4>Bestehende Seiten</h4>
      <div id="pagesList" class="w3-container" style="display: block !important;">
        <p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Seiten werden geladen...</p>
      </div>
    </div>
  `;
  
  // Event-Listener für den "Neue Seite erstellen" Button
  const createPageBtn = document.getElementById('createPageBtn');
  if (createPageBtn) {
    createPageBtn.addEventListener('click', showNewPageForm);
  }
  
  // Jetzt die Seitenliste mit Daten aus Firebase füllen
  const pagesList = document.getElementById('pagesList');
  
  if (!pagesList) {
    console.error("pagesList nicht gefunden! Erstelle es neu.");
    // Erstellen wir es neu
    const pagesListBox = document.getElementById('pagesListBox');
    if (pagesListBox) {
      const newPagesList = document.createElement('div');
      newPagesList.id = 'pagesList';
      newPagesList.className = 'w3-container';
      newPagesList.style.display = 'block';
      newPagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Seiten werden geladen...</p>';
      pagesListBox.appendChild(newPagesList);
      
      // Setzen wir die Variable neu
      loadPagesContent(newPagesList, db);
    } else {
      // Wirklich kritischer Fehler, zeige Fehlermeldung
      showError("Kritischer Fehler: Container für Seitenliste konnte nicht gefunden werden.");
    }
  } else {
    // Die Liste existiert, lade die Inhalte
    loadPagesContent(pagesList, db);
  }
}

// Funktion, um eine Fehlermeldung anzuzeigen
function showError(message) {
  // Versuche, eine Meldung in der UI zu zeigen
  try {
    const errorElement = document.createElement('div');
    errorElement.className = 'w3-panel w3-red';
    errorElement.innerHTML = `
      <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
      <button onclick="location.reload()" class="w3-button w3-black">Seite neu laden</button>
    `;
    
    // Füge die Meldung ans Dokument an
    const adminDiv = document.getElementById('adminDiv');
    if (adminDiv) {
      adminDiv.insertBefore(errorElement, adminDiv.firstChild);
    } else {
      document.body.insertBefore(errorElement, document.body.firstChild);
    }
  } catch (e) {
    // Fallback: Alert-Dialog
    alert(message);
  }
}

// Lade die Seiteninhalte
function loadPagesContent(pagesList, db) {
  // Seiten aus Firebase laden
  db.collection('pages').get().then(snapshot => {
    // Liste leeren
    pagesList.innerHTML = '';
    
    if (snapshot.empty) {
      pagesList.innerHTML = '<p class="w3-text-grey" id="noPagesMessage">Noch keine Seiten erstellt.</p>';
      return;
    }
    
    // Alle Seiten zur Liste hinzufügen
    snapshot.forEach(doc => {
      const pageData = doc.data();
      const pageId = doc.id;
      
      const pageItem = document.createElement('div');
      pageItem.className = 'w3-card w3-margin-bottom page-card';
      pageItem.innerHTML = `
        <div class="w3-container w3-padding">
          <h5>${pageData.title || 'Unbenannte Seite'}</h5>
          <p class="w3-text-grey">ID: ${pageId} | Template: ${pageData.template || 'Unbekannt'}</p>
          
          <div class="w3-bar">
            <a href="page.php?id=${pageId}" target="_blank" class="w3-button w3-blue w3-margin-right">
              <i class="fas fa-eye"></i> Ansehen
            </a>
            <button class="w3-button w3-green edit-page-btn" data-pageid="${pageId}">
              <i class="fas fa-edit"></i> Bearbeiten
            </button>
          </div>
        </div>
      `;
      
      pagesList.appendChild(pageItem);
      
      // Event-Listener für den Bearbeiten-Button hinzufügen
      const editBtn = pageItem.querySelector('.edit-page-btn');
      if (editBtn) {
        editBtn.addEventListener('click', function() {
          const pageId = this.getAttribute('data-pageid');
          console.log("Bearbeiten-Button geklickt für Seite:", pageId);
          editPageDirect(pageId);
        });
      }
    });
    
    console.log(`${snapshot.size} Seiten wurden angezeigt`);
    
  }).catch(error => {
    console.error("Fehler beim Laden der Seiten:", error);
    pagesList.innerHTML = `
      <div class="w3-panel w3-pale-red w3-leftbar w3-border-red">
        <p>Fehler beim Laden der Seiten: ${error.message}</p>
      </div>
    `;
  });
}

// Formular zum Erstellen einer neuen Seite anzeigen
function showNewPageForm() {
  const pagesListContainer = document.getElementById('pagesListContainer');
  if (!pagesListContainer) return;
  
  pagesListContainer.innerHTML = `
    <div class="w3-card w3-padding w3-margin-bottom">
      <h4>Neue Seite erstellen</h4>
      
      <div class="w3-section">
        <label><strong>Seitenname:</strong></label>
        <input type="text" id="pageName" class="w3-input w3-border w3-margin-bottom" placeholder="z.B. ueber-mich, angebote, kontakt" />
        <small class="w3-text-grey">Nur Kleinbuchstaben, Zahlen und Bindestriche verwenden</small>
        
        <label><strong>Seitentitel:</strong></label>
        <input type="text" id="pageTitle" class="w3-input w3-border w3-margin-bottom" placeholder="Wird im Browser-Tab angezeigt" />
        
        <label><strong>Template:</strong></label>
        <select id="pageTemplate" class="w3-select w3-border w3-margin-bottom">
          <option value="basic">Basis-Template (Titel + Text)</option>
          <option value="text-image">Text mit Bild (rechts)</option>
          <option value="image-text">Bild (links) mit Text</option>
          <option value="gallery">Galerie-Template</option>
          <option value="contact">Kontakt-Template</option>
        </select>
      </div>
      
      <div class="w3-section">
        <button class="w3-button w3-red w3-margin-right" id="cancelNewPageBtn">
          <i class="fas fa-times"></i> Abbrechen
        </button>
        <button class="w3-button w3-green" id="createNewPageBtn">
          <i class="fas fa-plus"></i> Seite erstellen
        </button>
      </div>
    </div>
  `;
  
  // Event-Listener hinzufügen
  document.getElementById('cancelNewPageBtn').addEventListener('click', function() {
    forceDisplayPages(); // Zurück zur Seitenliste
  });
  
  document.getElementById('createNewPageBtn').addEventListener('click', function() {
    createNewPage();
  });
}

// Neue Seite erstellen
function createNewPage() {
  const pageName = document.getElementById('pageName').value.trim();
  const pageTitle = document.getElementById('pageTitle').value.trim();
  const pageTemplate = document.getElementById('pageTemplate').value;
  
  // Validierung
  if (!pageName) {
    showMessage('Bitte geben Sie einen Seitennamen ein', true);
    return;
  }
  
  if (!pageTitle) {
    showMessage('Bitte geben Sie einen Seitentitel ein', true);
    return;
  }
  
  // URL-freundlichen Namen erstellen
  const urlName = pageName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  // Firebase sollte bereits initialisiert sein
  const db = firebase.firestore();
  
  // Ladestatus anzeigen
  showMessage('Seite wird erstellt...', false, true);
  
  // Prüfen, ob die Seite bereits existiert
  db.collection('pages').doc(urlName).get().then(doc => {
    if (doc.exists) {
      showMessage(`Eine Seite mit dem Namen "${urlName}" existiert bereits`, true);
      return Promise.reject(new Error('Seite existiert bereits'));
    }
    
    // Leere Daten für das Template erstellen
    const templateData = {};
    
    switch (pageTemplate) {
      case 'basic':
        templateData.header = '';
        templateData.content = '';
        break;
      case 'text-image':
        templateData.header = '';
        templateData.content = '';
        templateData.image = { url: '', public_id: '' };
        break;
      case 'image-text':
        templateData.header = '';
        templateData.content = '';
        templateData.image = { url: '', public_id: '' };
        break;
      case 'gallery':
        templateData.header = '';
        templateData.description = '';
        templateData.images = [];
        break;
      case 'contact':
        templateData.header = '';
        templateData.content = '';
        templateData.showMap = false;
        templateData.address = '';
        templateData.email = '';
        templateData.phone = '';
        break;
    }
    
    // Seitenobjekt erstellen
    const pageData = {
      title: pageTitle,
      template: pageTemplate,
      data: templateData,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // In Firestore speichern
    return db.collection('pages').doc(urlName).set(pageData);
  })
  .then(() => {
    showMessage('Seite erfolgreich erstellt');
    
    // Kurze Verzögerung vor dem Zurückkehren zur Seitenliste
    setTimeout(() => {
      forceDisplayPages();
    }, 1000);
  })
  .catch(error => {
    if (error.message !== 'Seite existiert bereits') {
      console.error('Fehler beim Erstellen der Seite:', error);
      showMessage('Fehler beim Erstellen der Seite: ' + error.message, true);
    }
  });
}

// Seite bearbeiten
function editPageDirect(pageId) {
  if (!pageId) {
    console.error("Keine Seiten-ID angegeben!");
    return;
  }
  
  console.log("Bearbeite Seite mit ID:", pageId);
  
  // Firebase sollte bereits initialisiert sein
  const db = firebase.firestore();
  
  // Ladestatus anzeigen
  const pagesListContainer = document.getElementById('pagesListContainer');
  if (pagesListContainer) {
    pagesListContainer.innerHTML = `
      <div class="w3-panel w3-pale-blue">
        <p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Seite wird geladen...</p>
      </div>
    `;
  }
  
  // Seite aus Firebase laden
  db.collection('pages').doc(pageId).get().then(doc => {
    if (!doc.exists) {
      showMessage(`Seite mit ID "${pageId}" wurde nicht gefunden.`, true);
      setTimeout(() => {
        forceDisplayPages();
      }, 2000);
      return;
    }
    
    const pageData = doc.data();
    console.log("Seitendaten geladen:", pageData);
    
    // Formular für die Bearbeitung anzeigen
    displayEditForm(pageId, pageData);
  })
  .catch(error => {
    console.error("Fehler beim Laden der Seite:", error);
    showMessage('Fehler beim Laden der Seite: ' + error.message, true);
    
    // Zurück zur Seitenliste nach einem Fehler
    setTimeout(() => {
      forceDisplayPages();
    }, 2000);
  });
}

// Bearbeitungsformular anzeigen
function displayEditForm(pageId, pageData) {
  const pagesListContainer = document.getElementById('pagesListContainer');
  if (!pagesListContainer) return;
  
  const templateType = pageData.template || 'basic';
  const data = pageData.data || {};
  
  pagesListContainer.innerHTML = `
    <div class="w3-card w3-padding w3-margin-bottom">
      <div class="w3-bar w3-blue" style="margin: -16px -16px 16px -16px; padding: 8px;">
        <h4 class="w3-bar-item">Seite bearbeiten: ${pageData.title}</h4>
      </div>
      
      <div class="w3-row">
        <div class="w3-col m3 w3-padding">
          <p><strong>Seiten-ID:</strong> ${pageId}</p>
          <p><strong>Template:</strong> ${templateType}</p>
          <p><strong>Erstellt:</strong> ${pageData.created ? new Date(pageData.created.seconds * 1000).toLocaleString() : 'Unbekannt'}</p>
        </div>
        
        <div class="w3-col m9 w3-padding">
          <div class="w3-section">
            <label><strong>Seitentitel:</strong></label>
            <input type="text" id="edit_title" class="w3-input w3-border" value="${pageData.title || ''}" />
          </div>
          
          <div id="edit_fields">
            <!-- Hier werden die Template-spezifischen Felder eingefügt -->
          </div>
        </div>
      </div>
      
      <div class="w3-section w3-right-align">
        <button class="w3-button w3-amber w3-margin-right" id="backToListBtn">
          <i class="fas fa-arrow-left"></i> Zurück zur Liste
        </button>
        <button class="w3-button w3-red w3-margin-right" id="deletePageBtn">
          <i class="fas fa-trash"></i> Löschen
        </button>
        <button class="w3-button w3-green" id="savePageBtn">
          <i class="fas fa-save"></i> Speichern
        </button>
      </div>
    </div>
  `;
  
  // Template-spezifische Felder erstellen
  const fieldsContainer = document.getElementById('edit_fields');
  
  switch (templateType) {
    case 'basic':
      fieldsContainer.innerHTML = `
        <div class="w3-section">
          <label><strong>Überschrift:</strong></label>
          <input type="text" id="edit_header" class="w3-input w3-border" value="${data.header || ''}" />
        </div>
        <div class="w3-section">
          <label><strong>Inhalt:</strong></label>
          <textarea id="edit_content" class="w3-input w3-border" rows="10">${data.content || ''}</textarea>
        </div>
      `;
      break;
      
    case 'text-image':
      fieldsContainer.innerHTML = `
        <div class="w3-section">
          <label><strong>Überschrift:</strong></label>
          <input type="text" id="edit_header" class="w3-input w3-border" value="${data.header || ''}" />
        </div>
        <div class="w3-section">
          <label><strong>Inhalt:</strong></label>
          <textarea id="edit_content" class="w3-input w3-border" rows="10">${data.content || ''}</textarea>
        </div>
        <div class="w3-section">
          <label><strong>Bild:</strong></label>
          <div class="w3-row">
            <div class="w3-col m9">
              <img id="edit_image_preview" src="${data.image?.url || '/api/placeholder/400/300'}" style="max-width: 100%; max-height: 200px;" />
            </div>
            <div class="w3-col m3 w3-padding">
              <button type="button" id="edit_image_upload" class="w3-button w3-blue w3-block">
                Bild auswählen
              </button>
              <input type="hidden" id="edit_image_data" value='${JSON.stringify(data.image || { url: "", public_id: "" })}' />
            </div>
          </div>
        </div>
      `;
      
      // Image Upload-Handler hinzufügen
      setTimeout(() => {
        document.getElementById('edit_image_upload')?.addEventListener('click', function() {
          uploadImage('edit_image');
        });
      }, 0);
      break;
      
    case 'image-text':
      fieldsContainer.innerHTML = `
        <div class="w3-section">
          <label><strong>Überschrift:</strong></label>
          <input type="text" id="edit_header" class="w3-input w3-border" value="${data.header || ''}" />
        </div>
        <div class="w3-section">
          <label><strong>Bild:</strong></label>
          <div class="w3-row">
            <div class="w3-col m9">
              <img id="edit_image_preview" src="${data.image?.url || '/api/placeholder/400/300'}" style="max-width: 100%; max-height: 200px;" />
            </div>
            <div class="w3-col m3 w3-padding">
              <button type="button" id="edit_image_upload" class="w3-button w3-blue w3-block">
                Bild auswählen
              </button>
              <input type="hidden" id="edit_image_data" value='${JSON.stringify(data.image || { url: "", public_id: "" })}' />
            </div>
          </div>
        </div>
        <div class="w3-section">
          <label><strong>Inhalt:</strong></label>
          <textarea id="edit_content" class="w3-input w3-border" rows="10">${data.content || ''}</textarea>
        </div>
      `;
      
      // Image Upload-Handler hinzufügen
      setTimeout(() => {
        document.getElementById('edit_image_upload')?.addEventListener('click', function() {
          uploadImage('edit_image');
        });
      }, 0);
      break;
      
    case 'gallery':
      fieldsContainer.innerHTML = `
        <div class="w3-section">
          <label><strong>Überschrift:</strong></label>
          <input type="text" id="edit_header" class="w3-input w3-border" value="${data.header || ''}" />
        </div>
        <div class="w3-section">
          <label><strong>Beschreibung:</strong></label>
          <textarea id="edit_description" class="w3-input w3-border" rows="5">${data.description || ''}</textarea>
        </div>
        <div class="w3-section">
          <label><strong>Galerie-Bilder:</strong></label>
          <div id="edit_gallery" class="w3-row"></div>
          <button type="button" id="edit_add_image" class="w3-button w3-blue w3-margin-top">
            <i class="fas fa-plus"></i> Bild hinzufügen
          </button>
          <input type="hidden" id="edit_gallery_data" value='${JSON.stringify(data.images || [])}' />
        </div>
      `;
      
      // Galerie-Bilder anzeigen
      renderGallery(data.images || []);
      
      // Event-Listener für "Bild hinzufügen"-Button
      setTimeout(() => {
        document.getElementById('edit_add_image')?.addEventListener('click', function() {
          addGalleryImage();
        });
      }, 0);
      break;
      
    case 'contact':
      fieldsContainer.innerHTML = `
        <div class="w3-section">
          <label><strong>Überschrift:</strong></label>
          <input type="text" id="edit_header" class="w3-input w3-border" value="${data.header || ''}" />
        </div>
        <div class="w3-section">
          <label><strong>Einleitungstext:</strong></label>
          <textarea id="edit_content" class="w3-input w3-border" rows="5">${data.content || ''}</textarea>
        </div>
        <div class="w3-section">
          <label>
            <input type="checkbox" id="edit_showMap" class="w3-check" ${data.showMap ? 'checked' : ''} />
            Karte anzeigen
          </label>
        </div>
        <div class="w3-section">
          <label><strong>Adresse:</strong></label>
          <input type="text" id="edit_address" class="w3-input w3-border" value="${data.address || ''}" />
        </div>
        <div class="w3-section">
          <label><strong>E-Mail:</strong></label>
          <input type="email" id="edit_email" class="w3-input w3-border" value="${data.email || ''}" />
        </div>
        <div class="w3-section">
          <label><strong>Telefon:</strong></label>
          <input type="tel" id="edit_phone" class="w3-input w3-border" value="${data.phone || ''}" />
        </div>
      `;
      break;
      
    default:
      fieldsContainer.innerHTML = `<p>Unbekanntes Template: ${templateType}</p>`;
  }
  
  // Event-Handler hinzufügen
  document.getElementById('backToListBtn')?.addEventListener('click', function() {
    forceDisplayPages();
  });
  
  document.getElementById('deletePageBtn')?.addEventListener('click', function() {
    if (confirm(`Möchten Sie die Seite "${pageData.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      deletePage(pageId);
    }
  });
  
  document.getElementById('savePageBtn')?.addEventListener('click', function() {
    savePage(pageId, pageData);
  });
}

// Galerie rendern
function renderGallery(images) {
  const galleryContainer = document.getElementById('edit_gallery');
  if (!galleryContainer) return;
  
  galleryContainer.innerHTML = '';
  
  if (!images || images.length === 0) {
    galleryContainer.innerHTML = `
      <div class="w3-panel w3-pale-yellow w3-center">
        <p>Keine Bilder in der Galerie. Klicken Sie auf "Bild hinzufügen".</p>
      </div>
    `;
    return;
  }
  
  images.forEach((image, index) => {
    const imageCol = document.createElement('div');
    imageCol.className = 'w3-col m3 w3-padding';
    imageCol.innerHTML = `
      <div style="position: relative;">
        <img src="${image.url}" style="width: 100%; height: 150px; object-fit: cover;" />
        <button type="button" class="w3-button w3-red w3-circle" style="position: absolute; top: 5px; right: 5px; width: 30px; height: 30px; padding: 0;">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    const deleteBtn = imageCol.querySelector('button');
    deleteBtn.addEventListener('click', function() {
      removeGalleryImage(index);
    });
    
    galleryContainer.appendChild(imageCol);
  });
}

// Bild zur Galerie hinzufügen
function addGalleryImage() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  document.body.appendChild(fileInput);
  
  fileInput.addEventListener('change', function() {
    if (fileInput.files.length > 0) {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      
      showMessage('Bild wird hochgeladen...', false, true);
      
      fetch('./api/upload.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Bild zur Galerie hinzufügen
          const galleryDataInput = document.getElementById('edit_gallery_data');
          if (galleryDataInput) {
            let galleryImages = [];
            try {
              galleryImages = JSON.parse(galleryDataInput.value) || [];
            } catch (e) {
              console.error('Fehler beim Parsen der Galerie-Daten:', e);
              galleryImages = [];
            }
            
            galleryImages.push({
              url: data.url,
              filename: data.filename,
              public_id: data.filename
            });
            
            galleryDataInput.value = JSON.stringify(galleryImages);
            
            // Galerie aktualisieren
            renderGallery(galleryImages);
            
            showMessage('Bild hinzugefügt');
          }
        } else {
          showMessage('Fehler beim Hochladen: ' + data.error, true);
        }
      })
      .catch(error => {
        console.error('Fehler beim Hochladen:', error);
        showMessage('Fehler beim Hochladen des Bildes', true);
      });
      
      document.body.removeChild(fileInput);
    }
  });
  
  fileInput.click();
}

// Bild aus der Galerie entfernen
function removeGalleryImage(index) {
  const galleryDataInput = document.getElementById('edit_gallery_data');
  if (!galleryDataInput) return;
  
  let galleryImages = [];
  try {
    galleryImages = JSON.parse(galleryDataInput.value) || [];
  } catch (e) {
    console.error('Fehler beim Parsen der Galerie-Daten:', e);
    return;
  }
  
  galleryImages.splice(index, 1);
  galleryDataInput.value = JSON.stringify(galleryImages);
  
  // Galerie aktualisieren
  renderGallery(galleryImages);
  
  showMessage('Bild entfernt');
}

// Bild hochladen
function uploadImage(fieldPrefix) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  document.body.appendChild(fileInput);
  
  fileInput.addEventListener('change', function() {
    if (fileInput.files.length > 0) {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      
      showMessage('Bild wird hochgeladen...', false, true);
      
      fetch('./api/upload.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Bild-URL und -Daten speichern
          const imageDataInput = document.getElementById(`${fieldPrefix}_data`);
          if (imageDataInput) {
            imageDataInput.value = JSON.stringify({
              url: data.url,
              filename: data.filename,
              public_id: data.filename
            });
          }
          
          // Vorschau aktualisieren
          const previewImg = document.getElementById(`${fieldPrefix}_preview`);
          if (previewImg) {
            previewImg.src = data.url;
          }
          
          showMessage('Bild hochgeladen');
        } else {
          showMessage('Fehler beim Hochladen: ' + data.error, true);
        }
      })
      .catch(error => {
        console.error('Fehler beim Hochladen:', error);
        showMessage('Fehler beim Hochladen des Bildes', true);
      });
      
      document.body.removeChild(fileInput);
    }
  });
  
  fileInput.click();
}

// Seite speichern
function savePage(pageId, originalData) {
  // Firebase sollte bereits initialisiert sein
  const db = firebase.firestore();
  
  showMessage('Seite wird gespeichert...', false, true);
  
  // Neuen Titel abrufen
  const newTitle = document.getElementById('edit_title').value.trim();
  if (!newTitle) {
    showMessage('Bitte geben Sie einen Seitentitel ein', true);
    return;
  }
  
  // Template-spezifische Daten sammeln
  const templateType = originalData.template;
  const newData = {};
  
  switch (templateType) {
    case 'basic':
      newData.header = document.getElementById('edit_header').value || '';
      newData.content = document.getElementById('edit_content').value || '';
      break;
      
    case 'text-image':
    case 'image-text':
      newData.header = document.getElementById('edit_header').value || '';
      newData.content = document.getElementById('edit_content').value || '';
      try {
        newData.image = JSON.parse(document.getElementById('edit_image_data').value);
      } catch (e) {
        console.error('Fehler beim Parsen der Bild-Daten:', e);
        newData.image = { url: '', public_id: '' };
      }
      break;
      
    case 'gallery':
      newData.header = document.getElementById('edit_header').value || '';
      newData.description = document.getElementById('edit_description').value || '';
      try {
        newData.images = JSON.parse(document.getElementById('edit_gallery_data').value);
      } catch (e) {
        console.error('Fehler beim Parsen der Galerie-Daten:', e);
        newData.images = [];
      }
      break;
      
    case 'contact':
      newData.header = document.getElementById('edit_header').value || '';
      newData.content = document.getElementById('edit_content').value || '';
      newData.showMap = document.getElementById('edit_showMap').checked;
      newData.address = document.getElementById('edit_address').value || '';
      newData.email = document.getElementById('edit_email').value || '';
      newData.phone = document.getElementById('edit_phone').value || '';
      break;
  }
  
  // Aktualisierte Seitendaten
  const updatedPage = {
    title: newTitle,
    template: templateType,
    data: newData,
    updated: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  // Erstellungsdatum beibehalten, falls vorhanden
  if (originalData.created) {
    updatedPage.created = originalData.created;
  }
  
  // In Firestore speichern
  db.collection('pages').doc(pageId).update(updatedPage)
    .then(() => {
      showMessage('Seite erfolgreich gespeichert');
      
      // Kurze Verzögerung, dann zurück zur Seitenliste
      setTimeout(() => {
        forceDisplayPages();
      }, 1000);
    })
    .catch(error => {
      console.error('Fehler beim Speichern der Seite:', error);
      showMessage('Fehler beim Speichern: ' + error.message, true);
    });
}

// Seite löschen
function deletePage(pageId) {
  // Firebase sollte bereits initialisiert sein
  const db = firebase.firestore();
  
  showMessage('Seite wird gelöscht...', false, true);
  
  db.collection('pages').doc(pageId).delete()
    .then(() => {
      showMessage('Seite erfolgreich gelöscht');
      
      // Kurze Verzögerung, dann zurück zur Seitenliste
      setTimeout(() => {
        forceDisplayPages();
      }, 1000);
    })
    .catch(error => {
      console.error('Fehler beim Löschen der Seite:', error);
      showMessage('Fehler beim Löschen: ' + error.message, true);
    });
}

// Statusmeldung anzeigen
function showMessage(message, isError = false, isLoading = false) {
  // Nachricht im vorhandenen statusMsg-Element anzeigen
  const statusMsg = document.getElementById('statusMsg');
  if (statusMsg) {
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    // Bei Lademeldungen die Nachricht stehen lassen
    if (!isLoading) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, 3000);
    }
  } else {
    // Fallback, falls kein statusMsg vorhanden ist
    alert(message);
  }
}

// DOM geladen Event
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM vollständig geladen, initialisiere Seitenverwaltungsfunktionen");
  
  // Tab-Wechsel Event-Handler
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (this.getAttribute('data-tab') === 'pages') {
        // Kurze Verzögerung, damit der Tab vollständig gewechselt hat
        setTimeout(forceDisplayPages, 100);
      }
    });
  });
  
  // Prüfen, ob wir bereits im Pages-Tab sind
  if (document.querySelector('.tab-btn[data-tab="pages"].active')) {
    setTimeout(forceDisplayPages, 100);
  }
  
  // Auf Auth-Status reagieren
  firebase.auth().onAuthStateChanged(function(user) {
    if (user && document.querySelector('.tab-btn[data-tab="pages"].active')) {
      setTimeout(forceDisplayPages, 500);
    }
  });
});

// Diese Funktionen global verfügbar machen
window.forceDisplayPages = forceDisplayPages;
window.editPageDirect = editPageDirect;