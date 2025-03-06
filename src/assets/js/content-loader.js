/**
 * content-loader.js - Gemeinsame Funktionen zum Laden von Inhalten
 * Diese Datei enthält wiederverwendbare Funktionen für die Inhaltsverarbeitung
 */

window.contentLoader = {
  /**
   * Lädt Inhalte aus Firestore
   * @param {boolean} isDraft - Ob Entwurf (true) oder Hauptversion (false) geladen werden soll
   * @returns {Promise} Promise mit den geladenen Daten
   */
  loadContent: function(isDraft = false) {
    const db = firebase.firestore();
    return db.collection("content").doc(isDraft ? "draft" : "main").get()
      .then(docSnap => {
        if (!docSnap.exists) {
          console.warn("Keine Inhalte gefunden");
          return null;
        }
        return docSnap.data();
      });
  },
  
  /**
   * Lädt Wortwolke aus Firestore
   * @returns {Promise} Promise mit den Wortwolkendaten
   */
  loadWordCloud: function() {
    const db = firebase.firestore();
    return db.collection("content").doc("wordCloud").get()
      .then(docSnap => {
        if (docSnap.exists && docSnap.data().words) {
          return docSnap.data().words;
        }
        return [];
      });
  },
  
  /**
   * Rendert die Wortwolke im angegebenen Container
   * @param {HTMLElement} container - Der Container für die Wortwolke
   * @param {Array} words - Array von Wortobjekten
   */
  renderWordCloud: function(container, words) {
    if (!container) return;
    container.innerHTML = '';
    
    words.forEach(word => {
      if (word && word.text) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        a.href = word.link || "#";
        a.setAttribute('data-weight', word.weight || "5");
        a.textContent = word.text;
        a.style.opacity = '0';
        a.style.transform = 'translateY(20px)';
        
        li.appendChild(a);
        container.appendChild(li);
      }
    });
  },
  
  /**
   * Animiert die Wortwolke mit einem Fade-In-Effekt
   * @param {HTMLElement} container - Der Container der Wortwolke
   */
  animateWordCloud: function(container) {
    if (!container) return;
    
    const wordCloudLinks = container.querySelectorAll('li a');
    
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
    
    observer.observe(container);
    
    // Sofort prüfen, ob bereits sichtbar
    const rect = container.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      wordCloudLinks.forEach((word, index) => {
        setTimeout(() => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        }, 50 * index);
      });
      observer.disconnect();
    }
  },
  
  /**
   * Aktualisiert Bildvorschauen basierend auf geladenen Daten
   * @param {Object} data - Geladene Inhaltsdaten mit Bildpfaden
   * @param {Object} elements - Objekt mit DOM-Referenzen
   */
  updateImagePreviews: function(data, elements) {
    // Process offer1_image
    if (data.offer1_image && elements.offer1Img) {
      let imgData = this.normalizeImageData(data.offer1_image);
      elements.offer1Img.src = imgData.url;
      elements.offer1Img.style.display = imgData.url ? 'block' : 'none';
    }
    
    // Process offer2_image
    if (data.offer2_image && elements.offer2Img) {
      let imgData = this.normalizeImageData(data.offer2_image);
      elements.offer2Img.src = imgData.url;
      elements.offer2Img.style.display = imgData.url ? 'block' : 'none';
    }
    
    // Process offer3_image
    if (data.offer3_image && elements.offer3Img) {
      let imgData = this.normalizeImageData(data.offer3_image);
      elements.offer3Img.src = imgData.url;
      elements.offer3Img.style.display = imgData.url ? 'block' : 'none';
    }
    
    // Process contact_image
    if (data.contact_image && elements.contactImg) {
      let imgData = this.normalizeImageData(data.contact_image);
      elements.contactImg.src = imgData.url;
      elements.contactImg.style.display = imgData.url ? 'block' : 'none';
    }
  },
  
  /**
   * Normalisiert Bilddaten in ein einheitliches Format
   * @param {string|Object} imageData - Bilddaten als String oder Objekt
   * @returns {Object} Normalisiertes Bilddatenobjekt
   */
  normalizeImageData: function(imageData) {
    if (typeof imageData === 'string') {
      return { url: imageData, public_id: "" };
    } else if (typeof imageData === 'object' && imageData !== null) {
      return {
        url: imageData.url || "",
        public_id: imageData.public_id || "",
        alt: imageData.alt || ""
      };
    } else {
      return { url: "", public_id: "", alt: "" };
    }
  }
};