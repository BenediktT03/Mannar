<?php
/**
 * Enhanced Dynamic Page Template
 * 
 * Renders pages based on their template type and data stored in Firebase
 * Supports multiple templates with dynamic content loading
 */

// Include initialization file
require_once 'core/init.php';

// Get page ID from URL parameter
$page_id = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';

// Redirect to homepage if no ID is provided
if (empty($page_id)) {
    header('Location: index.php');
    exit;
}

// Page configuration
$page_config = [
    'title' => 'Loading...',
    'description' => 'Loading page content...',
    'template' => 'basic',
    'custom_styles' => '',
    'body_class' => 'page-template',
    'dynamic_nav' => true
];

// Start output buffering to capture template content
ob_start();
?>

<!-- Loading indicator (shown until content loads) -->
<div class="page-loading" id="pageLoading">
  <div class="spinner"></div>
  <p>Inhalt wird geladen...</p>
</div>

<!-- Page content container (initially hidden) -->
<div class="page-content" id="pageContent" style="opacity: 0;">
  <!-- Dynamic content will be injected here by JavaScript -->
  <div class="w3-container w3-padding-64">
    <div class="w3-center" id="contentPlaceholder">
      <p>Inhalt wird geladen...</p>
    </div>
  </div>
</div>

<!-- Go to top button -->
<div class="go-top" id="goTopBtn">
  <i class="fas fa-arrow-up"></i>
</div>

<!-- Template-specific scripts -->
<script>
// Page configuration
const PAGE_ID = '<?php echo $page_id; ?>';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase (should be already done by firebase.js)
  const loadPage = async () => {
    try {
      // Get the Firestore instance
      const db = firebase.firestore();
      
      // Get page data
      const pageDoc = await db.collection('pages').doc(PAGE_ID).get();
      
      if (!pageDoc.exists) {
        showPageError('Die angeforderte Seite wurde nicht gefunden.');
        return;
      }
      
      const pageData = pageDoc.data();
      
      // Update page title and metadata
      document.title = pageData.title + ' - Mannar';
      
      // Load global settings if available
      let globalSettings = {};
      try {
        const settingsDoc = await db.collection('settings').doc('global').get();
        if (settingsDoc.exists) {
          globalSettings = settingsDoc.data();
        }
      } catch (error) {
        console.warn('Could not load global settings:', error);
      }
      
      // Render page content based on template
      renderPage(pageData, globalSettings);
      
      // Initialize UI components
      initUI();
      
      // Show the page content
      showPageContent();
    } catch (error) {
      console.error('Error loading page:', error);
      showPageError('Fehler beim Laden der Seite: ' + error.message);
    }
  };
  
  // Render the page content based on template and data
  const renderPage = (pageData, globalSettings) => {
    const contentEl = document.getElementById('pageContent');
    if (!contentEl) return;
    
    // Get template and data
    const template = pageData.template || 'basic';
    const data = pageData.data || {};
    
    // Create template-specific HTML
    let contentHtml = '';
    
    // Common page header
    contentHtml += `<div class="w3-container w3-padding-32">
      <h1 class="page-title w3-center">${data.title || pageData.title}</h1>
      ${data.subtitle ? `<p class="page-subtitle w3-center">${data.subtitle}</p>` : ''}
    </div>`;
    
    // Template-specific content
    switch (template) {
      case 'basic':
        contentHtml += renderBasicTemplate(data);
        break;
      case 'text-image':
        contentHtml += renderTextImageTemplate(data);
        break;
      case 'image-text':
        contentHtml += renderImageTextTemplate(data);
        break;
      case 'gallery':
        contentHtml += renderGalleryTemplate(data);
        break;
      case 'landing':
        contentHtml += renderLandingTemplate(data);
        break;
      case 'portfolio':
        contentHtml += renderPortfolioTemplate(data);
        break;
      case 'contact':
        contentHtml += renderContactTemplate(data);
        break;
      case 'blog':
        contentHtml += renderBlogTemplate(data);
        break;
      default:
        contentHtml += `<div class="w3-container">
          <div class="w3-panel w3-pale-yellow">
            <p>Template "${template}" nicht gefunden. Standardinhalt wird angezeigt.</p>
          </div>
          <div>${data.content || ''}</div>
        </div>`;
    }
    
    // Replace content
    contentEl.innerHTML = contentHtml;
    
    // Apply custom CSS from settings if available
    applyCustomStyles(pageData.settings || {}, globalSettings);
    
    // Initialize dynamic components like galleries and forms
    initDynamicComponents(template, data);
  };
  
  // Template renderers
  const renderBasicTemplate = (data) => {
    return `<div class="w3-container w3-padding-32 basic-page-content">
      <div class="w3-animate-opacity">${data.content || ''}</div>
    </div>`;
  };
  
  const renderTextImageTemplate = (data) => {
    return `<div class="w3-container w3-padding-32">
      <div class="w3-row-padding">
        <div class="w3-col m8 animate-item">
          <div class="w3-padding">${data.content || ''}</div>
        </div>
        <div class="w3-col m4 animate-item delay-1">
          <div class="image-container">
            <img src="${data.featuredImage?.url || '/api/placeholder/400/300'}" 
                 alt="${data.featuredImage?.alt || data.title || 'Featured image'}" 
                 class="w3-image">
          </div>
        </div>
      </div>
    </div>`;
  };
  
  const renderImageTextTemplate = (data) => {
    return `<div class="w3-container w3-padding-32">
      <div class="w3-row-padding">
        <div class="w3-col m4 animate-item">
          <div class="image-container">
            <img src="${data.featuredImage?.url || '/api/placeholder/400/300'}" 
                 alt="${data.featuredImage?.alt || data.title || 'Featured image'}" 
                 class="w3-image">
          </div>
        </div>
        <div class="w3-col m8 animate-item delay-1">
          <div class="w3-padding">${data.content || ''}</div>
        </div>
      </div>
    </div>`;
  };
  
  const renderGalleryTemplate = (data) => {
    let galleryItems = '';
    
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((image, index) => {
        if (image && image.url) {
          galleryItems += `
            <div class="w3-col m4 l3 s6 animate-item delay-${index % 4}">
              <div class="gallery-item" data-index="${index}">
                <img src="${image.url}" alt="${image.alt || ''}" class="w3-image">
                ${image.caption ? `<div class="gallery-caption">${image.caption}</div>` : ''}
              </div>
            </div>
          `;
        }
      });
    } else {
      galleryItems = '<p class="w3-center">Keine Bilder in dieser Galerie</p>';
    }
    
    return `<div class="w3-container w3-padding-32">
      <div class="w3-container animate-item">${data.description || ''}</div>
      <div class="w3-row-padding w3-margin-top gallery-container">
        ${galleryItems}
      </div>
      
      <!-- Gallery Modal -->
      <div id="galleryModal" class="w3-modal">
        <div class="w3-modal-content">
          <span class="w3-button w3-hover-red w3-xlarge w3-display-topright">&times;</span>
          <img id="modalImg" class="w3-image" style="width:100%">
          <div id="modalCaption" class="w3-container w3-padding-16"></div>
        </div>
      </div>
    </div>`;
  };
  
  const renderLandingTemplate = (data) => {
    // Generate features HTML
    let featuresHtml = '';
    if (data.features && Array.isArray(data.features) && data.features.length > 0) {
      featuresHtml = '<div class="w3-row-padding">';
      data.features.forEach((feature, index) => {
        featuresHtml += `
          <div class="w3-col m4 s12 animate-item delay-${index % 3}">
            <div class="feature-item">
              ${feature.icon && feature.icon.url ? 
                `<img src="${feature.icon.url}" alt="${feature.title || 'Feature'}" class="feature-icon">` : 
                '<div class="icon-placeholder"><i class="fas fa-star"></i></div>'
              }
              <h3>${feature.title || 'Feature'}</h3>
              <p>${feature.description || ''}</p>
            </div>
          </div>
        `;
      });
      featuresHtml += '</div>';
    }
    
    return `<div class="w3-container w3-padding-32">
      <!-- Hero section -->
      <div class="w3-row-padding">
        <div class="w3-col m6 s12 animate-item">
          <div class="w3-padding-large hero-content">
            ${data.content || ''}
            ${data.ctaButtonText ? 
              `<a href="${data.ctaButtonLink || '#'}" class="w3-button w3-padding-large w3-large w3-margin-top">${data.ctaButtonText}</a>` : 
              ''
            }
          </div>
        </div>
        <div class="w3-col m6 s12 animate-item delay-1">
          <div class="hero-image-container">
            ${data.heroImage && data.heroImage.url ? 
              `<img src="${data.heroImage.url}" alt="${data.heroImage.alt || data.title || 'Hero image'}" class="w3-image">` : 
              '<div class="w3-pale-blue w3-padding-64 w3-center"><i class="fas fa-image"></i><p>Hero Image</p></div>'
            }
          </div>
        </div>
      </div>
      
      <!-- Features section -->
      ${data.featuresTitle ? `<h2 class="w3-center w3-margin-top animate-item">${data.featuresTitle}</h2>` : ''}
      ${featuresHtml}
      
      <!-- CTA section -->
      ${data.ctaText ? 
        `<div class="w3-container w3-padding-32 w3-center w3-margin-top animate-item">
          <h3>${data.ctaText}</h3>
          ${data.ctaButtonText ? 
            `<a href="${data.ctaButtonLink || '#'}" class="w3-button w3-padding-large">${data.ctaButtonText}</a>` : 
            ''
          }
        </div>` : 
        ''
      }
    </div>`;
  };
  
  const renderPortfolioTemplate = (data) => {
    // Generate projects HTML
    let projectsHtml = '';
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      projectsHtml = '<div class="w3-row-padding">';
      data.projects.forEach((project, index) => {
        projectsHtml += `
          <div class="w3-col m6 l4 w3-padding animate-item delay-${index % 3}">
            <div class="portfolio-item">
              ${project.thumbnail && project.thumbnail.url ? 
                `<img src="${project.thumbnail.url}" alt="${project.title || 'Projekt'}" class="w3-image">` : 
                '<div class="w3-pale-blue w3-padding-32 w3-center"><i class="fas fa-image"></i><p>Projekt Bild</p></div>'
              }
              <div class="w3-container">
                <h3>${project.title || 'Projekt'}</h3>
                <p>${project.description || ''}</p>
                ${project.link ? `<a href="${project.link}" class="w3-button w3-margin-bottom">Mehr erfahren</a>` : ''}
              </div>
            </div>
          </div>
        `;
      });
      projectsHtml += '</div>';
    } else {
      projectsHtml = '<div class="w3-panel w3-pale-yellow w3-center">Keine Projekte definiert</div>';
    }
    
    return `<div class="w3-container w3-padding-32">
      <div class="w3-container animate-item">${data.introduction || ''}</div>
      ${projectsHtml}
    </div>`;
  };
  
  const renderContactTemplate = (data) => {
    return `<div class="w3-container w3-padding-32">
      <div class="w3-container animate-item">${data.introduction || ''}</div>
      
      <div class="w3-row w3-padding-32 w3-section">
        ${data.contactImage && data.contactImage.url ? 
          `<div class="w3-col m4 w3-container animate-item">
            <img src="${data.contactImage.url}" alt="${data.contactImage.alt || 'Kontaktbild'}" class="w3-image w3-round">
          </div>` : 
          ''
        }
        
        <div class="w3-col ${data.contactImage && data.contactImage.url ? 'm8' : 's12'} w3-panel animate-item delay-1">
          <div class="w3-large w3-margin-bottom">
            ${data.address ? `<p><i class="fas fa-map-marker-alt fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> ${data.address}</p>` : ''}
            ${data.email ? `<p><i class="fas fa-envelope fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> ${data.email}</p>` : ''}
            ${data.phone ? `<p><i class="fas fa-phone fa-fw w3-hover-text-black w3-xlarge w3-margin-right"></i> ${data.phone}</p>` : ''}
          </div>
          
          ${data.showForm ? 
            `<p>Hinterlassen Sie mir eine Nachricht:</p>
            
            <form class="contact-form" action="./api/contact.php" method="post">
              <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
                <div class="w3-half">
                  <input class="w3-input w3-border" type="text" placeholder="Name" required name="name">
                </div>
                <div class="w3-half">
                  <input class="w3-input w3-border" type="email" placeholder="E-Mail" required name="email">
                </div>
              </div>
              <textarea class="w3-input w3-border" placeholder="Nachricht" required name="message" rows="5"></textarea>
              <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
              <button class="w3-button w3-right w3-section" type="submit">
                <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
              </button>
            </form>` : 
            ''
          }
        </div>
      </div>
    </div>`;
  };
  
  const renderBlogTemplate = (data) => {
    // Categories HTML
    let categoriesHtml = '';
    if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
      categoriesHtml = `
        <div class="w3-section">
          <i class="fas fa-tags"></i> 
          ${data.categories.map(cat => `<span class="w3-tag w3-small w3-margin-right">${cat}</span>`).join('')}
        </div>
      `;
    }
    
    return `<div class="w3-container w3-padding-32">
      <div class="w3-container w3-margin-bottom">
        <div class="w3-row">
          <div class="w3-col m8 s12">
            <div class="blog-meta w3-margin-bottom">
              ${data.date ? `<span class="w3-margin-right"><i class="far fa-calendar-alt"></i> ${data.date}</span>` : ''}
              ${data.author ? `<span><i class="far fa-user"></i> ${data.author}</span>` : ''}
            </div>
            ${categoriesHtml}
          </div>
        </div>
      </div>
      
      <!-- Featured image -->
      ${data.featuredImage && data.featuredImage.url ? 
        `<div class="w3-container w3-margin-bottom animate-item">
          <div class="image-container">
            <img src="${data.featuredImage.url}" alt="${data.featuredImage.alt || data.title || 'Blog Post'}" class="w3-image">
          </div>
        </div>` : 
        ''
      }
      
      <!-- Excerpt -->
      ${data.excerpt ? 
        `<div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue animate-item">
          <p><em>${data.excerpt}</em></p>
        </div>` : 
        ''
      }
      
      <!-- Main content -->
      <div class="w3-container blog-content animate-item delay-1">
        ${data.content || ''}
      </div>
    </div>`;
  };
  
  // Apply custom styles based on settings
  const applyCustomStyles = (pageSettings, globalSettings) => {
    // Merge global and page settings
    const settings = {
      ...globalSettings,
      ...pageSettings
    };
    
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.id = 'dynamic-page-styles';
    
    // Generate CSS
    styleEl.textContent = `
      :root {
        --primary-color: ${settings.colors?.primary || '#3498db'};
        --secondary-color: ${settings.colors?.secondary || '#2c3e50'};
        --accent-color: ${settings.colors?.accent || '#e74c3c'};
        --text-color: ${settings.colors?.text || '#333333'};
        --title-size: ${settings.titleSize || 2.5}rem;
        --subtitle-size: ${settings.subtitleSize || 1.5}rem;
      }
      
      .page-title {
        font-size: var(--title-size);
      }
      
      .page-subtitle {
        font-size: var(--subtitle-size);
      }
      
      /* Disable animations if settings require it */
      ${!settings.layout?.enableAnimations ? `
        .animate-item {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
        
        .gallery-item img, 
        .image-container img,
        .hero-image-container img {
          transition: none !important;
        }
        
        .gallery-item:hover,
        .feature-item:hover,
        .portfolio-item:hover {
          transform: none !important;
        }
      ` : ''}
    `;
    
    // Add to document head
    document.head.appendChild(styleEl);
  };
  
  // Initialize dynamic components
  const initDynamicComponents = (template, data) => {
    // Gallery modal functionality
    if (template === 'gallery') {
      const modal = document.getElementById('galleryModal');
      const modalImg = document.getElementById('modalImg');
      const modalCaption = document.getElementById('modalCaption');
      
      if (modal && modalImg) {
        // Add click handlers to gallery items
        document.querySelectorAll('.gallery-item').forEach(item => {
          item.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const image = data.images[index];
            
            if (image && image.url) {
              modalImg.src = image.url;
              if (modalCaption) {
                modalCaption.textContent = image.caption || '';
                modalCaption.style.display = image.caption ? 'block' : 'none';
              }
              modal.style.display = 'block';
            }
          });
        });
        
        // Close modal on X click
        modal.querySelector('.w3-button').addEventListener('click', () => {
          modal.style.display = 'none';
        });
        
        // Close modal on outside click
        modal.addEventListener('click', function(e) {
          if (e.target === this) {
            this.style.display = 'none';
          }
        });
      }
    }
    
    // Contact form submission
    if (template === 'contact' && data.showForm) {
      const form = document.querySelector('.contact-form');
      if (form) {
        form.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          // Simple validation
          const name = this.querySelector('[name="name"]').value.trim();
          const email = this.querySelector('[name="email"]').value.trim();
          const message = this.querySelector('[name="message"]').value.trim();
          
          if (!name || !email || !message) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
          }
          
          // Submit form
          try {
            const formData = new FormData(this);
            const response = await fetch(this.action, {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('Vielen Dank für Ihre Nachricht! Wir werden uns in Kürze bei Ihnen melden.');
              this.reset();
            } else {
              alert('Beim Senden der Nachricht ist ein Fehler aufgetreten: ' + result.error);
            }
          } catch (error) {
            alert('Beim Senden der Nachricht ist ein Fehler aufgetreten: ' + error.message);
          }
        });
      }
    }
  };
  
  // Initialize general UI components
  const initUI = () => {
    // Go to top button
    const goTopBtn = document.getElementById('goTopBtn');
    if (goTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          goTopBtn.classList.add('visible');
        } else {
          goTopBtn.classList.remove('visible');
        }
      });
      
      goTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
    
    // Initialize animations for elements with animate-item class
    const animateItems = document.querySelectorAll('.animate-item');
    if (animateItems.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      animateItems.forEach(item => {
        observer.observe(item);
      });
    }
  };
  
  // Show error message
  const showPageError = (message) => {
    const pageLoading = document.getElementById('pageLoading');
    const pageContent = document.getElementById('pageContent');
    
    if (pageLoading) pageLoading.style.display = 'none';
    
    if (pageContent) {
      pageContent.innerHTML = `
        <div class="w3-container w3-padding-64">
          <div class="w3-panel w3-red">
            <h3>Fehler</h3>
            <p>${message}</p>
            <a href="index.php" class="w3-button w3-blue">Zurück zur Startseite</a>
          </div>
        </div>
      `;
      pageContent.style.opacity = '1';
    }
  };
  
  // Show page content and hide loading indicator
  const showPageContent = () => {
    const pageLoading = document.getElementById('pageLoading');
    const pageContent = document.getElementById('pageContent');
    
    if (pageLoading) {
      pageLoading.style.opacity = '0';
      setTimeout(() => {
        pageLoading.style.display = 'none';
      }, 300);
    }
    
    if (pageContent) {
      setTimeout(() => {
        pageContent.style.opacity = '1';
      }, 100);
    }
  };
  
  // Load the page
  loadPage();
});
</script>

<!-- Page-specific styles -->
<style>
/* Loading animation */
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Page content transition */
.page-content {
  transition: opacity 0.4s ease;
}

/* Animation for elements */
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
.delay-4 { transition-delay: 0.8s; }

/* Gallery styles */
.gallery-item {
  cursor: pointer;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius, 4px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.5s ease;
}

.gallery-caption {
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 0.9em;
}

/* Feature items */
.feature-item {
  padding: 20px;
  margin-bottom: 20px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  border-radius: var(--border-radius, 4px);
  text-align: center;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 15px auto;
  display: block;
}

.icon-placeholder {
  width: 64px;
  height: 64px;
  background-color: #f1f1f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px auto;
  font-size: 24px;
  color: #666;
}

/* Portfolio items */
.portfolio-item {
  margin-bottom: 20px;
  background-color: white;
  border-radius: var(--border-radius, 4px);
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.portfolio-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

/* Adjust responsive behavior */
@media (max-width: 768px) {
  .delay-1, .delay-2, .delay-3, .delay-4 {
    transition-delay: 0.1s;
  }
  
  .animate-item {
    transform: translateY(10px);
  }
}

/* Accessibility: respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .animate-item {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>

<?php
// Get buffered content
$content = ob_get_clean();

// Render with base template
render_template('base', [
    'title' => $page_config['title'],
    'description' => $page_config['description'],
    'content' => $content,
    'custom_styles' => $page_config['custom_styles'],
    'body_class' => $page_config['body_class'],
    'dynamic_nav' => $page_config['dynamic_nav']
]);
?>