// script-preview.js - Skript für die Vorschauseite

document.addEventListener('DOMContentLoaded', function() {
  // Firestore verwenden (Firebase sollte bereits im HTML initialisiert sein)
  const db = firebase.firestore();
  
  // Vorschau-Modus ermitteln (draft oder live)
  const params = new URLSearchParams(window.location.search);
  const isDraft = (params.get('draft') === 'true');
  const previewMode = document.getElementById('previewMode');
  const previewIndicator = document.getElementById('previewIndicator');
  
  if (isDraft) {
    previewMode.textContent = 'Entwurf';
    previewIndicator.classList.remove('live');
  } else {
    previewMode.textContent = 'Live-Website';
    previewIndicator.classList.add('live');
  }
  
  // DOM-Elemente
  const navbar = document.getElementById('myNavbar');
  const logo = document.getElementById('mainLogo');
  const wordCloudContainer = document.querySelector('.textbubble');

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
  
  // Ersetze die gesamte loadPreviewContent-Funktion mit folgender Code:
function loadPreviewContent() {
  // Vorschau-Modus ermitteln
  const params = new URLSearchParams(window.location.search);
  const isDraft = (params.get('draft') === 'true');
  
  // Hauptinhalte laden
  contentLoader.loadContent(isDraft).then(data => {
    if (!data) {
      console.log("Keine Inhalte gefunden");
      return;
    }
    
    // About
    if (data.aboutTitle) document.getElementById('aboutTitleDisplay').innerText = data.aboutTitle;
    if (data.aboutSubtitle) document.getElementById('aboutSubtitleDisplay').innerText = data.aboutSubtitle;
    if (data.aboutText) document.getElementById('aboutTextDisplay').innerHTML = data.aboutText;
    
    // Angebote
    if (data.offeringsTitle) document.getElementById('offeringsTitleDisplay').innerText = data.offeringsTitle;
    if (data.offeringsSubtitle) document.getElementById('offeringsSubtitleDisplay').innerText = data.offeringsSubtitle;
    
    // Bildvorschauen aktualisieren
    contentLoader.updateImagePreviews(data, {
      offer1Img: document.getElementById('offer1ImageDisplay'),
      offer2Img: document.getElementById('offer2ImageDisplay'),
      offer3Img: document.getElementById('offer3ImageDisplay'),
      contactImg: document.getElementById('contactImageDisplay')
    });
    
    // Titel
    if (data.offer1Title) document.getElementById('offer1TitleDisplay').innerText = data.offer1Title;
    if (data.offer1Desc) document.getElementById('offer1DescDisplay').innerHTML = data.offer1Desc;
    if (data.offer2Title) document.getElementById('offer2TitleDisplay').innerText = data.offer2Title;
    if (data.offer2Desc) document.getElementById('offer2DescDisplay').innerHTML = data.offer2Desc;
    if (data.offer3Title) document.getElementById('offer3TitleDisplay').innerText = data.offer3Title;
    if (data.offer3Desc) document.getElementById('offer3DescDisplay').innerHTML = data.offer3Desc;
    
    // Kontakt
    if (data.contactTitle) document.getElementById('contactTitleDisplay').innerText = data.contactTitle;
    if (data.contactSubtitle) document.getElementById('contactSubtitleDisplay').innerText = data.contactSubtitle;
  }).catch(error => {
    console.error("Fehler beim Laden der Inhalte:", error);
  });
  
  // Wortwolke laden
  contentLoader.loadWordCloud().then(words => {
    const wordCloudList = document.getElementById('wordCloudList');
    if (wordCloudList) {
      contentLoader.renderWordCloud(wordCloudList, words);
      contentLoader.animateWordCloud(document.querySelector('.textbubble'));
    }
  }).catch(error => {
    console.error("Fehler beim Laden der Wortwolke:", error);
  });
}
  
  // Wortwolken-Animation
  function animateWordCloud() {
    if (!wordCloudContainer) return;
    
    const wordCloudLinks = document.querySelectorAll('.word-cloud li a');
    
    // Sofort animieren in der Vorschau
    wordCloudLinks.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
});