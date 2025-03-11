/**
 * Editor Module
 * Verwaltet Rich-Text-Editoren im Admin-Bereich
 * Bietet eine einheitliche API für Quill-Editoren
 */
const EditorModule = (function() {
  // Aktive Editoren speichern
  const activeEditors = new Map();
  
  // Standard-Editor-Optionen
  const defaultOptions = {
    theme: 'snow',
    placeholder: 'Inhalt hier eingeben...',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    }
  };
  
  // Erweiterte Editor-Optionen für verschiedene Feldtypen
  const editorTypes = {
    // Editor für Überschriften und kurze Texte
    heading: {
      placeholder: 'Überschrift eingeben...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'header': [1, 2, 3, false] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['clean']
        ]
      }
    },
    
    // Editor für kurze Textabschnitte
    short: {
      placeholder: 'Kurzen Text eingeben...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    },
    
    // Vollständiger Editor für umfangreiche Inhalte
    full: {
      placeholder: 'Inhalt hier eingeben...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ]
      }
    }
  };
  
  /**
   * Prüfen, ob Quill verfügbar ist
   * @returns {boolean} Verfügbarkeit
   */
  function isQuillAvailable() {
    return typeof Quill !== 'undefined';
  }
  
  /**
   * Quill-Editor initialisieren
   * @param {HTMLElement|string} container - Container oder Container-ID
   * @param {Object} options - Editor-Optionen
   * @returns {Object} Quill-Editor-Instanz
   */
  function initEditor(container, options = {}) {
    if (!isQuillAvailable()) {
      console.error('Quill-Editor nicht verfügbar. Bitte laden Sie die Quill-Bibliothek.');
      return null;
    }
    
    // Container ermitteln
    const editorContainer = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!editorContainer) {
      console.error('Editor-Container nicht gefunden');
      return null;
    }
    
    // Vordefinierte Optionen basierend auf editorType auswählen
    let baseOptions = { ...defaultOptions };
    if (options.editorType && editorTypes[options.editorType]) {
      baseOptions = { ...baseOptions, ...editorTypes[options.editorType] };
      delete options.editorType; // editorType aus Optionen entfernen
    }
    
    // Optionen zusammenführen
    const mergedOptions = { ...baseOptions, ...options };
    
    try {
      // Quill-Editor erstellen
      const editor = new Quill(editorContainer, mergedOptions);
      
      // Editor im Map speichern
      const containerId = editorContainer.id || `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if (!editorContainer.id) {
        editorContainer.id = containerId;
      }
      
      activeEditors.set(containerId, editor);
      
      return editor;
    } catch (error) {
      console.error('Fehler beim Initialisieren des Editors:', error);
      return null;
    }
  }
  
  /**
   * Editor-Inhalt abrufen
   * @param {string} containerId - Container-ID
   * @returns {string} HTML-Inhalt
   */
  function getContent(containerId) {
    const editor = activeEditors.get(containerId);
    if (!editor) return '';
    
    return editor.root.innerHTML;
  }
  
  /**
   * Editor-Inhalt festlegen
   * @param {string} containerId - Container-ID
   * @param {string} content - HTML-Inhalt
   * @returns {boolean} Erfolg
   */
  function setContent(containerId, content) {
    const editor = activeEditors.get(containerId);
    if (!editor) return false;
    
    // Inhalt löschen und neuen Inhalt einfügen
    editor.root.innerHTML = '';
    editor.clipboard.dangerouslyPasteHTML(content || '');
    
    return true;
  }
  
  /**
   * Editor-Instanz abrufen
   * @param {string} containerId - Container-ID
   * @returns {Object} Quill-Editor-Instanz
   */
  function getEditor(containerId) {
    return activeEditors.get(containerId);
  }
  
  /**
   * Textarea in Quill-Editor umwandeln
   * @param {HTMLElement|string} textarea - Textarea oder Textarea-ID
   * @param {Object} options - Editor-Optionen
   * @returns {Object} Quill-Editor-Instanz
   */
  function convertTextarea(textarea, options = {}) {
    if (!isQuillAvailable()) {
      console.error('Quill-Editor nicht verfügbar');
      return null;
    }
    
    // Textarea ermitteln
    const textareaElement = typeof textarea === 'string' 
      ? document.getElementById(textarea) 
      : textarea;
    
    if (!textareaElement || textareaElement.tagName !== 'TEXTAREA') {
      console.error('Keine gültige Textarea gefunden');
      return null;
    }
    
    // Editor-Container erstellen
    const containerId = `${textareaElement.id}-editor`;
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'quill-editor';
      container.style.minHeight = options.minHeight || '200px';
      
      // Container nach der Textarea einfügen
      textareaElement.insertAdjacentElement('afterend', container);
    }
    
    // Textarea ausblenden
    textareaElement.style.display = 'none';
    
    // Editor initialisieren
    const editor = initEditor(container, options);
    
    if (!editor) {
      console.error('Fehler beim Initialisieren des Editors');
      return null;
    }
    
    // Initialen Inhalt setzen
    editor.clipboard.dangerouslyPasteHTML(textareaElement.value || '');
    
    // Änderungen in Textarea synchronisieren
    editor.on('text-change', () => {
      textareaElement.value = editor.root.innerHTML;
      
      // Change-Event auf der Textarea auslösen
      const event = new Event('change', { bubbles: true });
      textareaElement.dispatchEvent(event);
      
      // Dirty-Flag setzen, wenn im Admin-Bereich
      if (window.AdminCore && typeof window.AdminCore.setDirty === 'function') {
        window.AdminCore.setDirty(true);
      } else if (window.state && typeof window.state.isDirty !== 'undefined') {
        window.state.isDirty = true;
      }
    });
    
    return editor;
  }
  
  /**
   * Alle Textarea mit bestimmter Klasse in Editoren umwandeln
   * @param {string} selector - CSS-Selektor für die Textareas
   * @param {Object} options - Editor-Optionen
   * @returns {Array} Erstellte Editoren
   */
  function convertAll(selector = '.rich-editor', options = {}) {
    const textareas = document.querySelectorAll(selector);
    const editors = [];
    
    textareas.forEach(textarea => {
      // Spezifische Optionen basierend auf Datenattributen
      const elementOptions = { ...options };
      
      // Editor-Typ aus data-editor-type auslesen
      if (textarea.dataset.editorType && editorTypes[textarea.dataset.editorType]) {
        elementOptions.editorType = textarea.dataset.editorType;
      }
      
      // Min-Höhe aus data-min-height auslesen
      if (textarea.dataset.minHeight) {
        elementOptions.minHeight = textarea.dataset.minHeight;
      }
      
      // Editor erstellen
      const editor = convertTextarea(textarea, elementOptions);
      if (editor) editors.push(editor);
    });
    
    return editors;
  }
  
  /**
   * Editor aus dem DOM entfernen
   * @param {string} containerId - Container-ID
   * @returns {boolean} Erfolg
   */
  function destroyEditor(containerId) {
    const editor = activeEditors.get(containerId);
    if (!editor) return false;
    
    // Editor aus Map entfernen
    activeEditors.delete(containerId);
    
    // Container leeren
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      
      // Versteckte Textarea suchen und wieder anzeigen
      const textareaId = containerId.replace('-editor', '');
      const textarea = document.getElementById(textareaId);
      if (textarea) {
        textarea.style.display = '';
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Alle Editoren aus dem DOM entfernen
   */
  function destroyAll() {
    for (const containerId of activeEditors.keys()) {
      destroyEditor(containerId);
    }
  }
  
  /**
   * Editoren nach DOM-Änderungen neu initialisieren
   * (nützlich nach AJAX-Ladeprozessen)
   * @param {string} selector - CSS-Selektor für Textarea
   * @param {Object} options - Editor-Optionen
   */
  function refreshEditors(selector = '.rich-editor', options = {}) {
    // Vorhandene Container-IDs merken
    const existingEditors = new Set(activeEditors.keys());
    
    // Neue Editoren erstellen
    const editors = convertAll(selector, options);
    
    // Alte Editoren entfernen, die noch in der Map sind, aber nicht mehr auf der Seite
    for (const containerId of existingEditors) {
      if (!document.getElementById(containerId)) {
        activeEditors.delete(containerId);
      }
    }
    
    return editors;
  }
  
  // TinyMCE-Kompatibilitätsschicht erstellen
  function createTinyMCECompatLayer() {
    return {
      init: function(selector) {
        convertAll(selector);
        return this;
      },
      activeEditor: {
        getContent: function() {
          // Aktiven Editor finden (einfache Implementierung)
          for (const [id, editor] of activeEditors.entries()) {
            if (document.activeElement.closest(`#${id}`)) {
              return editor.root.innerHTML;
            }
          }
          
          // Wenn kein aktiver Editor gefunden, ersten Editor verwenden
          if (activeEditors.size > 0) {
            const firstEditor = activeEditors.values().next().value;
            return firstEditor.root.innerHTML;
          }
          
          return '';
        }
      },
      get editors() {
        return Array.from(activeEditors.values());
      },
      remove: function(selector) {
        const containers = document.querySelectorAll(selector);
        containers.forEach(container => {
          const editorId = `${container.id}-editor`;
          destroyEditor(editorId);
        });
      }
    };
  }
  
  // Öffentliche API
  return {
    initEditor,
    getContent,
    setContent,
    getEditor,
    convertTextarea,
    convertAll,
    destroyEditor,
    destroyAll,
    refreshEditors,
    getActiveEditors: () => activeEditors,
    createTinyMCECompatLayer
  };
})();

// Für globalen Zugriff
window.EditorModule = EditorModule;

// TinyMCE-Kompatibilitätsschicht für ältere Skripte
window.tinymce = EditorModule.createTinyMCECompatLayer();

// Ältere Editor-Namen für Rückwärtskompatibilität
window.editorModule = EditorModule;
window.quillEditor = EditorModule;

// Initialisierung bei DOM-Ladung
document.addEventListener('DOMContentLoaded', function() {
  // Verzögerung, um sicherzustellen, dass Quill geladen ist
  setTimeout(() => {
    if (typeof Quill !== 'undefined') {
      EditorModule.convertAll();
    }
  }, 100);
});