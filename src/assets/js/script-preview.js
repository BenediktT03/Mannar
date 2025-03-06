/**
 * Optimized Preview Script
 * Features improved error handling, performance, and accessibility
 */

document.addEventListener('DOMContentLoaded', function() {
  // Parse URL parameters with validation
  const params = new URLSearchParams(window.location.search);
  const isDraft = params.get('draft') === 'true';
  
  // Cache DOM elements
  const elements = {
    previewMode: document.getElementById('previewMode'),
    previewIndicator: document.getElementById('previewIndicator'),
    navbar: document.getElementById('myNavbar'),
    logo: document.getElementById('mainLogo'),
    aboutTitleDisplay: document.getElementById('aboutTitleDisplay'),
    aboutSubtitleDisplay: document.getElementById('aboutSubtitleDisplay'),
    aboutTextDisplay: document.getElementById('aboutTextDisplay'),
    offeringsTitleDisplay: document.getElementById('offeringsTitleDisplay'),
    offeringsSubtitleDisplay: document.getElementById('offeringsSubtitleDisplay'),
    wordCloudList: document.getElementById('wordCloudList'),
    contactTitleDisplay: document.getElementById('contactTitleDisplay'),
    contactSubtitleDisplay: document.getElementById('contactSubtitleDisplay')
  };
  
  // Initialize Firebase safely
  let db;
  try {
    db = firebase.firestore();
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    showErrorMessage('Firebase initialization failed. Please check your connection.');
    return;
  }
  
  // Display mode indicator
  if (elements.previewMode && elements.previewIndicator) {
    if (isDraft) {
      elements.previewMode.textContent = 'ENTWURF - Aktuelle Bearbeitung (Nicht veröffentlicht)';
      elements.previewMode.style.fontWeight = 'bold';
      elements.previewIndicator.classList.remove('live');
      elements.previewIndicator.style.backgroundColor = '#ff9800';
    } else {
      elements.previewMode.textContent = 'LIVE-Website (Veröffentlichte Version)';
      elements.previewMode.style.fontWeight = 'bold';
      elements.previewIndicator.classList.add('live');
      elements.previewIndicator.style.backgroundColor = '#4CAF50';
    }
  }
  
  // Show logo
  if (elements.logo) {
    elements.logo.style.display = 'block';
  }

  // Load preview content
  loadPreviewContent();
  
  // Setup scroll behavior
  setupScrollBehavior();
  
  // Setup smooth scrolling
  setupSmoothScrolling();
  
  /**
   * Load preview content from Firestore
   */
  function loadPreviewContent() {
    showLoadingOverlay(true);
    
    // Load main content
    db.collection("content").doc(isDraft ? "draft" : "main").get().then(doc => {
      if (!doc.exists) {
        console.warn("No content document found");
        showErrorMessage('No content found. Please save some content first.');
        return;
      }
      
      const data = doc.data();
      
      // Update content elements with null checks
      updateElementContent(elements.aboutTitleDisplay, data.aboutTitle);
      updateElementContent(elements.aboutSubtitleDisplay, data.aboutSubtitle);
      updateElementContent(elements.aboutTextDisplay, data.aboutText);
      updateElementContent(elements.offeringsTitleDisplay, data.offeringsTitle);
      updateElementContent(elements.offeringsSubtitleDisplay, data.offeringsSubtitle);
      updateElementContent(elements.contactTitleDisplay, data.contactTitle);
      updateElementContent(elements.contactSubtitleDisplay, data.contactSubtitle);
      
      // Update offering sections
      for (let i = 1; i <= 3; i++) {
        updateOfferingSection(i, data);
      }
      
      // Update contact image
      if (data.contact_image) {
        updateImageElement('contactImageDisplay', data.contact_image);
      }
      
      // Load word cloud if needed
      if (elements.wordCloudList) {
        loadWordCloud();
      }
      
    }).catch(error => {
      console.error("Error loading content:", error);
      showErrorMessage(`Error loading content: ${error.message}`);
    }).finally(() => {
      showLoadingOverlay(false);
    });
  }
  
  /**
   * Load word cloud data
   */
  function loadWordCloud() {
    db.collection("content").doc("wordCloud").get().then(doc => {
      if (doc.exists && doc.data().words) {
        const words = doc.data().words;
        renderWordCloud(words);
      } else {
        elements.wordCloudList.innerHTML = `
          <div class="w3-panel w3-pale-yellow">
            <p><i class="fas fa-exclamation-triangle"></i> No word cloud data found.</p>
          </div>
        `;
      }
    }).catch(error => {
      console.error("Error loading word cloud:", error);
      elements.wordCloudList.innerHTML = `
        <div class="w3-panel w3-pale-red">
          <p><i class="fas fa-exclamation-circle"></i> Error loading word cloud: ${error.message}</p>
        </div>
      `;
    });
  }
  
  /**
   * Render word cloud with animation
   */
  function renderWordCloud(words) {
    elements.wordCloudList.innerHTML = '';
    
    words.forEach(word => {
      if (!word || !word.text) return;
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = word.link || "#";
      a.setAttribute('data-weight', word.weight || "5");
      a.textContent = word.text;
      
      // Initial style for animation
      a.style.opacity = '0';
      a.style.transform = 'translateY(20px)';
      
      li.appendChild(a);
      elements.wordCloudList.appendChild(li);
    });
    
    // Animate word cloud items
    setTimeout(() => {
      document.querySelectorAll('.word-cloud li a').forEach((word, index) => {
        setTimeout(() => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        }, 50 * index);
      });
    }, 300);
  }
  
  /**
   * Update offering section
   */
  function updateOfferingSection(num, data) {
    updateElementContent(document.getElementById(`offer${num}TitleDisplay`), data[`offer${num}Title`]);
    updateElementContent(document.getElementById(`offer${num}DescDisplay`), data[`offer${num}Desc`]);
    
    if (data[`offer${num}_image`]) {
      updateImageElement(`offer${num}ImageDisplay`, data[`offer${num}_image`]);
    }
  }
  
  /**
   * Update element content safely
   */
  function updateElementContent(element, content) {
    if (element && content) {
      element.innerHTML = content;
    }
  }
  
  /**
   * Update image element
   */
  function updateImageElement(id, imageData) {
    const img = document.getElementById(id);
    if (!img) return;
    
    const imageUrl = typeof imageData === 'string' ? imageData : 
                     imageData.url ? imageData.url : null;
    
    if (imageUrl) {
      img.src = imageUrl;
      img.alt = imageData.alt || img.alt || '';
      img.style.display = 'block';
    }
  }
  
  /**
   * Setup scroll behavior
   */
  function setupScrollBehavior() {
    window.addEventListener('scroll', function() {
      if (!elements.navbar) return;
      
      if (window.scrollY > 100) {
        elements.navbar.classList.add('scrolled');
        elements.navbar.classList.add('visible');
      } else {
        elements.navbar.classList.remove('scrolled');
        if (window.scrollY <= 10) {
          elements.navbar.classList.remove('visible');
        }
      }
    });
  }
  
  /**
   * Setup smooth scrolling
   */
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
  
  /**
   * Show loading overlay
   */
  function showLoadingOverlay(show) {
    let loadingElement = document.getElementById('preview-loading');
    
    if (show) {
      if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.id = 'preview-loading';
        loadingElement.innerHTML = `
          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                   background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px; 
                   box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 1000; text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #3498db;"></i>
            <p>Loading preview...</p>
          </div>
        `;
        document.body.appendChild(loadingElement);
      }
    } else {
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }
  
  /**
   * Show error message
   */
  function showErrorMessage(message) {
    const contentContainer = document.getElementById('pageContent') || document.body;
    const errorElement = document.createElement('div');
    errorElement.className = 'w3-panel w3-pale-red w3-card';
    errorElement.innerHTML = `
      <h3>Error</h3>
      <p>${message}</p>
    `;
    contentContainer.prepend(errorElement);
    
    // Hide loading overlay
    showLoadingOverlay(false);
  }
});