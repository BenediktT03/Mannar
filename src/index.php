 <?php
/**
 * index.php
 * Main frontend page for the website
 */

// Set page title and description
$title = 'Mannar - Peer und Genesungsbegleiter';
$description = 'Mannar - Peer und Genesungsbegleiter. Beratung und Begleitung bei psychischen Herausforderungen.';

// Include header
require_once 'includes/header.php';
?>

<!-- Home Section -->
<div class="home-container w3-display-container" id="home">
  <div class="w3-display-middle w3-center">
    <span class="w3-jumbo w3-hide-small">MANNAR</span>
    <span class="w3-xxlarge w3-hide-large w3-hide-medium">MANNAR</span>
    <p class="w3-large">Peer und Genesungsbegleiter</p>
    <p><a href="#about" class="w3-button w3-padding-large w3-large w3-opacity w3-hover-opacity-off">MEHR ERFAHREN</a></p>
  </div>
</div>

<!-- About Section -->
<div class="w3-content w3-container w3-padding-64" id="about">
  <h2 class="w3-center" id="aboutTitle">ÜBER MICH</h2>
  <h3 class="w3-center" id="aboutSubtitle">Peer und Genesungsbegleiter</h3>
  <div class="w3-row">
    <div class="w3-col m6">
      <div id="aboutText">
        <p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum.</p>
        <p>Mit meiner eigenen Erfahrung im Umgang mit psychischen Herausforderungen begleite ich Sie einfühlsam und verständnisvoll durch schwierige Lebensphasen.</p>
        <p>Meine Angebote richten sich an Menschen, die nach Unterstützung, Hoffnung und neuen Perspektiven suchen.</p>
      </div>
    </div>
    <div class="w3-col m6">
      <img src="assets/images/profile.jpg" alt="Profilbild" class="w3-image w3-round" id="profileImage" onerror="this.src='https://www.w3schools.com/w3images/avatar2.png'">
    </div>
  </div>
  
  <!-- Word Cloud -->
  <div class="textbubble w3-margin-top">
    <ul id="wordCloudList" class="word-cloud" role="navigation" aria-label="Themengebiete">
      <!-- Word cloud items will be loaded dynamically -->
      <li><a href="#" data-weight="7">Achtsamkeit</a></li>
      <li><a href="#" data-weight="9">Selbstfürsorge</a></li>
      <li><a href="#" data-weight="6">Resilienz</a></li>
      <li><a href="#" data-weight="8">Recovery</a></li>
      <li><a href="#" data-weight="5">Empowerment</a></li>
    </ul>
  </div>
</div>

<!-- Offerings/Portfolio Section -->
<div class="w3-content w3-container w3-padding-64" id="portfolio">
  <h2 class="w3-center" id="offeringsTitle">MEINE ANGEBOTE</h2>
  <h3 class="w3-center" id="offeringsSubtitle">Hier sind einige meiner Leistungen und Angebote</h3>

  <div class="w3-row-padding">
    <!-- First Offering -->
    <div class="w3-col l4 m6 w3-margin-bottom">
      <div class="w3-card w3-white offering-card">
        <img src="assets/images/offering1.jpg" alt="Beratung" class="w3-image" id="offer1Image" onerror="this.src='https://www.w3schools.com/w3images/p1.jpg'">
        <div class="w3-container w3-padding">
          <h4 id="offer1Title">Beratung & Begleitung</h4>
          <p id="offer1Desc">Individuelle Beratung und Begleitung bei psychischen Herausforderungen und Lebenskrisen.</p>
        </div>
      </div>
    </div>
    
    <!-- Second Offering -->
    <div class="w3-col l4 m6 w3-margin-bottom">
      <div class="w3-card w3-white offering-card">
        <img src="assets/images/offering2.jpg" alt="Gruppenangebote" class="w3-image" id="offer2Image" onerror="this.src='https://www.w3schools.com/w3images/p2.jpg'">
        <div class="w3-container w3-padding">
          <h4 id="offer2Title">Gruppenangebote</h4>
          <p id="offer2Desc">Geleitete Gesprächsgruppen und Workshops zu verschiedenen Themen der psychischen Gesundheit.</p>
        </div>
      </div>
    </div>
    
    <!-- Third Offering -->
    <div class="w3-col l4 m6 w3-margin-bottom">
      <div class="w3-card w3-white offering-card">
        <img src="assets/images/offering3.jpg" alt="Vorträge" class="w3-image" id="offer3Image" onerror="this.src='https://www.w3schools.com/w3images/p3.jpg'">
        <div class="w3-container w3-padding">
          <h4 id="offer3Title">Vorträge & Fortbildungen</h4>
          <p id="offer3Desc">Informative Vorträge und Fortbildungen zu Recovery und Genesungsbegleitung.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Contact Section -->
<div class="w3-content w3-container w3-padding-64" id="contact">
  <h2 class="w3-center" id="contactTitle">KONTAKT</h2>
  <h3 class="w3-center" id="contactSubtitle">So erreichen Sie mich</h3>

  <div class="w3-row">
    <!-- Contact Information -->
    <div class="w3-col m5">
      <div class="w3-card w3-white w3-padding">
        <div class="w3-large w3-margin-bottom">
          <i class="fa fa-map-marker fa-fw w3-text-blue w3-margin-right"></i> Musterstraße 123, 12345 Musterstadt<br>
          <i class="fa fa-phone fa-fw w3-text-blue w3-margin-right"></i> Telefon: +49 123 456789<br>
          <i class="fa fa-envelope fa-fw w3-text-blue w3-margin-right"></i> Email: info@mannar.de<br>
        </div>
        <img src="assets/images/map.jpg" alt="Karte" class="w3-image" id="contactImage" onerror="this.src='https://www.w3schools.com/w3images/map.jpg'">
      </div>
    </div>
    
    <!-- Contact Form -->
    <div class="w3-col m7">
      <form class="contact-form w3-card w3-white w3-padding" onsubmit="return Website.handleContactForm(event)">
        <div class="w3-row-padding">
          <div class="w3-half">
            <input class="w3-input w3-border" type="text" name="Name" placeholder="Name" required>
          </div>
          <div class="w3-half">
            <input class="w3-input w3-border" type="email" name="Email" placeholder="Email" required>
          </div>
        </div>
        <textarea class="w3-input w3-border" name="Message" placeholder="Nachricht" rows="6" required></textarea>
        <button class="w3-button w3-right w3-margin-top" type="submit">NACHRICHT SENDEN</button>
      </form>
    </div>
  </div>
</div>

<!-- Modal for Portfolio Images -->
<div id="modal01" class="w3-modal" onclick="this.style.display='none'">
  <div class="w3-modal-content w3-animate-zoom">
    <img id="img01" style="width:100%">
    <div class="w3-container w3-black">
      <span class="w3-button w3-xxlarge w3-black w3-display-topright">&times;</span>
      <p id="caption"></p>
    </div>
  </div>
</div>

<!-- Loading Indicator -->
<div id="loading-indicator" class="loading-overlay" style="display: none;">
  <div class="loading-spinner">
    <i class="fas fa-spinner fa-spin fa-3x"></i>
    <p>Loading content...</p>
  </div>
</div>

<style>
  /* Additional page-specific styles */
  .home-container {
    background-image: url('assets/images/header.jpg');
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  .offering-card {
    transition: transform 0.3s;
  }
  
  .offering-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }
  
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .loading-spinner {
    text-align: center;
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    .home-container {
      background-attachment: scroll;
    }
  }
</style>

<?php
// Include footer
require_once 'includes/footer.php';
?>