// script-preview.js - Optimized script for the preview page

document.addEventListener('DOMContentLoaded', function() {
  // Firestore verwenden (Firebase sollte bereits im HTML initialisiert sein)
  const db = firebase.firestore();
  
  // Vorschau-Modus ermitteln (draft oder live)
  const params = new URLSearchParams(window.location.search);
  const isDraft = (params.get('draft') === 'true');
  const previewMode = document.getElementById('previewMode');
  const previewIndicator = document.getElementById('previewIndicator');
  
  // Clearly indicate if we are viewing draft or live content
  if (isDraft) {
    previewMode.textContent = 'ENTWURF - Aktuelle Bearbeitung (Nicht veröffentlicht)';
    previewMode.style.fontWeight = 'bold';
    previewIndicator.classList.remove('live');
    previewIndicator.style.backgroundColor = '#ff9800';
  } else {
    previewMode.textContent = 'LIVE-Website (Veröffentlichte Version)';
    previewMode.style.fontWeight = 'bold';
    previewIndicator.classList.add('live');
    previewIndicator.style.backgroundColor = '#4CAF50';
  }
  
  // DOM-Elemente
  const navbar = document.getElementById('myNavbar');
  const logo = document.getElementById('mainLogo');

  // Daten aus Firestore laden
  loadPreviewContent();
  
  // Logo anzeigen, sobald geladen
  if (logo) {
    logo.style.display = 'block';
  }

  // Navbar Scroll-Verhalten
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
      navbar.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      if (window.scrollY <= 10) {
        navbar.classList.remove('visible');
      }
    }
  });

  // Smooth Scrolling für interne Links
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
  
  // Inhalte aus Firestore laden
  function loadPreviewContent() {
    // Show loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.id = 'preview-loading';
    loadingElement.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                 background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px; 
                 box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 1000; text-align: center;">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #3498db;"></i>
        <p>Vorschau wird geladen...</p>
      </div>
    `;
    document.body.appendChild(loadingElement);
    
    // Hauptinhalte laden
    db.collection("content").doc(isDraft ? "draft" : "main").get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        
        // About
        if (data.aboutTitle) document.getElementById('aboutTitleDisplay').innerText = data.aboutTitle;
        if (data.aboutSubtitle) document.getElementById('aboutSubtitleDisplay').innerText = data.aboutSubtitle;
        if (data.aboutText) document.getElementById('aboutTextDisplay').innerHTML = data.aboutText;
        
        // Angebote
        if (data.offeringsTitle) document.getElementById('offeringsTitleDisplay').innerText = data.offeringsTitle;
        if (data.offeringsSubtitle) document.getElementById('offeringsSubtitleDisplay').innerText = data.offeringsSubtitle;
        
        // Angebot 1
        if (data.offer1Title) document.getElementById('offer1TitleDisplay').innerText = data.offer1Title;
        if (data.offer1Desc) document.getElementById('offer1DescDisplay').innerHTML = data.offer1Desc;
        if (data.offer1_image && data.offer1_image.url) {
          const img = document.getElementById('offer1ImageDisplay');
          if (img) {
            img.src = data.offer1_image.url;
            img.alt = data.offer1_image.alt || data.offer1Title || 'Angebot 1';
          }
        }
        
        // Angebot 2
        if (data.offer2Title) document.getElementById('offer2TitleDisplay').innerText = data.offer2Title;
        if (data.offer2Desc) document.getElementById('offer2DescDisplay').innerHTML = data.offer2Desc;
        if (data.offer2_image && data.offer2_image.url) {
          const img = document.getElementById('offer2ImageDisplay');
          if (img) {
            img.src = data.offer2_image.url;
            img.alt = data.offer2_image.alt || data.offer2Title || 'Angebot 2';
          }
        }
        
        // Angebot 3
        if (data.offer3Title) document.getElementById('offer3TitleDisplay').innerText = data.offer3Title;
        if (data.offer3Desc) document.getElementById('offer3DescDisplay').innerHTML = data.offer3Desc;
        if (data.offer3_image && data.offer3_image.url) {
          const img = document.getElementById('offer3ImageDisplay');
          if (img) {
            img.src = data.offer3_image.url;
            img.alt = data.offer3_image.alt || data.offer3Title || 'Angebot 3';
          }
        }
        
        // Kontakt
        if (data.contactTitle) document.getElementById('contactTitleDisplay').innerText = data.contactTitle;
        if (data.contactSubtitle) document.getElementById('contactSubtitleDisplay').innerText = data.contactSubtitle;
        if (data.contact_image && data.contact_image.url) {
          const img = document.getElementById('contactImageDisplay');
          if (img) {
            img.src = data.contact_image.url;
            img.alt = data.contact_image.alt || 'Kontakt';
          }
        }
      } else {
        console.log("Keine Inhalte gefunden");
        
        // Show error message
        const contentContainer = document.getElementById('pageContent') || document.body;
        const errorElement = document.createElement('div');
        errorElement.className = 'w3-panel w3-pale-red w3-card';
        errorElement.innerHTML = `
          <h3>Keine Inhalte gefunden</h3>
          <p>Es konnten keine Vorschau-Inhalte gefunden werden. Bitte speichern Sie zuerst Ihre Änderungen.</p>
        `;
        contentContainer.prepend(errorElement);
      }
      
      // Word Cloud preview is completely disabled as per requirements
      const wordCloudList = document.getElementById('wordCloudList');
      if (wordCloudList) {
        // Add disabled message
        wordCloudList.innerHTML = `
          <div class="w3-panel w3-pale-blue">
            <p><i class="fas fa-info-circle"></i> Die Word Cloud Vorschau ist deaktiviert. 
            Änderungen an der Word Cloud werden nur in der veröffentlichten Seite sichtbar.</p>
          </div>
        `;
      }
    }).catch(error => {
      console.error("Fehler beim Laden der Inhalte:", error);
      
      // Show error message
      const contentContainer = document.getElementById('pageContent') || document.body;
      const errorElement = document.createElement('div');
      errorElement.className = 'w3-panel w3-pale-red w3-card';
      errorElement.innerHTML = `
        <h3>Fehler beim Laden</h3>
        <p>Es ist ein Fehler beim Laden der Vorschau aufgetreten: ${error.message}</p>
      `;
      contentContainer.prepend(errorElement);
    }).finally(() => {
      // Remove loading indicator
      const loadingElement = document.getElementById('preview-loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    });
  }
});