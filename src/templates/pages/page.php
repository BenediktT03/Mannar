<?php
/**
 * Dynamic Page Template
 * 
 * Renders pages based on their template type and data stored in Firebase
 * Supports multiple templates with dynamic content loading
 */

// Get page ID from URL parameter
$page_id = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';

// Redirect to homepage if no ID is provided
if (empty($page_id)) {
    header('Location: index.php');
    exit;
}

// Page configuration
$page_title = 'Loading...';
$page_description = 'Loading page content...';
$body_class = 'dynamic-page page-template';
$enable_dynamic_nav = true;

// Custom head content for dynamic pages
$custom_head_content = '
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
      border-left-color: var(--primary-color, #3498db);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Page content transition */
    .page-content {
      transition: opacity 0.4s ease;
      min-height: 50vh;
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
';

// Additional scripts for dynamic pages
$additional_scripts = '
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      // Page ID from URL
      const PAGE_ID = "' . $page_id . '";
      loadPage(PAGE_ID);
      
      /**
       * Load page data from Firebase
       * @param {string} pageId - Page ID to load
       */
      async function loadPage(pageId) {
        const pageLoading = document.getElementById("pageLoading");
        const pageContent = document.getElementById("pageContent");
        
        try {
          // Get the Firestore instance
          let pageData;
          
          if (typeof FirebaseService !== "undefined") {
            // Use FirebaseService if available
            pageData = await FirebaseService.pages.get(pageId);
          } else if (typeof firebase !== "undefined") {
            // Fallback to direct Firebase usage
            const db = firebase.firestore();
            const pageDoc = await db.collection("pages").doc(pageId).get();
            
            if (pageDoc.exists) {
              pageData = {
                id: pageId,
                ...pageDoc.data()
              };
            }
          } else {
            throw new Error("Firebase service not available");
          }
          
          if (!pageData) {
            showPageError("Die angeforderte Seite wurde nicht gefunden.");
            return;
          }
          
          // Update page title and metadata
          document.title = (pageData.title || "") + " - Mannar";
          
          // Set meta description if available
          const metaDesc = document.querySelector("meta[name=\'description\']");
          if (metaDesc && pageData.description) {
            metaDesc.setAttribute("content", pageData.description);
          }
          
          // Render page content based on template
          renderPage(pageData);
          
          // Initialize UI components
          initUI();
          
          // Show the page content
          showPageContent();
        } catch (error) {
          console.error("Error loading page:", error);
          showPageError("Fehler beim Laden der Seite: " + error.message);
        }
      }
      
      /**
       * Render page content based on template
       * @param {Object} pageData - Page data from Firebase
       */
      function renderPage(pageData) {
        const contentEl = document.getElementById("pageContent");
        if (!contentEl) return;
        
        // Get template and data
        const template = pageData.template || "basic";
        const data = pageData.data || {};
        
        // Create template-specific HTML
        let contentHtml = "";
        
        // Common page header
        contentHtml += `
          <div class="w3-container w3-padding-32">
            <h1 class="page-title w3-center">${data.title || pageData.title || ""}</h1>
            ${data.subtitle ? `<p class="page-subtitle w3-center"><em>${data.subtitle}</em></p>` : ""}
          </div>
        `;
        
        // Template-specific content
        switch (template) {
          case "basic":
            contentHtml += renderBasicTemplate(data);
            break;
          case "text-image":
            contentHtml += renderTextImageTemplate(data);
            break;
          case "image-text":
            contentHtml += renderImageTextTemplate(data);
            break;
          case "gallery":
            contentHtml += renderGalleryTemplate(data);
            break;
          case "landing":
            contentHtml += renderLandingTemplate(data);
            break;
          case "portfolio":
            contentHtml += renderPortfolioTemplate(data);
            break;
          case "contact":
            contentHtml += renderContactTemplate(data);
            break;
          case "blog":
            contentHtml += renderBlogTemplate(data);
            break;
          default:
            contentHtml += `
              <div class="w3-container">
                <div class="w3-panel w3-pale-yellow">
                  <p>Template "${template}" nicht gefunden. Standardinhalt wird angezeigt.</p>
                </div>
                <div>${data.content || ""}</div>
              </div>
            `;
        }
        
        // Replace content
        contentEl.innerHTML = contentHtml;
        
        // Apply custom CSS from settings if available
        applyCustomStyles(pageData.settings || {});
      }
      
      /**
       * Render basic template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderBasicTemplate(data) {
        return `
          <div class="w3-container w3-padding-32 basic-page-content">
            <div class="w3-animate-opacity">${data.content || ""}</div>
          </div>
        `;
      }
      
      /**
       * Render text-image template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderTextImageTemplate(data) {
        return `
          <div class="w3-container w3-padding-32">
            <div class="w3-row-padding">
              <div class="w3-col m8 animate-item">
                <div class="w3-padding">${data.content || ""}</div>
              </div>
              <div class="w3-col m4 animate-item delay-1">
                <div class="image-container">
                  <img src="${data.featuredImage?.url || "/api/placeholder/400/300"}" 
                       alt="${data.featuredImage?.alt || data.title || "Featured image"}" 
                       class="w3-image w3-card">
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      /**
       * Render image-text template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderImageTextTemplate(data) {
        return `
          <div class="w3-container w3-padding-32">
            <div class="w3-row-padding">
              <div class="w3-col m4 animate-item">
                <div class="image-container">
                  <img src="${data.featuredImage?.url || "/api/placeholder/400/300"}" 
                       alt="${data.featuredImage?.alt || data.title || "Featured image"}" 
                       class="w3-image w3-card">
                </div>
              </div>
              <div class="w3-col m8 animate-item delay-1">
                <div class="w3-padding">${data.content || ""}</div>
              </div>
            </div>
          </div>
        `;
      }
      
      /**
       * Render gallery template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderGalleryTemplate(data) {
        let galleryItems = "";
        
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          data.images.forEach((image, index) => {
            if (image && image.url) {
              galleryItems += `
                <div class="w3-col m4 l3 s6 animate-item delay-${index % 4}">
                  <div class="gallery-item" data-index="${index}">
                    <img src="${image.url}" alt="${image.alt || ""}" class="w3-image">
                    ${image.caption ? `<div class="gallery-caption w3-padding-small w3-light-grey">${image.caption}</div>` : ""}
                  </div>
                </div>
              `;
            }
          });
        } else {
          galleryItems = "<p class=\"w3-center\">Keine Bilder in dieser Galerie</p>";
        }
        
        const galleryHtml = `
          <div class="w3-container w3-padding-32">
            <div class="w3-container animate-item">${data.description || ""}</div>
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
          </div>
        `;
        
        // Initialize gallery modal after rendering
        setTimeout(() => {
          initGalleryModal();
        }, 0);
        
        return galleryHtml;
      }
      
      /**
       * Initialize gallery modal functionality
       */
      function initGalleryModal() {
        const galleryItems = document.querySelectorAll(".gallery-item");
        const modal = document.getElementById("galleryModal");
        const modalImg = document.getElementById("modalImg");
        const modalCaption = document.getElementById("modalCaption");
        const closeButton = modal?.querySelector(".w3-button");
        
        if (!modal || !modalImg || !galleryItems.length) return;
        
        galleryItems.forEach(item => {
          item.addEventListener("click", () => {
            const img = item.querySelector("img");
            const caption = item.querySelector(".gallery-caption");
            
            if (img) {
              modalImg.src = img.src;
              modalImg.alt = img.alt || "";
              
              if (caption) {
                modalCaption.textContent = caption.textContent;
                modalCaption.style.display = "block";
              } else {
                modalCaption.textContent = "";
                modalCaption.style.display = "none";
              }
              
              modal.style.display = "block";
            }
          });
        });
        
        // Close button functionality
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            modal.style.display = "none";
          });
        }
        
        // Click outside to close
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.style.display = "none";
          }
        });
      }
      
      /**
       * Render landing template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderLandingTemplate(data) {
        // Generate features HTML
        let featuresHtml = "";
        
        if (data.features && Array.isArray(data.features) && data.features.length > 0) {
          featuresHtml = "<div class=\"w3-row-padding\">";
          data.features.forEach((feature, index) => {
            featuresHtml += `
              <div class="w3-col m4 s12 animate-item delay-${index % 3}">
                <div class="feature-item">
                  ${feature.icon && feature.icon.url ? 
                    `<img src="${feature.icon.url}" alt="${feature.title || "Feature"}" class="feature-icon" style="width:64px; height:64px; margin:0 auto; display:block;">` : 
                    "<div class=\"icon-placeholder w3-circle w3-light-grey w3-padding\" style=\"width:64px; height:64px; margin:0 auto; display:flex; align-items:center; justify-content:center;\"><i class=\"fas fa-star\"></i></div>"
                  }
                  <h3>${feature.title || "Feature"}</h3>
                  <p>${feature.description || ""}</p>
                </div>
              </div>
            `;
          });
          featuresHtml += "</div>";
        }
        
        return `
          <div class="w3-container w3-padding-32">
            <!-- Hero Section -->
            <div class="w3-row-padding">
              <div class="w3-col m6 s12 animate-item">
                <div class="w3-padding-large hero-content">
                  ${data.content || ""}
                  ${data.ctaButtonText ? 
                    `<a href="${data.ctaButtonLink || "#"}" class="w3-button w3-padding-large w3-large w3-margin-top">${data.ctaButtonText}</a>` : 
                    ""
                  }
                </div>
              </div>
              <div class="w3-col m6 s12 animate-item delay-1">
                <div class="hero-image-container">
                  ${data.heroImage && data.heroImage.url ? 
                    `<img src="${data.heroImage.url}" alt="${data.heroImage.alt || data.title || "Hero image"}" class="w3-image w3-card">` : 
                    "<div class=\"w3-pale-blue w3-padding-64 w3-center w3-card\"><i class=\"fas fa-image\" style=\"font-size:48px\"></i><p>Hero Image</p></div>"
                  }
                </div>
              </div>
            </div>
            
            <!-- Features Section -->
            ${data.featuresTitle ? `<h2 class="w3-center w3-margin-top animate-item">${data.featuresTitle}</h2>` : ""}
            ${featuresHtml}
            
            <!-- CTA Section -->
            ${data.ctaText ? 
              `<div class="w3-container w3-padding-32 w3-center w3-margin-top animate-item">
                <h3>${data.ctaText}</h3>
                ${data.ctaButtonText ? 
                  `<a href="${data.ctaButtonLink || "#"}" class="w3-button w3-padding-large">${data.ctaButtonText}</a>` : 
                  ""
                }
              </div>` : 
              ""
            }
          </div>
        `;
      }
      
      /**
       * Render portfolio template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderPortfolioTemplate(data) {
        let projectsHtml = "";
        
        // Generate projects
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          projectsHtml = "<div class=\"w3-row-padding\">";
          data.projects.forEach((project, index) => {
            if (!project) return;
            
            projectsHtml += `
              <div class="w3-col m6 l4 w3-padding animate-item delay-${index % 3}">
                <div class="portfolio-item">
                  ${project.thumbnail && project.thumbnail.url ? 
                    `<img src="${project.thumbnail.url}" alt="${project.title || "Projekt"}" class="w3-image" style="width:100%">` : 
                    "<div class=\"w3-pale-blue w3-padding-32 w3-center\"><i class=\"fas fa-image\"></i><p>Projekt Bild</p></div>"
                  }
                  <div class="w3-container">
                    <h3>${project.title || "Projekt"}</h3>
                    <p>${project.description || ""}</p>
                    ${project.link ? `<a href="${project.link}" class="w3-button w3-margin-bottom">Mehr erfahren</a>` : ""}
                  </div>
                </div>
              </div>
            `;
          });
          projectsHtml += "</div>";
        } else {
          projectsHtml = "<div class=\"w3-panel w3-pale-yellow w3-center\">Keine Projekte definiert</div>";
        }
        
        return `
          <div class="w3-container w3-padding-32">
            <div class="w3-container animate-item">${data.introduction || ""}</div>
            ${projectsHtml}
          </div>
        `;
      }
      
      /**
       * Render contact template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderContactTemplate(data) {
        return `
          <div class="w3-container w3-padding-32">
            <div class="w3-container animate-item">${data.introduction || ""}</div>
            
            <div class="w3-row w3-padding-32 w3-section">
              ${data.contactImage && data.contactImage.url ? 
                `<div class="w3-col m4 w3-container animate-item">
                  <img src="${data.contactImage.url}" alt="${data.contactImage.alt || "Kontaktbild"}" class="w3-image w3-round" style="width:100%">
                </div>` : 
                ""
              }
              
              <div class="w3-col ${data.contactImage && data.contactImage.url ? "m8" : "s12"} w3-panel animate-item delay-1">
                <div class="w3-large w3-margin-bottom">
                  ${data.address ? `<p><i class="fas fa-map-marker-alt fa-fw w3-xlarge w3-margin-right"></i> ${data.address}</p>` : ""}
                  ${data.email ? `<p><i class="fas fa-envelope fa-fw w3-xlarge w3-margin-right"></i> ${data.email}</p>` : ""}
                  ${data.phone ? `<p><i class="fas fa-phone fa-fw w3-xlarge w3-margin-right"></i> ${data.phone}</p>` : ""}
                </div>
                
                ${data.showForm ? 
                  `<form class="w3-container contact-form" action="./api/contact.php" method="post">
                    <div class="w3-row-padding" style="margin:0 -16px 8px -16px">
                      <div class="w3-half">
                        <input class="w3-input w3-border" type="text" placeholder="Name" required name="name">
                      </div>
                      <div class="w3-half">
                        <input class="w3-input w3-border" type="email" placeholder="E-Mail" required name="email">
                      </div>
                    </div>
                    <textarea class="w3-input w3-border" placeholder="Nachricht" required name="message" rows="5"></textarea>
                    <button class="w3-button w3-right w3-section" type="submit">
                      <i class="fas fa-paper-plane"></i> NACHRICHT SENDEN
                    </button>
                  </form>` : 
                  ""
                }
              </div>
            </div>
          </div>
        `;
      }
      
      /**
       * Render blog template
       * @param {Object} data - Template data
       * @returns {string} HTML content
       */
      function renderBlogTemplate(data) {
        // Format categories
        let categoriesHtml = "";
        
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          categoriesHtml = `
            <div class="w3-section">
              <i class="fas fa-tags"></i> 
              ${data.categories.map(cat => `<span class="w3-tag w3-small w3-margin-right">${cat}</span>`).join("")}
            </div>
          `;
        }
        
        return `
          <div class="w3-container w3-padding-32">
            <div class="w3-container w3-margin-bottom">
              <div class="w3-row">
                <div class="w3-col m8 s12">
                  <div class="blog-meta w3-margin-bottom">
                    ${data.date ? `<span class="w3-margin-right"><i class="far fa-calendar-alt"></i> ${data.date}</span>` : ""}
                    ${data.author ? `<span><i class="far fa-user"></i> ${data.author}</span>` : ""}
                  </div>
                  ${categoriesHtml}
                </div>
              </div>
            </div>
            
            <!-- Featured image -->
            ${data.featuredImage && data.featuredImage.url ? 
              `<div class="w3-container w3-margin-bottom animate-item">
                <div class="image-container">
                  <img src="${data.featuredImage.url}" alt="${data.featuredImage.alt || data.title || "Blog Post"}" class="w3-image">
                </div>
              </div>` : 
              ""
            }
            
            <!-- Excerpt -->
            ${data.excerpt ? 
              `<div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue animate-item">
                <p><em>${data.excerpt}</em></p>
              </div>` : 
              ""
            }
            
            <!-- Main content -->
            <div class="w3-container blog-content animate-item delay-1">
              ${data.content || ""}
            </div>
          </div>
        `;
      }
      
      /**
       * Apply custom styles based on page settings
       * @param {Object} settings - Page settings
       */
      function applyCustomStyles(settings) {
        // Create style element if it doesn't exist
        let styleEl = document.getElementById("dynamic-page-styles");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "dynamic-page-styles";
          document.head.appendChild(styleEl);
        }
        
        // Generate CSS
        styleEl.textContent = `
          :root {
            --primary-color: ${settings.primaryColor || "#3498db"};
            --secondary-color: ${settings.secondaryColor || "#2c3e50"};
            --accent-color: ${settings.accentColor || "#e74c3c"};
            --text-color: ${settings.textColor || "#333333"};
            --title-size: ${settings.titleSize || 2.5}rem;
            --subtitle-size: ${settings.subtitleSize || 1.5}rem;
          }
          
          .page-title {
            font-size: var(--title-size);
            color: var(--secondary-color);
          }
          
          .page-subtitle {
            font-size: var(--subtitle-size);
            color: var(--text-color);
          }
          
          /* Customize buttons */
          .w3-button {
            background-color: var(--primary-color);
            color: white;
          }
          
          .w3-button:hover {
            background-color: var(--primary-color);
            opacity: 0.8;
          }
          
          /* Disable animations if settings require it */
          ${settings.enableAnimations === false ? `
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
          ` : ""}
        `;
      }
      
      /**
       * Initialize UI components
       */
      function initUI() {
        // Initialize animations
        initAnimations();
        
        // Initialize go to top button
        initGoToTopButton();
      }
      
      /**
       * Initialize animations
       */
      function initAnimations() {
        // Check if reduced motion is preferred
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          document.querySelectorAll(".animate-item").forEach(item => {
            item.classList.add("visible");
          });
          return;
        }
        
        // Use Intersection Observer if available
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.1 });
          
          document.querySelectorAll(".animate-item").forEach(item => {
            observer.observe(item);
          });
        } else {
          // Fallback for browsers that don't support Intersection Observer
          document.querySelectorAll(".animate-item").forEach(item => {
            item.classList.add("visible");
          });
        }
      }
      
      /**
       * Initialize go to top button
       */
      function initGoToTopButton() {
        const goTopBtn = document.getElementById("goTopBtn");
        if (!goTopBtn) return;
        
        // Show/hide button based on scroll position
        window.addEventListener("scroll", () => {
          if (window.scrollY > 300) {
            goTopBtn.classList.add("visible");
          } else {
            goTopBtn.classList.remove("visible");
          }
        });
        
        // Scroll to top on click
        goTopBtn.addEventListener("click", () => {
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
          });
        });
      }
      
      /**
       * Show error message
       * @param {string} message - Error message
       */
      function showPageError(message) {
        const pageLoading = document.getElementById("pageLoading");
        const pageContent = document.getElementById("pageContent");
        
        if (pageLoading) pageLoading.style.display = "none";
        
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
          pageContent.style.opacity = "1";
        }
      }
      
      /**
       * Show page content and hide loading indicator
       */
      function showPageContent() {
        const pageLoading = document.getElementById("pageLoading");
        const pageContent = document.getElementById("pageContent");
        
        if (pageLoading) {
          pageLoading.style.opacity = "0";
          setTimeout(() => {
            pageLoading.style.display = "none";
          }, 300);
        }
        
        if (pageContent) {
          setTimeout(() => {
            pageContent.style.opacity = "1";
          }, 100);
        }
      }
    });
  </script>
';
?>

<!-- Loading indicator -->
<div class="page-loading" id="pageLoading">
  <div class="spinner"></div>
  <p>Inhalt wird geladen...</p>
</div>

<!-- Page content container -->
<div class="page-content" id="pageContent" style="opacity: 0;">
  <!-- Dynamic content will be injected here by JavaScript -->
</div>

<!-- Go to top button -->
<div class="go-top" id="goTopBtn" aria-label="Nach oben scrollen">
  <i class="fas fa-arrow-up"></i>
</div>