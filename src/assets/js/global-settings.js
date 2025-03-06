/**
 * Optimized Global Settings Manager
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

  let currentSettings = JSON.parse(JSON.stringify(defaults));
  let db = null;
  const elements = {};

  // Initialize settings
  function init() {
    try {
      if (typeof firebase !== 'undefined') {
        db = firebase.firestore();
      } else {
        console.error('Firebase not found');
        showStatus('Firebase could not be initialized. Settings functionality will be limited.', true);
        return;
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      showStatus('Firebase initialization error. Settings functionality will be limited.', true);
      return;
    }
    
    // Cache DOM elements
    cacheElements();
    
    // Add event listeners
    attachEvents();
    
    // Load settings
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
    setupColorInput('primaryColor', 'colors', 'primary');
    setupColorInput('secondaryColor', 'colors', 'secondary');
    setupColorInput('accentColor', 'colors', 'accent');
    setupColorInput('textColor', 'colors', 'text');
    
    // Typography inputs
    setupSelectInput('fontFamily', 'typography', 'fontFamily');
    setupSelectInput('headingFont', 'typography', 'headingFont');
    setupRangeInput('baseFontSize', 'typography', 'baseFontSize', 'baseFontSizeValue');
    setupRangeInput('lineHeight', 'typography', 'lineHeight', 'lineHeightValue');
    
    // Layout inputs
    setupRangeInput('containerWidth', 'layout', 'containerWidth', 'containerWidthValue');
    setupRangeInput('borderRadius', 'layout', 'borderRadius', 'borderRadiusValue');
    setupSelectInput('buttonStyle', 'layout', 'buttonStyle');
    
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

  // Setup color input
  function setupColorInput(elementId, settingGroup, settingName) {
    const input = elements[elementId];
    const valueDisplay = elements[`${elementId}Value`];
    
    if (!input) return;
    
    input.addEventListener('input', function() {
      if (valueDisplay) {
        valueDisplay.textContent = this.value;
      }
      currentSettings[settingGroup][settingName] = this.value;
      updatePreview();
    });
  }

  // Setup select input
  function setupSelectInput(elementId, settingGroup, settingName) {
    const input = elements[elementId];
    
    if (!input) return;
    
    input.addEventListener('change', function() {
      currentSettings[settingGroup][settingName] = this.value;
      updatePreview();
    });
  }

  // Setup range input
  function setupRangeInput(elementId, settingGroup, settingName, valueDisplayId) {
    const input = elements[elementId];
    const valueDisplay = elements[valueDisplayId];
    
    if (!input) return;
    
    input.addEventListener('input', function() {
      if (valueDisplay) {
        valueDisplay.textContent = this.value;
      }
      currentSettings[settingGroup][settingName] = parseFloat(this.value);
      updatePreview();
    });
  }

  // Load settings from Firebase
  function loadSettings() {
    if (!db) return;
    
    showStatus('Loading settings...', false, 0);
    
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
          
          // Update UI
          updateSettingsUI();
          showStatus('Settings loaded successfully');
        } else {
          // Create document with defaults
          db.collection('settings').doc('global').set(defaults)
            .then(() => {
              console.log('Created default settings');
              showStatus('Default settings created');
            })
            .catch(error => {
              console.error('Error creating default settings:', error);
              showStatus('Error creating default settings: ' + error.message, true);
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
    updateColorInput('primaryColor', currentSettings.colors.primary);
    updateColorInput('secondaryColor', currentSettings.colors.secondary);
    updateColorInput('accentColor', currentSettings.colors.accent);
    updateColorInput('textColor', currentSettings.colors.text);
    
    // Update typography inputs
    updateSelectInput('fontFamily', currentSettings.typography.fontFamily);
    updateSelectInput('headingFont', currentSettings.typography.headingFont);
    updateRangeInput('baseFontSize', 'baseFontSizeValue', currentSettings.typography.baseFontSize);
    updateRangeInput('lineHeight', 'lineHeightValue', currentSettings.typography.lineHeight);
    
    // Update layout inputs
    updateRangeInput('containerWidth', 'containerWidthValue', currentSettings.layout.containerWidth);
    updateRangeInput('borderRadius', 'borderRadiusValue', currentSettings.layout.borderRadius);
    updateSelectInput('buttonStyle', currentSettings.layout.buttonStyle);
    
    if (elements.enableAnimations) {
      elements.enableAnimations.checked = currentSettings.layout.enableAnimations;
    }
    
    // Update preview
    updatePreview();
  }

  // Update color input
  function updateColorInput(elementId, value) {
    const input = elements[elementId];
    const valueDisplay = elements[`${elementId}Value`];
    
    if (input && value) {
      input.value = value;
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
    }
  }

  // Update select input
  function updateSelectInput(elementId, value) {
    const input = elements[elementId];
    
    if (input && value) {
      input.value = value;
    }
  }

  // Update range input
  function updateRangeInput(elementId, valueDisplayId, value) {
    const input = elements[elementId];
    const valueDisplay = elements[valueDisplayId];
    
    if (input && value !== undefined) {
      input.value = value;
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
    }
  }

  // Update preview
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
    
    // Insert style
    let currentContent = elements.stylePreview.innerHTML;
    currentContent = currentContent.replace(/<style>[\s\S]*?<\/style>/g, '');
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
    
    // Show message
    showStatus('Settings reset to defaults');
  }

  // Open settings preview in a new tab
  function openSettingsPreview() {
    // Generate CSS
    const css = generateCSS();
    
    // Store in session storage
    sessionStorage.setItem('previewCSS', css);
    
    // Open preview page
    window.open('preview.html?draft=true', '_blank');
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
    
    // Show status
    showStatus('Saving settings...', false, 0);
    
    // Save to Firebase
    db.collection('settings').doc('global').set(currentSettings)
      .then(() => {
        showStatus('Settings saved successfully');
        
        // Generate and save CSS
        const css = generateCSS();
        
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
    init,
    loadSettings,
    generateCSS,
    getCurrentSettings: function() {
      return JSON.parse(JSON.stringify(currentSettings));
    }
  };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  GlobalSettings.init();
});