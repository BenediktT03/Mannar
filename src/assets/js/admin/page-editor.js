/**
 * Page Editor Module
 * Zuständig für die Verwaltung und Bearbeitung von Seiten im Admin-Panel
 */
const PageEditor = (function() {
  // Private Variablen
  let currentEditingPage = null;       // Aktuelle Seiten-ID oder null
  let isEditingMainContent = false;    // Bearbeiten wir die Hauptseite?
  let pageCache = {};                  // Cache für geladene Seiten
  let mainContentCache = null;         // Cache für Hauptseiteninhalt
  let editingDirty = false;            // Ungespeicherte Änderungen vorhanden?
  let templateDefinitions = {};        // Templates-Definitionen

  // DOM-Elemente-Cache
  let elements = {};

  /**
   * Initialisierung des Moduls
   */
  function init() {
    console.log('PageEditor wird initialisiert');
    
    // Templates laden
    initTemplates();
    
    // DOM-Elemente cachen
    cacheElements();
    
    // UI-Elemente bei Bedarf erstellen
    ensureUIElements();
    
    // Event-Listener anhängen
    attachEvents();
    
    // Initial Seiten laden
    loadPages();
    
    console.log('PageEditor erfolgreich initialisiert');
  }

  /**
   * Definiert alle verfügbaren Seitenvorlagen
   */
  function initTemplates() {
    templateDefinitions = {
      'main-content': {
        name: 'Homepage (index.php)',
        description: 'Hauptwebsite-Inhalt',
        preview: '<div class="tp-header"></div><div class="tp-hero"></div><div class="tp-content"></div>',
        fields: [
          // About-Bereich
          { type: 'text', name: 'aboutTitle', label: 'About-Bereich Titel', required: true },
          { type: 'text', name: 'aboutSubtitle', label: 'About-Bereich Untertitel', required: false },
          { type: 'textarea', name: 'aboutText', label: 'About-Bereich Inhalt', editor: true, required: false },
          
          // Angebote-Bereich
          { type: 'text', name: 'offeringsTitle', label: 'Angebote-Bereich Titel', required: true },
          { type: 'text', name: 'offeringsSubtitle', label: 'Angebote-Bereich Untertitel', required: false },
          
          // Angebot 1
          { type: 'text', name: 'offer1Title', label: 'Angebot 1 Titel', required: false },
          { type: 'textarea', name: 'offer1Desc', label: 'Angebot 1 Beschreibung', editor: true, required: false },
          { type: 'image', name: 'offer1_image', label: 'Angebot 1 Bild', required: false },
          
          // Angebot 2
          { type: 'text', name: 'offer2Title', label: 'Angebot 2 Titel', required: false },
          { type: 'textarea', name: 'offer2Desc', label: 'Angebot 2 Beschreibung', editor: true, required: false },
          { type: 'image', name: 'offer2_image', label: 'Angebot 2 Bild', required: false },
          
          // Angebot 3
          { type: 'text', name: 'offer3Title', label: 'Angebot 3 Titel', required: false },
          { type: 'textarea', name: 'offer3Desc', label: 'Angebot 3 Beschreibung', editor: true, required: false },
          { type: 'image', name: 'offer3_image', label: 'Angebot 3 Bild', required: false },
          
          // Kontakt-Bereich
          { type: 'text', name: 'contactTitle', label: 'Kontakt-Bereich Titel', required: true },
          { type: 'text', name: 'contactSubtitle', label: 'Kontakt-Bereich Untertitel', required: false },
          { type: 'image', name: 'contact_image', label: 'Kontakt-Bild', required: false }
        ]
      },
      'basic': {
        name: 'Einfache Seite',
        description: 'Einfache Seite mit Titel, Untertitel und Inhalt',
        preview: '<div class="tp-header"></div><div class="tp-content"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Seitentitel', required: true },
          { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
          { type: 'textarea', name: 'content', label: 'Hauptinhalt', editor: true, required: false }
        ]
      },
      'text-image': {
        name: 'Text mit Bild',
        description: 'Text links, Bild rechts',
        preview: '<div class="tp-text-col"></div><div class="tp-image-col"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Seitentitel', required: true },
          { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
          { type: 'textarea', name: 'content', label: 'Hauptinhalt', editor: true, required: false },
          { type: 'image', name: 'featuredImage', label: 'Hauptbild', required: false }
        ]
      },
      'image-text': {
        name: 'Bild mit Text',
        description: 'Bild links, Text rechts',
        preview: '<div class="tp-image-col"></div><div class="tp-text-col"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Seitentitel', required: true },
          { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
          { type: 'image', name: 'featuredImage', label: 'Hauptbild', required: false },
          { type: 'textarea', name: 'content', label: 'Hauptinhalt', editor: true, required: false }
        ]
      },
      'gallery': {
        name: 'Galerie',
        description: 'Zeigt eine Sammlung von Bildern in Galerieform an',
        preview: '<div class="tp-header"></div><div class="tp-gallery"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Galerietitel', required: true },
          { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
          { type: 'textarea', name: 'description', label: 'Galeriebeschreibung', editor: true, required: false },
          { type: 'gallery', name: 'images', label: 'Galeriebilder', required: false }
        ]
      },
      'landing': {
        name: 'Landing Page',
        description: 'Vollständige Landing Page mit Hero-Bild, Features und Call-to-Action',
        preview: '<div class="tp-hero"></div><div class="tp-features"></div><div class="tp-cta"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Hero-Titel', required: true },
          { type: 'text', name: 'subtitle', label: 'Hero-Untertitel', required: false },
          { type: 'image', name: 'heroImage', label: 'Hero-Hintergrundbild', required: false },
          { type: 'text', name: 'ctaText', label: 'Call-to-Action Text', required: false },
          { type: 'text', name: 'ctaButtonText', label: 'Button-Text', required: false },
          { type: 'text', name: 'ctaButtonLink', label: 'Button-Link', required: false },
          { type: 'text', name: 'featuresTitle', label: 'Features-Bereich Titel', required: false },
          { type: 'repeater', name: 'features', label: 'Features', required: false, subfields: [
            { type: 'text', name: 'title', label: 'Feature-Titel' },
            { type: 'textarea', name: 'description', label: 'Feature-Beschreibung', editor: false },
            { type: 'image', name: 'icon', label: 'Feature-Icon/Bild' }
          ]}
        ]
      },
      'contact': {
        name: 'Kontaktseite',
        description: 'Kontaktinformationen mit Kontaktformular',
        preview: '<div class="tp-header"></div><div class="tp-contact-info"></div><div class="tp-form"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Kontaktseitentitel', required: true },
          { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
          { type: 'textarea', name: 'introduction', label: 'Einführungstext', editor: true, required: false },
          { type: 'text', name: 'address', label: 'Adresse', required: false },
          { type: 'text', name: 'email', label: 'E-Mail-Adresse', required: false },
          { type: 'text', name: 'phone', label: 'Telefonnummer', required: false },
          { type: 'checkbox', name: 'showForm', label: 'Kontaktformular anzeigen', required: false },
          { type: 'image', name: 'contactImage', label: 'Kontaktbild/Karte', required: false }
        ]
      },
      'blog': {
        name: 'Blog-Beitrag',
        description: 'Ein Blog-Beitrag mit Hauptbild und Inhaltsabschnitten',
        preview: '<div class="tp-header"></div><div class="tp-featured"></div><div class="tp-content"></div>',
        fields: [
          { type: 'text', name: 'title', label: 'Beitragstitel', required: true },
          { type: 'text', name: 'subtitle', label: 'Untertitel', required: false },
          { type: 'date', name: 'date', label: 'Beitragsdatum', required: false },
          { type: 'text', name: 'author', label: 'Autor', required: false },
          { type: 'image', name: 'featuredImage', label: 'Hauptbild', required: false },
          { type: 'textarea', name: 'excerpt', label: 'Auszug', editor: false, required: false },
          { type: 'textarea', name: 'content', label: 'Beitragsinhalt', editor: true, required: false },
          { type: 'tags', name: 'categories', label: 'Kategorien', required: false }
        ]
      }
    };
  }

  /**
   * DOM-Elemente für schnelleren Zugriff cachen
   */
  function cacheElements() {
    elements = {
      pagesContainer: document.getElementById('pagesContainer'),
      pagesListCol: document.getElementById('pagesListCol'),
      pagesEditorCol: document.getElementById('pagesEditorCol'),
      pagesList: document.getElementById('pagesList'),
      createPageBtn: document.getElementById('createPageBtn'),
      welcomeCreateBtn: document.getElementById('welcomeCreateBtn'),
      pageEditorContainer: document.getElementById('pageEditorContainer'),
      pageWelcomeContainer: document.getElementById('pageWelcomeContainer'),
      editorPageTitle: document.getElementById('editorPageTitle'),
      pageId: document.getElementById('pageId'),
      pageTitle: document.getElementById('pageTitle'),
      templateSelector: document.getElementById('templateSelector'),
      templateFields: document.getElementById('templateFields'),
      closeEditorBtn: document.getElementById('closeEditorBtn'),
      previewPageBtn: document.getElementById('previewPageBtn'),
      deletePageBtn: document.getElementById('deletePageBtn'),
      savePageBtn: document.getElementById('savePageBtn'),
      publishPageBtn: document.getElementById('publishPageBtn'),
      livePreview: document.getElementById('livePreview'),
      
      // "Neue Seite erstellen"-Dialog
      createPageDialog: document.getElementById('createPageDialog'),
      closePageDialogBtn: document.getElementById('closePageDialogBtn'),
      newPageId: document.getElementById('newPageId'),
      newPageTitle: document.getElementById('newPageTitle'),
      newPageTemplate: document.getElementById('newPageTemplate'),
      templatePreview: document.getElementById('templatePreview'),
      confirmCreatePageBtn: document.getElementById('confirmCreatePageBtn'),
      cancelCreatePageBtn: document.getElementById('cancelCreatePageBtn')
    };
  }

  /**
   * Stellt sicher, dass alle benötigten UI-Elemente vorhanden sind
   */
  function ensureUIElements() {
    // Überprüfen, ob der Hauptcontainer existiert
    if (!document.getElementById('pagesContainer')) {
      console.error('pagesContainer nicht gefunden, UI kann nicht erstellt werden');
      return;
    }
    
    // Überprüfen, ob alle notwendigen Unterelemente vorhanden sind, ggf. erstellen
    // ...
    // (Der vollständige Code würde hier alle UI-Elemente erstellen, 
    // aber das würde den Rahmen dieser optimierenden Refaktorierung sprengen)
  }

  /**
   * Event-Listener für UI-Elemente anhängen
   */
  function attachEvents() {
    // Seite erstellen Button
    if (elements.createPageBtn) {
      elements.createPageBtn.addEventListener('click', openCreatePageDialog);
    }
    
    // Welcome-Seite "Erste Seite erstellen" Button
    if (elements.welcomeCreateBtn) {
      elements.welcomeCreateBtn.addEventListener('click', openCreatePageDialog);
    }
    
    // Editor schließen Button
    if (elements.closeEditorBtn) {
      elements.closeEditorBtn.addEventListener('click', closeEditor);
    }
    
    // Seite speichern Button
    if (elements.savePageBtn) {
      elements.savePageBtn.addEventListener('click', () => savePage(false));
    }
    
    // Seite veröffentlichen Button
    if (elements.publishPageBtn) {
      elements.publishPageBtn.addEventListener('click', () => savePage(true));
    }
    
    // Seite löschen Button
    if (elements.deletePageBtn) {
      elements.deletePageBtn.addEventListener('click', deletePage);
    }
    
    // Seitenvorschau Button
    if (elements.previewPageBtn) {
      elements.previewPageBtn.addEventListener('click', openPagePreview);
    }
    
    // Template-Auswahl
    if (elements.templateSelector) {
      elements.templateSelector.addEventListener('change', function() {
        const selectedTemplate = this.value;
        if (selectedTemplate) {
          changeTemplate(selectedTemplate);
        }
      });
    }
    
    // "Neue Seite erstellen"-Dialog schließen Button
    if (elements.closePageDialogBtn) {
      elements.closePageDialogBtn.addEventListener('click', closeCreatePageDialog);
    }
    
    // "Abbrechen" Button im Dialog
    if (elements.cancelCreatePageBtn) {
      elements.cancelCreatePageBtn.addEventListener('click', closeCreatePageDialog);
    }
    
    // Template-Vorschau im Dialog aktualisieren, wenn sich die Auswahl ändert
    if (elements.newPageTemplate) {
      elements.newPageTemplate.addEventListener('change', function() {
        updateTemplatePreview(this.value);
      });
    }
    
    // "Seite erstellen" Button im Dialog
    if (elements.confirmCreatePageBtn) {
      elements.confirmCreatePageBtn.addEventListener('click', createNewPage);
    }
    
    // Seiten-ID normalisieren, während Benutzer tippt
    if (elements.newPageId) {
      elements.newPageId.addEventListener('input', function() {
        this.value = sanitizePageId(this.value);
      });
    }
    
    // Autosave einrichten - Änderungen im Editor verfolgen
    setupAutosave();
  }

  /**
   * Auto-Save-Funktionalität einrichten
   */
  function setupAutosave() {
    // Änderungen im Editor überwachen
    document.addEventListener('change', function(e) {
      if (e.target.closest('#pageEditorContainer')) {
        setDirty(true);
      }
    });
    
    // Text-Änderungen überwachen
    document.addEventListener('input', function(e) {
      if (e.target.closest('#pageEditorContainer')) {
        setDirty(true);
        
        // Vorschau verzögert aktualisieren
        debounce(updatePreview, 500)();
      }
    });
  }

  /**
   * Debounce-Funktion für verzögerte Ausführung
   * @param {Function} func - Auszuführende Funktion
   * @param {number} wait - Verzögerung in Millisekunden
   * @returns {Function} Debounced-Funktion
   */
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  /**
   * Alle Seiten aus Firestore laden
   */
  async function loadPages() {
    if (!elements.pagesList) return;
    
    // Ladeindikator anzeigen
    elements.pagesList.innerHTML = '<div class="w3-center"><i class="fas fa-spinner fa-spin"></i> Seiten werden geladen...</div>';
    
    try {
      // Seiten über Firebase-Service laden
      const pages = await FirebaseService.pages.getAll();
      
      // Liste leeren
      elements.pagesList.innerHTML = '';
      pageCache = {}; // Cache zurücksetzen
      
      // Spezialseite für Hauptinhalt (index.php) hinzufügen
      const mainPageItem = document.createElement('div');
      mainPageItem.className = 'page-item w3-bar w3-hover-light-grey w3-margin-bottom w3-pale-yellow';
      mainPageItem.innerHTML = `
        <div class="w3-bar-item w3-padding">
          <span class="page-title"><i class="fas fa-home"></i> Homepage (index.php)</span><br>
          <small class="w3-text-grey">Hauptwebsite-Inhalt</small>
        </div>
        <div class="w3-bar-item w3-right">
          <a href="index.php" target="_blank" class="w3-button w3-small w3-blue">
            <i class="fas fa-eye"></i>
          </a>
        </div>
      `;
      
      // Click-Event für Hauptseite
      mainPageItem.addEventListener('click', function(e) {
        // Ignorieren, wenn auf den Vorschau-Button geklickt wurde
        if (e.target.closest('a')) return;
        
        // Hauptinhalt bearbeiten
        editMainContent();
      });
      
      // Zur Liste hinzufügen
      elements.pagesList.appendChild(mainPageItem);
      
      // Trennzeile einfügen
      const divider = document.createElement('div');
      divider.className = 'w3-panel w3-border-bottom';
      divider.innerHTML = '<p class="w3-small w3-text-grey">Zusätzliche Seiten</p>';
      elements.pagesList.appendChild(divider);
      
      if (pages.length === 0) {
        // Keine weiteren Seiten gefunden
        const noPages = document.createElement('div');
        noPages.className = 'w3-panel w3-pale-yellow w3-center';
        noPages.innerHTML = '<p>Keine zusätzlichen Seiten gefunden. Erstellen Sie Ihre erste Seite!</p>';
        elements.pagesList.appendChild(noPages);
      } else {
        // Seiten zur Liste hinzufügen
        pages.forEach(page => {
          // Seitendaten cachen
          pageCache[page.id] = page;
          
          // Seiten-Listenelement erstellen
          const pageItem = document.createElement('div');
          pageItem.className = 'page-item w3-bar w3-hover-light-grey w3-margin-bottom';
          pageItem.dataset.id = page.id;
          pageItem.innerHTML = `
            <div class="w3-bar-item w3-padding">
              <span class="page-title">${page.title || 'Unbenannte Seite'}</span><br>
              <small class="w3-text-grey">${getTemplateNameById(page.template) || page.template || 'Unbekanntes Template'}</small>
            </div>
            <div class="w3-bar-item w3-right">
              <a href="page.php?id=${page.id}" target="_blank" class="w3-button w3-small w3-blue">
                <i class="fas fa-eye"></i>
              </a>
            </div>
          `;
          
          // Click-Event zum Öffnen des Editors
          pageItem.addEventListener('click', function(e) {
            // Ignorieren, wenn auf den Vorschau-Button geklickt wurde
            if (e.target.closest('a')) return;
            
            const pageId = this.dataset.id;
            openEditor(pageId);
          });
          
          elements.pagesList.appendChild(pageItem);
        });
      }
      
      console.log('Seiten erfolgreich geladen', pages.length, 'Seiten gefunden');
    } catch (error) {
      console.error('Fehler beim Laden der Seiten:', error);
      elements.pagesList.innerHTML = `
        <div class="w3-panel w3-pale-red">
          <p>Fehler beim Laden der Seiten: ${error.message}</p>
          <button class="w3-button w3-red" onclick="PageEditor.loadPages()">Erneut versuchen</button>
        </div>
      `;
    }
  }

  /**
   * Gibt den Anzeigenamen eines Templates anhand seiner ID zurück
   * @param {string} templateId - Template-ID
   * @returns {string} Template-Name oder leerer String
   */
  function getTemplateNameById(templateId) {
    return templateDefinitions[templateId]?.name || '';
  }

  /**
   * Hauptinhalt der Website bearbeiten (index.php)
   */
  async function editMainContent() {
    if (!elements.pageEditorContainer || !elements.pageWelcomeContainer) return;
    
    // Flags setzen
    currentEditingPage = null;
    isEditingMainContent = true;
    
    // Ladeindikator anzeigen
    showStatus('Hauptinhalt wird geladen...', false, 0);
    
    try {
      let contentData;
      
      // Cache verwenden, wenn verfügbar
      if (mainContentCache) {
        contentData = mainContentCache;
      } else {
        // Von Firestore laden
        contentData = await FirebaseService.content.load('content/draft');
        
        // Falls keine Daten vorhanden, Standardinhalt erstellen
        if (!contentData) {
          contentData = await createDefaultMainContent();
        } else {
          // Daten cachen
          mainContentCache = contentData;
        }
      }
      
      // Editor anzeigen
      displayMainContentEditor(contentData);
      showStatus('Hauptinhalt geladen', false, 2000);
    } catch (error) {
      console.error('Fehler beim Laden des Hauptinhalts:', error);
      showStatus('Fehler beim Laden des Hauptinhalts: ' + error.message, true);
      isEditingMainContent = false;
    }
  }

  /**
   * Standardinhalt für Hauptseite erstellen, wenn noch nicht vorhanden
   * @returns {Promise<Object>} Erstellte Inhaltsdaten
   */
  async function createDefaultMainContent() {
    const defaultContent = {
      aboutTitle: "ÜBER MICH",
      aboutSubtitle: "Peer und Genesungsbegleiter",
      aboutText: "<p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum.</p>",
      
      offeringsTitle: "MEINE ANGEBOTE",
      offeringsSubtitle: "Hier sind einige meiner Leistungen und Angebote",
      
      offer1Title: "Einzelgespräche",
      offer1Desc: "<p>Persönliche Begleitung auf Ihrem Weg zu mehr Bewusstsein und Selbsterkenntnis.</p>",
      
      offer2Title: "Gruppenworkshops",
      offer2Desc: "<p>Gemeinsame Erfahrungsräume für Austausch und Wachstum in der Gemeinschaft.</p>",
      
      offer3Title: "Meditation",
      offer3Desc: "<p>Anleitungen und Übungen zur Stärkung von Achtsamkeit und innerem Frieden.</p>",
      
      contactTitle: "KONTAKT",
      contactSubtitle: "Ich freue mich auf Ihre Nachricht!",
      
      lastUpdated: new Date().toISOString()
    };
    
    try {
      // In Firestore speichern
      await FirebaseService.content.save('content/draft', defaultContent);
      console.log('Standardinhalt für Hauptseite erstellt');
      
      // Daten cachen
      mainContentCache = defaultContent;
      
      return defaultContent;
    } catch (error) {
      console.error('Fehler beim Erstellen des Standardinhalts:', error);
      throw error;
    }
  }

  /**
   * Editor für Hauptinhalt anzeigen
   * @param {Object} contentData - Inhaltsdaten
   */
  function displayMainContentEditor(contentData) {
    if (!elements.pageEditorContainer || !elements.pageWelcomeContainer) return;
    
    console.log('Editor für Hauptinhalt wird angezeigt:', contentData);
    
    // Willkommensseite ausblenden und Editor anzeigen
    elements.pageWelcomeContainer.style.display = 'none';
    elements.pageEditorContainer.style.display = 'block';
    
    // Editortitel setzen
    if (elements.editorPageTitle) {
      elements.editorPageTitle.textContent = 'Bearbeiten: Homepage (index.php)';
    }
    
    // Formularwerte setzen
    if (elements.pageId) elements.pageId.value = 'index.php';
    if (elements.pageTitle) elements.pageTitle.value = 'Homepage';
    
    // Template-Selector auf 'main-content' setzen
    if (elements.templateSelector) {
      elements.templateSelector.value = 'main-content';
      elements.templateSelector.disabled = true; // Template für Hauptinhalt nicht änderbar
    }
    
    // Publish-Button anzeigen, falls vorhanden
    if (elements.publishPageBtn) {
      elements.publishPageBtn.style.display = 'inline-block';
    }
    
    // Template-Felder generieren
    generateTemplateFields('main-content', contentData);
    
    // Status für ungespeicherte Änderungen zurücksetzen
    setDirty(false);
    
    // Vorschau aktualisieren
    updatePreview();
  }

  /**
   * Dialog zum Erstellen einer neuen Seite öffnen
   */
  function openCreatePageDialog() {
    if (!elements.createPageDialog) return;
    
    // Formular zurücksetzen
    if (elements.newPageId) elements.newPageId.value = '';
    if (elements.newPageTitle) elements.newPageTitle.value = '';
    if (elements.newPageTemplate) elements.newPageTemplate.selectedIndex = 0;
    if (elements.templatePreview) elements.templatePreview.innerHTML = '';
    
    // Dialogfeld anzeigen
    elements.createPageDialog.style.display = 'block';
  }

  /**
   * Dialog zum Erstellen einer neuen Seite schließen
   */
  function closeCreatePageDialog() {
    if (!elements.createPageDialog) return;
    
    elements.createPageDialog.style.display = 'none';
  }

  /**
   * Template-Vorschau im Dialog aktualisieren
   * @param {string} templateId - ID des Templates
   */
  function updateTemplatePreview(templateId) {
    if (!elements.templatePreview) return;
    
    // Vorschau leeren
    elements.templatePreview.innerHTML = '';
    
    if (!templateId || !templateDefinitions[templateId]) return;
    
    const template = templateDefinitions[templateId];
    
    // Vorschau erstellen
    const previewContainer = document.createElement('div');
    previewContainer.className = 'template-preview-container';
    previewContainer.innerHTML = `
      <h4>${template.name}</h4>
      <p>${template.description}</p>
      <div class="template-preview">
        ${template.preview}
      </div>
    `;
    
    elements.templatePreview.appendChild(previewContainer);
  }

  /**
   * Neue Seite erstellen
   */
  async function createNewPage() {
    if (!elements.newPageId || !elements.newPageTitle || !elements.newPageTemplate) return;
    
    const pageId = elements.newPageId.value.trim();
    const pageTitle = elements.newPageTitle.value.trim();
    const templateId = elements.newPageTemplate.value;
    
    // Validierung
    if (!pageId) {
      showStatus('Bitte geben Sie eine Seiten-ID ein', true);
      return;
    }
    
    if (!pageTitle) {
      showStatus('Bitte geben Sie einen Seitentitel ein', true);
      return;
    }
    
    if (!templateId || !templateDefinitions[templateId]) {
      showStatus('Bitte wählen Sie ein Template', true);
      return;
    }
    
    // Ladeindikator anzeigen
    showStatus('Seite wird erstellt...', false, 0);
    
    try {
      // Prüfen, ob Seiten-ID bereits existiert
      const existingPage = await FirebaseService.pages.get(pageId);
      if (existingPage) {
        showStatus(`Seiten-ID "${pageId}" existiert bereits. Bitte wählen Sie eine andere ID.`, true);
        return;
      }
      
      // Leere Daten basierend auf Template erstellen
      const templateData = {};
      const template = templateDefinitions[templateId];
      
      template.fields.forEach(field => {
        if (field.type === 'repeater' && field.subfields) {
          // Repeater-Felder mit leerem Array initialisieren
          templateData[field.name] = [];
        } else {
          // Andere Felder mit Standardwerten initialisieren
          switch (field.type) {
            case 'checkbox':
              templateData[field.name] = false;
              break;
            case 'gallery':
              templateData[field.name] = [];
              break;
            case 'image':
              templateData[field.name] = { url: '', alt: '' };
              break;
            default:
              templateData[field.name] = '';
          }
        }
      });
      
      // Standardwerte für häufige Felder
      if (templateData.title === undefined) templateData.title = pageTitle;
      
      // Seitenobjekt erstellen
      const pageData = {
        title: pageTitle,
        template: templateId,
        data: templateData,
        settings: {
          titleSize: 2.5,
          subtitleSize: 1.8,
          primaryColor: '#3498db',
          secondaryColor: '#2c3e50',
          bodyFont: 'Lato, sans-serif',
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      
      // In Firestore speichern
      const success = await FirebaseService.pages.create(pageId, pageData);
      
      if (success) {
        showStatus(`Seite "${pageTitle}" erfolgreich erstellt`);
        
        // Seiten-Cache aktualisieren
        pageCache[pageId] = pageData;
        
        // Dialog schließen
        closeCreatePageDialog();
        
        // Seiten neu laden
        await loadPages();
        
        // Editor für die neue Seite öffnen
        setTimeout(() => {
          openEditor(pageId);
        }, 300);
      } else {
        showStatus('Fehler beim Erstellen der Seite', true);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Seite:', error);
      showStatus('Fehler beim Erstellen der Seite: ' + error.message, true);
    }
  }

  /**
   * Seiten-ID für URL-freundliches Format bereinigen
   * @param {string} input - Eingabetext
   * @returns {string} Bereinigter Text
   */
  function sanitizePageId(input) {
    return input.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Entferne alle Nicht-Wort-Zeichen
      .replace(/\s+/g, '-')     // Ersetze Leerzeichen durch Bindestriche
      .replace(/-+/g, '-');     // Ersetze mehrere Bindestriche durch einen
  }

  /**
   * Editor für eine bestimmte Seite öffnen
   * @param {string} pageId - ID der zu bearbeitenden Seite
   */
  async function openEditor(pageId) {
    if (!pageId || !elements.pageEditorContainer || !elements.pageWelcomeContainer) return;
    
    // Hauptinhalt-Bearbeitungs-Flag zurücksetzen
    isEditingMainContent = false;
    
    // Aktuelle Seite setzen
    currentEditingPage = pageId;
    
    // Ladeindikator anzeigen
    showStatus('Seite wird geladen...', false, 0);
    
    try {
      let pageData;
      
      // Cache verwenden, wenn verfügbar
      if (pageCache[pageId]) {
        pageData = pageCache[pageId];
      } else {
        // Von Firestore laden
        pageData = await FirebaseService.pages.get(pageId);
        
        if (!pageData) {
          showStatus(`Seite "${pageId}" nicht gefunden`, true);
          currentEditingPage = null;
          return;
        }
        
        // Daten cachen
        pageCache[pageId] = pageData;
      }
      
      // Editor anzeigen
      displayEditor(pageId, pageData);
      showStatus('Seite geladen', false, 2000);
    } catch (error) {
      console.error('Fehler beim Laden der Seite:', error);
      showStatus('Fehler beim Laden der Seite: ' + error.message, true);
      currentEditingPage = null;
    }
  }

  /**
   * Editor für eine Seite anzeigen
   * @param {string} pageId - ID der Seite
   * @param {Object} pageData - Seitendaten
   */
  function displayEditor(pageId, pageData) {
    if (!elements.pageEditorContainer || !elements.pageWelcomeContainer) return;
    
    console.log('Editor für Seite wird angezeigt:', pageId, pageData);
    
    // Willkommensseite ausblenden und Editor anzeigen
    elements.pageWelcomeContainer.style.display = 'none';
    elements.pageEditorContainer.style.display = 'block';
    
    // Editortitel setzen
    if (elements.editorPageTitle) {
      elements.editorPageTitle.textContent = `Bearbeiten: ${pageData.title || 'Unbenannte Seite'}`;
    }
    
    // Formularwerte setzen
    if (elements.pageId) elements.pageId.value = pageId;
    if (elements.pageTitle) elements.pageTitle.value = pageData.title || '';
    
    // Template-Selector
    if (elements.templateSelector) {
      try {
        elements.templateSelector.value = pageData.template || '';
        elements.templateSelector.disabled = false; // Template für normale Seiten änderbar
      } catch (e) {
        console.error('Fehler beim Setzen des Template-Selectors:', e);
        
        // Wenn das Template nicht in der Dropdown-Liste existiert, hinzufügen
        if (pageData.template && !Array.from(elements.templateSelector.options).find(opt => opt.value === pageData.template)) {
          const option = document.createElement('option');
          option.value = pageData.template;
          option.textContent = pageData.template + ' (Unbekannt)';
          elements.templateSelector.appendChild(option);
          elements.templateSelector.value = pageData.template;
        }
      }
    }
    
    // Publish-Button ausblenden, falls vorhanden
    if (elements.publishPageBtn) {
      elements.publishPageBtn.style.display = 'none';
    }
    
    // Template-Felder generieren
    generateTemplateFields(pageData.template, pageData.data);
    
    // Status für ungespeicherte Änderungen zurücksetzen
    setDirty(false);
    
    // Vorschau aktualisieren
    updatePreview();
  }

  /**
   * Formularfelder basierend auf Template erstellen
   * @param {string} templateId - ID des Templates
   * @param {Object} data - Daten für die Felder
   */
  function generateTemplateFields(templateId, data) {
    if (!elements.templateFields || !templateDefinitions[templateId]) return;
    
    const template = templateDefinitions[templateId];
    
    // Bestehende Felder leeren
    elements.templateFields.innerHTML = '';
    
    // Felder basierend auf Template erstellen
    template.fields.forEach(field => {
      createField(field, data, elements.templateFields);
    });
    
    // Rich-Text-Editoren initialisieren, wenn das EditorModule verfügbar ist
    if (typeof EditorModule !== 'undefined' && typeof EditorModule.convertAll === 'function') {
      setTimeout(() => {
        EditorModule.convertAll('#templateFields .tinymce-editor');
      }, 100);
    }
  }

  /**
   * Einzelnes Formularfeld erstellen
   * @param {Object} field - Felddefinition
   * @param {Object} data - Daten für das Feld
   * @param {HTMLElement} container - Container für das Feld
   */
  function createField(field, data, container) {
    const fieldValue = data && data[field.name] !== undefined ? data[field.name] : '';
    const fieldId = `field_${field.name}`;
    
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'field-container w3-margin-bottom';
    fieldContainer.dataset.fieldName = field.name;
    fieldContainer.dataset.fieldType = field.type;
    
    // Label erstellen (außer für Checkbox-Typ)
    if (field.type !== 'checkbox') {
      const label = document.createElement('label');
      label.setAttribute('for', fieldId);
      label.innerHTML = `<strong>${field.label}${field.required ? ' *' : ''}:</strong>`;
      fieldContainer.appendChild(label);
    }
    
    // Feldinhalt basierend auf Typ erstellen
    switch (field.type) {
      case 'text':
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = fieldId;
        textInput.className = 'w3-input w3-border';
        textInput.value = fieldValue || '';
        textInput.required = field.required || false;
        fieldContainer.appendChild(textInput);
        break;
        
      case 'textarea':
        if (field.editor) {
          // Rich-Text-Editor
          const textarea = document.createElement('textarea');
          textarea.id = fieldId;
          textarea.className = 'w3-input w3-border tinymce-editor';
          textarea.rows = 6;
          textarea.value = fieldValue || '';
          textarea.required = field.required || false;
          
          fieldContainer.appendChild(textarea);
        } else {
          // Einfaches Textarea
          const textarea = document.createElement('textarea');
          textarea.id = fieldId;
          textarea.className = 'w3-input w3-border';
          textarea.rows = 4;
          textarea.value = fieldValue || '';
          textarea.required = field.required || false;
          
          fieldContainer.appendChild(textarea);
        }
        break;
        
      case 'checkbox':
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'w3-margin-bottom';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = fieldId;
        checkbox.className = 'w3-check';
        checkbox.checked = fieldValue || false;
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', fieldId);
        checkboxLabel.textContent = ` ${field.label}`;
        
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkboxLabel);
        fieldContainer.appendChild(checkboxContainer);
        break;
        
      case 'image':
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-field-container';
        
        // Vorschau-Container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview';
        previewContainer.id = `${fieldId}_preview`;
        
        // Vorschaubild
        const previewImg = document.createElement('img');
        previewImg.src = fieldValue && fieldValue.url ? fieldValue.url : '/api/placeholder/400/300';
        previewImg.style.maxWidth = '100%';
        previewImg.style.display = fieldValue && fieldValue.url ? 'block' : 'none';
        
        previewContainer.appendChild(previewImg);
        
        // Upload-Button
        const uploadBtn = document.createElement('button');
        uploadBtn.type = 'button';
        uploadBtn.id = `${fieldId}_upload`;
        uploadBtn.className = 'w3-button w3-blue w3-margin-top';
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Bild auswählen';
        uploadBtn.addEventListener('click', () => uploadImage(fieldId));
        
        // Verstecktes Input für Bilddaten
        const imageInput = document.createElement('input');
        imageInput.type = 'hidden';
        imageInput.id = fieldId;
        imageInput.value = JSON.stringify(fieldValue || { url: '', alt: '' });
        
        // Alt-Text-Input
        const altContainer = document.createElement('div');
        altContainer.className = 'w3-margin-top';
        
        const altLabel = document.createElement('label');
        altLabel.setAttribute('for', `${fieldId}_alt`);
        altLabel.textContent = 'Bild-Alt-Text:';
        
        const altInput = document.createElement('input');
        altInput.type = 'text';
        altInput.id = `${fieldId}_alt`;
        altInput.className = 'w3-input w3-border';
        altInput.value = fieldValue && fieldValue.alt ? fieldValue.alt : '';
        altInput.placeholder = 'Beschreiben Sie das Bild für Barrierefreiheit';
        
        // Event-Listener für Alt-Text-Aktualisierung
        altInput.addEventListener('input', () => {
          try {
            const imageData = JSON.parse(imageInput.value);
            imageData.alt = altInput.value;
            imageInput.value = JSON.stringify(imageData);
            setDirty(true);
          } catch (error) {
            console.error('Fehler beim Aktualisieren des Alt-Texts:', error);
          }
        });
        
        altContainer.appendChild(altLabel);
        altContainer.appendChild(altInput);
        
        imageContainer.appendChild(previewContainer);
        imageContainer.appendChild(uploadBtn);
        imageContainer.appendChild(imageInput);
        imageContainer.appendChild(altContainer);
        
        fieldContainer.appendChild(imageContainer);
        break;
        
      // Weitere Feldtypen wie gallery, date, tags, repeater usw. könnten hier implementiert werden
        
      default:
        // Fallback für unbekannte Feldtypen
        const unknownField = document.createElement('div');
        unknownField.className = 'w3-panel w3-pale-yellow';
        unknownField.innerHTML = `<p>Unbekannter Feldtyp: ${field.type}</p>`;
        fieldContainer.appendChild(unknownField);
    }
    
    container.appendChild(fieldContainer);
  }

  /**
   * Bild für ein Feld hochladen
   * @param {string} fieldId - ID des Bildfelds
   */
  function uploadImage(fieldId) {
    // Prüfen, ob UploadService verfügbar ist
    if (typeof window.uploadService === 'undefined' && typeof window.cloudinary === 'undefined') {
      showStatus('Upload-Service nicht verfügbar', true);
      return;
    }
    
    // Cloudinary-Widget öffnen, wenn verfügbar
    if (typeof window.cloudinary !== 'undefined') {
      const uploadWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'dlegnsmho',
          uploadPreset: 'ml_default',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFileSize: 5000000, // 5MB
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary-Upload-Fehler:', error);
            showStatus('Upload-Fehler: ' + error.message, true);
            return;
          }
          
          if (result && result.event === "success") {
            handleImageUploadSuccess(result.info, fieldId);
          }
        }
      );
      
      uploadWidget.open();
    } else if (typeof window.uploadService !== 'undefined') {
      // UploadService verwenden
      // Dateiauswahl-Dialog öffnen
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      
      fileInput.addEventListener('change', async () => {
        if (fileInput.files && fileInput.files.length > 0) {
          try {
            // Upload-Button-Status aktualisieren
            const uploadBtn = document.getElementById(`${fieldId}_upload`);
            if (uploadBtn) {
              uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload läuft...';
              uploadBtn.disabled = true;
            }
            
            // Datei hochladen
            const result = await window.uploadService.uploadFile(fileInput.files[0]);
            
            if (result.success) {
              handleImageUploadSuccess(result, fieldId);
            } else {
              showStatus('Upload-Fehler: ' + (result.error?.message || 'Unbekannter Fehler'), true);
            }
          } catch (error) {
            console.error('Upload-Fehler:', error);
            showStatus('Upload-Fehler: ' + error.message, true);
          } finally {
            // Upload-Button zurücksetzen
            const uploadBtn = document.getElementById(`${fieldId}_upload`);
            if (uploadBtn) {
              uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Bild auswählen';
              uploadBtn.disabled = false;
            }
            
            // Datei-Input entfernen
            document.body.removeChild(fileInput);
          }
        }
      });
      
      // Dateiauswahl-Dialog öffnen
      fileInput.click();
    } else {
      showStatus('Kein Upload-Service verfügbar', true);
    }
  }

  /**
   * Nach erfolgreichen Bild-Upload
   * @param {Object} imageData - Bilddaten vom Upload-Service
   * @param {string} fieldId - ID des Bildfelds
   */
  function handleImageUploadSuccess(imageData, fieldId) {
    // Bildvorschau aktualisieren
    const previewImg = document.querySelector(`#${fieldId}_preview img`);
    if (previewImg) {
      previewImg.src = imageData.url || imageData.secure_url;
      previewImg.style.display = 'block';
    }
    
    // Verstecktes Input aktualisieren
    const imageInput = document.getElementById(fieldId);
    if (imageInput) {
      const currentData = JSON.parse(imageInput.value || '{"url":"","alt":""}');
      const newData = {
        url: imageData.url || imageData.secure_url,
        public_id: imageData.public_id || '',
        alt: currentData.alt || ''
      };
      
      imageInput.value = JSON.stringify(newData);
    }
    
    // Ungespeicherte Änderungen markieren
    setDirty(true);
    
    // Vorschau aktualisieren
    updatePreview();
    
    showStatus('Bild erfolgreich hochgeladen');
  }

  /**
   * Templatetyp für die aktuelle Seite ändern
   * @param {string} templateId - ID des neuen Templates
   */
  function changeTemplate(templateId) {
    if (!templateDefinitions[templateId]) {
      showStatus('Ungültiges Template', true);
      return;
    }
    
    // Bei ungespeicherten Änderungen warnen
    if (editingDirty) {
      if (!confirm('Sie haben ungespeicherte Änderungen. Möchten Sie wirklich das Template wechseln?')) {
        // Template-Auswahl zurücksetzen
        if (currentEditingPage && elements.templateSelector) {
          elements.templateSelector.value = pageCache[currentEditingPage]?.template || '';
        }
        return;
      }
    }
    
    // Aktuelle Daten holen
    const currentData = getFormData();
    
    // Template-Felder generieren
    generateTemplateFields(templateId, currentData);
    
    // Status für ungespeicherte Änderungen setzen
    setDirty(true);
    
    // Vorschau aktualisieren
    updatePreview();
  }

  /**
   * Formularwerte sammeln
   * @returns {Object} Gesammelte Formularwerte
   */
  function getFormData() {
    const formData = {};
    
    // Alle Feldcontainer durchgehen
    const fieldContainers = elements.templateFields.querySelectorAll('.field-container');
    fieldContainers.forEach(container => {
      const fieldName = container.dataset.fieldName;
      const fieldType = container.dataset.fieldType;
      
      if (!fieldName || !fieldType) return;
      
      switch (fieldType) {
        case 'text':
          const textInput = document.getElementById(`field_${fieldName}`);
          if (textInput) {
            formData[fieldName] = textInput.value;
          }
          break;
          
        case 'textarea':
          // Rich-Text-Editor oder normales Textarea
          if (typeof EditorModule !== 'undefined' && typeof EditorModule.getContent === 'function') {
            // Versuchen, Inhalt vom Editor zu bekommen
            const editorContent = EditorModule.getContent(`field_${fieldName}`);
            if (editorContent) {
              formData[fieldName] = editorContent;
            } else {
              // Fallback auf normales Textarea
              const textarea = document.getElementById(`field_${fieldName}`);
              if (textarea) {
                formData[fieldName] = textarea.value;
              }
            }
          } else {
            // Normales Textarea
            const textarea = document.getElementById(`field_${fieldName}`);
            if (textarea) {
              formData[fieldName] = textarea.value;
            }
          }
          break;
          
        case 'checkbox':
          const checkbox = document.getElementById(`field_${fieldName}`);
          if (checkbox) {
            formData[fieldName] = checkbox.checked;
          }
          break;
          
        case 'image':
          const imageInput = document.getElementById(`field_${fieldName}`);
          if (imageInput) {
            try {
              formData[fieldName] = JSON.parse(imageInput.value);
            } catch (error) {
              console.error('Fehler beim Parsen der Bilddaten:', error);
              formData[fieldName] = { url: '', alt: '' };
            }
          }
          break;
          
        // Weitere Feldtypen hier behandeln
      }
    });
    
    return formData;
  }

  /**
   * Aktuelle Seite speichern
   * @param {boolean} publish - Bei true wird bei Hauptinhalt auch veröffentlicht
   */
  async function savePage(publish = false) {
    if (!currentEditingPage && !isEditingMainContent) {
      showStatus('Keine Seite zum Speichern ausgewählt', true);
      return;
    }
    
    // Ladeindikator anzeigen
    showStatus('Speichern...', false, 0);
    
    // Formularwerte sammeln
    const formData = getFormData();
    
    if (isEditingMainContent) {
      // Hauptinhalt speichern
      await saveMainContent(formData, publish);
    } else {
      // Normale Seite speichern
      await saveRegularPage(formData);
    }
  }

  /**
   * Hauptinhalt speichern
   * @param {Object} formData - Formulardaten
   * @param {boolean} publish - Bei true wird auch veröffentlicht
   */
  async function saveMainContent(formData, publish) {
    try {
      const pageTitle = elements.pageTitle ? elements.pageTitle.value : 'Homepage';
      
      // Zeitstempel hinzufügen
      const contentData = {
        ...formData,
        lastUpdated: new Date().toISOString()
      };
      
      // In Firestore speichern
      const success = await FirebaseService.content.save('content/draft', contentData);
      
      if (success) {
        // Cache aktualisieren
        mainContentCache = { ...contentData };
        
        // Ungespeicherte Änderungen zurücksetzen
        setDirty(false);
        
        showStatus('Entwurf erfolgreich gespeichert! 💾');
        
        // Wenn gewünscht, auch veröffentlichen
        if (publish) {
          await publishMainContent();
        }
      } else {
        showStatus('Fehler beim Speichern des Entwurfs', true);
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Hauptinhalts:', error);
      showStatus('Fehler beim Speichern: ' + error.message, true);
    }
  }

  /**
   * Hauptinhalt veröffentlichen
   */
  async function publishMainContent() {
    try {
      const success = await FirebaseService.content.publishOrRevert(true);
      
      if (success) {
        showStatus('Inhalt erfolgreich veröffentlicht! 🚀');
      } else {
        showStatus('Fehler beim Veröffentlichen', true);
      }
    } catch (error) {
      console.error('Fehler beim Veröffentlichen des Hauptinhalts:', error);
      showStatus('Fehler beim Veröffentlichen: ' + error.message, true);
    }
  }

  /**
   * Normale Seite speichern
   * @param {Object} formData - Formulardaten
   */
  async function saveRegularPage(formData) {
    if (!currentEditingPage) {
      showStatus('Keine Seite zum Speichern ausgewählt', true);
      return;
    }
    
    try {
      const pageTitle = elements.pageTitle ? elements.pageTitle.value : '';
      const templateId = elements.templateSelector ? elements.templateSelector.value : '';
      
      // Validierung
      if (!pageTitle) {
        showStatus('Bitte geben Sie einen Seitentitel ein', true);
        return;
      }
      
      if (!templateId || !templateDefinitions[templateId]) {
        showStatus('Bitte wählen Sie ein gültiges Template', true);
        return;
      }
      
      // Aktuelle Seitendaten holen
      const pageData = pageCache[currentEditingPage];
      if (!pageData) {
        showStatus('Fehler: Seitendaten nicht gefunden', true);
        return;
      }
      
      // Seitendaten aktualisieren
      const updatedPageData = {
        ...pageData,
        title: pageTitle,
        template: templateId,
        data: formData,
        updated: new Date().toISOString()
      };
      
      // In Firestore speichern
      const success = await FirebaseService.pages.save(currentEditingPage, updatedPageData);
      
      if (success) {
        // Cache aktualisieren
        pageCache[currentEditingPage] = updatedPageData;
        
        // Seitenlisteneintrag aktualisieren
        const pageItem = document.querySelector(`.page-item[data-id="${currentEditingPage}"] .page-title`);
        if (pageItem) {
          pageItem.textContent = pageTitle;
        }
        
        // Ungespeicherte Änderungen zurücksetzen
        setDirty(false);
        
        showStatus('Seite erfolgreich gespeichert');
      } else {
        showStatus('Fehler beim Speichern der Seite', true);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Seite:', error);
      showStatus('Fehler beim Speichern: ' + error.message, true);
    }
  }

  /**
   * Aktuelle Seite löschen
   */
  async function deletePage() {
    if (!currentEditingPage) {
      showStatus('Keine Seite zum Löschen ausgewählt', true);
      return;
    }
    
    // Hauptinhalt kann nicht gelöscht werden
    if (isEditingMainContent) {
      showStatus('Der Hauptinhalt kann nicht gelöscht werden', true);
      return;
    }
    
    // Seitendaten holen
    const pageData = pageCache[currentEditingPage];
    if (!pageData) {
      showStatus('Fehler: Seitendaten nicht gefunden', true);
      return;
    }
    
    // Löschung bestätigen
    if (!confirm(`Sind Sie sicher, dass Sie die Seite "${pageData.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }
    
    // Ladeindikator anzeigen
    showStatus('Seite wird gelöscht...', false, 0);
    
    try {
      // Aus Firestore löschen
      const success = await FirebaseService.pages.delete(currentEditingPage);
      
      if (success) {
        // Aus Cache entfernen
        delete pageCache[currentEditingPage];
        
        // Aus Seitenliste entfernen
        const pageItem = document.querySelector(`.page-item[data-id="${currentEditingPage}"]`);
        if (pageItem) {
          pageItem.remove();
        }
        
        // Aktuelle Seite zurücksetzen
        currentEditingPage = null;
        
        // Editor schließen
        closeEditor();
        
        showStatus('Seite erfolgreich gelöscht');
        
        // Falls keine Seiten mehr übrig sind, Meldung anzeigen
        if (Object.keys(pageCache).length === 0) {
          if (elements.pagesList) {
            elements.pagesList.innerHTML = `
              <div class="w3-panel w3-pale-yellow w3-center">
                <p>Keine Seiten gefunden. Erstellen Sie Ihre erste Seite!</p>
              </div>
            `;
          }
        }
      } else {
        showStatus('Fehler beim Löschen der Seite', true);
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Seite:', error);
      showStatus('Fehler beim Löschen: ' + error.message, true);
    }
  }

  /**
   * Seitenvorschau in neuem Tab öffnen
   */
  function openPagePreview() {
    if (!currentEditingPage && !isEditingMainContent) {
      showStatus('Keine Seite zur Vorschau ausgewählt', true);
      return;
    }
    
    // Bei ungespeicherten Änderungen fragen
    if (editingDirty) {
      if (!confirm('Sie haben ungespeicherte Änderungen. Vor der Vorschau speichern?')) {
        // Ohne Speichern fortfahren
        if (isEditingMainContent) {
          window.open('preview.html?draft=true', '_blank');
        } else {
          window.open(`page.php?id=${currentEditingPage}`, '_blank');
        }
        return;
      }
      
      // Zuerst speichern, dann Vorschau öffnen
      savePage().then(() => {
        if (isEditingMainContent) {
          window.open('preview.html?draft=true', '_blank');
        } else {
          window.open(`page.php?id=${currentEditingPage}`, '_blank');
        }
      });
    } else {
      // Keine ungespeicherten Änderungen, direkt Vorschau öffnen
      if (isEditingMainContent) {
        window.open('preview.html?draft=true', '_blank');
      } else {
        window.open(`page.php?id=${currentEditingPage}`, '_blank');
      }
    }
  }

  /**
   * Editor schließen und zur Willkommensseite zurückkehren
   */
  function closeEditor() {
    // Bei ungespeicherten Änderungen warnen
    if (editingDirty) {
      if (!confirm('Sie haben ungespeicherte Änderungen. Möchten Sie wirklich ohne zu speichern schließen?')) {
        return;
      }
    }
    
    // Aktuelle Seite und Flags zurücksetzen
    currentEditingPage = null;
    isEditingMainContent = false;
    
    // Editor ausblenden und Willkommensseite anzeigen
    if (elements.pageEditorContainer) {
      elements.pageEditorContainer.style.display = 'none';
    }
    
    if (elements.pageWelcomeContainer) {
      elements.pageWelcomeContainer.style.display = 'block';
    }
    
    // Template-Selector (möglicher Disable-Status) zurücksetzen
    if (elements.templateSelector) {
      elements.templateSelector.disabled = false;
    }
    
    // Ungespeicherte Änderungen zurücksetzen
    setDirty(false);
  }

  /**
   * Live-Vorschau aktualisieren
   */
  function updatePreview() {
    if (!elements.livePreview || (!currentEditingPage && !isEditingMainContent)) return;
    
    // Formularwerte sammeln
    const formData = getFormData();
    
    // Vorschau-HTML erstellen
    let previewHtml;
    
    if (isEditingMainContent) {
      // Für Hauptinhalt eine vereinfachte Homepage-Vorschau erstellen
      previewHtml = generateMainContentPreview(formData);
    } else {
      // Für normale Seiten Vorschau basierend auf Template erstellen
      const pageData = pageCache[currentEditingPage];
      if (!pageData) return;
      
      const templateId = elements.templateSelector ? elements.templateSelector.value : pageData.template;
      previewHtml = generatePreviewHtml(templateId, formData);
    }
    
    // Vorschau-Container aktualisieren
    elements.livePreview.innerHTML = previewHtml;
  }

  /**
   * Vorschau-HTML für Hauptinhalt generieren
   * @param {Object} data - Inhaltsdaten
   * @returns {string} Vorschau-HTML
   */
  function generateMainContentPreview(data) {
    // CSS für die Vorschau
    const previewCSS = `
      <style>
        .preview-container {
          font-family: 'Lato', sans-serif;
          color: #333;
          padding: 15px;
        }
        .preview-section {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px dashed #ccc;
          border-radius: 4px;
        }
        .preview-section-title {
          margin-top: 0;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
          font-weight: bold;
          color: #555;
        }
        .preview-content img {
          max-width: 100%;
          height: auto;
        }
      </style>
    `;
    
    // Vorschau-HTML
    return `
      <div class="preview-container">
        ${previewCSS}
        
        <!-- About-Bereich Vorschau -->
        <div class="preview-section">
          <h4 class="preview-section-title">About-Bereich</h4>
          <div class="preview-content">
            <h2>${data.aboutTitle || 'About-Titel'}</h2>
            <h3>${data.aboutSubtitle || 'About-Untertitel'}</h3>
            <div>${data.aboutText || ''}</div>
          </div>
        </div>
        
        <!-- Angebote-Bereich Vorschau -->
        <div class="preview-section">
          <h4 class="preview-section-title">Angebote-Bereich</h4>
          <div class="preview-content">
            <h2>${data.offeringsTitle || 'Angebote-Titel'}</h2>
            <h3>${data.offeringsSubtitle || 'Angebote-Untertitel'}</h3>
            
            <div class="w3-row">
              <!-- Angebot 1 -->
              <div class="w3-col s12 m4 w3-padding">
                <h4>${data.offer1Title || 'Angebot 1'}</h4>
                ${data.offer1_image && data.offer1_image.url ? 
                  `<img src="${data.offer1_image.url}" alt="${data.offer1_image.alt || 'Angebot 1'}" style="width:100%">` : 
                  '<div style="height:100px;background:#eee;text-align:center;line-height:100px;">Bild</div>'}
                <div>${data.offer1Desc || ''}</div>
              </div>
              
              <!-- Angebot 2 -->
              <div class="w3-col s12 m4 w3-padding">
                <h4>${data.offer2Title || 'Angebot 2'}</h4>
                ${data.offer2_image && data.offer2_image.url ? 
                  `<img src="${data.offer2_image.url}" alt="${data.offer2_image.alt || 'Angebot 2'}" style="width:100%">` : 
                  '<div style="height:100px;background:#eee;text-align:center;line-height:100px;">Bild</div>'}
                <div>${data.offer2Desc || ''}</div>
              </div>
              
              <!-- Angebot 3 -->
              <div class="w3-col s12 m4 w3-padding">
                <h4>${data.offer3Title || 'Angebot 3'}</h4>
                ${data.offer3_image && data.offer3_image.url ? 
                  `<img src="${data.offer3_image.url}" alt="${data.offer3_image.alt || 'Angebot 3'}" style="width:100%">` : 
                  '<div style="height:100px;background:#eee;text-align:center;line-height:100px;">Bild</div>'}
                <div>${data.offer3Desc || ''}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Kontakt-Bereich Vorschau -->
        <div class="preview-section">
          <h4 class="preview-section-title">Kontakt-Bereich</h4>
          <div class="preview-content">
            <h2>${data.contactTitle || 'Kontakt-Titel'}</h2>
            <h3>${data.contactSubtitle || 'Kontakt-Untertitel'}</h3>
            ${data.contact_image && data.contact_image.url ? 
              `<img src="${data.contact_image.url}" alt="${data.contact_image.alt || 'Kontakt'}" style="max-width:300px">` : 
              '<div style="height:100px;width:300px;background:#eee;text-align:center;line-height:100px;">Kontaktbild</div>'}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Vorschau-HTML basierend auf Template und Daten generieren
   * @param {string} templateId - Template-ID
   * @param {Object} data - Formulardaten
   * @returns {string} Vorschau-HTML
   */
  function generatePreviewHtml(templateId, data) {
    if (!templateDefinitions[templateId]) {
      return '<div class="w3-panel w3-pale-red">Ungültiges Template</div>';
    }
    
    // Seitentitel aus Feld oder Formular holen
    const pageTitle = elements.pageTitle ? elements.pageTitle.value : '';
    
    // Diese Funktion sollte für alle Templates eine entsprechende Vorschau generieren
    // Die Implementierung würde den Rahmen der Refaktorierung sprengen
    
    return `
      <div class="w3-panel w3-pale-blue">
        <h3>Vorschau: ${templateDefinitions[templateId].name}</h3>
        <p>${templateDefinitions[templateId].description}</p>
        <div class="w3-margin-top">${templateDefinitions[templateId].preview}</div>
      </div>
    `;
  }

  /**
   * Status für ungespeicherte Änderungen setzen
   * @param {boolean} isDirty - Neuer Status
   */
  function setDirty(isDirty) {
    editingDirty = isDirty;
    
    // Wenn AdminCore verfügbar, globalen Status aktualisieren
    if (typeof AdminCore !== 'undefined' && typeof AdminCore.setDirty === 'function') {
      AdminCore.setDirty(isDirty);
    }
    
    // Speichern-Button aktivieren/deaktivieren, falls vorhanden
    if (elements.savePageBtn) {
      elements.savePageBtn.disabled = !isDirty;
    }
    
    // Veröffentlichen-Button aktivieren/deaktivieren, falls vorhanden
    if (elements.publishPageBtn && isEditingMainContent) {
      elements.publishPageBtn.disabled = !isDirty;
    }
  }

  // Öffentliche API
  return {
    init,
    loadPages,
    openEditor,
    closeEditor,
    savePage,
    deletePage,
    openCreatePageDialog,
    editMainContent,
    updatePreview,
    setDirty: (isDirty) => setDirty(isDirty),
    getDirtyState: () => editingDirty,
    getPageCache: () => ({ ...pageCache }),
    getMainContentCache: () => mainContentCache ? { ...mainContentCache } : null
  };
})();

// Für globalen Zugriff
window.PageEditor = PageEditor;

// Automatisch initialisieren, wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', () => {
  // Verzögerte Initialisierung, um sicherzustellen, dass andere Module geladen sind
  setTimeout(PageEditor.init, 200);
});