 <?php
/**
 * Homepage Template
 * 
 * Main landing page template for the Mannar website
 * Displays the hero section, about information, services/portfolio, and contact form
 */

// Variable for page title
$page_title = $page_title ?? 'Mannar - Peer und Genesungsbegleiter';
$page_description = $page_description ?? 'Mannar bietet Begleitung und Unterstützung auf dem Weg zu psychischer Gesundheit und persönlichem Wachstum.';
$body_class = $body_class ?? 'home-page';

// Include additional head content if needed
$custom_head_content = '
  <style>
    /* Page-specific styles */
    .portfolio-item {
      margin-bottom: 20px;
      transition: transform 0.3s ease;
    }
    
    .portfolio-item:hover {
      transform: translateY(-5px);
    }
    
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
  </style>
';

// Additional scripts for the home page
$additional_scripts = '
  <script src="./assets/js/content-loader.js?v=' . ASSET_VERSION . '"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      // Load content from Firebase
      if (typeof FirebaseService !== "undefined") {
        FirebaseService.content.load("content/main")
          .then(data => {
            if (data) {
              updatePageContent(data);
            }
          })
          .catch(error => {
            console.error("Error loading content:", error);
          });
      }
      
      // Initialize UI components
      if (typeof UIUtils !== "undefined") {
        UIUtils.initAll();
      }
      
      // Load word cloud if enabled
      if (' . (defined('FEATURES') && isset(FEATURES['enable_word_cloud']) && FEATURES['enable_word_cloud'] ? 'true' : 'false') . ') {
        if (typeof ContentService !== "undefined") {
          ContentService.loadWordCloud().then(words => {
            const wordCloudList = document.getElementById("wordCloudList");
            if (wordCloudList) {
              renderWordCloud(wordCloudList, words);
              animateWordCloud(document.querySelector(".textbubble"));
            }
          });
        }
      }
      
      /**
       * Update page content with data from Firebase
       * @param {Object} data - Content data
       */
      function updatePageContent(data) {
        // Update about section
        if (data.aboutTitle) {
          document.getElementById("aboutTitle").innerHTML = data.aboutTitle;
        }
        
        if (data.aboutSubtitle) {
          document.getElementById("aboutSubtitle").innerHTML = data.aboutSubtitle;
        }
        
        if (data.aboutText) {
          document.getElementById("aboutText").innerHTML = data.aboutText;
        }
        
        // Update offerings section
        if (data.offeringsTitle) {
          document.getElementById("offeringsTitle").innerHTML = data.offeringsTitle;
        }
        
        if (data.offeringsSubtitle) {
          document.getElementById("offeringsSubtitle").innerHTML = data.offeringsSubtitle;
        }
        
        // Update offerings
        updateOffering(1, data);
        updateOffering(2, data);
        updateOffering(3, data);
        
        // Update contact section
        if (data.contactTitle) {
          document.getElementById("contactTitle").innerHTML = data.contactTitle;
        }
        
        if (data.contactSubtitle) {
          document.getElementById("contactSubtitle").innerHTML = data.contactSubtitle;
        }
        
        // Update images
        updateImages(data);
      }
      
      /**
       * Update an offering section
       * @param {number} index - Offering index (1-3)
       * @param {Object} data - Content data
       */
      function updateOffering(index, data) {
        const titleKey = `offer${index}Title`;
        const descKey = `offer${index}Desc`;
        
        if (data[titleKey]) {
          const titleElement = document.getElementById(titleKey);
          if (titleElement) titleElement.innerHTML = data[titleKey];
        }
        
        if (data[descKey]) {
          const descElement = document.getElementById(descKey);
          if (descElement) descElement.innerHTML = data[descKey];
        }
      }
      
      /**
       * Update images with content data
       * @param {Object} data - Content data
       */
      function updateImages(data) {
        // Map of image elements and their data keys
        const imageMap = {
          "offer1Image": "offer1_image",
          "offer2Image": "offer2_image", 
          "offer3Image": "offer3_image",
          "contactImage": "contact_image"
        };
        
        for (const [elemId, dataKey] of Object.entries(imageMap)) {
          if (data[dataKey] && data[dataKey].url) {
            const imgElement = document.getElementById(elemId);
            if (imgElement) {
              imgElement.src = data[dataKey].url;
              if (data[dataKey].alt) {
                imgElement.alt = data[dataKey].alt;
              }
            }
          }
        }
      }
      
      /**
       * Render word cloud
       * @param {HTMLElement} container - Container element
       * @param {Array} words - Word cloud data
       */
      function renderWordCloud(container, words) {
        if (!container || !words || !words.length) return;
        
        container.innerHTML = "";
        
        words.forEach(word => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          
          a.href = word.link || "#";
          a.textContent = word.text || "";
          a.setAttribute("data-weight", word.weight || 5);
          
          li.appendChild(a);
          container.appendChild(li);
        });
      }
      
      /**
       * Animate word cloud items
       * @param {HTMLElement} container - Word cloud container
       */
      function animateWordCloud(container) {
        if (!container) return;
        
        const wordElements = container.querySelectorAll(".word-cloud li a");
        
        wordElements.forEach((word, index) => {
          setTimeout(() => {
            word.style.opacity = "1";
            word.style.transform = "translateY(0)";
          }, 50 * index);
        });
      }
    });
  </script>
';
?>

<!-- Hero Section with Logo -->
<div class="bgimg-1 w3-display-container" id="home">
  <div class="w3-display-middle" style="white-space:nowrap;">
    <img src="./assets/img/IMG_4781.svg" alt="Mannar Logo" id="mainLogo" style="display:none;">
  </div>
</div>

<!-- About Section -->
<div class="w3-content w3-container w3-padding-64" id="about">
  <h2 id="aboutTitle" class="w3-center">ÜBER MICH</h2>
  <p id="aboutSubtitle" class="w3-center"><em>Peer und Genesungsbegleiter</em></p>
  <div id="aboutText" class="animate-item">
    <p>Willkommen auf meiner Website. Ich bin als Peer und Genesungsbegleiter tätig und unterstütze Menschen auf ihrem Weg zu psychischer Gesundheit und persönlichem Wachstum. Meine eigenen Erfahrungen haben mich gelehrt, wie wichtig Achtsamkeit, Bewusstsein und Selbstreflexion für den Heilungsprozess sind.</p>
  </div>
  
  <?php if (defined('FEATURES') && isset(FEATURES['enable_word_cloud']) && FEATURES['enable_word_cloud']): ?>
  <div class="textbubble">
    <ul class="word-cloud" id="wordCloudList" role="navigation" aria-label="Psychologie & Spiritualität Word Cloud">
      <!-- Will be dynamically populated from Firebase -->
    </ul>
  </div>
  <?php endif; ?>
</div>

<!-- Portfolio/Offerings Section -->
<div class="w3-content w3-container w3-padding-64" id="portfolio">
  <h2 id="offeringsTitle" class="w3-center">MEINE ANGEBOTE</h2>
  <p id="offeringsSubtitle" class="w3-center"><em>Hier sind einige meiner Leistungen und Angebote</em></p>
  
  <!-- Offerings Cards -->
  <div class="w3-row-padding">
    <!-- Offering 1 -->
    <div class="w3-col m4 portfolio-item animate-item delay-1">
      <div class="w3-card w3-round">
        <img id="offer1Image" src="./assets/img/placeholder.jpg" alt="Angebot 1" style="width:100%">
        <div class="w3-container">
          <h3 id="offer1Title">Einzelgespräche</h3>
          <div id="offer1Desc">
            <p>Persönliche Begleitung auf Ihrem Weg zu mehr Bewusstsein und Selbsterkenntnis.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Offering 2 -->
    <div class="w3-col m4 portfolio-item animate-item delay-2">
      <div class="w3-card w3-round">
        <img id="offer2Image" src="./assets/img/placeholder.jpg" alt="Gruppenworkshops" style="width:100%">
        <div class="w3-container">
          <h3 id="offer2Title">Gruppenworkshops</h3>
          <div id="offer2Desc">
            <p>Gemeinsame Erfahrungsräume für Austausch und Wachstum in der Gemeinschaft.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Offering 3 -->
    <div class="w3-col m4 portfolio-item animate-item delay-3">
      <div class="w3-card w3-round">
        <img id="offer3Image" src="./assets/img/placeholder.jpg" alt="Meditation" style="width:100%">
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
    <img id="img01" class="w3-image" alt="Vergrößertes Bild">
    <p id="caption" class="w3-opacity w3-large"></p>
  </div>
</div>

<!-- Contact Section -->
<div class="w3-content w3-container w3-padding-64" id="contact">
  <h2 id="contactTitle" class="w3-center">KONTAKT</h2>
  <p id="contactSubtitle" class="w3-center"><em>Ich freue mich auf Ihre Nachricht!</em></p>

  <div class="w3-row w3-padding-32 w3-section">
    <div class="w3-col m4 w3-container animate-item">
      <img id="contactImage" src="./assets/img/placeholder.jpg" class="w3-image w3-round" style="width:100%" alt="Karte zu meinem Standort">
    </div>
    <div class="w3-col m8 w3-panel animate-item delay-1">
      <div class="w3-large w3-margin-bottom">
        <i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Berlin, Deutschland<br>
        <i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Telefon: +49 30 123456<br>
        <i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> E-Mail: <?= htmlspecialchars(defined('EMAIL_CONFIG') && isset(EMAIL_CONFIG['contact_email']) ? EMAIL_CONFIG['contact_email'] : 'kontakt@beispiel.de') ?><br>
      </div>
      <p>Schauen Sie auf einen Kaffee vorbei <i class="fas fa-coffee"></i>, oder hinterlassen Sie mir eine Nachricht:</p>
      
      <?php if (defined('FEATURES') && isset(FEATURES['enable_contact_form']) && FEATURES['enable_contact_form']): ?>
      <form action="./api/contact.php" method="post" class="contact-form w3-container">
        <?php if (function_exists('generate_csrf_token')): ?>
          <?php $csrf_token = generate_csrf_token(); ?>
          <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
        <?php endif; ?>
        
        <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
          <div class="w3-half">
            <input class="w3-input w3-border" type="text" placeholder="Name" required name="name">
          </div>
          <div class="w3-half">
            <input class="w3-input w3-border" type="email" placeholder="E-Mail" required name="email">
          </div>
        </div>
        <input class="w3-input w3-border w3-margin-bottom" type="text" placeholder="Betreff" name="subject">
        <textarea class="w3-input w3-border" name="message" rows="5" placeholder="Nachricht" required></textarea>
        <button class="w3-button w3-black w3-right w3-section" type="submit">
          <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
        </button>
      </form>
      <?php else: ?>
      <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue">
        <p>Das Kontaktformular ist derzeit deaktiviert. Bitte kontaktieren Sie mich direkt per E-Mail oder Telefon.</p>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- Go to top button -->
<div class="go-top" id="goTopBtn" aria-label="Nach oben scrollen">
  <i class="fas fa-arrow-up"></i>
</div>