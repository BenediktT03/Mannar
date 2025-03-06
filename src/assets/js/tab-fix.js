 /**
 * Tab Navigation Fix Script
 * Diese Datei behebt Probleme mit der Tab-Navigation im Admin-Panel
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Tab Fix Script geladen");
  
  // Warte einen Moment, damit andere Skripte geladen werden können
  setTimeout(function() {
    // Funktionen für Tab-Aktivierung
    function activateTab(tabName) {
      console.log("Aktiviere Tab:", tabName);
      
      // Alle Tab-Inhalte ausblenden
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
      });
      
      // Alle Tab-Buttons deaktivieren
      const tabButtons = document.querySelectorAll('.tab-btn');
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Den gewählten Tab-Button aktivieren
      const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
      if (selectedButton) {
        selectedButton.classList.add('active');
      }
      
      // Den gewählten Tab-Inhalt anzeigen
      const selectedContent = document.getElementById(`${tabName}-tab`);
      if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');
        
        // Trigger ein Resize-Event für Charts und andere responsive Elemente
        window.dispatchEvent(new Event('resize'));
      } else {
        console.error(`Tab-Inhalt für ${tabName} nicht gefunden!`);
      }
    }
    
    // Event-Listener für Tab-Buttons hinzufügen
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        activateTab(tabName);
      });
    });
    
    // Tab-CSS-Fix
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* CSS-Fix für Tab-Anzeige */
      .tab-content {
        display: none !important;
      }
      
      .tab-content.active {
        display: block !important;
      }
      
      #dashboard-tab.active, 
      #pages-tab.active, 
      #wordcloud-tab.active, 
      #preview-tab.active,
      #settings-tab.active {
        display: block !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Standard-Tab aktivieren
    const defaultTab = document.querySelector('.tab-btn.active');
    if (defaultTab) {
      activateTab(defaultTab.getAttribute('data-tab'));
    } else {
      // Fallback auf den ersten Tab
      const firstTabButton = document.querySelector('.tab-btn');
      if (firstTabButton) {
        activateTab(firstTabButton.getAttribute('data-tab'));
      }
    }
    
    // Global verfügbar machen
    window.activateTab = activateTab;
  }, 500);
});