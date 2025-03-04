document.addEventListener('DOMContentLoaded', async function() {
  // 1) Firebase init (compat)
  if(!firebase.apps.length){
    firebase.initializeApp({
      apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
      authDomain: "mannar-129a5.firebaseapp.com",
      projectId: "mannar-129a5",
      storageBucket: "mannar-129a5.appspot.com",
      messagingSenderId: "687710492532",
      appId: "1:687710492532:web:c7b675da541271f8d83e21"
    });
  }
  const db = firebase.firestore();
  const auth = firebase.auth();

  console.log("Firebase init. Apps:", firebase.apps.length);

  // Falls du Auth-Check brauchst:
  auth.onAuthStateChanged(user => {
    if(user) console.log("✅ Eingeloggt als:", user.email);
    else console.log("❌ Kein User eingeloggt.");
  });

  // 2) Navbar / Toggle
  const navbar = document.getElementById('myNavbar');
  const navDemo = document.getElementById('navDemo');
  const goTopBtn = document.getElementById('goTopBtn');
  const logo = document.getElementById('mainLogo');

  window.toggleFunction = function() {
    if (navDemo) {
      navDemo.classList.toggle('w3-show');
      if (navDemo.classList.contains('w3-show')) {
        navDemo.classList.add('visible');
      } else {
        navDemo.classList.remove('visible');
      }
    }
  };

  // Navbar Scroll
  let lastScrollY = window.scrollY;
  let ticking = false;
  function updateNavbarVisibility(sY) {
    if(!navbar) return;
    if(window.innerWidth < 600) {
      // Mobile: immer sichtbar
      navbar.classList.add('visible');
      if(sY > 100) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    } else {
      // Größere Screens
      if(sY > 100) {
        navbar.classList.add('scrolled');
        navbar.classList.add('visible');
      } else {
        navbar.classList.remove('scrolled');
        if(sY <= 10) navbar.classList.remove('visible');
      }
    }
    // GoTop
    if(goTopBtn) {
      if(sY > 300) goTopBtn.classList.add('visible');
      else goTopBtn.classList.remove('visible');
    }
  }
  updateNavbarVisibility(window.scrollY);

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if(!ticking) {
      window.requestAnimationFrame(() => {
        updateNavbarVisibility(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  });

  if(goTopBtn) {
    goTopBtn.addEventListener('click', () => {
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  }

  // Logo anzeigen, sobald JS geladen
  if(logo) {
    logo.style.display = 'block';
  }

  // 3) Portfolio-Bilder -> Modal
  document.querySelectorAll('.portfolio-item img').forEach(img => {
    img.addEventListener('click', function() {
      const modal = document.getElementById('modal01');
      if(!modal) return;
      const modalImg = document.getElementById('img01');
      const captionText = document.getElementById('caption');
      modal.style.display = 'block';
      modalImg.src = this.src;
      captionText.innerHTML = this.alt || "";
    });
  });

  // 4) Word Cloud: Animate once
  const wordCloudContainer = document.querySelector('.textbubble');
  const wordCloudList = document.querySelector('.word-cloud');

  if(wordCloudContainer && wordCloudList) {
    const wordLinks = wordCloudList.querySelectorAll('li a');
    // Animate function
    function animateWordLinks() {
      console.log("🔔 Wortwolke-Effekt startet …");
      wordLinks.forEach((link, index) => {
        setTimeout(() => {
          link.style.opacity = '1';
          link.style.transform = 'translateY(0)';
        }, 60 * index);
      });
    }

    // Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          // EINMALIG
          animateWordLinks();
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.2
    });
    observer.observe(wordCloudContainer);

    // Falls Container sofort sichtbar ist (keine Scroll)
    // -> Sofort check
    const rect = wordCloudContainer.getBoundingClientRect();
    if(rect.top < window.innerHeight && rect.bottom > 0) {
      animateWordLinks();
      observer.disconnect();
    }
  }

  // 5) Lazy Loading Fallback
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
    });
  } else {
    const lazyImages = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          const img = entry.target;
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
      img.style.opacity = '0';
      imageObserver.observe(img);
    });
  }

  // 6) Firestore-Daten laden
  try {
    const contentSnap = await db.collection("content").doc("main").get();
    if(contentSnap.exists) {
      const data = contentSnap.data();
      // aboutTitleDisplay, aboutSubtitleDisplay etc.
      // ...
    }
  } catch(err) {
    console.error("Fehler beim Laden der Inhalte:", err);
  }

  console.log("Seite fertig initialisiert.");
});
