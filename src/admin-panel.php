<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Panel</title>
  <!-- Bestehende Styles einbinden -->
  <link rel="stylesheet" href="./assets/css/styles.css" />
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  
  <!-- TinyMCE einbinden mit API Key -->
  <script src="https://cdn.tiny.cloud/1/5pxzy8guun55o6z5mi0r8c4j8gk5hqeq3hpsotx123ak212k/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
  
  <!-- Firebase SDKs einbinden (nur einmal, in der richtigen Reihenfolge) -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
  
  <!-- Cloudinary -->
  <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script>
  


  <style>
  /* Temporäres Debug-CSS */
  #pagesListContainer, #pagesList {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    height: auto !important;
    overflow: visible !important;
  }
  
  /* Hervorhebung für Debug */
  #pagesList {
    border: 2px solid red !important;
    padding: 10px !important;
    margin: 10px !important;
  }

    .tox-tinymce {
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .preview-frame {
      width: 100%;
      height: 600px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .status-msg {
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
      display: none;
      opacity: 0;
      transform: translateY(-20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .status-msg.show {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .word-cloud-admin {
      margin: 20px 0;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
      border: 1px solid #eee;
    }
    .word-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .word-item input {
      margin-right: 8px;
    }
    .word-weight {
      width: 80px;
    }
    .draggable-handle {
      cursor: move;
      padding: 0 10px;
      color: #666;
    }
    .tabs {
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      position: sticky;
      top: 0;
      background-color: white;
      z-index: 99;
      padding: 10px 0;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 16px;
      outline: none;
    }
    .tab-btn.active {
      border-bottom: 3px solid #000;
      font-weight: bold;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .cloud-upload-preview {
      max-width: 100%;
      max-height: 150px;
      margin-top: 8px;
      border-radius: 4px;
    }
    .action-buttons {
      position: sticky;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-top: 1px solid #ddd;
      margin-top: 30px;
      z-index: 90;
    }
    .section-divider {
      margin: 30px 0;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>

  <h2 class="w3-center">Admin-Bereich</h2>
  <!-- Logout-Button und Zurück-Link (wird nur angezeigt, wenn eingeloggt) -->
  <div style="text-align:right; margin: 10px 20px;">
    <a href="index.php" class="w3-button w3-blue w3-margin-right">Zurück zur Website</a>
    <button id="logoutBtn" class="w3-button w3-red">Abmelden</button>
  </div>

  <!-- Statusmeldung -->
  <div id="statusMsg" class="status-msg"></div>

  <!-- Login-Formular -->
  <div id="loginDiv" class="w3-card w3-padding" style="max-width: 400px; margin: 50px auto;">
    <h3>Anmelden</h3>
    <input id="emailField" class="w3-input w3-margin-bottom" type="email" placeholder="Email" />
    <input id="passField" class="w3-input w3-margin-bottom" type="password" placeholder="Passwort" />
    <button id="loginBtn" class="w3-button w3-black w3-block">Login</button>
    <p id="loginError" class="w3-text-red"></p>
  </div>

  <!-- Admin-Panel Inhalte (nur für angemeldete Nutzer sichtbar) -->
  <div id="adminDiv" class="w3-container" style="max-width: 1000px; margin: 20px auto; display: none;">
    
    <!-- Tabs für verschiedene Sektionen -->
    <div class="tabs">
      <button class="tab-btn active" data-tab="content">Inhalte</button>
      <button class="tab-btn" data-tab="pages">Seiten</button>
      <button class="tab-btn" data-tab="wordcloud">Wortwolke</button>
      <button class="tab-btn" data-tab="preview">Vorschau</button>
    </div>
    
    <!-- Tab: Inhalte -->
    <div id="content-tab" class="tab-content active">
      <!-- Abschnitt "Über mich" -->
      <h3>Über mich</h3>
      <label for="aboutTitle">Titel:</label>
      <input id="aboutTitle" type="text" class="w3-input w3-margin-bottom" />
      <label for="aboutSubtitle">Untertitel:</label>
      <input id="aboutSubtitle" type="text" class="w3-input w3-margin-bottom" />
      <label for="aboutText">Beschreibung:</label>
      <textarea id="aboutText" class="tinymce-editor w3-margin-bottom" rows="5"></textarea>

      <div class="section-divider"></div>

      <!-- Abschnitt "Angebote/Portfolio" -->
      <h3>Meine Angebote</h3>
      <label for="offeringsTitle">Bereich-Titel:</label>
      <input id="offeringsTitle" type="text" class="w3-input w3-margin-bottom" />
      <label for="offeringsSubtitle">Bereich-Untertitel:</label>
      <input id="offeringsSubtitle" type="text" class="w3-input w3-margin-bottom" />
      
      <!-- Angebot 1 -->
      <div class="w3-card w3-padding w3-margin-bottom">
        <p><strong>Angebot 1:</strong></p>
        <label for="offer1Title">Titel:</label>
        <input id="offer1Title" type="text" class="w3-input w3-margin-bottom" />
        <label for="offer1Desc">Beschreibung:</label>
        <textarea id="offer1Desc" class="tinymce-editor w3-margin-bottom" rows="3"></textarea>
        <label>Bild für Angebot 1:</label>
        <div class="w3-row">
          <div class="w3-col m9">
            <div id="offer1ImagePreview" class="w3-margin-bottom" style="max-height: 150px; overflow: hidden;">
              <img id="offer1Img" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
            </div>
          </div>
          <div class="w3-col m3 w3-padding-small">
            <button id="offer1UploadBtn" class="w3-button w3-blue w3-block">Bild auswählen</button>
          </div>
        </div>
      </div>
      
      <!-- Angebot 2 -->
      <div class="w3-card w3-padding w3-margin-bottom">
        <p><strong>Angebot 2:</strong></p>
        <label for="offer2Title">Titel:</label>
        <input id="offer2Title" type="text" class="w3-input w3-margin-bottom" />
        <label for="offer2Desc">Beschreibung:</label>
        <textarea id="offer2Desc" class="tinymce-editor w3-margin-bottom" rows="3"></textarea>
        <label>Bild für Angebot 2:</label>
        <div class="w3-row">
          <div class="w3-col m9">
            <div id="offer2ImagePreview" class="w3-margin-bottom" style="max-height: 150px; overflow: hidden;">
              <img id="offer2Img" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
            </div>
          </div>
          <div class="w3-col m3 w3-padding-small">
            <button id="offer2UploadBtn" class="w3-button w3-blue w3-block">Bild auswählen</button>
          </div>
        </div>
      </div>
      
      <!-- Angebot 3 -->
      <div class="w3-card w3-padding w3-margin-bottom">
        <p><strong>Angebot 3:</strong></p>
        <label for="offer3Title">Titel:</label>
        <input id="offer3Title" type="text" class="w3-input w3-margin-bottom" />
        <label for="offer3Desc">Beschreibung:</label>
        <textarea id="offer3Desc" class="tinymce-editor w3-margin-bottom" rows="3"></textarea>
        <label>Bild für Angebot 3:</label>
        <div class="w3-row">
          <div class="w3-col m9">
            <div id="offer3ImagePreview" class="w3-margin-bottom" style="max-height: 150px; overflow: hidden;">
              <img id="offer3Img" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
            </div>
          </div>
          <div class="w3-col m3 w3-padding-small">
            <button id="offer3UploadBtn" class="w3-button w3-blue w3-block">Bild auswählen</button>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Abschnitt "Kontakt" -->
      <h3>Kontakt</h3>
      <label for="contactTitle">Titel:</label>
      <input id="contactTitle" type="text" class="w3-input w3-margin-bottom" />
      <label for="contactSubtitle">Untertitel/Notiz:</label>
      <input id="contactSubtitle" type="text" class="w3-input w3-margin-bottom" />
      <label>Bild für Kontaktbereich (z.B. Karte):</label>
      <div class="w3-row">
        <div class="w3-col m9">
          <div id="contactImagePreview" class="w3-margin-bottom" style="max-height: 150px; overflow: hidden;">
            <img id="contactImg" src="/api/placeholder/400/300" style="max-width: 100%; display: none;" />
          </div>
        </div>
        <div class="w3-col m3 w3-padding-small">
          <button id="contactUploadBtn" class="w3-button w3-blue w3-block">Bild auswählen</button>
        </div>
      </div>

      <!-- Speichern-Button - Sticky am unteren Rand -->
      <div class="action-buttons">
        <button id="saveDraftBtn" class="w3-button w3-yellow w3-margin-right">
          <i class="fas fa-save"></i> Als Entwurf speichern
        </button>
        <button id="publishBtn" class="w3-button w3-green">
          <i class="fas fa-globe"></i> Veröffentlichen
        </button>
      </div>
    </div>
    
    <!-- Tab: Seiten -->
    <div id="pages-tab" class="tab-content">
      <h3>Seiten verwalten</h3>
      <div class="w3-panel w3-pale-yellow">
  <p>
    <i class="fas fa-wrench"></i> 
    <strong>Admin-Panel-Funktionalität:</strong>
    Wenn Seiten nicht korrekt angezeigt werden, klicke auf
    <button onclick="window.fixAdminPanel()" class="w3-button w3-yellow">Admin-Panel reparieren</button>
  </p>
</div>
      <script>
// DOM-Struktur erzwingen
document.addEventListener('DOMContentLoaded', function() {
  const pagesTab = document.getElementById('pages-tab');
  if (pagesTab) {
    // Prüfen, ob der Container existiert
    let pagesListContainer = document.getElementById('pagesListContainer');
    if (!pagesListContainer) {
      console.log("pagesListContainer nicht gefunden, erstelle ihn");
      pagesListContainer = document.createElement('div');
      pagesListContainer.id = 'pagesListContainer';
      pagesListContainer.className = 'w3-margin-bottom';
      pagesTab.appendChild(pagesListContainer);
    }
    
    // Prüfen, ob die Liste existiert
    let pagesList = document.getElementById('pagesList');
    if (!pagesList) {
      console.log("pagesList nicht gefunden, erstelle ihn");
      pagesList = document.createElement('div');
      pagesList.id = 'pagesList';
      pagesList.className = 'w3-container';
      pagesListContainer.appendChild(pagesList);
      
      // Nachricht hinzufügen
      const noPages = document.createElement('p');
      noPages.id = 'noPagesMessage';
      noPages.className = 'w3-text-grey';
      noPages.textContent = 'Noch keine Seiten erstellt.';
      pagesList.appendChild(noPages);
    }
    
    console.log("DOM-Struktur überprüft und repariert");
  }
});
</script>
        <!-- Füge direkt NACH dieser Zeile ein: -->
  <button onclick="forceShowPages()" style="background-color: red; color: white; padding: 10px; margin: 10px;">
    Seiten direkt anzeigen
  </button>

  <script>
  function forceShowPages() {
    const db = firebase.firestore();
    const pagesList = document.getElementById('pagesList');
    
    // Ladeanimation anzeigen
    pagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Lade Seiten direkt...</p>';
    
    // Direkt aus Firebase laden
    db.collection('pages').get().then(snapshot => {
      pagesList.innerHTML = '';
      
      if (snapshot.empty) {
        pagesList.innerHTML = '<p>Keine Seiten gefunden</p>';
        return;
      }
      
      snapshot.forEach(doc => {
        const pageData = doc.data();
        const pageId = doc.id;
        
        // Einfaches Listenelement erstellen
        const item = document.createElement('div');
        item.style.border = '1px solid #ddd';
        item.style.padding = '10px';
        item.style.margin = '10px 0';
        item.innerHTML = `
          <strong>${pageData.title}</strong>
          <p>ID: ${pageId}</p>
          <a href="page.php?id=${pageId}" target="_blank" class="w3-button w3-blue">Ansehen</a>
        `;
        
        pagesList.appendChild(item);
      });
      
      console.log(`${snapshot.size} Seiten direkt angezeigt`);
    }).catch(error => {
      console.error("Fehler beim Laden der Seiten:", error);
      pagesList.innerHTML = `<p style="color:red">Fehler: ${error.message}</p>`;
    });
  }
  </script>

  <div id="pagesListContainer" class="w3-margin-bottom">
      <div class="w3-margin-bottom">
        <button id="createPageBtn" class="w3-button w3-blue">
          <i class="fas fa-plus"></i> Neue Seite erstellen
        </button>
      </div>
      
      <div id="pagesListContainer" class="w3-margin-bottom">
        <div class="w3-card w3-padding w3-margin-bottom">
          <h4>Bestehende Seiten</h4>
          <div id="pagesList" class="w3-container">
            <!-- Hier werden die Seiten dynamisch eingefügt -->
            <p class="w3-text-grey" id="noPagesMessage">Noch keine Seiten erstellt.</p>
          </div>
        </div>
      </div>
      
      <!-- Formular für neue Seite (standardmäßig ausgeblendet) -->
      <div id="newPageForm" class="w3-card w3-padding w3-margin-bottom" style="display: none;">
        <h4>Neue Seite erstellen</h4>
        
        <div class="w3-section">
          <label for="pageName">Seitenname:</label>
          <input id="pageName" type="text" class="w3-input w3-margin-bottom" placeholder="z.B. ueber-mich, angebote, kontakt" />
          
          <label for="pageTitle">Seitentitel:</label>
          <input id="pageTitle" type="text" class="w3-input w3-margin-bottom" placeholder="Wird im Browser-Tab angezeigt" />
          
          <label for="pageTemplate">Template auswählen:</label>
          <select id="pageTemplate" class="w3-select w3-margin-bottom">
            <option value="basic">Basis-Template (Titel + Text)</option>
            <option value="text-image">Text mit Bild (rechts)</option>
            <option value="image-text">Bild (links) mit Text</option>
            <option value="gallery">Galerie-Template</option>
            <option value="contact">Kontakt-Template</option>
          </select>
          
          <div id="templatePreview" class="w3-margin-bottom w3-padding w3-light-grey">
            <p>Vorschau des gewählten Templates wird hier angezeigt...</p>
          </div>
        </div>
        
        <div class="w3-row">
          <div class="w3-col m6">
            <button id="cancelNewPageBtn" class="w3-button w3-red w3-margin-right">
              <i class="fas fa-times"></i> Abbrechen
            </button>
          </div>
          <div class="w3-col m6 w3-right-align">
            <button id="createNewPageBtn" class="w3-button w3-green">
              <i class="fas fa-check"></i> Seite erstellen
            </button>
          </div>
        </div>
      </div>
      
      <!-- Seitenbearbeitung (standardmäßig ausgeblendet) -->
      <div id="editPageForm" class="w3-card w3-padding w3-margin-bottom" style="display: none;">
        <h4>Seite bearbeiten: <span id="editPageTitle">Seitentitel</span></h4>
        
        <div id="templateFields" class="w3-section">
          <!-- Diese Felder werden je nach Template dynamisch erzeugt -->
        </div>
        
        <div class="w3-row">
          <div class="w3-col m6">
            <button id="backToListBtn" class="w3-button w3-amber w3-margin-right">
              <i class="fas fa-arrow-left"></i> Zurück zur Liste
            </button>
          </div>
          <div class="w3-col m6 w3-right-align">
            <button id="deletePageBtn" class="w3-button w3-red w3-margin-right">
              <i class="fas fa-trash"></i> Löschen
            </button>
            <button id="savePageBtn" class="w3-button w3-green">
              <i class="fas fa-save"></i> Speichern
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Wortwolke -->
    <div id="wordcloud-tab" class="tab-content">
      <h3>Wortwolke bearbeiten</h3>
      <p>Hier kannst du die Wörter in der Wortwolke anpassen. Die Gewichtung (1-9) bestimmt die Größe der Wörter.</p>
      
      <div id="wordCloudContainer" class="word-cloud-admin">
        <!-- Hier werden dynamisch Word-Items eingefügt -->
      </div>
      
      <button id="addWordBtn" class="w3-button w3-blue">
        <i class="fas fa-plus"></i> Neues Wort hinzufügen
      </button>
      
      <div class="action-buttons">
        <button id="saveWordCloudBtn" class="w3-button w3-green">
          <i class="fas fa-save"></i> Wortwolke speichern
        </button>
      </div>
    </div>
    
    <!-- Tab: Vorschau -->
    <div id="preview-tab" class="tab-content">
      <div class="w3-margin-bottom">
        <label><input type="radio" name="previewType" value="draft" checked> Entwurf</label>
        <label class="w3-margin-left"><input type="radio" name="previewType" value="live"> Live-Website</label>
        <button id="refreshPreviewBtn" class="w3-button w3-blue w3-right">
          <i class="fas fa-sync-alt"></i> Aktualisieren
        </button>
      </div>
      <iframe id="previewFrame" class="preview-frame" src="preview.html?draft=true"></iframe>
    </div>
  </div>

  <!-- Firebase Initialisierung -->
  <script>
    // Einmalige Initialisierung von Firebase
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
        authDomain: "mannar-129a5.firebaseapp.com",
        projectId: "mannar-129a5",
        storageBucket: "mannar-129a5.firebasestorage.app",
        messagingSenderId: "687710492532",
        appId: "1:687710492532:web:c7b675da541271f8d83e21",
        measurementId: "G-NXBLYJ5CXL"
      });
    }
    window.fixAdminPanel = function() {
  console.log("Repariere Admin-Panel...");
  
  // Die ursprüngliche loadPages-Funktion überschreiben
  window.originalLoadPages = loadPages; // Original-Funktion sichern
  
  // Mit der funktionierenden Version ersetzen
  loadPages = function() {
    console.log("Verwende verbesserte loadPages-Funktion");
    
    // Tab aktivieren
    const pagesTab = document.getElementById('pages-tab');
    const pagesButton = document.querySelector('.tab-btn[data-tab="pages"]');
    
    if (pagesTab && pagesButton) {
      // Alle Tabs deaktivieren
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
      });
      
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Seiten-Tab aktivieren
      pagesTab.style.display = 'block';
      pagesTab.classList.add('active');
      pagesButton.classList.add('active');
    }
    
    // Showtime - Gleiche Logik wie der erfolgreiche Notfallbutton
    const db = firebase.firestore();
    
    // Container und Liste sicherstellen
    let pagesListContainer = document.getElementById('pagesListContainer');
    if (!pagesListContainer) {
      pagesListContainer = document.createElement('div');
      pagesListContainer.id = 'pagesListContainer';
      pagesListContainer.className = 'w3-margin-bottom';
      pagesTab.appendChild(pagesListContainer);
    }
    
    let pagesList = document.getElementById('pagesList');
    if (!pagesList) {
      pagesList = document.createElement('div');
      pagesList.id = 'pagesList';
      pagesList.className = 'w3-container';
      pagesListContainer.appendChild(pagesList);
    }
    
    // UI-Feedback zeigen
    pagesList.innerHTML = '<p class="w3-center"><i class="fas fa-spinner fa-spin"></i> Lade Seiten aus Firebase...</p>';
    
    // Seiten aus Firestore laden
    db.collection('pages').get().then(snapshot => {
      console.log("Firebase-Antwort erhalten:", snapshot.size, "Dokumente");
      pagesList.innerHTML = ''; // Liste leeren
      
      if (snapshot.empty) {
        pagesList.innerHTML = '<p class="w3-text-grey" id="noPagesMessage">Noch keine Seiten erstellt.</p>';
        return;
      }
      
      // Zurücksetzen der Seiten-Liste
      currentPages = {};
      
      // Seiten zum Objekt hinzufügen und anzeigen
      snapshot.forEach(doc => {
        const pageData = doc.data();
        const pageId = doc.id;
        
        currentPages[pageId] = pageData;
        
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
            if (typeof editPage === 'function') {
              editPage(pageId);
            } else {
              alert("Bearbeiten-Funktion nicht gefunden!");
            }
          });
        }
      });
      
      console.log("Seiten wurden erfolgreich geladen und angezeigt");
      
    }).catch(error => {
      console.error("Fehler beim Laden der Seiten:", error);
      pagesList.innerHTML = `<p class="w3-text-red w3-center">Fehler beim Laden: ${error.message}</p>`;
    });
  };
  
  // Aktualisiere die Seiten, wenn eine aktive Anmeldung vorliegt
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // Lade Seiten nach einer kurzen Verzögerung
      setTimeout(loadPages, 500);
    }
  });
  
  console.log("Admin-Panel-Reparatur abgeschlossen");
  
  // Status-Meldung anzeigen
  if (typeof showStatus === 'function') {
    showStatus("Admin-Panel-Funktionen wurden aktualisiert");
  }
  
  return "Admin-Panel-Funktionen wurden erfolgreich aktualisiert!";
};

// Automatisch die Reparatur ausführen
setTimeout(function() {
  window.fixAdminPanel();
}, 1000);
  </script>
  
  <!-- Skripte am Ende des Body-Tags -->
  <script src="./assets/js/navbar.js"></script>
  <script src="./assets/js/admin-panel.js"></script>
  <script>
// Einfache und robuste Funktion zum Anzeigen von Seiten
function showAllPages() {
  const db = firebase.firestore();
  
  // Container erstellen falls nicht vorhanden
  let container = document.getElementById('pagesListContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pagesListContainer';
    container.style.margin = '20px';
    container.style.padding = '20px';
    container.style.border = '3px solid blue';
    document.body.appendChild(container);
  }
  
  // Liste erstellen falls nicht vorhanden
  let list = document.getElementById('pagesList');
  if (!list) {
    list = document.createElement('div');
    list.id = 'pagesList';
    list.style.border = '3px solid green';
    list.style.padding = '10px';
    container.appendChild(list);
  }
  
  // Ladeinfo zeigen
  list.innerHTML = '<p style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Seiten werden geladen...</p>';
  
  // Seiten aus Firebase laden
  db.collection('pages').get().then(snapshot => {
    if (snapshot.empty) {
      list.innerHTML = '<p>Keine Seiten gefunden</p>';
      return;
    }
    
    list.innerHTML = ''; // Liste leeren
    snapshot.docs.forEach(doc => {
      const pageData = doc.data();
      const pageId = doc.id;
      
      const item = document.createElement('div');
      item.style.border = '1px solid #ddd';
      item.style.padding = '10px';
      item.style.margin = '10px 0';
      item.style.backgroundColor = '#f9f9f9';
      item.innerHTML = `
        <h4>${pageData.title}</h4>
        <p>ID: ${pageId} | Template: ${pageData.template}</p>
        <div>
          <a href="page.php?id=${pageId}" target="_blank" class="w3-button w3-blue w3-margin-right">Ansehen</a>
          <button class="w3-button w3-green edit-btn">Bearbeiten</button>
        </div>
      `;
      
      list.appendChild(item);
      
      // Event-Listener direkt hinzufügen
      const editBtn = item.querySelector('.edit-btn');
      editBtn.addEventListener('click', function() {
        alert('Seite bearbeiten: ' + pageId);
      });
    });
    
    console.log(`${snapshot.size} Seiten erfolgreich angezeigt!`);
  }).catch(error => {
    list.innerHTML = `<p style="color:red;font-weight:bold;">Fehler: ${error.message}</p>`;
    console.error('Fehler beim Laden der Seiten:', error);
  });
}

// "Notfall"-Button hinzufügen
const emergencyBtn = document.createElement('button');
emergencyBtn.innerHTML = 'NOTFALL: Seiten direkt anzeigen';
emergencyBtn.style.position = 'fixed';
emergencyBtn.style.bottom = '20px';
emergencyBtn.style.right = '20px';
emergencyBtn.style.zIndex = '9999';
emergencyBtn.style.backgroundColor = '#ff0000';
emergencyBtn.style.color = '#ffffff';
emergencyBtn.style.padding = '15px';
emergencyBtn.style.borderRadius = '5px';
emergencyBtn.style.fontWeight = 'bold';
emergencyBtn.onclick = showAllPages;
document.body.appendChild(emergencyBtn);
</script>
</body>
</html>