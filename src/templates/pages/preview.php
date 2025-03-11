<?php
// Variable für Template-Titel
$page_title = 'Vorschau';
$include_template_css = false;
$body_class = '';
$include_dynamic_nav = false;

// Parameter für den Vorschaumodus
$is_draft = isset($_GET['draft']) && $_GET['draft'] === 'true';
$preview_mode = $is_draft ? 'Entwurf' : 'Live-Website';
$preview_class = $is_draft ? '' : 'live';

// Zusätzlicher Head-Content
$custom_head_content = '
  <style>
    /* Zusätzliche Preview-Styles */
    .preview-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #ff9800;
      color: white;
      text-align: center;
      padding: 5px;
      z-index: 1000;
      font-size: 14px;
    }
    
    .preview-indicator.live {
      background-color: #4CAF50;
    }
  </style>
';

// Zusätzliche Skripte
$additional_scripts = '
  <script src="./assets/js/script-preview.js"></script>
';
?>

<?php include 'templates/header.php'; ?>

<!-- Preview mode indicator -->
<div id="previewIndicator" class="preview-indicator <?php echo $preview_class; ?>">
  Vorschau-Modus: <span id="previewMode"><?php echo $preview_mode; ?></span>
</div>

<?php include 'templates/navbar.php'; ?>

<!-- Hero-Bereich -->
<div class="bgimg-1 w3-display-container" id="home">
  <div class="w3-display-middle" style="white-space:nowrap;">
    <img src="./assets/img/IMG_4781.svg" alt="Mannar Logo" id="mainLogo" style="display:none;">
  </div>
</div>

<!-- About-Sektion -->
<div class="w3-content w3-container w3-padding-64" id="about">
  <h2 id="aboutTitleDisplay" class="w3-center"></h2>
  <p id="aboutSubtitleDisplay" class="w3-center"><em></em></p>
  <div id="aboutTextDisplay"></div>

  <div class="textbubble">
    <ul class="word-cloud" id="wordCloudList">
      <!-- Wird dynamisch befüllt -->
    </ul>
  </div>
</div>

<!-- Portfolio-Sektion (Angebote) -->
<div class="w3-content w3-container w3-padding-64" id="portfolio">
  <h2 id="offeringsTitleDisplay" class="w3-center"></h2>
  <p id="offeringsSubtitleDisplay" class="w3-center"><em></em></p>
  
  <!-- Drei Angebote / Cards -->
  <div class="w3-row-padding">
    <div class="w3-col m4 portfolio-item">
      <div class="w3-card w3-round">
        <img id="offer1ImageDisplay" src="/api/placeholder/400/300" alt="Angebot 1" style="width:100%">
        <div class="w3-container">
          <h3 id="offer1TitleDisplay"></h3>
          <div id="offer1DescDisplay"></div>
        </div>
      </div>
    </div>
    
    <div class="w3-col m4 portfolio-item">
      <div class="w3-card w3-round">
        <img id="offer2ImageDisplay" src="/api/placeholder/400/300" alt="Angebot 2" style="width:100%">
        <div class="w3-container">
          <h3 id="offer2TitleDisplay"></h3>
          <div id="offer2DescDisplay"></div>
        </div>
      </div>
    </div>
    
    <div class="w3-col m4 portfolio-item">
      <div class="w3-card w3-round">
        <img id="offer3ImageDisplay" src="/api/placeholder/400/300" alt="Angebot 3" style="width:100%">
        <div class="w3-container">
          <h3 id="offer3TitleDisplay"></h3>
          <div id="offer3DescDisplay"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Kontakt-Sektion -->
<div class="w3-content w3-container w3-padding-64" id="contact">
  <h2 id="contactTitleDisplay" class="w3-center"></h2>
  <p id="contactSubtitleDisplay" class="w3-center"></p>

  <div class="w3-row w3-padding-32 w3-section">
    <div class="w3-col m4 w3-container">
      <img id="contactImageDisplay" src="/api/placeholder/400/300" class="w3-image w3-round" style="width:100%" alt="Kontaktbild">
    </div>
    <div class="w3-col m8 w3-panel">
      <div class="w3-large w3-margin-bottom">
        <i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Berlin, Deutschland<br>
        <i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> Telefon: +49 30 123456<br>
        <i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> E-Mail: kontakt@beispiel.de<br>
      </div>
      <p>Schauen Sie auf einen Kaffee vorbei <i class="fas fa-coffee"></i>, oder hinterlassen Sie mir eine Nachricht:</p>
      
      <!-- Kontaktformular (nur Platzhalter für Vorschau) -->
      <form class="w3-container">
        <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
          <div class="w3-half">
            <input class="w3-input w3-border" type="text" placeholder="Name" disabled>
          </div>
          <div class="w3-half">
            <input class="w3-input w3-border" type="text" placeholder="E-Mail" disabled>
          </div>
        </div>
        <input class="w3-input w3-border" type="text" placeholder="Nachricht" disabled>
        <button class="w3-button w3-black w3-right w3-section" type="button" disabled>
          <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
        </button>
      </form>
    </div>
  </div>
</div>

<?php include 'templates/footer.php'; ?> 