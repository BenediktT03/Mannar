// Modern JavaScript with improved functionality
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const navbar = document.getElementById('myNavbar');
  const navDemo = document.getElementById('navDemo');
  const goTopBtn = document.getElementById('goTopBtn');
  const wordCloudItems = document.querySelectorAll('.word-cloud li');
  const logo = document.getElementById('mainLogo');
  
  // Show logo once page is loaded
  if (logo) {
    logo.style.display = 'block';
  }
  
  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navDemo && navDemo.classList.contains('w3-show')) {
          navDemo.classList.remove('w3-show');
        }
      }
    });
  });
  
  // Modal image gallery
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
  
  // Navbar toggle for small screens
  window.toggleFunction = function() {
    if (navDemo) {
      navDemo.classList.toggle('w3-show');
    }
  };
  
  // Navbar & Go Top button scroll behavior
  window.addEventListener('scroll', function() {
    // Navbar change on scroll
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
      navbar.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      if (window.scrollY <= 10) {
        navbar.classList.remove('visible');
      }
    }
    // Show/hide Go Top button
    if (window.scrollY > 300) {
      goTopBtn.classList.add('visible');
    } else {
      goTopBtn.classList.remove('visible');
    }
  });
  
  // Go Top button click handler
  if (goTopBtn) {
    goTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Word Cloud Animation with Intersection Observer
  const wordCloudContainer = document.querySelector('.textbubble');
  const wordCloudLinks = document.querySelectorAll('.word-cloud li a');
  
  // Initialer Stil für alle Wörter - unsichtbar und verschoben
  wordCloudLinks.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  
  // Intersection Observer erstellen
  if (wordCloudContainer && wordCloudLinks.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animation starten, wenn der Container sichtbar ist
          wordCloudLinks.forEach((word, index) => {
            // Prüfen der Einstellung für reduzierte Bewegung
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              setTimeout(() => {
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
              }, 50 * index);
            } else {
              // Für Benutzer mit Einstellung für reduzierte Bewegung
              word.style.opacity = '1';
              word.style.transform = 'translateY(0)';
            }
          });
          
          // Observer entfernen, sobald die Animation gestartet wurde
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1 // Animation startet, wenn 10% des Elements sichtbar sind
    });
    
    // Container beobachten
    observer.observe(wordCloudContainer);
  }
  
  // Word Cloud subtle movement on mousemove (desktop only)
  if (!('ontouchstart' in window) && wordCloudItems.length > 0) {
    const wordCloud = document.querySelector('.word-cloud');
    
    document.addEventListener('mousemove', function(e) {
      // Skip animation if user prefers reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      wordCloudItems.forEach((word) => {
        const weightEl = word.querySelector('a');
        
        if (weightEl) {
          const weight = parseInt(weightEl.getAttribute('data-weight'));
          const factor = (10 - weight) / 15; // Higher weight = less movement
          const offsetX = (mouseX - 0.5) * 8;
          const offsetY = (mouseY - 0.5) * 6;
          
          word.style.transform = `translate(${offsetX * factor}px, ${offsetY * factor}px)`;
        }
      });
    });
  }
  
  // Form validation enhancement
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic form validation
      const nameInput = this.querySelector('input[name="Name"]');
      const emailInput = this.querySelector('input[name="Email"]');
      const messageInput = this.querySelector('input[name="Message"]');
      
      let isValid = true;
      
      if (!nameInput.value.trim()) {
        nameInput.style.borderColor = 'red';
        isValid = false;
      } else {
        nameInput.style.borderColor = '';
      }
      
      if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
        emailInput.style.borderColor = 'red';
        isValid = false;
      } else {
        emailInput.style.borderColor = '';
      }
      
      if (!messageInput.value.trim()) {
        messageInput.style.borderColor = 'red';
        isValid = false;
      } else {
        messageInput.style.borderColor = '';
      }
      
      if (isValid) {
        // In a real implementation, you would send the form data to the server
        alert('Vielen Dank für Ihre Nachricht! Ich werde mich bald bei Ihnen melden.');
        this.reset();
      }
    });
  }
  
  // Add lazy loading for images
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const lazyImages = document.querySelectorAll('img');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.style.opacity = '0';
          
          // Load the image
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



//Test Area ---------------------------------------------------------------------------------------------------------------------------------------


document.addEventListener("DOMContentLoaded", function () {
  // Abrufen der Wortgrößen aus dem Server (initial leer, wird später dynamisch gefüllt)
  fetchWordClickCounts().then(wordCounts => {
    updateWordCloudSizes(wordCounts);
    
    // Event Listener für die Klicks auf die Wörter
    const wordLinks = document.querySelectorAll(".word");
    wordLinks.forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const word = link.getAttribute("data-word");
        incrementClickCount(word);
      });
    });
  });
});

// Funktion, um die Wortgrößen nach Klicks zu aktualisieren
function updateWordCloudSizes(wordCounts) {
  const wordLinks = document.querySelectorAll(".word");
  wordLinks.forEach(link => {
    const word = link.getAttribute("data-word");
    const count = wordCounts[word] || 0; // Wenn kein Klick vorhanden, dann 0
    const size = Math.min(Math.max(1 + count, 1), 10); // Wortgröße anpassen
    link.style.fontSize = `${size}rem`;
  });
}

// Funktion, um die Klicks zu erhöhen und auf den Server zu senden
function incrementClickCount(word) {
  fetch("/increment-click", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ word: word })
  })
  .then(response => response.json())
  .then(data => {
    console.log("Klick gezählt:", data);
    // Nach dem Klick die Wortgrößen wieder aktualisieren
    fetchWordClickCounts().then(wordCounts => {
      updateWordCloudSizes(wordCounts);
    });
  });
}

// Funktion zum Abrufen der aktuellen Klickzahlen vom Server
function fetchWordClickCounts() {
  return fetch("/get-click-counts")
    .then(response => response.json())
    .then(data => data.wordCounts); // Annahme: { wordCounts: { "HTML": 5, "CSS": 2, ... } }
}
