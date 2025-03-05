 <?php
// page.php - Template für dynamische Seiten

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
  <link rel="stylesheet" href="./assets/css/styles.css">
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  
  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
</head>
<body>

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

<!-- Seiteninhalt -->
<div class="w3-content w3-container w3-padding-64" style="margin-top: 50px;">
  <div id="pageContent">
    <!-- Der Seiteninhalt wird hier dynamisch eingefügt -->
    <div class="w3-center">
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
<script src="./assets/js/script.js"></script>

<!-- Dynamische Seiten-Skript -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Seiten-ID aus der URL extrahieren
    const pageId = '<?php echo $page_id; ?>';
    
    if (!pageId) {
      displayError('Keine Seiten-ID angegeben');
      return;
    }
    
    // Seite aus Firestore laden
    const db = firebase.firestore();
    db.collection('pages').doc(pageId).get()
      .then(doc => {
        if (!doc.exists) {
          displayError('Die angeforderte Seite wurde nicht gefunden');
          return;
        }
        
        const pageData = doc.data();
        
        // Seitentitel setzen
        document.title = pageData.title + ' - Mannar';
        
        // Seiteninhalt basierend auf Template rendern
        renderPage(pageData);
        
        // Laden aller veröffentlichten Seiten für die Navigation
        loadPageNavigation();
      })
      .catch(error => {
        console.error('Fehler beim Laden der Seite:', error);
        displayError('Fehler beim Laden der Seite: ' + error.message);
      });
    
    // Fehler anzeigen
    function displayError(message) {
      const pageContent = document.getElementById('pageContent');
      pageContent.innerHTML = `
        <div class="w3-panel w3-pale-red w3-leftbar w3-border-red">
          <h3>Fehler</h3>
          <p>${message}</p>
          <p><a href="index.php" class="w3-button w3-blue">Zurück zur Startseite</a></p>
        </div>
      `;
    }
    
    // Seite basierend auf Template rendern
    function renderPage(pageData) {
      const pageContent = document.getElementById('pageContent');
      
      // Seitentitel hinzufügen
      pageContent.innerHTML = `<h1 class="w3-center">${pageData.title}</h1>`;
      
      // Je nach Template unterschiedliche Inhalte rendern
      switch (pageData.template) {
        case 'basic':
          renderBasicTemplate(pageData.data, pageContent);
          break;
        case 'text-image':
          renderTextImageTemplate(pageData.data, pageContent);
          break;
        case 'image-text':
          renderImageTextTemplate(pageData.data, pageContent);
          break;
        case 'gallery':
          renderGalleryTemplate(pageData.data, pageContent);
          break;
        case 'contact':
          renderContactTemplate(pageData.data, pageContent);
          break;
        default:
          pageContent.innerHTML += `<p class="w3-center">Unbekanntes Template: ${pageData.template}</p>`;
      }
    }
    
    // Basic Template rendern
    function renderBasicTemplate(data, container) {
      container.innerHTML += `
        <h2>${data.header || ''}</h2>
        <div class="w3-container">${data.content || ''}</div>
      `;
    }
    
    // Text-Image Template rendern
    function renderTextImageTemplate(data, container) {
      container.innerHTML += `
        <h2>${data.header || ''}</h2>
        <div class="w3-row">
          <div class="w3-col m8 w3-padding">
            <div>${data.content || ''}</div>
          </div>
          <div class="w3-col m4 w3-padding">
            <img src="${data.image?.url || '/api/placeholder/400/300'}" alt="${data.header || 'Bild'}" class="w3-image w3-round">
          </div>
        </div>
      `;
    }
    
    // Image-Text Template rendern
    function renderImageTextTemplate(data, container) {
      container.innerHTML += `
        <h2>${data.header || ''}</h2>
        <div class="w3-row">
          <div class="w3-col m4 w3-padding">
            <img src="${data.image?.url || '/api/placeholder/400/300'}" alt="${data.header || 'Bild'}" class="w3-image w3-round">
          </div>
          <div class="w3-col m8 w3-padding">
            <div>${data.content || ''}</div>
          </div>
        </div>
      `;
    }
    
    // Gallery Template rendern
    function renderGalleryTemplate(data, container) {
      container.innerHTML += `
        <h2>${data.header || ''}</h2>
        <div class="w3-container">${data.description || ''}</div>
        <div class="w3-row-padding w3-margin-top" id="galleryContainer"></div>
      `;
      
      const galleryContainer = document.getElementById('galleryContainer');
      if (!galleryContainer) return;
      
      // Bilder zur Galerie hinzufügen
      const images = data.images || [];
      
      if (images.length === 0) {
        galleryContainer.innerHTML = '<p class="w3-center w3-text-grey">Keine Bilder in der Galerie.</p>';
        return;
      }
      
      images.forEach(image => {
        const col = document.createElement('div');
        col.className = 'w3-col m3 s6 w3-margin-bottom';
        
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = 'Galeriebild';
        img.className = 'w3-hover-opacity gallery-image';
        img.style.width = '100%';
        img.style.cursor = 'pointer';
        
        // Modal beim Klick öffnen
        img.addEventListener('click', () => {
          const modal = document.getElementById('modal01');
          const modalImg = document.getElementById('img01');
          if (modal && modalImg) {
            modal.style.display = 'block';
            modalImg.src = image.url;
          }
        });
        
        col.appendChild(img);
        galleryContainer.appendChild(col);
      });
      
      // Wenn es noch kein Modal gibt, eines erstellen
      if (!document.getElementById('modal01')) {
        const modal = document.createElement('div');
        modal.id = 'modal01';
        modal.className = 'w3-modal w3-black';
        modal.onclick = function() { this.style.display='none'; };
        
        modal.innerHTML = `
          <span class="w3-button w3-large w3-black w3-display-topright" title="Schließen"><i class="fas fa-times"></i></span>
          <div class="w3-modal-content w3-animate-zoom w3-center w3-transparent w3-padding-64">
            <img id="img01" class="w3-image">
          </div>
        `;
        
        document.body.appendChild(modal);
      }
    }
    
    // Contact Template rendern
    function renderContactTemplate(data, container) {
      const mapHtml = data.showMap ? `
        <div class="w3-col m4 w3-container">
          <img src="${data.image?.url || '/api/placeholder/400/300'}" class="w3-image w3-round" style="width:100%" alt="Karte zu meinem Standort">
        </div>
      ` : '';
      
      const mapColWidth = data.showMap ? 'm8' : 'm12';
      
      container.innerHTML += `
        <h2>${data.header || ''}</h2>
        <div class="w3-container">${data.content || ''}</div>
        
        <div class="w3-row w3-padding-32 w3-section">
          ${mapHtml}
          <div class="w3-col ${mapColWidth} w3-panel">
            <div class="w3-large w3-margin-bottom">
              ${data.address ? `<i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> ${data.address}<br>` : ''}
              ${data.phone ? `<i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Telefon: ${data.phone}<br>` : ''}
              ${data.email ? `<i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> E-Mail: ${data.email}<br>` : ''}
            </div>
            <p>Schauen Sie auf einen Kaffee vorbei <i class="fas fa-coffee"></i>, oder hinterlassen Sie mir eine Nachricht:</p>
            <form action="./api/contact.php" target="_blank" class="contact-form">
              <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
                <div class="w3-half">
                  <input class="w3-input w3-border" type="text" placeholder="Name" required name="Name">
                </div>
                <div class="w3-half">
                  <input class="w3-input w3-border" type="text" placeholder="E-Mail" required name="Email">
                </div>
              </div>
              <input class="w3-input w3-border" type="text" placeholder="Nachricht" required name="Message">
              <button class="w3-button w3-black w3-right w3-section" type="submit">
                <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
              </button>
            </form>
          </div>
        </div>
      `;
    }
    
    // Alle veröffentlichten Seiten für Navigation laden
    function loadPageNavigation() {
      const db = firebase.firestore();
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
</body>
</html>