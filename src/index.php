<!DOCTYPE html>
<html lang="de">
<head>
  <title>Mannar</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Mannar - Peer, Genesungsbegeleiter">
  <link rel="stylesheet" href="./assets/css/styles.css">
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  
  <!-- Nur eine Version von Firebase laden - Compat Version -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
</head>
<body>

<!-- Navbar (always visible) -->
<div class="w3-top">
  <div class="w3-bar" id="myNavbar">
    <a class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right" href="javascript:void(0);" onclick="toggleFunction()" title="Navigation Menu">
      <i class="fas fa-bars"></i>
    </a>
    <a href="#home" class="w3-bar-item w3-button">HOME</a>
    <a href="#about" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-user"></i> ABOUT</a>
    <a href="#portfolio" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-th"></i> PORTFOLIO</a>
    <a href="#contact" class="w3-bar-item w3-button w3-hide-small"><i class="fas fa-envelope"></i> KONTAKT</a>
    </a>
  </div>

  <!-- Navbar for small screens -->
  <div id="navDemo" class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium">
    <a href="#about" class="w3-bar-item w3-button" onclick="toggleFunction()">ABOUT</a>
    <a href="#portfolio" class="w3-bar-item w3-button" onclick="toggleFunction()">PORTFOLIO</a>
    <a href="#contact" class="w3-bar-item w3-button" onclick="toggleFunction()">KONTAKT</a>
    <a href="#" class="w3-bar-item w3-button">SUCHE</a>
  </div>
</div>

<!-- First section with Logo -->
<div class="bgimg-1 w3-display-container" id="home">
  <div class="w3-display-middle" style="white-space:nowrap;">
    <img src="./assets/img/IMG_4781.svg" alt="Mannar Logo" id="mainLogo">
  </div>
</div>

<!-- About section with Word Cloud -->
<div class="w3-content w3-container w3-padding-64" id="about">
  <h2 id="aboutTitle" class="w3-center">ÜBER MICH</h2>
  <p id="aboutSubtitle" class="w3-center"><em>Peer und Genesungsbegleiter</em></p>
  <div id="aboutText">
    <p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum. Meine eigenen Erfahrungen haben mich gelehrt, wie wichtig Achtsamkeit, Bewusstsein und Selbstreflexion für den Heilungsprozess sind.</p>
  </div>
  
  <div class="textbubble"> 
    <ul class="word-cloud" id="wordCloudList" role="navigation" aria-label="Psychologie & Spiritualität Word Cloud">
      <!-- Wird dynamisch aus Firebase geladen -->
    </ul>
  </div>
</div>

<!-- Portfolio section -->
<div class="w3-content w3-container w3-padding-64" id="portfolio">
  <h2 id="offeringsTitle" class="w3-center">MEINE ANGEBOTE</h2>
  <p id="offeringsSubtitle" class="w3-center"><em>Hier sind einige meiner Leistungen und Angebote</em></p>
  
  <div class="w3-row-padding">
    <div class="w3-col m4 portfolio-item">
      <div class="w3-card w3-round">
        <img id="offer1Image" src="/api/placeholder/400/300" alt="Angebot 1" style="width:100%">
        <div class="w3-container">
          <h3 id="offer1Title">Einzelgespräche</h3>
          <div id="offer1Desc">
            <p>Persönliche Begleitung auf Ihrem Weg zu mehr Bewusstsein und Selbsterkenntnis.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="w3-col m4 portfolio-item">
      <div class="w3-card w3-round">
        <img id="offer2Image" src="/api/placeholder/400/300" alt="Gruppenworkshops" style="width:100%">
        <div class="w3-container">
          <h3 id="offer2Title">Gruppenworkshops</h3>
          <div id="offer2Desc">
            <p>Gemeinsame Erfahrungsräume für Austausch und Wachstum in der Gemeinschaft.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="w3-col m4 portfolio-item">
      <div class="w3-card w3-round">
        <img id="offer3Image" src="/api/placeholder/400/300" alt="Meditation" style="width:100%">
        <div class="w3-container">
          <h3 id="offer3Title">Meditation</h3>
          <div id="offer3Desc">
            <p>Anleitungen und Übungen zur Stärkung von Achtsamkeit und innerem Frieden.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal for displaying images on click -->
<div id="modal01" class="w3-modal w3-black" onclick="this.style.display='none'">
  <span class="w3-button w3-large w3-black w3-display-topright" title="Schließen"><i class="fas fa-times"></i></span>
  <div class="w3-modal-content w3-animate-zoom w3-center w3-transparent w3-padding-64">
    <img id="img01" class="w3-image">
    <p id="caption" class="w3-opacity w3-large"></p>
  </div>
</div>

<!-- Contact section -->
<div class="w3-content w3-container w3-padding-64" id="contact">
  <h2 id="contactTitle" class="w3-center">KONTAKT</h2>
  <p id="contactSubtitle" class="w3-center"><em>Ich freue mich auf Ihre Nachricht!</em></p>

  <div class="w3-row w3-padding-32 w3-section">
    <div class="w3-col m4 w3-container">
      <img id="contactImage" src="/api/placeholder/400/300" class="w3-image w3-round" style="width:100%" alt="Karte zu meinem Standort">
    </div>
    <div class="w3-col m8 w3-panel">
      <div class="w3-large w3-margin-bottom">
        <i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Berlin, Deutschland<br>
        <i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Telefon: +49 30 123456<br>
        <i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> E-Mail: kontakt@beispiel.de<br>
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
</div>

<!-- Go to top button -->
<div class="go-top" id="goTopBtn">
  <i class="fas fa-arrow-up"></i>
</div>

<!-- Footer -->
<footer class="w3-center w3-black w3-padding-64 w3-opacity w3-hover-opacity-off">
  <a href="#home" class="w3-button w3-light-grey"><i class="fas fa-arrow-up w3-margin-right"></i>Nach oben</a>
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
</body>
</html>