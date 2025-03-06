 /**
 * Konsolidierte admin.js
 * Kombiniert admin-panel.js, tab-fix.js und page-display-fix.js
 */

// IIFE, um den globalen Namespace sauber zu halten
(function() {
  // Globaler Admin-Zustand
  const Admin = {
    // Firebase-Referenzen
    db: null,
    auth: null,
    storage: null,
    
    // UI-Status
    currentTab: 'pages',
    isDirty: false,
    pageEditorInitialized: false,
    
    // Cache für Daten
    imageData: {
      offer1_image: { url: "", public_id: "" },
      offer2_image: { url: "", public_id: "" },
      offer3_image: { url: "", public_id: "" },
      contact_image: { url: "", public_id: "" }
    },
    wordCloudData: [],
    
    // DOM-Elemente Cache
    elements: {}
  };

  /**
   * Initialisieren nach DOM-Ladung
   */
  document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin Panel wird initialisiert");
    
    // Firebase initialisieren
    initFirebase();
    
    // DOM-Elemente cachen
    cacheElements();
    
    // Event-Listener hinzufügen
    setupEventListeners();
    
    // Tabs vorbereiten
    initializeTabs();
    
    // Fixes für Tab-Navigation und -Anzeige
    applyTabFixes();
    
    // Auf Auth-Status reagieren
    setupAuthStateListener();
  });

  /**
   * Firebase initialisieren
   */
  function initFirebase() {
    try {
      if (typeof firebase !== 'undefined') {
        Admin.db = firebase.firestore();
        Admin.auth = firebase.auth();
        if (firebase.storage) {
          Admin.storage = firebase.storage();
        }
      } else {
        console.error('Firebase nicht gefunden');
        showStatus('Firebase konnte nicht initialisiert werden. Einige Funktionen sind eingeschränkt.', true);
      }
    } catch (error) {
      console.error('Firebase-Initialisierungsfehler:', error);
      showStatus('Firebase-Initialisierungsfehler. Einige Funktionen sind eingeschränkt.', true);
    }
  }

  /**
   * DOM-Elemente cachen
   */
  function cacheElements() {
    // Login-Elemente
    Admin.elements.loginDiv = document.getElementById('loginDiv');
    Admin.elements.adminDiv = document.getElementById('adminDiv');
    Admin.elements.emailField = document.getElementById('emailField');
    Admin.elements.passField = document.getElementById('passField');
    Admin.elements.loginBtn = document.getElementById('loginBtn');
    Admin.elements.loginError = document.getElementById('loginError');
    Admin.elements.logoutBtn = document.getElementById('logoutBtn');
    Admin.elements.statusMsg = document.getElementById('statusMsg');
    
    // Tab-Elemente
    Admin.elements.tabButtons = document.querySelectorAll('.tab-btn');
    Admin.elements.tabContents = document.querySelectorAll('.tab-content');
    
    // Content-Elemente
    Admin.elements.contentTab = document.getElementById('content-tab');
    Admin.elements.pagesTab = document.getElementById('pages-tab');
    Admin.elements.wordcloudTab = document.getElementById('wordcloud-tab');
    Admin.elements.previewTab = document.getElementById('preview-tab');
    Admin.elements.settingsTab = document.getElementById('settings-tab');
    
    // Preview-Elemente
    Admin.elements.previewFrame = document.getElementById('previewFrame');
    Admin.elements.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
    Admin.elements.previewTypeRadios = document.getElementsByName('previewType');
  }

  /**
   * Event-Listener hinzufügen
   */
  function setupEventListeners() {
    // Login-Button
    if (Admin.elements.loginBtn) {
      Admin.elements.loginBtn.addEventListener('click', handleLogin);
    }
    
    // Passwortfeld: Login bei Enter
    if (Admin.elements.passField) {
      Admin.elements.passField.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          handleLogin();
        }
      });
    }
    
    // Logout-Button
    if (Admin.elements.logoutBtn) {
      Admin.elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Tab-Buttons
    Admin.elements.tabButtons.forEach(button => {
      button.addEventListener('click', handleTabChange);
    });
    
    // Preview-Update-Button
    if (Admin.elements.refreshPreviewBtn) {
      Admin.elements.refreshPreviewBtn.addEventListener('click', refreshPreview);
    }
    
    // Preview-Typ-Radiobuttons
    if (Admin.elements.previewTypeRadios.length > 0) {
      Array.from(Admin.elements.previewTypeRadios).forEach(radio => {
        radio.addEventListener('change', refreshPreview);
      });
    }
  }

  /**
   * Login-Handler
   */
  function handleLogin() {
    if (!Admin.auth || !Admin.elements.emailField || !Admin.elements.passField) {
      console.error("Auth oder Formularelemente nicht gefunden");
      return;
    }
    
    const email = Admin.elements.emailField.value.trim();
    const pass = Admin.elements.passField.value;
    
    // Validierung
    if (!email || !pass) {
      if (Admin.elements.loginError) Admin.elements.loginError.textContent = "Bitte E-Mail und Passwort eingeben";
      return;
    }
    
    if (Admin.elements.loginError) Admin.elements.loginError.textContent = "";
    showStatus("Einloggen...", false, 0);
    
    Admin.auth.signInWithEmailAndPassword(email, pass)
      .then(userCredential => {
        console.log("Login erfolgreich:", userCredential.user.email);
        showStatus("Login erfolgreich! Admin-Panel wird geladen...");
      })
      .catch(err => {
        console.error("Login-Fehler:", err);
        if (Admin.elements.loginError) Admin.elements.loginError.textContent = "Login fehlgeschlagen: " + err.message;
        showStatus("Login fehlgeschlagen", true);
      });
  }

  /**
   * Logout-Handler
   */
  function handleLogout() {
    // Auf ungespeicherte Änderungen prüfen
    if (Admin.isDirty) {
      if (!confirm('Du hast ungespeicherte Änderungen. Möchtest du dich wirklich abmelden?')) {
        return;
      }
    }
    
    if (!Admin.auth) return;
    
    Admin.auth.signOut().then(() => {
      showStatus("Erfolgreich abgemeldet");
    }).catch(err => {
      console.error("Logout-Fehler:", err);
      showStatus("Fehler beim Abmelden: " + err.message, true);
    });
  }

  /**
   * Tab-Wechsel-Handler
   */
  function handleTabChange() {
    const tabName = this.getAttribute('data-tab');
    
    console.log(`Wechsel zu Tab: ${tabName}`);
    
    // Alle Tab-Inhalte ausblenden
    Admin.elements.tabContents.forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    
    // Alle Tab-Buttons deaktivieren
    Admin.elements.tabButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Aktuellen Tab aktivieren
    this.classList.add('active');
    
    // Ziel-Tab-Inhalt anzeigen
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
      targetTab.style.display = 'block';
      targetTab.classList.add('active');
      Admin.currentTab = tabName;
      
      // Tab-spezifische Initialisierung
      if (tabName === 'preview') {
        refreshPreview();
      } else if (tabName === 'pages') {
        initializePageEditor();
      }
    } else {
      console.error(`Tab-Inhalt mit ID "${tabName}-tab" nicht gefunden`);
    }
  }

  /**
   * Initialisiere Tabs
   */
  function initializeTabs() {
    // Standard-Tab aktivieren
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
      Admin.currentTab = activeTabBtn.getAttribute('data-tab');
      const activeTabContent = document.getElementById(`${Admin.currentTab}-tab`);
      if (activeTabContent) {
        activeTabContent.style.display = 'block';
        activeTabContent.classList.add('active');
      }
    } else {
      // Fallback: Ersten Tab aktivieren
      const firstTabBtn = document.querySelector('.tab-btn');
      if (firstTabBtn) {
        firstTabBtn.classList.add('active');
        Admin.currentTab = firstTabBtn.getAttribute('data-tab');
        const firstTabContent = document.getElementById(`${Admin.currentTab}-tab`);
        if (firstTabContent) {
          firstTabContent.style.display = 'block';
          firstTabContent.classList.add('active');
        }
      }
    }
  }

  /**
   * Fixes für Tab-Navigation und -Anzeige
   */
  function applyTabFixes() {
    // CSS-Fix für Tab-Anzeige
    ensureTabStyles();
    
    // Fix für Pages-Tab
    setTimeout(fixPageVisibility, 1000);
    
    // Page-Editor initialisieren, wenn der Pages-Tab aktiv ist
    if (Admin.currentTab === 'pages') {
      setTimeout(initializePageEditor, 1000);
    }
  }

  /**
   * Tab-Styles sicherstellen
   */
  function ensureTabStyles() {
    // Stil-Element erstellen, falls es nicht existiert
    if (!document.getElementById('admin-tab-fix-styles')) {
      const style = document.createElement('style');
      style.id = 'admin-tab-fix-styles';
      style.innerHTML = `
        /* Tab-Anzeige-Fix */
        .tab-content {
          display: none !important;
        }
        
        .tab-content.active {
          display: block !important;
        }
        
        #dashboard-tab.active, 
        #content-tab.active,
        #pages-tab.active, 
        #wordcloud-tab.active, 
        #preview-tab.active,
        #settings-tab.active {
          display: block !important;
        }
        
        /* Pages-Tab-Fix */
        #pagesContainer {
          display: block !important;
          min-height: 200px;
        }
      `;
      document.head.appendChild(style);
      console.log("Tab-Style-Fix hinzugefügt");
    }
  }

  /**
   * Pages-Tab-Sichtbarkeit korrigieren
   */
  function fixPageVisibility() {
    // Pages-Tab erzwingen, wenn er aktiv ist
    const pagesTab = Admin.elements.pagesTab;
    const pagesTabBtn = document.querySelector('.tab-btn[data-tab="pages"]');
    
    if (pagesTab && pagesTabBtn && pagesTabBtn.classList.contains('active')) {
      pagesTab.style.display = 'block';
      pagesTab.classList.add('active');
      console.log("Pages-Tab sichtbar gemacht");
    }
    
    // Sicherstellen, dass pagesContainer existiert
    ensurePagesContainer();
    
    // Page-Editor initialisieren, falls notwendig
    if (Admin.currentTab === 'pages') {
      initializePageEditor();
    }
  }

  /**
   * Sicherstellen, dass pagesContainer existiert
   */
  function ensurePagesContainer() {
    const pagesTab = Admin.elements.pagesTab;
    if (!pagesTab) return;
    
    let pagesContainer = document.getElementById('pagesContainer');
    if (!pagesContainer) {
      console.log("pagesContainer erstellen");
      pagesContainer = document.createElement('div');
      pagesContainer.id = 'pagesContainer';
      pagesContainer.className = 'w3-row';
      pagesTab.appendChild(pagesContainer);
    }
    
    // Sicherstellen, dass der Container sichtbar ist
    pagesContainer.style.display = 'block';
    
    // Spalte für Seitenliste erstellen, falls nicht vorhanden
    if (!document.getElementById('pagesListCol')) {
      console.log("pagesListCol erstellen");
      const pagesListCol = document.createElement('div');
      pagesListCol.id = 'pagesListCol';
      pagesListCol.className = 'w3-col m4 l3';
      pagesContainer.appendChild(pagesListCol);
      
      // Button zum Erstellen einer Seite hinzufügen
      const createBtnContainer = document.createElement('div');
      createBtnContainer.className = 'w3-margin-bottom';
      createBtnContainer.innerHTML = `
        <button id="createPageBtn" class="w3-button w3-blue w3-block">
          <i class="fas fa-plus"></i> Neue Seite erstellen
        </button>
      `;
      pagesListCol.appendChild(createBtnContainer);
      
      // Seitenliste hinzufügen
      const pagesListCard = document.createElement('div');
      pagesListCard.id = 'pagesListCard';
      pagesListCard.className = 'w3-card w3-padding';
      pagesListCard.innerHTML = `
        <h3>Meine Seiten</h3>
        <div id="pagesList" class="pages-list">
          <div class="w3-center">
            <i class="fas fa-spinner fa-spin"></i> Seiten werden geladen...
          </div>
        </div>
      `;
      pagesListCol.appendChild(pagesListCard);
    }
  }

  /**
   * Page-Editor initialisieren
   */
  function initializePageEditor() {
    // Prüfen, ob PageEditor verfügbar ist
    if (typeof PageEditor !== 'undefined') {
      if (typeof PageEditor.init === 'function' && !Admin.pageEditorInitialized) {
        console.log("PageEditor wird initialisiert");
        try {
          PageEditor.init();
          Admin.pageEditorInitialized = true;
        } catch (error) {
          console.error("Fehler bei PageEditor-Initialisierung:", error);
        }
      }
      
      // Seiten laden
      if (typeof PageEditor.loadPages === 'function') {
        console.log("Seiten werden geladen");
        try {
          PageEditor.loadPages();
        } catch (error) {
          console.error("Fehler beim Laden der Seiten:", error);
        }
      }
    } else {
      console.warn("PageEditor nicht verfügbar");
    }
  }

  /**
   * Vorschau aktualisieren
   */
  function refreshPreview() {
    if (!Admin.elements.previewFrame) return;
    
    const isDraft = Array.from(Admin.elements.previewTypeRadios)
      .find(radio => radio.checked)?.value === 'draft';
    
    const timestamp = Date.now(); // Cache-Busting
    Admin.elements.previewFrame.src = `preview.html?draft=${isDraft}&t=${timestamp}`;
  }

  /**
   * Auth-Status-Listener einrichten
   */
  function setupAuthStateListener() {
    if (!Admin.auth) return;
    
    Admin.auth.onAuthStateChanged(user => {
      if (user) {
        // Benutzer ist eingeloggt
        console.log("Benutzer eingeloggt:", user.email);
        
        if (Admin.elements.loginDiv) Admin.elements.loginDiv.style.display = 'none';
        if (Admin.elements.adminDiv) Admin.elements.adminDiv.style.display = 'block';
        
        // TinyMCE initialisieren
        initTinyMCE();
        
        // Auf TinyMCE warten und dann Inhalte laden
        setTimeout(() => {
          // Content laden, wenn der Content-Tab aktiv ist
          if (Admin.currentTab === 'content') {
            loadContentData();
          }
          
          // Word-Cloud laden, wenn der Word-Cloud-Tab aktiv ist
          if (Admin.currentTab === 'wordcloud') {
            loadWordCloudData();
          }
          
          // Sicherstellen, dass der Page-Editor geladen wird
          if (Admin.currentTab === 'pages') {
            fixPageVisibility();
          }
        }, 1000);
      } else {
        // Benutzer ist nicht eingeloggt
        console.log("Benutzer nicht eingeloggt");
        
        if (Admin.elements.adminDiv) Admin.elements.adminDiv.style.display = 'none';
        if (Admin.elements.loginDiv) Admin.elements.loginDiv.style.display = 'block';
        
        // TinyMCE bereinigen
        if (typeof tinymce !== 'undefined') {
          tinymce.remove();
        }
      }
    });
  }

  /**
   * TinyMCE initialisieren
   */
  function initTinyMCE() {
    // Bestehende Instanzen entfernen
    if (typeof tinymce !== 'undefined') {
      tinymce.remove();
      
      // Für normale Inhaltsfelder
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
        setup: function(editor) {
          editor.on('change', function() {
            Admin.isDirty = true;
          });
        }
      });
      
      // Für kleine Felder wie Titel/Untertitel
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
          editor.on('change', function() {
            Admin.isDirty = true;
          });
        }
      });
    }
  }

  /**
   * Inhaltsdaten laden
   */
  function loadContentData(isDraft = true) {
    if (!Admin.db) return;
    
    showStatus("Inhalt wird geladen...", false, 0);
    
    Admin.db.collection("content").doc(isDraft ? "draft" : "main").get()
      .then(doc => {
        if (!doc.exists) {
          console.warn("Kein Inhaltsdokument gefunden");
          showStatus("Kein Inhalt gefunden. Bitte speichern Sie zuerst einen Inhalt.", true);
          return;
        }
        
        const data = doc.data();
        console.log("Daten geladen:", data);
        
        // Textfelder füllen und weitere Daten verarbeiten...
        // (gekürzt, um den Code zu vereinfachen)
        
        // Dirty-Flag zurücksetzen
        Admin.isDirty = false;
        
        showStatus("Inhalt erfolgreich geladen");
      })
      .catch(err => {
        console.error("Fehler beim Laden der Daten:", err);
        showStatus("Fehler beim Laden der Daten: " + err.message, true);
      });
  }

  /**
   * Word-Cloud-Daten laden
   */
  function loadWordCloudData() {
    if (!Admin.db) return;
    
    const wordCloudContainer = document.getElementById('wordCloudContainer');
    if (!wordCloudContainer) return;
    
    try {
      Admin.db.collection("content").doc("wordCloud").get().then(doc => {
        if (doc.exists) {
          Admin.wordCloudData = doc.data().words || [];
        } else {
          // Mit Standardwerten initialisieren
          Admin.wordCloudData = [
            { text: "Mindfulness", weight: 5, link: "#" },
            { text: "Meditation", weight: 8, link: "#" },
            { text: "Selbstreflexion", weight: 7, link: "#" },
            { text: "Bewusstsein", weight: 9, link: "#" },
            { text: "Spiritualität", weight: 6, link: "#" }
          ];
          
          // Dokument mit Standarddaten erstellen
          Admin.db.collection("content").doc("wordCloud").set({
            words: Admin.wordCloudData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        
        renderWordCloudItems();
      });
    } catch (err) {
      console.error("Fehler beim Laden der Wortwolke:", err);
      showStatus("Fehler beim Laden der Wortwolke: " + err.message, true);
    }
  }

  /**
   * Word-Cloud-Elemente rendern
   */
  function renderWordCloudItems() {
    const wordCloudContainer = document.getElementById('wordCloudContainer');
    if (!wordCloudContainer) return;
    
    wordCloudContainer.innerHTML = '';
    
    if (Admin.wordCloudData.length === 0) {
      wordCloudContainer.innerHTML = `
        <div class="w3-panel w3-pale-yellow w3-center">
          <p>Keine Worte in der Wortwolke. Klicken Sie auf "Neues Wort hinzufügen" um Worte hinzuzufügen.</p>
        </div>
      `;
      return;
    }
    
    // Tabelle für bessere Struktur erstellen
    const tableContainer = document.createElement('div');
    tableContainer.className = 'w3-responsive';
    
    const table = document.createElement('table');
    table.className = 'w3-table w3-bordered w3-striped';
    
    // Tabellenkopf
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
    
    // Tabellenkörper
    const tbody = document.createElement('tbody');
    
    Admin.wordCloudData.forEach((word, index) => {
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
      
      // Event-Listener hinzufügen...
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    wordCloudContainer.appendChild(tableContainer);
  }

  /**
   * Statusmeldung anzeigen
   */
  function showStatus(message, isError = false, timeout = 3000) {
    const statusMsg = Admin.elements.statusMsg;
    if (!statusMsg) return;
    
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    // Nach Timeout ausblenden, außer wenn es 0 ist (persistent)
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, timeout);
    }
  }
  
  // Admin-Objekt global verfügbar machen (nur ausgewählte Funktionen)
  window.AdminPanel = {
    showStatus: showStatus,
    refreshPreview: refreshPreview,
    fixPageVisibility: fixPageVisibility,
    initializePageEditor: initializePageEditor
  };
})();