 /**
 * Global Settings Manager
 * Handles site-wide style and layout settings
 */

const GlobalSettings = (function() {
  // Default settings
  const defaults = {
    colors: {
      primary: '#3498db',
      secondary: '#2c3e50',
      accent: '#e74c3c',
      text: '#333333'
    },
    typography: {
      fontFamily: "'Lato', sans-serif",
      headingFont: "'Lato', sans-serif",
      baseFontSize: 16,
      lineHeight: 1.6
    },
    layout: {
      containerWidth: 1170,
      borderRadius: 4,
      buttonStyle: 'rounded',
      enableAnimations: true
    }
  };

  // Current settings (will be loaded from Firebase)
  let currentSettings = JSON.parse(JSON.stringify(defaults));
  
  // DOM Elements
  const elements = {};
  
  // Firebase references
  let db;

  // Initialize
  function init() {
    if (typeof firebase !== 'undefined') {
      db = firebase.firestore();
    } else {
      console.error('Firebase not found');
      return;
    }
    
    // Cache DOM elements
    cacheElements();
    
    // Add event listeners
    attachEvents();
    
    // Load settings from Firebase
    loadSettings();
    
    console.log('Global Settings Manager initialized');
  }

  // Cache DOM elements
  function cacheElements() {
    // Color inputs
    elements.primaryColor = document.getElementById('primaryColor');
    elements.secondaryColor = document.getElementById('secondaryColor');
    elements.accentColor = document.getElementById('accentColor');
    elements.textColor = document.getElementById('textColor');
    
    // Color value displays
    elements.primaryColorValue = document.getElementById('primaryColorValue');
    elements.secondaryColorValue = document.getElementById('secondaryColorValue');
    elements.accentColorValue = document.getElementById('accentColorValue');
    elements.textColorValue = document.getElementById('textColorValue');
    
    // Typography inputs
    elements.fontFamily = document.getElementById('fontFamily');
    elements.headingFont = document.getElementById('headingFont');
    elements.baseFontSize = document.getElementById('baseFontSize');
    elements.lineHeight = document.getElementById('lineHeight');
    
    // Typography value displays
    elements.baseFontSizeValue = document.getElementById('baseFontSizeValue');
    elements.lineHeightValue = document.getElementById('lineHeightValue');
    
    // Layout inputs
    elements.containerWidth = document.getElementById('containerWidth');
    elements.borderRadius = document.getElementById('borderRadius');
    elements.buttonStyle = document.getElementById('buttonStyle');
    elements.enableAnimations = document.getElementById('enableAnimations');
    
    // Layout value displays
    elements.containerWidthValue = document.getElementById('containerWidthValue');
    elements.borderRadiusValue = document.getElementById('borderRadiusValue');
    
    // Action buttons
    elements.resetSettingsBtn = document.getElementById('resetSettingsBtn');
    elements.previewSettingsBtn = document.getElementById('previewSettingsBtn');
    elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // Preview container
    elements.stylePreview = document.getElementById('stylePreview');
  }

  // Attach event listeners
  function attachEvents() {
    // Color inputs
    if (elements.primaryColor) {
      elements.primaryColor.addEventListener('input', function() {
        if (elements.primaryColorValue) {
          elements.primaryColorValue.textContent = this.value;
        }
        currentSettings.colors.primary = this.value;
        updatePreview();
      });
    }
    
    if (elements.secondaryColor) {
      elements.secondaryColor.addEventListener('input', function() {
        if (elements.secondaryColorValue) {
          elements.secondaryColorValue.textContent = this.value;
        }
        currentSettings.colors.secondary = this.value;
        updatePreview();
      });
    }
    
    if (elements.accentColor) {
      elements.accentColor.addEventListener('input', function() {
        if (elements.accentColorValue) {
          elements.accentColorValue.textContent = this.value;
        }
        currentSettings.colors.accent = this.value;
        updatePreview();
      });
    }
    
    if (elements.textColor) {
      elements.textColor.addEventListener('input', function() {
        if (elements.textColorValue) {
          elements.textColorValue.textContent = this.value;
        }
        currentSettings.colors.text = this.value;
        updatePreview();
      });
    }
    
    // Typography inputs
    if (elements.fontFamily) {
      elements.fontFamily.addEventListener('change', function() {
        currentSettings.typography.fontFamily = this.value;
        updatePreview();
      });
    }
    
    if (elements.headingFont) {
      elements.headingFont.addEventListener('change', function() {
        currentSettings.typography.headingFont = this.value;
        updatePreview();
      });
    }
    
    if (elements.baseFontSize) {
      elements.baseFontSize.addEventListener('input', function() {
        if (elements.baseFontSizeValue) {
          elements.baseFontSizeValue.textContent = this.value;
        }
        currentSettings.typography.baseFontSize = parseInt(this.value);
        updatePreview();
      });
    }
    
    if (elements.lineHeight) {
      elements.lineHeight.addEventListener('input', function() {
        if (elements.lineHeightValue) {
          elements.lineHeightValue.textContent = this.value;
        }
        currentSettings.typography.lineHeight = parseFloat(this.value);
        updatePreview();
      });
    }
    
    // Layout inputs
    if (elements.containerWidth) {
      elements.containerWidth.addEventListener('input', function() {
        if (elements.containerWidthValue) {
          elements.containerWidthValue.textContent = this.value;
        }
        currentSettings.layout.containerWidth = parseInt(this.value);
        updatePreview();
      });
    }
    
    if (elements.borderRadius) {
      elements.borderRadius.addEventListener('input', function() {
        if (elements.borderRadiusValue) {
          elements.borderRadiusValue.textContent = this.value;
        }
        currentSettings.layout.borderRadius = parseInt(this.value);
        updatePreview();
      });
    }
    
    if (elements.buttonStyle) {
      elements.buttonStyle.addEventListener('change', function() {
        currentSettings.layout.buttonStyle = this.value;
        updatePreview();
      });
    }
    
    if (elements.enableAnimations) {
      elements.enableAnimations.addEventListener('change', function() {
        currentSettings.layout.enableAnimations = this.checked;
        updatePreview();
      });
    }
    
    // Action buttons
    if (elements.resetSettingsBtn) {
      elements.resetSettingsBtn.addEventListener('click', resetSettings);
    }
    
    if (elements.previewSettingsBtn) {
      elements.previewSettingsBtn.addEventListener('click', openSettingsPreview);
    }
    
    if (elements.saveSettingsBtn) {
      elements.saveSettingsBtn.addEventListener('click', saveSettings);
    }
  }

  // Load settings from Firebase
  function loadSettings() {
    if (!db) return;
    
    db.collection('settings').doc('global').get()
      .then(doc => {
        if (doc.exists) {
          const settings = doc.data();
          
          // Merge with defaults to ensure all properties exist
          currentSettings = {
            colors: { ...defaults.colors, ...settings.colors },
            typography: { ...defaults.typography, ...settings.typography },
            layout: { ...defaults.layout, ...settings.layout }
          };
          
          // Update UI with loaded settings
          updateSettingsUI();
        } else {
          // Create settings document with defaults if it doesn't exist
          db.collection('settings').doc('global').set(defaults)
            .then(() => {
              console.log('Created default settings');
            })
            .catch(error => {
              console.error('Error creating default settings:', error);
            });
        }
      })
      .catch(error => {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings: ' + error.message, true);
      });
  }

  // Update UI with current settings
  function updateSettingsUI() {
    // Update color inputs
    if (elements.primaryColor && currentSettings.colors.primary) {
      elements.primaryColor.value = currentSettings.colors.primary;
      if (elements.primaryColorValue) {
        elements.primaryColorValue.textContent = currentSettings.colors.primary;
      }
    }
    
    if (elements.secondaryColor && currentSettings.colors.secondary) {
      elements.secondaryColor.value = currentSettings.colors.secondary;
      if (elements.secondaryColorValue) {
        elements.secondaryColorValue.textContent = currentSettings.colors.secondary;
      }
    }
    
    if (elements.accentColor && currentSettings.colors.accent) {
      elements.accentColor.value = currentSettings.colors.accent;
      if (elements.accentColorValue) {
        elements.accentColorValue.textContent = currentSettings.colors.accent;
      }
    }
    
    if (elements.textColor && currentSettings.colors.text) {
      elements.textColor.value = currentSettings.colors.text;
      if (elements.textColorValue) {
        elements.textColorValue.textContent = currentSettings.colors.text;
      }
    }
    
    // Update typography inputs
    if (elements.fontFamily && currentSettings.typography.fontFamily) {
      elements.fontFamily.value = currentSettings.typography.fontFamily;
    }
    
    if (elements.headingFont && currentSettings.typography.headingFont) {
      elements.headingFont.value = currentSettings.typography.headingFont;
    }
    
    if (elements.baseFontSize && currentSettings.typography.baseFontSize) {
      elements.baseFontSize.value = currentSettings.typography.baseFontSize;
      if (elements.baseFontSizeValue) {
        elements.baseFontSizeValue.textContent = currentSettings.typography.baseFontSize;
      }
    }
    
    if (elements.lineHeight && currentSettings.typography.lineHeight) {
      elements.lineHeight.value = currentSettings.typography.lineHeight;
      if (elements.lineHeightValue) {
        elements.lineHeightValue.textContent = currentSettings.typography.lineHeight;
      }
    }
    
    // Update layout inputs
    if (elements.containerWidth && currentSettings.layout.containerWidth) {
      elements.containerWidth.value = currentSettings.layout.containerWidth;
      if (elements.containerWidthValue) {
        elements.containerWidthValue.textContent = currentSettings.layout.containerWidth;
      }
    }
    
    if (elements.borderRadius && currentSettings.layout.borderRadius !== undefined) {
      elements.borderRadius.value = currentSettings.layout.borderRadius;
      if (elements.borderRadiusValue) {
        elements.borderRadiusValue.textContent = currentSettings.layout.borderRadius;
      }
    }
    
    if (elements.buttonStyle && currentSettings.layout.buttonStyle) {
      elements.buttonStyle.value = currentSettings.layout.buttonStyle;
    }
    
    if (elements.enableAnimations && currentSettings.layout.enableAnimations !== undefined) {
      elements.enableAnimations.checked = currentSettings.layout.enableAnimations;
    }
    
    // Update preview
    updatePreview();
  }

  // Update the style preview
  function updatePreview() {
    if (!elements.stylePreview) return;
    
    // Generate CSS for preview
    const previewCSS = `
      <style>
        #stylePreview {
          font-family: ${currentSettings.typography.fontFamily};
          font-size: ${currentSettings.typography.baseFontSize}px;
          line-height: ${currentSettings.typography.lineHeight};
          color: ${currentSettings.colors.text};
        }
        
        #stylePreview h1, 
        #stylePreview h2 {
          font-family: ${currentSettings.typography.headingFont};
          color: ${currentSettings.colors.secondary};
        }
        
        #stylePreview h1 {
          font-size: 2em;
          margin-top: 0;
        }
        
        #stylePreview h2 {
          font-size: 1.5em;
        }
        
        #stylePreview .preview-button {
          background-color: ${currentSettings.colors.primary};
          color: white;
          padding: 8px 16px;
          border: none;
          cursor: pointer;
          ${getBorderRadiusStyle(currentSettings.layout.buttonStyle, currentSettings.layout.borderRadius)}
          ${currentSettings.layout.enableAnimations ? 
            'transition: all 0.3s ease; transform: translateY(0);' : ''}
        }
        
        #stylePreview .preview-button:hover {
          background-color: ${lightenDarkenColor(currentSettings.colors.primary, -20)};
          ${currentSettings.layout.enableAnimations ? 
            'transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1);' : ''}
        }
        
        #stylePreview .preview-card {
          ${getBorderRadiusStyle('rounded', currentSettings.layout.borderRadius)}
          border: 1px solid #ddd;
          ${currentSettings.layout.enableAnimations ? 
            'transition: all 0.3s ease;' : ''}
        }
        
        #stylePreview .preview-card:hover {
          ${currentSettings.layout.enableAnimations ? 
            'box-shadow: 0 4px 8px rgba(0,0,0,0.1);' : ''}
        }
      </style>
    `;
    
    // Insert the style tag at the beginning of the preview
    let currentContent = elements.stylePreview.innerHTML;
    
    // Remove any existing style tags
    currentContent = currentContent.replace(/<style>[\s\S]*?<\/style>/g, '');
    
    // Add the new style tag
    elements.stylePreview.innerHTML = previewCSS + currentContent;
  }
  
  // Get border radius style based on button style and radius value
  function getBorderRadiusStyle(style, radius) {
    switch (style) {
      case 'square':
        return 'border-radius: 0;';
      case 'pill':
        return 'border-radius: 50px;';
      case 'rounded':
      default:
        return `border-radius: ${radius}px;`;
    }
  }
  
  // Utility to lighten or darken a color
  function lightenDarkenColor(col, amt) {
    let usePound = false;
    
    if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
    }
    
    let num = parseInt(col, 16);
    
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  }

  // Reset settings to defaults
  function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }
    
    // Reset to defaults
    currentSettings = JSON.parse(JSON.stringify(defaults));
    
    // Update UI
    updateSettingsUI();
    
    // Show status message
    showStatus('Settings reset to defaults');
  }

  // Open settings preview in a new tab
  function openSettingsPreview() {
    // Generate a style tag with the current settings
    const css = generateCSS();
    
    // Create a temporary element to hold our style tag
    const temp = document.createElement('div');
    temp.innerHTML = css;
    
    // Store the CSS in local storage (limited to current session)
    sessionStorage.setItem('previewCSS', css);
    
    // Open preview page in a new tab
    window.open('preview.html?css=preview', '_blank');
  }

  // Generate CSS from current settings
  function generateCSS() {
    return `
      <style id="custom-settings">
        :root {
          --primary-color: ${currentSettings.colors.primary};
          --secondary-color: ${currentSettings.colors.secondary};
          --accent-color: ${currentSettings.colors.accent};
          --text-color: ${currentSettings.colors.text};
          --font-family: ${currentSettings.typography.fontFamily};
          --heading-font: ${currentSettings.typography.headingFont};
          --base-font-size: ${currentSettings.typography.baseFontSize}px;
          --line-height: ${currentSettings.typography.lineHeight};
          --container-width: ${currentSettings.layout.containerWidth}px;
          --border-radius: ${currentSettings.layout.borderRadius}px;
          --enable-animations: ${currentSettings.layout.enableAnimations ? '1' : '0'};
        }
        
        body, html {
          font-family: var(--font-family);
          font-size: var(--base-font-size);
          line-height: var(--line-height);
          color: var(--text-color);
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--heading-font);
          color: var(--secondary-color);
        }
        
        a {
          color: var(--primary-color);
        }
        
        a:hover {
          color: ${lightenDarkenColor(currentSettings.colors.primary, -20)};
        }
        
        .w3-content {
          max-width: var(--container-width);
        }
        
        .w3-button {
          ${getBorderRadiusStyle(currentSettings.layout.buttonStyle, currentSettings.layout.borderRadius)}
          ${currentSettings.layout.enableAnimations ? 
            'transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;' : ''}
        }
        
        .w3-button:hover {
          ${currentSettings.layout.enableAnimations ? 
            'transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1);' : ''}
        }
        
        .w3-card, .w3-card-2, .w3-card-4 {
          ${getBorderRadiusStyle('rounded', currentSettings.layout.borderRadius)}
          ${currentSettings.layout.enableAnimations ? 
            'transition: transform 0.3s ease, box-shadow 0.3s ease;' : ''}
        }
        
        .w3-card:hover, .w3-card-2:hover, .w3-card-4:hover {
          ${currentSettings.layout.enableAnimations ? 
            'transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.1);' : ''}
        }
        
        .w3-blue, .w3-hover-blue:hover {
          background-color: var(--primary-color) !important;
        }
        
        .w3-text-blue, .w3-hover-text-blue:hover {
          color: var(--primary-color) !important;
        }
      </style>
    `;
  }

  // Save settings to Firebase
  function saveSettings() {
    if (!db) {
      showStatus('Firebase not available', true);
      return;
    }
    
    // Show status message
    showStatus('Saving settings...', false, 0);
    
    // Save to Firebase
    db.collection('settings').doc('global').set(currentSettings)
      .then(() => {
        showStatus('Settings saved successfully');
        
        // Generate CSS
        const css = generateCSS();
        
        // Save CSS to a file that can be included in the website
        return db.collection('settings').doc('css').set({
          css: css,
          updated: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        console.log('CSS saved');
      })
      .catch(error => {
        console.error('Error saving settings:', error);
        showStatus('Error saving settings: ' + error.message, true);
      });
  }

  // Show status message
  function showStatus(message, isError = false, timeout = 3000) {
    const statusMsg = document.getElementById('statusMsg');
    if (!statusMsg) return;
    
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    // Hide after timeout unless it's 0 (persistent)
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, timeout);
    }
  }

  // Public API
  return {
    init: init,
    loadSettings: loadSettings,
    generateCSS: generateCSS,
    getCurrentSettings: function() {
      return JSON.parse(JSON.stringify(currentSettings));
    }
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  GlobalSettings.init();
});