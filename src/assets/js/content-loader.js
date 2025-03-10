 // Create new file: src/assets/js/services/content-loader.js

/**
 * Content Loader - Handles loading and rendering website content
 * Works with FirebaseService for data access
 */
const ContentLoader = (function() {
  // Load main website content
  async function loadContent(isDraft = false) {
    try {
      const content = await FirebaseService.content.load(`content/${isDraft ? "draft" : "main"}`);
      return content || {};
    } catch (error) {
      console.error('Error loading content:', error);
      return {};
    }
  }

  // Load and render word cloud
  async function loadWordCloud() {
    try {
      return await FirebaseService.wordCloud.load();
    } catch (error) {
      console.error('Error loading word cloud:', error);
      return [];
    }
  }

  // Render word cloud to container
  function renderWordCloud(container, words) {
    if (!container || !words || !words.length) return;
    
    container.innerHTML = '';
    
    words.forEach(word => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = word.link || '#';
      a.textContent = word.text || '';
      a.setAttribute('data-weight', word.weight || 5);
      
      li.appendChild(a);
      container.appendChild(li);
    });
  }

  // Animate word cloud elements
  function animateWordCloud(container) {
    if (!container) return;
    
    const wordElements = container.querySelectorAll('.word-cloud li a');
    
    wordElements.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }

  // Update image previews from data
  function updateImagePreviews(data, imageElements) {
    if (!data || !imageElements) return;
    
    Object.keys(imageElements).forEach(key => {
      const imgElement = imageElements[key];
      if (!imgElement) return;
      
      const dataKey = key.replace('Img', '_image');
      if (data[dataKey]) {
        const imageData = FirebaseService.utils.normalizeImageData(data[dataKey]);
        imgElement.src = imageData.url || "/api/placeholder/400/300";
        
        if (imageData.url) {
          imgElement.style.display = "block";
          if (imageData.alt) imgElement.alt = imageData.alt;
        } else {
          imgElement.style.display = "none";
        }
      }
    });
  }

  // Public API
  return {
    loadContent,
    loadWordCloud,
    renderWordCloud,
    animateWordCloud,
    updateImagePreviews
  };
})();

// For global access and backward compatibility
window.contentLoader = ContentLoader;