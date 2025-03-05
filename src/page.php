<?php
// page.php - Enhanced template for dynamic pages with multiple template support

// Prüfen, ob eine Seiten-ID übergeben wurde
$page_id = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';

if (empty($page_id)) {
    // Weiterleitung zur Startseite, wenn keine ID vorhanden ist
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mannar</title>
  <meta name="description" content="Mannar - Peer, Genesungsbegeleiter">
  
  <!-- Base Styles -->
  <link rel="stylesheet" href="./assets/css/styles.css">
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  
  <!-- Enhanced Template Styles -->
  <link rel="stylesheet" href="./assets/css/templates.css">
  
  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  
  <!-- Optimized loading -->
  <style>
    /* Loading animation */
    .page-loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .content-ready .page-loading {
      opacity: 0;
      pointer-events: none;
    }
    
    /* Ensure content is hidden until loaded */
    .page-content {
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    
    .content-ready .page-content {
      opacity: 1;
    }
  </style>
</head>
<body>
  <!-- Loading indicator -->
  <div class="page-loading">
    <div class="spinner"></div>
  </div>

  <!-- Navbar (immer sichtbar) -->
  <div class="w3-top">
    <div class="w3-bar" id="myNavbar">
      <a class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right" href="javascript:void(0);" onclick="toggleFunction()" title="Navigation Menu">
        <i class="fas fa-bars"></i>
      </a>
      <a href="index.php" class="w3-bar-item w3-button">HOME</a>
      <a href="index.php#about" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-user"></i> ABOUT</a>
      <a href="index.php#portfolio" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-th"></i> PORTFOLIO</a>
      <a href="index.php#contact" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-envelope"></i> KONTAKT</a>
      <!-- Dynamische Seiten-Navigation wird hier eingefügt -->
      <div id="dynamicNav"></div>
    </div>

    <!-- Navbar für kleine Bildschirme -->
    <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium">
      <a href="index.php#about" class="w3-bar-item w3-button" onclick="toggleFunction()">ABOUT</a>
      <a href="index.php#portfolio" class="w3-bar-item w3-button" onclick="toggleFunction()">PORTFOLIO</a>
      <a href="index.php#contact" class="w3-bar-item w3-button" onclick="toggleFunction()">KONTAKT</a>
      <!-- Dynamische Seiten-Navigation wird hier eingefügt -->
      <div id="dynamicNavMobile"></div>
    </div>
  </div>

  <!-- Seiteninhalt - wird dynamisch gefüllt -->
  <div class="page-content">
    <div id="pageContent" class="w3-content w3-padding-64" style="margin-top: 60px;">
      <!-- Der Seiteninhalt wird hier dynamisch eingefügt -->
      <div class="w3-center" id="loadingIndicator">
        <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #888;"></i>
        <p>Inhalt wird geladen...</p>
      </div>
    </div>
  </div>

  <!-- Go to top button -->
  <div class="go-top" id="goTopBtn">
    <i class="fas fa-arrow-up"></i>
  </div>

  <!-- Footer -->
  <footer class="w3-center w3-black w3-padding-64 w3-opacity w3-hover-opacity-off">
    <a href="#" class="w3-button w3-light-grey"><i class="fas fa-arrow-up w3-margin-right"></i>Nach oben</a>
    <div class="w3-xlarge w3-section social-icons">
      <i class="fab fa-facebook w3-hover-opacity"></i>
      <i class="fab fa-instagram w3-hover-opacity"></i>
      <i class="fab fa-snapchat w3-hover-opacity"></i>
      <i class="fab fa-pinterest w3-hover-opacity"></i>
      <i class="fab fa-twitter w3-hover-opacity"></i>
      <i class="fab fa-linkedin w3-hover-opacity"></i>
    </div>
    <p>&copy; 2025 Mannar | Peer und Genesungsbegleiter</p>
  </footer>

  <!-- Firebase Initialisierung -->
  <script>
    // Einmalige Initialisierung von Firebase
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
        authDomain: "mannar-129a5.firebaseapp.com",
        projectId: "mannar-129a5",
        storageBucket: "mannar-129a5.firebasestorage.app",
        messagingSenderId: "687710492532",
        appId: "1:687710492532:web:c7b675da541271f8d83e21",
        measurementId: "G-NXBLYJ5CXL"
      });
    }
  </script>

  <!-- Skripte einbinden -->
  <script src="./assets/js/navbar.js"></script>
  
  <!-- Enhanced Page Template Renderer -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Seiten-ID aus der URL extrahieren
      const pageId = '<?php echo $page_id; ?>';
      
      if (!pageId) {
        displayError('Keine Seiten-ID angegeben');
        return;
      }
      
      // Global styling settings
      let globalSettings = {
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
      
      // Seite aus Firestore laden
      const db = firebase.firestore();
      
      // Erst globale Einstellungen laden
      db.collection('settings').doc('global').get()
        .then(doc => {
          if (doc.exists) {
            const settings = doc.data();
            // Merge settings with defaults
            globalSettings = {
              colors: { ...globalSettings.colors, ...settings.colors },
              typography: { ...globalSettings.typography, ...settings.typography },
              layout: { ...globalSettings.layout, ...settings.layout }
            };
          }
          
          // Dann Seitendaten laden
          return db.collection('pages').doc(pageId).get();
        })
        .then(doc => {
          if (!doc.exists) {
            displayError('Die angeforderte Seite wurde nicht gefunden');
            return;
          }
          
          const pageData = doc.data();
          
          // Seitentitel setzen
          document.title = pageData.title + ' - Mannar';
          
          // Dynamisches CSS für die Seite erstellen
          applyCustomStyles(globalSettings, pageData.settings || {});
          
          // Seiteninhalt basierend auf Template rendern
          renderPage(pageData);
          
          // Laden aller veröffentlichten Seiten für die Navigation
          loadPageNavigation();
          
          // Seite als geladen markieren
          setTimeout(() => {
            document.body.classList.add('content-ready');
          }, 300);
        })
        .catch(error => {
          console.error('Fehler beim Laden der Seite:', error);
          displayError('Fehler beim Laden der Seite: ' + error.message);
        });
      
      // Fehler anzeigen
      function displayError(message) {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
          pageContent.innerHTML = `
            <div class="w3-panel w3-pale-red w3-leftbar w3-border-red">
              <h3>Fehler</h3>
              <p>${message}</p>
              <p><a href="index.php" class="w3-button w3-blue">Zurück zur Startseite</a></p>
            </div>
          `;
        }
        
        // Seite als geladen markieren
        document.body.classList.add('content-ready');
      }
      
      // Dynamisches CSS basierend auf Einstellungen erstellen
      function applyCustomStyles(globalSettings, pageSettings) {
        // Merge global and page-specific settings
        const settings = {
          ...globalSettings,
          ...pageSettings
        };
        
        // Create style element
        const styleEl = document.createElement('style');
        styleEl.id = 'dynamic-styles';
        
        styleEl.innerHTML = `
          :root {
            --primary-color: ${settings.colors.primary};
            --secondary-color: ${settings.colors.secondary};
            --accent-color: ${settings.colors.accent || '#e74c3c'};
            --text-color: ${settings.colors.text};
            --font-family: ${settings.typography.fontFamily};
            --heading-font: ${settings.typography.headingFont || settings.typography.fontFamily};
            --base-font-size: ${settings.typography.baseFontSize || 16}px;
            --line-height: ${settings.typography.lineHeight || 1.6};
            --title-size: ${settings.titleSize || 2.5}em;
            --subtitle-size: ${settings.subtitleSize || 1.5}em;
            --border-radius: ${settings.layout?.borderRadius || 4}px;
            --container-width: ${settings.layout?.containerWidth || 1170}px;
          }
          
          body, html {
            font-family: var(--font-family);
            font-size: var(--base-font-size);
            line-height: var(--line-height);
            color: var(--text-color);
          }
          
          .w3-content {
            max-width: var(--container-width);
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--heading-font);
            color: var(--secondary-color);
          }
          
          .page-title {
            font-size: var(--title-size);
            margin-bottom: 0.5em;
          }
          
          .page-subtitle {
            font-size: var(--subtitle-size);
            color: var(--secondary-color);
            margin-bottom: 1.5em;
          }
          
          a {
            color: var(--primary-color);
            text-decoration: none;
          }
          
          a:hover {
            text-decoration: underline;
          }
          
          .w3-button {
            background-color: var(--primary-color);
            color: white;
          }
          
          .w3-button:hover {
            background-color: var(--secondary-color) !important;
          }
          
          .w3-card, .w3-card-2, .w3-card-4 {
            border-radius: var(--border-radius);
          }
          
          /* Template-specific styles */
          .feature-item {
            border-radius: var(--border-radius);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .feature-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .gallery-item {
            border-radius: var(--border-radius);
            overflow: hidden;
            transition: transform 0.3s ease;
          }
          
          .gallery-item:hover {
            transform: scale(1.03);
          }
        `;
        
        // Add style to document
        document.head.appendChild(styleEl);
      }
      
      // Seite basierend auf Template rendern
      function renderPage(pageData) {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;
        
        // Loading indicator entfernen
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
          loadingIndicator.remove();
        }
        
        // Seitentitel hinzufügen
        pageContent.innerHTML = `<h1 class="page-title w3-center">${pageData.title}</h1>`;
        
        // Je nach Template unterschiedliche Inhalte rendern
        const templateData = pageData.data || {};
        
        switch (pageData.template) {
          case 'basic':
            renderBasicTemplate(templateData, pageContent);
            break;
          case 'text-image':
            renderTextImageTemplate(templateData, pageContent);
            break;
          case 'image-text':
            renderImageTextTemplate(templateData, pageContent);
            break;
          case 'gallery':
            renderGalleryTemplate(templateData, pageContent);
            break;
          case 'landing':
            renderLandingTemplate(templateData, pageContent);
            break;
          case 'portfolio':
            renderPortfolioTemplate(templateData, pageContent);
            break;
          case 'contact':
            renderContactTemplate(templateData, pageContent);
            break;
          case 'blog':
            renderBlogTemplate(templateData, pageContent);
            break;
          default:
            pageContent.innerHTML += `<p class="w3-center">Unbekanntes Template: ${pageData.template}</p>`;
        }
        
        // Animationen für Elemente hinzufügen
        addAnimations();
      }
      
      // Basic Template rendern
      function renderBasicTemplate(data, container) {
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          <div class="w3-container">${data.content || ''}</div>
        `;
      }
      
      // Text-Image Template rendern
      function renderTextImageTemplate(data, container) {
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          <div class="w3-row-padding">
            <div class="w3-col m8 w3-padding animate-item">
              <div>${data.content || ''}</div>
            </div>
            <div class="w3-col m4 w3-padding animate-item delay-1">
              <div class="image-container w3-card">
                <img src="${data.featuredImage?.url || '/api/placeholder/400/300'}" alt="${data.featuredImage?.alt || data.title || 'Bild'}" class="w3-image">
              </div>
            </div>
          </div>
        `;
      }
      
      // Image-Text Template rendern
      function renderImageTextTemplate(data, container) {
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          <div class="w3-row-padding">
            <div class="w3-col m4 w3-padding animate-item">
              <div class="image-container w3-card">
                <img src="${data.featuredImage?.url || '/api/placeholder/400/300'}" alt="${data.featuredImage?.alt || data.title || 'Bild'}" class="w3-image">
              </div>
            </div>
            <div class="w3-col m8 w3-padding animate-item delay-1">
              <div>${data.content || ''}</div>
            </div>
          </div>
        `;
      }
      
      // Gallery Template rendern
      function renderGalleryTemplate(data, container) {
        let galleryItemsHtml = '';
        
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          data.images.forEach((image, index) => {
            if (!image || !image.url) return;
            
            galleryItemsHtml += `
              <div class="w3-col m4 l3 s6 w3-padding animate-item delay-${index % 5}">
                <div class="gallery-item w3-card">
                  <img src="${image.url}" alt="${image.alt || ''}" class="w3-image" style="width:100%">
                  ${image.caption ? `<div class="w3-padding-small w3-light-grey">${image.caption}</div>` : ''}
                </div>
              </div>
            `;
          });
        } else {
          galleryItemsHtml = '<div class="w3-panel w3-pale-yellow w3-center">Keine Bilder in dieser Galerie</div>';
        }
        
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          <div class="w3-container">${data.description || ''}</div>
          <div class="w3-row-padding w3-margin-top">
            ${galleryItemsHtml}
          </div>
        `;
        
        // Modal für Galerie-Bilder hinzufügen
        addGalleryModal();
      }
      
      // Landing Template rendern
      function renderLandingTemplate(data, container) {
        let featuresHtml = '';
        
        // Features erstellen
        if (data.features && Array.isArray(data.features) && data.features.length > 0) {
          data.features.forEach((feature, index) => {
            if (!feature) return;
            
            featuresHtml += `
              <div class="w3-col m4 s12 w3-padding animate-item delay-${index % 3}">
                <div class="feature-item w3-card w3-padding w3-center">
                  ${feature.icon && feature.icon.url ? 
                    `<img src="${feature.icon.url}" alt="${feature.title || 'Feature'}" style="width:64px; height:64px; margin:0 auto; display:block;">` : 
                    '<div class="w3-circle w3-light-grey w3-padding w3-center" style="width:64px; height:64px; margin:0 auto; display:flex; align-items:center; justify-content:center;"><i class="fas fa-star"></i></div>'
                  }
                  <h3>${feature.title || 'Feature'}</h3>
                  <p>${feature.description || ''}</p>
                </div>
              </div>
            `;
          });
        }
        
        // Template zusammenstellen
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          
          <!-- Hero Section -->
          <div class="w3-row-padding">
            <div class="w3-col m6 s12 w3-padding animate-item">
              <div class="w3-padding-large">
                <div class="hero-content">
                  ${data.content || ''}
                </div>
                ${data.ctaButtonText ? 
                  `<a href="${data.ctaButtonLink || '#'}" class="w3-button w3-padding-large w3-large w3-margin-top">${data.ctaButtonText}</a>` : 
                  ''}
              </div>
            </div>
            <div class="w3-col m6 s12 w3-padding animate-item delay-1">
              <div class="hero-image-container">
                ${data.heroImage && data.heroImage.url ? 
                  `<img src="${data.heroImage.url}" alt="${data.heroImage.alt || data.title || 'Hero Image'}" class="w3-image w3-card">` : 
                  '<div class="w3-pale-blue w3-padding-64 w3-center w3-card"><i class="fas fa-image" style="font-size:48px"></i><p>Hero Image</p></div>'
                }
              </div>
            </div>
          </div>
          
          <!-- Features Section -->
          ${data.featuresTitle ? `<h2 class="w3-center w3-margin-top">${data.featuresTitle}</h2>` : ''}
          <div class="w3-row-padding w3-margin-top features-container">
            ${featuresHtml || '<div class="w3-col s12 w3-center w3-padding">Keine Features definiert</div>'}
          </div>
          
          <!-- CTA Section -->
          ${data.ctaText ? 
            `<div class="w3-panel w3-padding-32 w3-center w3-margin-top animate-item">
              <h3>${data.ctaText}</h3>
              ${data.ctaButtonText ? 
                `<a href="${data.ctaButtonLink || '#'}" class="w3-button w3-padding-large">${data.ctaButtonText}</a>` : 
                ''}
            </div>` : 
            ''}
        `;
      }
      
      // Portfolio Template rendern
      function renderPortfolioTemplate(data, container) {
        let projectsHtml = '';
        
        // Projekte erstellen
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          data.projects.forEach((project, index) => {
            if (!project) return;
            
            projectsHtml += `
              <div class="w3-col m6 l4 w3-padding animate-item delay-${index % 3}">
                <div class="w3-card portfolio-item">
                  ${project.thumbnail && project.thumbnail.url ? 
                    `<img src="${project.thumbnail.url}" alt="${project.title || 'Projekt'}" class="w3-image" style="width:100%">` : 
                    '<div class="w3-pale-blue w3-padding-32 w3-center"><i class="fas fa-image"></i><p>Projekt Bild</p></div>'
                  }
                  <div class="w3-container">
                    <h3>${project.title || 'Projekt'}</h3>
                    <p>${project.description || ''}</p>
                    ${project.link ? `<a href="${project.link}" class="w3-button w3-margin-bottom">Mehr erfahren</a>` : ''}
                  </div>
                </div>
              </div>
            `;
          });
        } else {
          projectsHtml = '<div class="w3-panel w3-pale-yellow w3-center">Keine Projekte definiert</div>';
        }
        
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          <div class="w3-container animate-item">${data.introduction || ''}</div>
          <div class="w3-row-padding w3-margin-top">
            ${projectsHtml}
          </div>
        `;
      }
      
      // Contact Template rendern
      function renderContactTemplate(data, container) {
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          <div class="w3-container animate-item">${data.introduction || ''}</div>
          
          <div class="w3-row w3-padding-32 w3-section">
            ${data.contactImage && data.contactImage.url && data.showMap ? 
              `<div class="w3-col m4 w3-container animate-item">
                <img src="${data.contactImage.url}" alt="${data.contactImage.alt || 'Kontaktbild'}" class="w3-image w3-round" style="width:100%">
              </div>` : 
              ''
            }
            
            <div class="w3-col ${data.contactImage && data.contactImage.url && data.showMap ? 'm8' : 's12'} w3-panel animate-item delay-1">
              <div class="w3-large w3-margin-bottom">
                ${data.address ? `<i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> ${data.address}<br>` : ''}
                ${data.email ? `<i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> E-Mail: ${data.email}<br>` : ''}
                ${data.phone ? `<i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Telefon: ${data.phone}<br>` : ''}
              </div>
              
              ${data.showForm ? 
                `<p>Schauen Sie auf einen Kaffee vorbei <i class="fas fa-coffee"></i>, oder hinterlassen Sie mir eine Nachricht:</p>
                
                <form class="w3-container contact-form" action="./api/contact.php" method="post">
                  <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
                    <div class="w3-half">
                      <input class="w3-input w3-border" type="text" placeholder="Name" required name="Name">
                    </div>
                    <div class="w3-half">
                      <input class="w3-input w3-border" type="email" placeholder="E-Mail" required name="Email">
                    </div>
                  </div>
                  <textarea class="w3-input w3-border" placeholder="Nachricht" required name="Message" rows="5"></textarea>
                  <button class="w3-button w3-right w3-section" type="submit">
                    <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
                  </button>
                </form>` : 
                ''
              }
            </div>
          </div>
        `;
      }
      
      // Blog Template rendern
      function renderBlogTemplate(data, container) {
        // Kategorien formatieren
        let categoriesHtml = '';
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          categoriesHtml = `
            <div class="w3-section w3-padding-small w3-light-grey w3-round">
              <i class="fas fa-tags"></i> Kategorien: 
              ${data.categories.map(cat => `<span class="w3-tag w3-small w3-margin-right">${cat}</span>`).join('')}
            </div>
          `;
        }
        
        container.innerHTML += `
          ${data.subtitle ? `<h2 class="page-subtitle w3-center">${data.subtitle}</h2>` : ''}
          
          <!-- Blog header with meta -->
          <div class="w3-container w3-margin-bottom">
            <div class="w3-row">
              <div class="w3-col m8 s12">
                <div class="blog-meta w3-margin-bottom">
                  ${data.date ? `<span class="w3-margin-right"><i class="far fa-calendar-alt"></i> ${data.date}</span>` : ''}
                  ${data.author ? `<span><i class="far fa-user"></i> ${data.author}</span>` : ''}
                </div>
                ${categoriesHtml}
              </div>
            </div>
          </div>
          
          <!-- Featured image -->
          ${data.featuredImage && data.featuredImage.url ? 
            `<div class="w3-container w3-margin-bottom animate-item">
              <div class="w3-card">
                <img src="${data.featuredImage.url}" alt="${data.featuredImage.alt || data.title || 'Blog Post'}" class="w3-image" style="width:100%">
              </div>
            </div>` : 
            ''
          }
          
          <!-- Excerpt -->
          ${data.excerpt ? 
            `<div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue animate-item">
              <p><em>${data.excerpt}</em></p>
            </div>` : 
            ''
          }
          
          <!-- Main content -->
          <div class="w3-container blog-content animate-item delay-1">
            ${data.content || ''}
          </div>
        `;
      }
      
      // Modal für Galerie-Bilder hinzufügen
      function addGalleryModal() {
        // Prüfen, ob Modal bereits existiert
        if (document.getElementById('galleryModal')) {
          return;
        }
        
        // Modal erstellen
        const modal = document.createElement('div');
        modal.id = 'galleryModal';
        modal.className = 'w3-modal';
        modal.onclick = function() { this.style.display = 'none'; };
        
        modal.innerHTML = `
          <div class="w3-modal-content w3-animate-zoom">
            <span class="w3-button w3-hover-red w3-xlarge w3-display-topright">&times;</span>
            <img id="modalImg" class="w3-image" style="width:100%; max-height:80vh; object-fit:contain;">
            <div id="modalCaption" class="w3-container w3-padding-16 w3-light-grey"></div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Click-Handler für Galerie-Bilder
        const galleryImages = document.querySelectorAll('.gallery-item img');
        galleryImages.forEach(img => {
          img.style.cursor = 'pointer';
          img.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const modal = document.getElementById('galleryModal');
            const modalImg = document.getElementById('modalImg');
            const modalCaption = document.getElementById('modalCaption');
            
            modalImg.src = this.src;
            
            // Caption finden (nächstes div-Element nach dem Bild)
            const captionElement = this.nextElementSibling;
            if (captionElement && captionElement.textContent) {
              modalCaption.textContent = captionElement.textContent;
              modalCaption.style.display = 'block';
            } else {
              modalCaption.textContent = '';
              modalCaption.style.display = 'none';
            }
            
            modal.style.display = 'block';
          });
        });
      }
      
      // Animationen für Elemente hinzufügen
      function addAnimations() {
        // Prüfen, ob Animationen aktiviert sind
        const animationStyle = document.createElement('style');
        animationStyle.textContent = `
          .animate-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
          }
          
          .animate-item.visible {
            opacity: 1;
            transform: translateY(0);
          }
          
          .delay-1 { transition-delay: 0.2s; }
          .delay-2 { transition-delay: 0.4s; }
          .delay-3 { transition-delay: 0.6s; }
          .delay-4 { transition-delay: 0.8s; }
        `;
        document.head.appendChild(animationStyle);
        
        // Intersection Observer für Animation beim Scrollen
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1
        });
        
        // Alle Elemente beobachten
        document.querySelectorAll('.animate-item').forEach(item => {
          observer.observe(item);
        });
      }
      
      // Laden aller veröffentlichten Seiten für die Navigation
      function loadPageNavigation() {
        db.collection('pages').get()
          .then(snapshot => {
            const dynamicNav = document.getElementById('dynamicNav');
            const dynamicNavMobile = document.getElementById('dynamicNavMobile');
            
            if (!dynamicNav || !dynamicNavMobile) return;
            
            snapshot.forEach(doc => {
              const pageData = doc.data();
              const pageId = doc.id;
              
              // Link für Desktop-Navigation
              const navLink = document.createElement('a');
              navLink.href = `page.php?id=${pageId}`;
              navLink.className = 'w3-bar-item w3-button w3-hide-small';
              navLink.textContent = pageData.title;
              
              // Prüfen, ob dies die aktuelle Seite ist
              if (pageId === '<?php echo $page_id; ?>') {
                navLink.className += ' w3-green';
              }
              
              dynamicNav.appendChild(navLink);
              
              // Link für Mobile-Navigation
              const mobileNavLink = document.createElement('a');
              mobileNavLink.href = `page.php?id=${pageId}`;
              mobileNavLink.className = 'w3-bar-item w3-button';
              mobileNavLink.textContent = pageData.title;
              mobileNavLink.onclick = toggleFunction;
              
              // Prüfen, ob dies die aktuelle Seite ist
              if (pageId === '<?php echo $page_id; ?>') {
                mobileNavLink.className += ' w3-green';
              }
              
              dynamicNavMobile.appendChild(mobileNavLink);
            });
          })
          .catch(error => {
            console.error('Fehler beim Laden der Navigation:', error);
          });
      }
    });
  </script>
  
  <!-- Go-to-top button script -->
  <script>
    window.addEventListener('scroll', function() {
      const goTopBtn = document.getElementById('goTopBtn');
      if (!goTopBtn) return;
      
      if (window.scrollY > 300) {
        goTopBtn.classList.add('visible');
      } else {
        goTopBtn.classList.remove('visible');
      }
    });
    
    document.getElementById('goTopBtn').addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  </script>
</body>
</html>