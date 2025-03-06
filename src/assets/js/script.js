// Optimized main script
document.addEventListener('DOMContentLoaded', function() {
  // Cache DOM elements
  const DOM = {
    navbar: document.getElementById('myNavbar'),
    navDemo: document.getElementById('navDemo'),
    goTopBtn: document.getElementById('goTopBtn'),
    logo: document.getElementById('mainLogo'),
    wordCloudContainer: document.querySelector('.textbubble'),
    portfolioImages: document.querySelectorAll('.portfolio-item img'),
    internalLinks: document.querySelectorAll('a[href^="#"]'),
    modal: document.getElementById('modal01'),
    modalImg: document.getElementById('img01'),
    captionText: document.getElementById('caption')
  };

  // Initialize Firebase safely
  let db = null;
  try {
    db = firebase.firestore();
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
  
  // Display logo
  if (DOM.logo) DOM.logo.style.display = 'block';

  // Load content
  loadWebsiteContent();
  
  // Smooth scrolling
  setupSmoothScrolling();
  
  // Modal for images
  setupImageModal();
  
  // Navbar & scroll button
  setupScrollHandling();
  
  // Lazy loading
  setupLazyLoading();
  
  /**
   * Load website content from Firebase
   */
  function loadWebsiteContent() {
    if (!db) return;

    // Load main content
    db.collection("content").doc("main").get().then(doc => {
      if (doc.exists) {const data = doc.data();
      console.log("Loaded data from Firestore:", data);
      
      // Populate content elements with null checks
      updateElementContent('aboutTitle', data.aboutTitle);
      updateElementContent('aboutSubtitle', data.aboutSubtitle);
      updateElementContent('aboutText', data.aboutText);
      updateElementContent('offeringsTitle', data.offeringsTitle);
      updateElementContent('offeringsSubtitle', data.offeringsSubtitle);
      
      // Handle offering sections with image optimization
      setupOfferingSection(1, data);
      setupOfferingSection(2, data);
      setupOfferingSection(3, data);
      
      // Contact section
      updateElementContent('contactTitle', data.contactTitle);
      updateElementContent('contactSubtitle', data.contactSubtitle);
      
      if (data.contact_image) {
        updateImageElement('contactImage', data.contact_image);
      }
    } else {
      console.warn("No content found in Firestore");
    }
  }).catch(error => {
    console.error("Error loading content:", error);
  });
    
    // Word cloud
    loadWordCloud();
  }
  
  // Helper function to update element content safely
  function updateElementContent(id, content) {
    const element = document.getElementById(id);
    if (element && content) {
      element.innerHTML = content;
    }
  }
  
  // Helper function to update image elements
  function updateImageElement(id, imageData) {
    const img = document.getElementById(id);
    if (!img) return;
    
    const imageUrl = typeof imageData === 'string' ? imageData : 
                     imageData.url ? imageData.url : null;
    
    if (imageUrl) {
      img.src = imageUrl;
      img.alt = imageData.alt || img.alt;
    }
  }
  
  // Setup offering section with proper error handling
  function setupOfferingSection(num, data) {
    updateElementContent(`offer${num}Title`, data[`offer${num}Title`]);
    updateElementContent(`offer${num}Desc`, data[`offer${num}Desc`]);
    
    const imageData = data[`offer${num}_image`];
    if (imageData) {
      updateImageElement(`offer${num}Image`, imageData);
    }
  }
  
  // Load word cloud with better error handling
  function loadWordCloud() {
    if (!db || !DOM.wordCloudContainer) return;
    
    db.collection("content").doc("wordCloud").get().then(doc => {
      if (doc.exists && doc.data().words) {
        renderWordCloud(doc.data().words);
      }
    }).catch(error => {
      console.error("Error loading word cloud:", error);
    });
  }
  
  // Render word cloud with animation
  function renderWordCloud(words) {
    const wordCloudList = document.getElementById('wordCloudList');
    if (!wordCloudList) return;
    
    wordCloudList.innerHTML = '';
    
    words.forEach(word => {
      if (!word || !word.text) return;
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = word.link || "#";
      a.setAttribute('data-weight', word.weight || "5");
      a.textContent = word.text;
      a.style.opacity = '0';
      a.style.transform = 'translateY(20px)';
      
      li.appendChild(a);
      wordCloudList.appendChild(li);
    });
    
    animateWordCloud();
  }
  
  // Animate word cloud with IntersectionObserver
  function animateWordCloud() {
    const wordCloudContainer = DOM.wordCloudContainer;
    if (!wordCloudContainer) return;
    
    const wordCloudLinks = document.querySelectorAll('.word-cloud li a');
    if (!wordCloudLinks.length) return;
    
    // Use IntersectionObserver if available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          animateWords(wordCloudLinks);
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      
      observer.observe(wordCloudContainer);
    } else {
      // Fallback for older browsers
      animateWords(wordCloudLinks);
    }
  }
  
  function animateWords(wordCloudLinks) {
    wordCloudLinks.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
  
  // Setup smooth scrolling with improved behavior
  function setupSmoothScrolling() {
    DOM.internalLinks.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          // Use modern scrollIntoView with fallback
          if ('scrollBehavior' in document.documentElement.style) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            // Fallback for older browsers
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
        
        // Close mobile menu if open
        if (DOM.navDemo && DOM.navDemo.classList.contains('w3-show')) {
          DOM.navDemo.classList.remove('w3-show');
        }
      });
    });
  }
  
  // Setup image modal
  function setupImageModal() {
    if (!DOM.modal || !DOM.modalImg || !DOM.captionText) return;
    
    DOM.portfolioImages.forEach(img => {
      img.addEventListener('click', function() {
        DOM.modal.style.display = 'block';
        DOM.modalImg.src = this.src;
        DOM.captionText.innerHTML = this.alt;
      });
    });
    
    // Add close functionality
    const closeBtn = DOM.modal.querySelector('.w3-button');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        DOM.modal.style.display = 'none';
      });
    }
    
    DOM.modal.addEventListener('click', function() {
      this.style.display = 'none';
    });
  }
  
  // Setup scroll handling
  function setupScrollHandling() {
    window.addEventListener('scroll', function() {
      const scrollY = window.scrollY;
      
      // Navbar visibility
      if (DOM.navbar) {
        if (scrollY > 100) {
          DOM.navbar.classList.add('scrolled');
          DOM.navbar.classList.add('visible');
        } else {
          DOM.navbar.classList.remove('scrolled');
          if (scrollY <= 10) {
            DOM.navbar.classList.remove('visible');
          }
        }
      }
      
      // Go-to-top button
      if (DOM.goTopBtn) {
        if (scrollY > 300) {
          DOM.goTopBtn.classList.add('visible');
        } else {
          DOM.goTopBtn.classList.remove('visible');
        }
      }
    });
    
    // Go-to-top button click
    if (DOM.goTopBtn) {
      DOM.goTopBtn.addEventListener('click', function() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
  
  // Setup lazy loading
  function setupLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.loading = 'lazy';
        }
      });
    } else {
      // Fallback with IntersectionObserver
      if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img:not([loading])');
        
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              
              // Fade in effect
              img.style.opacity = '0';
              const src = img.dataset.src || img.src;
              
              const tempImg = new Image();
              tempImg.src = src;
              tempImg.onload = () => {
                img.src = src;
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
    }
  }
});

// Add hidden admin link to footer (extracted outside main function)
document.addEventListener('DOMContentLoaded', function() {
  const footerCopyright = document.querySelector('footer p');
  if (footerCopyright) {
    const adminSpan = document.createElement('span');
    adminSpan.innerHTML = ' | <a href="admin-panel.php" style="opacity: 0.3; font-size: 0.8em; text-decoration: none;">Admin</a>';
    footerCopyright.appendChild(adminSpan);
  }
});