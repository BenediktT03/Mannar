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
  
  // Inhalte aus Firestore laden
  function loadWebsiteContent() {
    // Hauptinhalte laden
    db.collection("content").doc("main").get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        console.log("Geladene Daten aus Firestore:", data);
        
        // About
        if (data.aboutTitle) document.getElementById('aboutTitle').innerText = data.aboutTitle;
        if (data.aboutSubtitle) document.getElementById('aboutSubtitle').innerText = data.aboutSubtitle;
        if (data.aboutText) document.getElementById('aboutText').innerHTML = data.aboutText;
        
        // Angebote
        if (data.offeringsTitle) document.getElementById('offeringsTitle').innerText = data.offeringsTitle;
        if (data.offeringsSubtitle) document.getElementById('offeringsSubtitle').innerText = data.offeringsSubtitle;
        
        // Bilder überprüfen und setzen mit Fallback
        // Angebot 1
        const offer1Image = document.getElementById('offer1Image');
        if (offer1Image) {
          if (data.offer1Title) document.getElementById('offer1Title').innerText = data.offer1Title;
          if (data.offer1Desc) document.getElementById('offer1Desc').innerHTML = data.offer1Desc;
          
          if (data.offer1_image && typeof data.offer1_image === 'object') {
            // Standard Objekt-Format: { url: "...", public_id: "..." }
            if (data.offer1_image.url) {
              console.log("Setze Angebot 1 Bild aus URL:", data.offer1_image.url);
              offer1Image.src = data.offer1_image.url;
            }
          } else if (typeof data.offer1_image === 'string') {
            // Alternatives Format: direkter String-Pfad
            console.log("Setze Angebot 1 Bild aus String:", data.offer1_image);
            offer1Image.src = data.offer1_image;
          }
        }
        
        // Angebot 2
        const offer2Image = document.getElementById('offer2Image');
        if (offer2Image) {
          if (data.offer2Title) document.getElementById('offer2Title').innerText = data.offer2Title;
          if (data.offer2Desc) document.getElementById('offer2Desc').innerHTML = data.offer2Desc;
          
          if (data.offer2_image && typeof data.offer2_image === 'object') {
            if (data.offer2_image.url) {
              console.log("Setze Angebot 2 Bild aus URL:", data.offer2_image.url);
              offer2Image.src = data.offer2_image.url;
            }
          } else if (typeof data.offer2_image === 'string') {
            console.log("Setze Angebot 2 Bild aus String:", data.offer2_image);
            offer2Image.src = data.offer2_image;
          }
        }
        
        // Angebot 3
        const offer3Image = document.getElementById('offer3Image');
        if (offer3Image) {
          if (data.offer3Title) document.getElementById('offer3Title').innerText = data.offer3Title;
          if (data.offer3Desc) document.getElementById('offer3Desc').innerHTML = data.offer3Desc;
          
          if (data.offer3_image && typeof data.offer3_image === 'object') {
            if (data.offer3_image.url) {
              console.log("Setze Angebot 3 Bild aus URL:", data.offer3_image.url);
              offer3Image.src = data.offer3_image.url;
            }
          } else if (typeof data.offer3_image === 'string') {
            console.log("Setze Angebot 3 Bild aus String:", data.offer3_image);
            offer3Image.src = data.offer3_image;
          }
        }
        
        // Kontakt
        if (data.contactTitle) document.getElementById('contactTitle').innerText = data.contactTitle;
        if (data.contactSubtitle) document.getElementById('contactSubtitle').innerText = data.contactSubtitle;
        
        // Kontaktbild
        const contactImage = document.getElementById('contactImage');
        if (contactImage) {
          if (data.contact_image && typeof data.contact_image === 'object') {
            if (data.contact_image.url) {
              console.log("Setze Kontakt Bild aus URL:", data.contact_image.url);
              contactImage.src = data.contact_image.url;
            }
          } else if (typeof data.contact_image === 'string') {
            console.log("Setze Kontakt Bild aus String:", data.contact_image);
            contactImage.src = data.contact_image;
          }
        }
      } else {
        console.warn("Keine Inhalte in Firestore gefunden");
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