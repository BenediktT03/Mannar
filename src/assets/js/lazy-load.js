 /**
 * Optimiertes Lazy-Loading für Bilder
 */
(function() {
  // Nach DOM-Ladung ausführen
  document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img:not([loading])');
    
    // Native Unterstützung
    if ('loading' in HTMLImageElement.prototype) {
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });
    } else {
      // Fallback für ältere Browser
      const lazyImageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '200px 0px' }
      );
      
      images.forEach(img => {
        // Original-Quelle als data-Attribut
        if (!img.hasAttribute('data-src') && img.src) {
          img.setAttribute('data-src', img.src);
          // Kleine Platzhalter-Quelle
          img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
          // Bei Sichtbarkeit die echte Quelle setzen
          img.addEventListener('load', function() {
            if (img.classList.contains('loaded') && img.hasAttribute('data-src')) {
              img.src = img.getAttribute('data-src');
            }
          });
        }
        
        lazyImageObserver.observe(img);
      });
    }
  });
})();