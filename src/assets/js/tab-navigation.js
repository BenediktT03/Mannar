 // Enhanced tab navigation with debug
document.addEventListener('DOMContentLoaded', function() {
  // Debug function
  function debug(message) {
    console.log(`[Tab Navigation] ${message}`);
  }

  // Get all tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  // Get all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  
  debug(`Found ${tabButtons.length} tab buttons and ${tabContents.length} tab contents`);
  
  // Make the tabs system more robust
  function setupTabNavigation() {
    // First, hide all tab contents
    tabContents.forEach(content => {
      content.style.display = 'none';
    });
    
    // Ensure we have active tab set (default to pages)
    let activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) {
      activeTab = document.querySelector('.tab-btn[data-tab="pages"]');
      if (activeTab) {
        activeTab.classList.add('active');
      }
    }
    
    // Show the active tab content
    if (activeTab) {
      const tabName = activeTab.getAttribute('data-tab');
      const tabContent = document.getElementById(`${tabName}-tab`);
      if (tabContent) {
        tabContent.style.display = 'block';
        tabContent.classList.add('active');
        debug(`Activated tab: ${tabName}`);
      } else {
        debug(`Tab content not found for ${tabName}`);
      }
    }
    
    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        debug(`Clicked tab: ${tabName}`);
        
        // Hide all tab contents
        tabContents.forEach(content => {
          content.style.display = 'none';
          content.classList.remove('active');
          debug(`Hiding tab content: ${content.id}`);
        });
        
        // Remove active class from all buttons
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Show the corresponding tab content
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
          tabContent.style.display = 'block';
          tabContent.classList.add('active');
          debug(`Showing tab content: ${tabContent.id}`);
          
          // Special handling for certain tabs
          if (tabName === 'preview') {
            // Refresh preview
            if (typeof refreshPreview === 'function') {
              setTimeout(refreshPreview, 300);
            }
          } else if (tabName === 'pages') {
            // Ensure PageEditor is initialized
            if (typeof PageEditor !== 'undefined' && PageEditor.loadPages) {
              setTimeout(PageEditor.loadPages, 300);
            }
          } else if (tabName === 'settings') {
            // Ensure GlobalSettings is initialized
            if (typeof GlobalSettings !== 'undefined' && GlobalSettings.loadSettings) {
              setTimeout(GlobalSettings.loadSettings, 300);
            }
          }
        } else {
          debug(`Tab content not found for ${tabName}`);
        }
      });
    });
  }
  
  // Force show tab if hash is present
  function handleHashChange() {
    if (window.location.hash) {
      const tabName = window.location.hash.substring(1);
      const tabButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
      if (tabButton) {
        tabButton.click();
      }
    }
  }
  
  // Watch for hash changes
  window.addEventListener('hashchange', handleHashChange);
  
  // Setup tab navigation system
  setupTabNavigation();
  
  // Handle initial hash
  handleHashChange();
  
  // Expose tab functions globally
  window.AdminTabs = {
    activateTab: function(tabName) {
      const tabButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
      if (tabButton) {
        tabButton.click();
      }
    }
  };
  
  // Create a simple CSS fix for tab display if needed
  function ensureTabStyles() {
    // Check if we already have the fix
    if (document.getElementById('admin-tab-fix-styles')) {
      return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'admin-tab-fix-styles';
    style.innerHTML = `
      /* Force tab display for active tabs */
      #dashboard-tab.active, 
      #pages-tab.active, 
      #wordcloud-tab.active, 
      #preview-tab.active,
      #settings-tab.active {
        display: block !important;
      }
      
      /* Hide all tabs by default */
      #dashboard-tab, 
      #pages-tab, 
      #wordcloud-tab, 
      #preview-tab,
      #settings-tab {
        display: none !important;
      }
    `;
    
    // Add to head
    document.head.appendChild(style);
    debug('Added tab style fix');
  }
  
  // Apply styles fix
  ensureTabStyles();
});