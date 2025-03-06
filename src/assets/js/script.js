// script.js - Hauptskript für die Mannar-Website

document.addEventListener('DOMContentLoaded', function() {
  // Firebase sollte bereits im HTML initialisiert sein
  const db = firebase.firestore();
  
  // DOM-Elemente
  const navbar = document.getElementById('myNavbar');
  const navDemo = document.getElementById('navDemo');
  const goTopBtn = document.getElementById('goTopBtn');
  const logo = document.getElementById('mainLogo');
  const wordCloudContainer = document.querySelector('.textbubble');
  
  // Inhalte aus Firestore laden
  loadWebsiteContent();
  
  // Logo anzeigen, sobald geladen
  if (logo) {
    logo.style.display = 'block';
  }

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
      
      // Mobile Menü schließen, wenn offen
      if (navDemo && navDemo.classList.contains('w3-show')) {
        navDemo.classList.remove('w3-show');
      }
    });
  });

  // Modal für Bilder
  document.querySelectorAll('.portfolio-item img').forEach(img => {
    img.addEventListener('click', function() {
      const modal = document.getElementById('modal01');
      const modalImg = document.getElementById('img01');
      const captionText = document.getElementById('caption');
      
      modal.style.display = 'block';
      modalImg.src = this.src;
      captionText.innerHTML = this.alt;
    });
  });

  // Navbar toggle für kleine Bildschirme
  window.toggleFunction = function() {
    if (navDemo) {
      navDemo.classList.toggle('w3-show');
    }
  };

  // Navbar & Go-To-Top Button bei Scroll
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
    
    if (window.scrollY > 300) {
      goTopBtn.classList.add('visible');
    } else {
      goTopBtn.classList.remove('visible');
    }
  });

  // Go-To-Top Button Click
  if (goTopBtn) {
    goTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Suche nach der Funktion loadWebsiteContent
function loadWebsiteContent() {
  // Ersetze die gesamte Funktion mit folgendem Code:
  
  // Hauptinhalte laden
  contentLoader.loadContent(false).then(data => {
    if (!data) {
      console.warn("Keine Inhalte in Firestore gefunden");
      return;
    }
    
    console.log("Geladene Daten aus Firestore:", data);
    
    // About
    if (data.aboutTitle) document.getElementById('aboutTitle').innerText = data.aboutTitle;
    if (data.aboutSubtitle) document.getElementById('aboutSubtitle').innerText = data.aboutSubtitle;
    if (data.aboutText) document.getElementById('aboutText').innerHTML = data.aboutText;
    
    // Angebote
    if (data.offeringsTitle) document.getElementById('offeringsTitle').innerText = data.offeringsTitle;
    if (data.offeringsSubtitle) document.getElementById('offeringsSubtitle').innerText = data.offeringsSubtitle;
    
    // Aktualisiere Bildvorschauen
    contentLoader.updateImagePreviews(data, {
      offer1Img: document.getElementById('offer1Image'),
      offer2Img: document.getElementById('offer2Image'),
      offer3Img: document.getElementById('offer3Image'),
      contactImg: document.getElementById('contactImage')
    });
    
    // Titel
    if (data.offer1Title) document.getElementById('offer1Title').innerText = data.offer1Title;
    if (data.offer1Desc) document.getElementById('offer1Desc').innerHTML = data.offer1Desc;
    if (data.offer2Title) document.getElementById('offer2Title').innerText = data.offer2Title;
    if (data.offer2Desc) document.getElementById('offer2Desc').innerHTML = data.offer2Desc;
    if (data.offer3Title) document.getElementById('offer3Title').innerText = data.offer3Title;
    if (data.offer3Desc) document.getElementById('offer3Desc').innerHTML = data.offer3Desc;
    
    // Kontakt
    if (data.contactTitle) document.getElementById('contactTitle').innerText = data.contactTitle;
    if (data.contactSubtitle) document.getElementById('contactSubtitle').innerText = data.contactSubtitle;
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
 
  
  // Wortwolken-Animation mit Intersection Observer
  function animateWordCloud() {
    if (!wordCloudContainer) return;
    
    const wordCloudLinks = document.querySelectorAll('.word-cloud li a');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          wordCloudLinks.forEach((word, index) => {
            setTimeout(() => {
              word.style.opacity = '1';
              word.style.transform = 'translateY(0)';
            }, 50 * index);
          });
          
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(wordCloudContainer);
    
    // Sofort prüfen, ob bereits sichtbar
    const rect = wordCloudContainer.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      wordCloudLinks.forEach((word, index) => {
        setTimeout(() => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        }, 50 * index);
      });
      observer.disconnect();
    }
  }

  // Bilder Lazy-Loading
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
    });
  } else {
    const lazyImages = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.style.opacity = '0';
          
          const tempImg = new Image();
          tempImg.src = img.src;
          tempImg.onload = () => {
            img.style.transition = 'opacity 0.5s ease';
            img.style.opacity = '1';
          };
          
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
});



// Versteckten Admin-Link zum Footer hinzufügen
const footerCopyright = document.querySelector('footer p');
if (footerCopyright) {
  const adminSpan = document.createElement('span');
  adminSpan.innerHTML = ' | <a href="admin-panel.php" style="opacity: 0.3; font-size: 0.8em; text-decoration: none;">Admin</a>';
  footerCopyright.appendChild(adminSpan);
}

// Navbar Funktionalität (früher in navbar.js)

// navbar.js - Spezifisches Skript für die Navbar-Funktionalität
// Dieses Skript wird vor allen anderen Skripten geladen, um die toggleFunction global verfügbar zu machen

// Globale Funktion zum Umschalten des mobilen Menüs
function toggleFunction() {
  const navDemo = document.getElementById('navDemo');
  const toggleBtn = document.querySelector('[aria-controls="navDemo"]');
  
  if (navDemo) {
    if (navDemo.classList.contains('w3-show')) {
      navDemo.classList.remove('w3-show');
      // ARIA-Status aktualisieren
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    } else {
      navDemo.classList.add('w3-show');
      // ARIA-Status aktualisieren
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    }
  }
}

// Diese Funktion muss im globalen Bereich verfügbar sein
window.toggleFunction = toggleFunction;

// Zusätzliche Event-Listener nach DOM-Ladung
document.addEventListener('DOMContentLoaded', function() {
  const navbarToggleBtn = document.querySelector('.w3-right.w3-hide-medium.w3-hide-large');
  const navDemo = document.getElementById('navDemo');

  // Falls der Toggle-Button existiert, einen Klick-Listener hinzufügen
  if (navbarToggleBtn) {
    navbarToggleBtn.addEventListener('click', function(event) {
      event.preventDefault(); // Verhindern, dass der Link gefolgt wird
      toggleFunction();
    });
  }

  // Schließen des Menüs beim Klick außerhalb
  document.addEventListener('click', function(event) {
    if (navDemo && navDemo.classList.contains('w3-show')) {
      // Wenn das geklickte Element nicht Teil des Menüs oder des Toggle-Buttons ist
      if (!navDemo.contains(event.target) && 
          (!navbarToggleBtn || !navbarToggleBtn.contains(event.target))) {
        navDemo.classList.remove('w3-show');
      }
    }
  });
}); 