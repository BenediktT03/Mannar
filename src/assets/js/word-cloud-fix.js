 /**
 * Wortwolke (Word Cloud) Fix
 * Behebt Probleme mit der Darstellung und Animation der Wortwolke
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Word Cloud Fix geladen");
  
  // Funktion zum Initialisieren der Wortwolke
  function initWordCloud() {
    // Prüfen, ob die Wortwolke existiert
    const wordCloudContainer = document.querySelector('.textbubble');
    const wordCloudList = document.querySelector('.word-cloud');
    
    if (!wordCloudContainer || !wordCloudList) {
      console.log("Keine Wortwolke auf dieser Seite gefunden");
      return;
    }
    
    console.log("Wortwolke gefunden, initialisiere...");
    
    // Prüfen, ob Firestore verfügbar ist
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.error("Firebase/Firestore nicht verfügbar für Wortwolke");
      return;
    }
    
    // Firestore-Referenz
    const db = firebase.firestore();
    
    // Wortwolken-Daten aus Firestore laden
    db.collection("content").doc("wordCloud").get().then(doc => {
      if (doc.exists && doc.data().words) {
        console.log("Wortwolken-Daten geladen:", doc.data().words.length, "Wörter");
        const words = doc.data().words;
        
        // Wortwolke leeren
        wordCloudList.innerHTML = '';
        
        // Wörter zur Wortwolke hinzufügen
        words.forEach(word => {
          if (word && word.text) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = word.link || "#";
            a.setAttribute('data-weight', word.weight || "5");
            a.textContent = word.text;
            
            // Speziell für die Animation
            a.style.opacity = '0';
            a.style.transform = 'translateY(20px)';
            a.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            li.appendChild(a);
            wordCloudList.appendChild(li);
          }
        });
        
        // Wortwolken-Animation starten
        setTimeout(animateWordCloud, 500);
      } else {
        console.warn("Keine Wortwolken-Daten gefunden");
        // Beispiel-Wörter anzeigen, wenn keine Daten vorhanden sind
        showDemoWords(wordCloudList);
      }
    }).catch(error => {
      console.error("Fehler beim Laden der Wortwolke:", error);
      // Im Fehlerfall Demo-Wörter anzeigen
      showDemoWords(wordCloudList);
    });
  }
  
  // Funktion zum Anzeigen von Demo-Wörtern
  function showDemoWords(wordCloudList) {
    if (!wordCloudList) return;
    
    wordCloudList.innerHTML = '';
    
    const demoWords = [
      { text: "Mindfulness", weight: 7, link: "#" },
      { text: "Meditation", weight: 9, link: "#" },
      { text: "Bewusstsein", weight: 6, link: "#" },
      { text: "Achtsamkeit", weight: 8, link: "#" },
      { text: "Spiritualität", weight: 5, link: "#" },
      { text: "Heilung", weight: 7, link: "#" },
      { text: "Persönlichkeit", weight: 6, link: "#" },
      { text: "Reflexion", weight: 8, link: "#" },
      { text: "Wachstum", weight: 5, link: "#" },
      { text: "Psychologie", weight: 9, link: "#" }
    ];
    
    demoWords.forEach(word => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = word.link;
      a.setAttribute('data-weight', word.weight);
      a.textContent = word.text;
      
      // Speziell für die Animation
      a.style.opacity = '0';
      a.style.transform = 'translateY(20px)';
      a.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      li.appendChild(a);
      wordCloudList.appendChild(li);
    });
    
    // Wortwolken-Animation starten
    setTimeout(animateWordCloud, 500);
  }
  
  // Funktion für die Wortwolken-Animation
  function animateWordCloud() {
    const wordCloudLinks = document.querySelectorAll('.word-cloud li a');
    
    wordCloudLinks.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
  
  // Wird verwendet, um die Wortwolke zu initialisieren, wenn sie im Viewport ist
  function setupWordCloudObserver() {
    const wordCloudContainer = document.querySelector('.textbubble');
    if (!wordCloudContainer) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateWordCloud();
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(wordCloudContainer);
  }
  
  // Wortwolke initialisieren
  initWordCloud();
  
  // Beobachter für die Animation einrichten
  setupWordCloudObserver();
});