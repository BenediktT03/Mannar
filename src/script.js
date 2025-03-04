document.addEventListener('DOMContentLoaded', function () {
  // DOM-Elemente
  const navbar = document.getElementById('myNavbar');
  const navDemo = document.getElementById('navDemo');
  const goTopBtn = document.getElementById('goTopBtn');
  const wordCloudItems = document.querySelectorAll('.word-cloud li');
  const logo = document.getElementById('mainLogo');
  const wordCloudContainer = document.querySelector('.textbubble'); // Nur einmal deklarieren
  const wordCloudLinks = document.querySelectorAll('.word-cloud li a');
  const contactForm = document.querySelector('.contact-form');
  const wordCloudDiv = document.getElementById('wordCloud');
  document.getElementById('navDemo').classList.toggle('w3-show');

    

  // Show logo once page is loaded
  if (logo) {
    logo.style.display = 'block';
  }

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
    
      
    
      // Close mobile menu if open
      if (navDemo && navDemo.classList.contains('w3-show')) {
        navDemo.classList.remove('w3-show');
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
  wordCloudLinks.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  if (wordCloudContainer && wordCloudLinks.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          wordCloudLinks.forEach((word, index) => {
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              setTimeout(() => {
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
              }, 50 * index);
            } else {
              word.style.opacity = '1';
              word.style.transform = 'translateY(0)';
            }
          });
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1
    });
    observer.observe(wordCloudContainer);
  }

  // Word Cloud subtle movement on mousemove (desktop only)
  if (!('ontouchstart' in window) && wordCloudItems.length > 0) {
    const wordCloud = document.querySelector('.word-cloud');
    document.addEventListener('mousemove', function(e) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      wordCloudItems.forEach((word) => {
        const weightEl = word.querySelector('a');
        if (weightEl) {
          const weight = parseInt(weightEl.getAttribute('data-weight'));
          const factor = (10 - weight) / 15;
          const offsetX = (mouseX - 0.5) * 8;
          const offsetY = (mouseY - 0.5) * 6;
          word.style.transform = `translate(${offsetX * factor}px, ${offsetY * factor}px)`;
        }
      });
    });
  }


  // Add lazy loading for images
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


if (navbar) {
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
}
}
)