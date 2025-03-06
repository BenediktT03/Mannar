 /**
 * Admin Bundle - Konsolidiertes Admin JavaScript
 */

// IIFE zum Vermeiden von globaler Namespace-Verschmutzung
(function() {
  // ===== GEMEINSAMER STATE & HILFSFUNKTIONEN =====
  const Admin = {
    // Firebase-Referenzen
    db: null,
    auth: null,
    storage: null,
    
    // UI-State
    currentTab: 'pages',
    isDirty: false,
    
    // Cache für DOM-Elemente
    elements: {}
  };

  // Status-Nachricht Funktion (gemeinsames Utility)
  function showStatus(message, isError = false, timeout = 3000) {
    const statusMsg = document.getElementById('statusMsg');
    if (!statusMsg) return;
    
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, timeout);
    }
  }

  // Einfache Initialisierungsfunktion zum Testen
  function init() {
    console.log("Admin Bundle wurde initialisiert");
    showStatus("Admin Bundle wurde initialisiert", false, 2000);
  }

})();

// ===== FIREBASE & AUTH =====
function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      Admin.db = firebase.firestore();
      Admin.auth = firebase.auth();
      if (firebase.storage) {
        Admin.storage = firebase.storage();
      }
      console.log("Firebase erfolgreich initialisiert");
      return true;
    } else {
      console.error('Firebase nicht gefunden');
      showStatus('Firebase konnte nicht initialisiert werden. Einige Funktionen werden eingeschränkt sein.', true);
      return false;
    }
  } catch (error) {
    console.error('Firebase Initialisierungsfehler:', error);
    showStatus('Firebase Initialisierungsfehler: ' + error.message, true);
    return false;
  }
}

function handleLogin() {
  const emailField = document.getElementById('emailField');
  const passField = document.getElementById('passField');
  const loginError = document.getElementById('loginError');
  
  if (!Admin.auth || !emailField || !passField) {
    console.error("Auth oder Formularelemente nicht gefunden");
    return;
  }
  
  const email = emailField.value.trim();
  const pass = passField.value;
  
  // Validierung
  if (!email || !pass) {
    if (loginError) loginError.textContent = "Bitte E-Mail und Passwort eingeben";
    return;
  }
  
  if (loginError) loginError.textContent = "";
  showStatus("Anmeldung läuft...", false, 0);
  
  Admin.auth.signInWithEmailAndPassword(email, pass)
    .then(userCredential => {
      console.log("Login erfolgreich:", userCredential.user.email);
      showStatus("Login erfolgreich! Admin Panel wird geladen...");
    })
    .catch(err => {
      console.error("Login Fehler:", err);
      if (loginError) loginError.textContent = "Login fehlgeschlagen: " + err.message;
      showStatus("Login fehlgeschlagen", true);
    });
}

function handleLogout() {
  if (!Admin.auth) return;
  
  Admin.auth.signOut().then(() => {
    showStatus("Erfolgreich abgemeldet");
  }).catch(err => {
    console.error("Logout Fehler:", err);
    showStatus("Fehler beim Abmelden: " + err.message, true);
  });
}

function setupAuthStateListener() {
  if (!Admin.auth) return;
  
  Admin.auth.onAuthStateChanged(user => {
    const loginDiv = document.getElementById('loginDiv');
    const adminDiv = document.getElementById('adminDiv');
    
    if (user) {
      // Benutzer ist angemeldet
      console.log("Benutzer angemeldet:", user.email);
      
      if (loginDiv) loginDiv.style.display = 'none';
      if (adminDiv) adminDiv.style.display = 'block';
      
      // TinyMCE später initialisieren
    } else {
      // Benutzer ist nicht angemeldet
      console.log("Benutzer nicht angemeldet");
      
      if (adminDiv) adminDiv.style.display = 'none';
      if (loginDiv) loginDiv.style.display = 'block';
      
      // TinyMCE aufräumen
      if (typeof tinymce !== 'undefined') {
        tinymce.remove();
      }
    }
  });
}

function init() {
  console.log("Admin Bundle wird initialisiert");
  
  // Firebase initialisieren
  const firebaseInitialized = initFirebase();
  
  // Auth-Listener einrichten
  if (firebaseInitialized) {
    setupAuthStateListener();
  }
  
  // Login/Logout Buttons einrichten
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Enter-Taste beim Passwort
  const passField = document.getElementById('passField');
  if (passField) {
    passField.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
  
  showStatus("Admin Bundle initialisiert", false, 2000);
}



// ===== TAB-NAVIGATION =====
function cacheTabElements() {
  Admin.elements.tabButtons = document.querySelectorAll('.tab-btn');
  Admin.elements.tabContents = document.querySelectorAll('.tab-content');
}

function initializeTabs() {
  // Standard-Tab-Aktivierung
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

function handleTabChange() {
  const tabName = this.getAttribute('data-tab');
  
  console.log(`Wechsle zu Tab: ${tabName}`);
  
  // Verstecke alle Tab-Inhalte
  Admin.elements.tabContents.forEach(content => {
    content.style.display = 'none';
    content.classList.remove('active');
  });
  
  // Deaktiviere alle Tab-Buttons
  Admin.elements.tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Aktiviere aktuellen Tab
  this.classList.add('active');
  
  // Zeige gewählten Tab-Inhalt
  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) {
    targetTab.style.display = 'block';
    targetTab.classList.add('active');
    Admin.currentTab = tabName;
    
    // Tab-spezifische Initialisierung
    if (tabName === 'preview') {
      refreshPreview();
    } else if (tabName === 'pages') {
      // PageEditor später initialisieren
    }
  } else {
    console.error(`Tab mit ID "${tabName}-tab" nicht gefunden`);
  }
}

function setupTabEventListeners() {
  Admin.elements.tabButtons.forEach(button => {
    button.addEventListener('click', handleTabChange);
  });
}

function ensureTabStyles() {
  // Style-Element erstellen, falls nicht vorhanden
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
    `;
    document.head.appendChild(style);
    console.log("Tab-Style-Fix hinzugefügt");
  }
}

// Vorläufige Preview-Refresh-Funktion
function refreshPreview() {
  const previewFrame = document.getElementById('previewFrame');
  if (!previewFrame) return;
  
  const previewTypeRadios = document.getElementsByName('previewType');
  const isDraft = Array.from(previewTypeRadios)
    .find(radio => radio.checked)?.value === 'draft';
  
  const timestamp = Date.now(); // Cache-Busting
  previewFrame.src = `preview.html?draft=${isDraft}&t=${timestamp}`;
  
  console.log(`Preview aktualisiert (${isDraft ? 'Entwurf' : 'Live'} Version)`);
}

function init() {
  console.log("Admin Bundle wird initialisiert");
  
  // Firebase initialisieren
  const firebaseInitialized = initFirebase();
  
  // Tab-Elemente cachen
  cacheTabElements();
  
  // Tabs initialisieren
  initializeTabs();
  
  // Tab-Style-Fix anwenden
  ensureTabStyles();
  
  // Tab-Event-Listener einrichten
  setupTabEventListeners();
  
  // Auth-Listener einrichten
  if (firebaseInitialized) {
    setupAuthStateListener();
  }
  
  // Login/Logout Buttons einrichten
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Enter-Taste beim Passwort
  const passField = document.getElementById('passField');
  if (passField) {
    passField.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
  
  // Preview-Button Event-Listener
  const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
  if (refreshPreviewBtn) {
    refreshPreviewBtn.addEventListener('click', refreshPreview);
  }
  
  showStatus("Admin Bundle initialisiert", false, 2000);
}



// ===== TINYMCE EDITOR =====
function initTinyMCE() {
  // Vorhandene Instanzen entfernen
  if (typeof tinymce !== 'undefined') {
    tinymce.remove();
    
    // Für reguläre Inhaltsfelder
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
    
    console.log("TinyMCE erfolgreich initialisiert");
  } else {
    console.warn("TinyMCE ist nicht verfügbar");
  }
}

function setupAuthStateListener() {
  if (!Admin.auth) return;
  
  Admin.auth.onAuthStateChanged(user => {
    const loginDiv = document.getElementById('loginDiv');
    const adminDiv = document.getElementById('adminDiv');
    
    if (user) {
      // Benutzer ist angemeldet
      console.log("Benutzer angemeldet:", user.email);
      
      if (loginDiv) loginDiv.style.display = 'none';
      if (adminDiv) adminDiv.style.display = 'block';
      
      // TinyMCE initialisieren
      setTimeout(initTinyMCE, 1000);
    } else {
      // Benutzer ist nicht angemeldet
      console.log("Benutzer nicht angemeldet");
      
      if (adminDiv) adminDiv.style.display = 'none';
      if (loginDiv) loginDiv.style.display = 'block';
      
      // TinyMCE aufräumen
      if (typeof tinymce !== 'undefined') {
        tinymce.remove();
      }
    }
  });
}


// ===== DASHBOARD-MODUL =====
const Dashboard = (function() {
  // Private Variablen
  let chartInstances = {};
  let statsCache = {
    pageViews: {},
    userActivity: {},
    popularPages: [],
    lastUpdated: null
  };
  
  // DOM Elemente
  const elements = {};
  
  // Initialisierung
  function init() {
    console.log("Dashboard-Modul wird initialisiert");
    
    // DOM-Elemente cachen
    cacheElements();
    
    // Event-Listener einrichten
    setupEventListeners();
    
    // Statistiken laden
    loadStatistics();
    
    // Daten-Aktualisierung alle 5 Minuten
    setInterval(refreshData, 5 * 60 * 1000);
    
    return true;
  }
  
  // DOM-Elemente cachen
  function cacheElements() {
    elements.statsContainer = document.getElementById('statisticsContainer');
    elements.pageViewsChart = document.getElementById('pageViewsChart');
    elements.userActivityChart = document.getElementById('userActivityChart');
    elements.popularPagesContainer = document.getElementById('popularPagesContainer');
    elements.lastUpdatedSpan = document.getElementById('lastUpdatedTime');
    elements.refreshStatsBtn = document.getElementById('refreshStatsBtn');
    elements.exportCSVBtn = document.getElementById('exportCSVBtn');
    elements.exportExcelBtn = document.getElementById('exportExcelBtn');
    elements.dateRangeSelector = document.getElementById('dateRangeSelector');
    elements.customStartDate = document.getElementById('customStartDate');
    elements.customEndDate = document.getElementById('customEndDate');
    elements.loadingIndicator = document.getElementById('statsLoadingIndicator');
  }
  
  // Event-Listener einrichten
  function setupEventListeners() {
    // Refresh-Button
    if (elements.refreshStatsBtn) {
      elements.refreshStatsBtn.addEventListener('click', function() {
        refreshData(true); // Force-Refresh
      });
    }
    
    // Export-Buttons
    if (elements.exportCSVBtn) {
      elements.exportCSVBtn.addEventListener('click', function() {
        exportData('csv');
      });
    }
    
    if (elements.exportExcelBtn) {
      elements.exportExcelBtn.addEventListener('click', function() {
        exportData('excel');
      });
    }
    
    // Date-Range-Selector
    if (elements.dateRangeSelector) {
      elements.dateRangeSelector.addEventListener('change', function() {
        const range = this.value;
        
        // Custom-Datum Ein-/Ausblenden
        if (range === 'custom') {
          document.getElementById('customDateContainer').style.display = 'block';
        } else {
          document.getElementById('customDateContainer').style.display = 'none';
          refreshData(true); // Mit neuem Datum-Bereich neuladen
        }
      });
    }
    
    // Custom-Datum-Inputs
    if (elements.customStartDate && elements.customEndDate) {
      elements.customStartDate.addEventListener('change', updateCustomDateRange);
      elements.customEndDate.addEventListener('change', updateCustomDateRange);
    }
  }
  
  // Datum-Bereich aktualisieren
  function updateCustomDateRange() {
    const startDate = elements.customStartDate.value;
    const endDate = elements.customEndDate.value;
    
    if (startDate && endDate) {
      refreshData(true); // Mit benutzerdefiniertem Datum-Bereich neuladen
    }
  }
  
  // Lade-Status anzeigen
  function showLoading(show = true) {
    if (elements.loadingIndicator) {
      elements.loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    if (elements.refreshStatsBtn) {
      elements.refreshStatsBtn.disabled = show;
    }
  }
  
  // Statistiken laden
  function loadStatistics() {
    showLoading(true);
    
    // Statistiken hier laden...
    // Für dieses Beispiel verwenden wir Dummy-Daten
    
    setTimeout(() => {
      // Simuliere geladene Daten
      statsCache.pageViews = generateDemoData('pageViews');
      statsCache.userActivity = generateDemoData('userActivity');
      statsCache.popularPages = generateDemoData('popularPages');
      statsCache.lastUpdated = new Date();
      
      // Update UI
      if (elements.lastUpdatedSpan) {
        elements.lastUpdatedSpan.textContent = statsCache.lastUpdated.toLocaleTimeString();
      }
      
      // Rendere Charts und Daten
      renderPageViewsChart();
      renderUserActivityChart();
      renderPopularPages();
      
      showLoading(false);
      showStatus("Statistiken geladen");
    }, 1000);
  }
  
  // Demo-Daten generieren
  function generateDemoData(type) {
    switch (type) {
      case 'pageViews':
        const views = {};
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('de-DE');
          views[dateStr] = Math.floor(Math.random() * 100) + 50;
        }
        return views;
        
      case 'userActivity':
        const activity = {};
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('de-DE');
          activity[dateStr] = {
            sessions: Math.floor(Math.random() * 50) + 10,
            edits: Math.floor(Math.random() * 20) + 5,
            logins: Math.floor(Math.random() * 10) + 2
          };
        }
        return activity;
        
      case 'popularPages':
        return [
          { pageId: 'index', title: 'Home', views: 523, lastViewed: new Date() },
          { pageId: 'about', title: 'About', views: 321, lastViewed: new Date() },
          { pageId: 'services', title: 'Services', views: 278, lastViewed: new Date() },
          { pageId: 'contact', title: 'Contact', views: 195, lastViewed: new Date() },
          { pageId: 'blog', title: 'Blog', views: 142, lastViewed: new Date() }
        ];
    }
  }
  
  // Page-Views-Chart rendern
  function renderPageViewsChart() {
    if (!elements.pageViewsChart) return;
    
    // Wenn Chart.js nicht verfügbar ist, zeige Fehler
    if (typeof Chart === 'undefined') {
      elements.pageViewsChart.innerHTML = '<div class="w3-panel w3-pale-red"><p>Chart.js wird benötigt, um dieses Diagramm anzuzeigen.</p></div>';
      return;
    }
    
    // Daten vorbereiten
    const labels = Object.keys(statsCache.pageViews).sort().reverse();
    const data = labels.map(label => statsCache.pageViews[label]);
    
    // Vorhandenes Chart zerstören, falls vorhanden
    if (chartInstances.pageViews) {
      chartInstances.pageViews.destroy();
    }
    
    // Chart erstellen
    const ctx = elements.pageViewsChart.getContext('2d');
    chartInstances.pageViews = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Seitenaufrufe',
          data: data,
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgba(52, 152, 219, 1)',
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Tägliche Seitenaufrufe',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Datum'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Aufrufe'
            }
          }
        }
      }
    });
  }
  
  // User-Activity-Chart rendern
  function renderUserActivityChart() {
    if (!elements.userActivityChart) return;
    
    // Wenn Chart.js nicht verfügbar ist, zeige Fehler
    if (typeof Chart === 'undefined') {
      elements.userActivityChart.innerHTML = '<div class="w3-panel w3-pale-red"><p>Chart.js wird benötigt, um dieses Diagramm anzuzeigen.</p></div>';
      return;
    }
    
    // Daten vorbereiten
    const labels = Object.keys(statsCache.userActivity).sort().reverse();
    const sessions = labels.map(label => statsCache.userActivity[label]?.sessions || 0);
    const edits = labels.map(label => statsCache.userActivity[label]?.edits || 0);
    const logins = labels.map(label => statsCache.userActivity[label]?.logins || 0);
    
    // Vorhandenes Chart zerstören, falls vorhanden
    if (chartInstances.userActivity) {
      chartInstances.userActivity.destroy();
    }
    
    // Chart erstellen
    const ctx = elements.userActivityChart.getContext('2d');
    chartInstances.userActivity = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sessions',
            data: sessions,
            backgroundColor: 'rgba(52, 152, 219, 0.6)'
          },
          {
            label: 'Bearbeitungen',
            data: edits,
            backgroundColor: 'rgba(46, 204, 113, 0.6)'
          },
          {
            label: 'Logins',
            data: logins,
            backgroundColor: 'rgba(155, 89, 182, 0.6)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Benutzeraktivität',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Datum'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Anzahl'
            }
          }
        }
      }
    });
  }
  
  // Beliebte Seiten rendern
  function renderPopularPages() {
    if (!elements.popularPagesContainer) return;
    
    // Wenn keine Daten, zeige Nachricht
    if (!statsCache.popularPages.length) {
      elements.popularPagesContainer.innerHTML = '<div class="w3-panel w3-pale-yellow"><p>Keine Daten zu Seitenaufrufen verfügbar.</p></div>';
      return;
    }
    
    // HTML für beliebte Seiten erstellen
    let html = `
      <table class="w3-table w3-striped w3-bordered">
        <thead>
          <tr class="w3-light-grey">
            <th>Seite</th>
            <th>Aufrufe</th>
            <th>Zuletzt angesehen</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Zeilen für jede Seite hinzufügen
    statsCache.popularPages.forEach(page => {
      const lastViewedStr = page.lastViewed ? 
        page.lastViewed.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A';
      
      html += `
        <tr>
          <td>${page.title}</td>
          <td>${page.views}</td>
          <td>${lastViewedStr}</td>
          <td>
            <a href="page.php?id=${page.pageId}" target="_blank" class="w3-button w3-small w3-blue">
              <i class="fas fa-eye"></i>
            </a>
            <button class="w3-button w3-small w3-green open-editor-btn" data-page-id="${page.pageId}">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    // Container aktualisieren
    elements.popularPagesContainer.innerHTML = html;
    
    // Event-Listener für Editor-Buttons
    document.querySelectorAll('.open-editor-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const pageId = this.getAttribute('data-page-id');
        console.log(`Editor für Seite öffnen: ${pageId}`);
        // Hier PageEditor aufrufen, falls verfügbar
        if (typeof PageEditor !== 'undefined' && PageEditor.openEditor) {
          PageEditor.openEditor(pageId);
        }
      });
    });
  }
  
  // Daten aktualisieren
  function refreshData(force = false) {
    // Wenn nicht Force-Refresh und Daten wurden vor weniger als 5 Minuten geladen, überspringen
    if (!force && statsCache.lastUpdated && (new Date() - statsCache.lastUpdated) < 5 * 60 * 1000) {
      console.log('Datenaktualisierung übersprungen (Daten sind aktuell)');
      return;
    }
    
    console.log('Statistikdaten werden aktualisiert...');
    loadStatistics();
  }
  
  // Daten exportieren
  function exportData(format) {
    alert('Exportfunktion noch nicht implementiert: ' + format);
    // Hier würde der Export-Code stehen...
  }
  
  // Track-Funktion für Seitenaufrufe
  function trackPageView(pageId, pageTitle) {
    console.log(`Seitenaufruf getrackt: ${pageTitle} (${pageId})`);
    // Hier würde der Tracking-Code stehen...
  }
  
  // Track-Funktion für Benutzeraktivität
  function trackUserActivity(activityType) {
    console.log(`Benutzeraktivität getrackt: ${activityType}`);
    // Hier würde der Tracking-Code stehen...
  }
  
  // Public API
  return {
    init,
    refreshData,
    exportData,
    trackPageView,
    trackUserActivity
  };
})();   
function handleTabChange() {
  const tabName = this.getAttribute('data-tab');
  
  console.log(`Wechsle zu Tab: ${tabName}`);
  
  // Verstecke alle Tab-Inhalte
  Admin.elements.tabContents.forEach(content => {
    content.style.display = 'none';
    content.classList.remove('active');
  });
  
  // Deaktiviere alle Tab-Buttons
  Admin.elements.tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Aktiviere aktuellen Tab
  this.classList.add('active');
  
  // Zeige gewählten Tab-Inhalt
  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) {
    targetTab.style.display = 'block';
    targetTab.classList.add('active');
    Admin.currentTab = tabName;
    
    // Tab-spezifische Initialisierung
    if (tabName === 'preview') {
      refreshPreview();
    } else if (tabName === 'dashboard') {
      // Dashboard initialisieren, wenn noch nicht geschehen
      if (typeof Dashboard !== 'undefined' && Dashboard.init) {
        Dashboard.init();
      }
    } else if (tabName === 'pages') {
      // PageEditor später initialisieren
    }
  } else {
    console.error(`Tab mit ID "${tabName}-tab" nicht gefunden`);
  }
}

// ===== PAGE EDITOR INTEGRATION =====
function initializePageEditor() {
  // Prüfen, ob PageEditor verfügbar ist
  if (typeof PageEditor !== 'undefined') {
    if (typeof PageEditor.init === 'function' && !Admin.pageEditorInitialized) {
      console.log("PageEditor wird initialisiert");
      try {
        PageEditor.init();
        Admin.pageEditorInitialized = true;
      } catch (error) {
        console.error("Fehler beim Initialisieren des PageEditors:", error);
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

function fixPageVisibility() {
  // Force-Sichtbarkeit des Pages-Tabs, wenn aktiv
  const pagesTab = document.getElementById('pages-tab');
  const pagesTabBtn = document.querySelector('.tab-btn[data-tab="pages"]');
  
  if (pagesTab && pagesTabBtn && pagesTabBtn.classList.contains('active')) {
    pagesTab.style.display = 'block';
    pagesTab.classList.add('active');
    console.log("Pages-Tab wurde sichtbar gemacht");
  }
  
  // Sicherstellen, dass pagesContainer existiert
  ensurePagesContainer();
  
  // PageEditor initialisieren, wenn nötig
  if (Admin.currentTab === 'pages') {
    initializePageEditor();
  }
}

function ensurePagesContainer() {
  const pagesTab = document.getElementById('pages-tab');
  if (!pagesTab) return;
  
  let pagesContainer = document.getElementById('pagesContainer');
  if (!pagesContainer) {
    console.log("pagesContainer wird erstellt");
    pagesContainer = document.createElement('div');
    pagesContainer.id = 'pagesContainer';
    pagesContainer.className = 'w3-row';
    pagesTab.appendChild(pagesContainer);
  }
  
  // Container sichtbar machen
  pagesContainer.style.display = 'block';
  
  // Weitere Elemente bei Bedarf hier erstellen...
}
function handleTabChange() {
  const tabName = this.getAttribute('data-tab');
  
  console.log(`Wechsle zu Tab: ${tabName}`);
  
  // Verstecke alle Tab-Inhalte
  Admin.elements.tabContents.forEach(content => {
    content.style.display = 'none';
    content.classList.remove('active');
  });
  
  // Deaktiviere alle Tab-Buttons
  Admin.elements.tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Aktiviere aktuellen Tab
  this.classList.add('active');
  
  // Zeige gewählten Tab-Inhalt
  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) {
    targetTab.style.display = 'block';
    targetTab.classList.add('active');
    Admin.currentTab = tabName;
    
    // Tab-spezifische Initialisierung
    if (tabName === 'preview') {
      refreshPreview();
    } else if (tabName === 'dashboard') {
      // Dashboard initialisieren, wenn noch nicht geschehen
      if (typeof Dashboard !== 'undefined' && Dashboard.init) {
        Dashboard.init();
      }
    } else if (tabName === 'pages') {
      // PageEditor initialisieren
      fixPageVisibility();
      initializePageEditor();
    }
  } else {
    console.error(`Tab mit ID "${tabName}-tab" nicht gefunden`);
  }
}

function init() {
  console.log("Admin Bundle wird initialisiert");
  
  // Firebase initialisieren
  const firebaseInitialized = initFirebase();
  
  // Tab-Elemente cachen
  cacheTabElements();
  
  // Tabs initialisieren
  initializeTabs();
  
  // Tab-Style-Fix anwenden
  ensureTabStyles();
  
  // Wenn Pages-Tab aktiv ist, PageEditor-Initialisierung vorbereiten
  if (Admin.currentTab === 'pages') {
    setTimeout(fixPageVisibility, 500);
  }
  
  // Tab-Event-Listener einrichten
  setupTabEventListeners();
  
  // Auth-Listener einrichten
  if (firebaseInitialized) {
    setupAuthStateListener();
  }
  
  // Login/Logout Buttons einrichten
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Enter-Taste beim Passwort
  const passField = document.getElementById('passField');
  if (passField) {
    passField.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
  
  // Preview-Button Event-Listener
  const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
  if (refreshPreviewBtn) {
    refreshPreviewBtn.addEventListener('click', refreshPreview);
  }
  
  showStatus("Admin Bundle initialisiert", false, 2000);
}

// ===== WORDCLOUD-MODUL =====
const WordCloudManager = (function() {
  // Privater Status
  let wordCloudData = [];
  let isDirty = false;
  
  // DOM-Elemente
  const elements = {};
  
  // Initialisierung
  function init() {
    console.log("WordCloud-Manager wird initialisiert");
    
    // DOM-Elemente cachen
    cacheElements();
    
    // Event-Handler einrichten
    setupEventListeners();
    
    // Daten laden
    loadWordCloudData();
    
    return true;
  }
  
  // DOM-Elemente cachen
  function cacheElements() {
    elements.wordCloudContainer = document.getElementById('wordCloudContainer');
    elements.addWordBtn = document.getElementById('addWordBtn');
    elements.saveWordCloudBtn = document.getElementById('saveWordCloudBtn');
    elements.previewWordCloudBtn = document.getElementById('previewWordCloudBtn');
  }
  
  // Event-Listener einrichten
  function setupEventListeners() {
    // "Wort hinzufügen"-Button
    if (elements.addWordBtn) {
      elements.addWordBtn.addEventListener('click', function() {
        addNewWord();
      });
    }
    
    // "Speichern"-Button
    if (elements.saveWordCloudBtn) {
      elements.saveWordCloudBtn.addEventListener('click', function() {
        saveWordCloud();
      });
    }
    
    // "Vorschau"-Button
    if (elements.previewWordCloudBtn) {
      elements.previewWordCloudBtn.addEventListener('click', function() {
        previewWordCloud();
      });
    }
  }
  
  // WordCloud-Daten laden
  function loadWordCloudData() {
    if (!Admin.db || !elements.wordCloudContainer) return;
    
    try {
      Admin.db.collection("content").doc("wordCloud").get().then(doc => {
        if (doc.exists) {
          wordCloudData = doc.data().words || [];
        } else {
          // Mit Standardwerten initialisieren
          wordCloudData = [
            { text: "Mindfulness", weight: 5, link: "#" },
            { text: "Meditation", weight: 8, link: "#" },
            { text: "Self-reflection", weight: 7, link: "#" },
            { text: "Consciousness", weight: 9, link: "#" },
            { text: "Spirituality", weight: 6, link: "#" }
          ];
          
          // Dokument mit Standarddaten erstellen
          Admin.db.collection("content").doc("wordCloud").set({
            words: wordCloudData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        
        renderWordCloudItems();
      }).catch(error => {
        console.error("Fehler beim Laden der WordCloud:", error);
        showStatus("Fehler beim Laden der WordCloud: " + error.message, true);
      });
    } catch (err) {
      console.error("Fehler beim Laden der WordCloud:", err);
      showStatus("Fehler beim Laden der WordCloud: " + err.message, true);
    }
  }
  
  // WordCloud-Elemente rendern
  function renderWordCloudItems() {
    if (!elements.wordCloudContainer) return;
    
    elements.wordCloudContainer.innerHTML = '';
    
    if (wordCloudData.length === 0) {
      elements.wordCloudContainer.innerHTML = `
        <div class="w3-panel w3-pale-yellow w3-center">
          <p>Keine Wörter in der WordCloud. Klicken Sie auf "Neues Wort hinzufügen", um Wörter hinzuzufügen.</p>
        </div>
      `;
      return;
    }
    
    // Tabelle für bessere Struktur erstellen
    const tableContainer = document.createElement('div');
    tableContainer.className = 'w3-responsive';
    
    const table = document.createElement('table');
    table.className = 'w3-table w3-bordered w3-striped';
    
    // Tabellen-Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="w3-light-grey">
        <th style="width:5%">Nr.</th>
        <th style="width:35%">Wort</th>
        <th style="width:15%">Gewicht (1-9)</th>
        <th style="width:35%">Link</th>
        <th style="width:10%">Aktion</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Tabellen-Body
    const tbody = document.createElement('tbody');
    
    wordCloudData.forEach((word, index) => {
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
      
      // Event-Listener für Input-Änderungen
      tr.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', function() {
          const field = input.getAttribute('data-field');
          const value = field === 'weight' ? parseInt(input.value) : input.value;
          wordCloudData[index][field] = value;
          isDirty = true;
        });
      });
      
      // Event-Listener für Löschen-Button
      tr.querySelector('.delete-word-btn').addEventListener('click', function() {
        if (confirm('Sind Sie sicher, dass Sie dieses Wort löschen möchten?')) {
          wordCloudData.splice(index, 1);
          renderWordCloudItems();
          isDirty = true;
        }
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    elements.wordCloudContainer.appendChild(tableContainer);
    
    // Drag & Drop initialisieren, wenn Sortable.js verfügbar ist
    initSortable();
  }
  
  // Sortable.js initialisieren
  function initSortable() {
    if (typeof Sortable !== 'undefined' && elements.wordCloudContainer) {
      Sortable.create(elements.wordCloudContainer.querySelector('tbody'), {
        handle: '.draggable-handle',
        animation: 150,
        onEnd: function() {
          // WordCloud-Daten neu ordnen basierend auf DOM-Reihenfolge
          const newWordData = [];
          elements.wordCloudContainer.querySelectorAll('.word-item').forEach(item => {
            const text = item.querySelector('[data-field="text"]').value;
            const weight = parseInt(item.querySelector('[data-field="weight"]').value);
            const link = item.querySelector('[data-field="link"]').value;
            
            newWordData.push({ text, weight, link });
          });
          
          // Status aktualisieren
          wordCloudData = newWordData;
          isDirty = true;
        }
      });
    }
  }
  
  // Neues Wort hinzufügen
  function addNewWord() {
    wordCloudData.push({ text: "", weight: 5, link: "#" });
    renderWordCloudItems();
    isDirty = true;
  }
  
  // WordCloud speichern
  function saveWordCloud() {
    if (!Admin.db) {
      showStatus('Firebase nicht verfügbar', true);
      return;
    }
    
    showStatus('WordCloud wird gespeichert...', false, 0);
    
    try {
      Admin.db.collection("content").doc("wordCloud").set({
        words: wordCloudData,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        showStatus("WordCloud erfolgreich gespeichert!");
        isDirty = false;
      }).catch(error => {
        console.error("Fehler beim Speichern der WordCloud:", error);
        showStatus("Fehler beim Speichern: " + error.message, true);
      });
    } catch (err) {
      console.error("Fehler beim Speichern der WordCloud:", err);
      showStatus("Fehler beim Speichern: " + err.message, true);
    }
  }
  
  // WordCloud-Vorschau anzeigen
  function previewWordCloud() {
    // Vorschau in neuem Tab öffnen
    const previewWindow = window.open('', '_blank');
    
    // Vorschau-HTML generieren
    const previewHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>WordCloud Vorschau</title>
        <link rel="stylesheet" href="./assets/css/styles.css">
        <link rel="stylesheet" href="./assets/css/word-cloud-fix.css">
        <style>
          body { padding: 2rem; font-family: 'Lato', sans-serif; }
          .preview-container { max-width: 800px; margin: 0 auto; }
          .preview-title { text-align: center; margin-bottom: 2rem; }
          .back-btn { position: fixed; top: 1rem; right: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
      </head>
      <body>
        <button class="back-btn" onclick="window.close()">Schließen</button>
        <div class="preview-container">
          <h1 class="preview-title">WordCloud Vorschau</h1>
          
          <div class="textbubble">
            <ul class="word-cloud" role="navigation" aria-label="WordCloud">
              ${wordCloudData.map(word => `
                <li>
                  <a href="${word.link || '#'}" data-weight="${word.weight || 5}">${word.text || 'Wort'}</a>
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
  }
  
  // Public API
  return {
    init,
    saveWordCloud,
    previewWordCloud
  };
})();

function handleTabChange() {
  const tabName = this.getAttribute('data-tab');
  
  console.log(`Wechsle zu Tab: ${tabName}`);
  
  // Verstecke alle Tab-Inhalte
  Admin.elements.tabContents.forEach(content => {
    content.style.display = 'none';
    content.classList.remove('active');
  });
  
  // Deaktiviere alle Tab-Buttons
  Admin.elements.tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Aktiviere aktuellen Tab
  this.classList.add('active');
  
  // Zeige gewählten Tab-Inhalt
  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) {
    targetTab.style.display = 'block';
    targetTab.classList.add('active');
    Admin.currentTab = tabName;
    
    // Tab-spezifische Initialisierung
    if (tabName === 'preview') {
      refreshPreview();
    } else if (tabName === 'dashboard') {
      // Dashboard initialisieren, wenn noch nicht geschehen
      if (typeof Dashboard !== 'undefined' && Dashboard.init) {
        Dashboard.init();
      }
    } else if (tabName === 'pages') {
      // PageEditor initialisieren
      fixPageVisibility();
      initializePageEditor();
    } else if (tabName === 'wordcloud') {
      // WordCloud initialisieren
      if (typeof WordCloudManager !== 'undefined' && WordCloudManager.init) {
        WordCloudManager.init();
      }
    }
  } else {
    console.error(`Tab mit ID "${tabName}-tab" nicht gefunden`);
  }
}

// ===== INITIALIZATION ON DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM geladen, Admin Bundle wird initialisiert");
  
  // Alles initialisieren
  init();
  
  // Je nach aktivem Tab zusätzliche Module initialisieren
  if (Admin.currentTab === 'dashboard') {
    if (typeof Dashboard !== 'undefined' && Dashboard.init) {
      Dashboard.init();
    }
  } else if (Admin.currentTab === 'wordcloud') {
    if (typeof WordCloudManager !== 'undefined' && WordCloudManager.init) {
      WordCloudManager.init();
    }
  }
});

// ===== EXPORTS =====
// Ausgewählte Funktionen global verfügbar machen
window.AdminBundle = {
  init,
  showStatus,
  handleLogin,
  handleLogout,
  refreshPreview,
  initTinyMCE,
  initializePageEditor
};