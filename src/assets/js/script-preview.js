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
  
  // Inhalte aus Firestore laden
  function loadPreviewContent() {
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
        if (data.offer1_image && data.offer1_image.url) document.getElementById('offer1ImageDisplay').src = data.offer1_image.url;
        
        // Angebot 2
        if (data.offer2Title) document.getElementById('offer2TitleDisplay').innerText = data.offer2Title;
        if (data.offer2Desc) document.getElementById('offer2DescDisplay').innerHTML = data.offer2Desc;
        if (data.offer2_image && data.offer2_image.url) document.getElementById('offer2ImageDisplay').src = data.offer2_image.url;
        
        // Angebot 3
        if (data.offer3Title) document.getElementById('offer3TitleDisplay').innerText = data.offer3Title;
        if (data.offer3Desc) document.getElementById('offer3DescDisplay').innerHTML = data.offer3Desc;
        if (data.offer3_image && data.offer3_image.url) document.getElementById('offer3ImageDisplay').src = data.offer3_image.url;
        
        // Kontakt
        if (data.contactTitle) document.getElementById('contactTitleDisplay').innerText = data.contactTitle;
        if (data.contactSubtitle) document.getElementById('contactSubtitleDisplay').innerText = data.contactSubtitle;
        if (data.contact_image && data.contact_image.url) document.getElementById('contactImageDisplay').src = data.contact_image.url;
      } else {
        console.log("Keine Inhalte gefunden");
      }
    }).catch(error => {
      console.error("Fehler beim Laden der Inhalte:", error);
    });
    
    // Wortwolke laden
    db.collection("content").doc("wordCloud").get().then(doc => {
      if (doc.exists && doc.data().words) {
        const wordCloudList = document.getElementById('wordCloudList');
        wordCloudList.innerHTML = '';
        
        doc.data().words.forEach(word => {
          if (word && word.text) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = word.link || "#";
            a.setAttribute('data-weight', word.weight || "5");
            a.textContent = word.text;
            a.style.opacity = '0';
            a.style.transform = 'translateY(20px)';
            
            li.appendChild(a);
            wordCloudList.appendChild(li);
          }
        });
        
        // Wortwolken-Animation starten
        animateWordCloud();
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