/**
 * firebase-service.js - Umfassender Firebase-Service für die Mannar-Website
 * Konsolidiert die Funktionalitäten aus firebase-config.js, firebase-helper.js und content-loader.js
 * Bietet zusätzlich Kompatibilität für legacy Code, der contentLoader und firebaseHelper verwendet
 */

// Namespace für alle Firebase-Funktionen
window.firebaseService = (function() {
  // Firebase-Konfiguration
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    authDomain: "mannar-129a5.firebaseapp.com",
    projectId: "mannar-129a5",
    storageBucket: "mannar-129a5.firebasestorage.app",
    messagingSenderId: "687710492532",
    appId: "1:687710492532:web:c7b675da541271f8d83e21",
    measurementId: "G-NXBLYJ5CXL"
  };

  // Firebase-Instanzen
  let app, db, auth;

  /**
   * Initialisiert Firebase und gibt Firebase-Instanzen zurück
   * @returns {Object} Objekt mit Firebase-Instanzen (app, db, auth)
   */
  function initFirebase() {
    // Nur initialisieren, wenn Firebase verfügbar ist
    if (typeof firebase === 'undefined') {
      console.error('Firebase ist nicht verfügbar - stellen Sie sicher, dass die Firebase-SDK geladen wurde');
      return { app: null, db: null, auth: null };
    }

    // Prüfen, ob Firebase bereits initialisiert wurde
    if (firebase.apps && firebase.apps.length > 0) {
      app = firebase.app();
      db = firebase.firestore ? firebase.firestore() : null;
      auth = firebase.auth ? firebase.auth() : null;
      return { app, db, auth };
    }
    
    // Initialisierung
    firebase.initializeApp(FIREBASE_CONFIG);
    console.log("Firebase initialized");
    
    app = firebase.app();
    db = firebase.firestore ? firebase.firestore() : null;
    auth = firebase.auth ? firebase.auth() : null;
    
    return { app, db, auth };
  }

  /**
   * Lädt Inhalte aus Firestore
   * @param {string} docPath - Der Pfad zum Dokument (z.B. "content/main")
   * @param {Function} callback - Callback-Funktion, die mit den Daten aufgerufen wird
   */
  function loadContent(docPath, callback) {
    const instances = initFirebase();
    if (!instances.db) {
      console.error('Firestore ist nicht verfügbar');
      if (callback) callback(null);
      return;
    }

    // Pfad in Sammlung und Dokument aufteilen
    const [collection, doc] = docPath.split('/');
    
    // Daten abrufen
    instances.db.collection(collection).doc(doc).get()
      .then(docSnap => {
        if (docSnap.exists) {
          if (callback) callback(docSnap.data());
        } else {
          console.log(`Dokument ${docPath} wurde nicht gefunden.`);
          if (callback) callback(null);
        }
      })
      .catch(error => {
        console.error(`Fehler beim Laden von ${docPath}:`, error);
        if (callback) callback(null);
      });
  }

  /**
   * Speichert Inhalte in Firestore
   * @param {string} docPath - Der Pfad zum Dokument (z.B. "content/draft")
   * @param {Object} data - Die zu speichernden Daten
   * @param {boolean} merge - Ob die Daten mit vorhandenen Daten zusammengeführt werden sollen
   * @param {Function} callback - Callback-Funktion, die nach dem Speichern aufgerufen wird
   */
  function saveContent(docPath, data, merge = true, callback) {
    const instances = initFirebase();
    if (!instances.db) {
      console.error('Firestore ist nicht verfügbar');
      if (callback) callback(false, new Error('Firestore ist nicht verfügbar'));
      return;
    }

    // Pfad in Sammlung und Dokument aufteilen
    const [collection, doc] = docPath.split('/');
    
    // Zeitstempel hinzufügen, wenn Firestore verfügbar ist
    if (firebase.firestore && firebase.firestore.FieldValue) {
      data.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
    } else {
      data.lastUpdated = new Date().toISOString();
    }
    
    // Daten speichern
    instances.db.collection(collection).doc(doc).set(data, { merge })
      .then(() => {
        console.log(`Dokument ${docPath} erfolgreich gespeichert.`);
        if (callback) callback(true);
      })
      .catch(error => {
        console.error(`Fehler beim Speichern von ${docPath}:`, error);
        if (callback) callback(false, error);
      });
  }

  /**
   * Fügt einen Auth-Zustandsbeobachter hinzu
   * @param {Function} callback - Callback-Funktion, die bei Änderungen des Auth-Zustands aufgerufen wird
   */
  function onAuthStateChanged(callback) {
    const instances = initFirebase();
    if (!instances.auth) {
      console.error('Firebase Auth ist nicht verfügbar');
      if (callback) callback(null);
      return;
    }
    
    instances.auth.onAuthStateChanged(user => {
      if (callback) callback(user);
    });
  }

  /**
   * Meldet einen Benutzer mit E-Mail und Passwort an
   * @param {string} email - Die E-Mail-Adresse des Benutzers
   * @param {string} password - Das Passwort des Benutzers
   * @param {Function} callback - Callback-Funktion, die nach dem Anmelden aufgerufen wird
   */
  function login(email, password, callback) {
    const instances = initFirebase();
    if (!instances.auth) {
      console.error('Firebase Auth ist nicht verfügbar');
      if (callback) callback(false, new Error('Firebase Auth ist nicht verfügbar'));
      return;
    }
    
    instances.auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log('Anmeldung erfolgreich:', userCredential.user.email);
        if (callback) callback(true, userCredential.user);
      })
      .catch(error => {
        console.error('Anmeldefehler:', error);
        if (callback) callback(false, error);
      });
  }

  /**
   * Meldet den aktuellen Benutzer ab
   * @param {Function} callback - Callback-Funktion, die nach dem Abmelden aufgerufen wird
   */
  function logout(callback) {
    const instances = initFirebase();
    if (!instances.auth) {
      console.error('Firebase Auth ist nicht verfügbar');
      if (callback) callback(false, new Error('Firebase Auth ist nicht verfügbar'));
      return;
    }
    
    instances.auth.signOut()
      .then(() => {
        console.log('Abmeldung erfolgreich');
        if (callback) callback(true);
      })
      .catch(error => {
        console.error('Abmeldefehler:', error);
        if (callback) callback(false, error);
      });
  }

  /**
   * Lädt Wortwolke aus Firestore
   * @returns {Promise} Promise mit den Wortwolkendaten
   */
  function loadWordCloud() {
    const instances = initFirebase();
    if (!instances.db) {
      return Promise.reject(new Error('Firestore ist nicht verfügbar'));
    }
    
    return instances.db.collection("content").doc("wordCloud").get()
      .then(docSnap => {
        if (docSnap.exists && docSnap.data().words) {
          return docSnap.data().words;
        }
        return [];
      });
  }

  /**
   * Löscht ein Dokument
   * @param {string} docPath - Pfad zum Dokument (z.B. "content/draft")
   * @param {Function} callback - Callback nach Abschluss
   */
  function deleteDocument(docPath, callback) {
    const instances = initFirebase();
    if (!instances.db) {
      if (callback) callback(false, new Error('Firestore ist nicht verfügbar'));
      return;
    }
    
    // Pfad in Sammlung und Dokument aufteilen
    const [collection, doc] = docPath.split('/');
    
    instances.db.collection(collection).doc(doc).delete()
      .then(() => {
        console.log(`Dokument ${docPath} gelöscht`);
        if (callback) callback(true);
      })
      .catch(error => {
        console.error(`Fehler beim Löschen von ${docPath}:`, error);
        if (callback) callback(false, error);
      });
  }
  
  /**
   * Normalisiert Bilddaten in ein einheitliches Format
   * @param {string|Object} imageData - Bilddaten als String oder Objekt
   * @returns {Object} Normalisiertes Bilddatenobjekt
   */
  function normalizeImageData(imageData) {
    if (typeof imageData === 'string') {
      return { url: imageData, public_id: "", alt: "" };
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

  // Öffentliche API
  return {
    init: initFirebase,
    loadContent,
    saveContent,
    deleteDocument,
    onAuthStateChanged,
    login,
    logout,
    loadWordCloud,
    normalizeImageData
  };
})();

// =====================================================
// KOMPATIBILITÄTSSCHICHT FÜR LEGACY CODE
// =====================================================

// 1. contentLoader für Kompatibilität mit älteren Skripten
window.contentLoader = {
  /**
   * Lädt Inhalte aus Firestore basierend auf isDraft-Flag
   * @param {boolean} isDraft - Ob Entwurf oder Live-Daten geladen werden sollen
   * @returns {Promise} - Promise mit den Daten
   */
  loadContent: function(isDraft) {
    return new Promise((resolve, reject) => {
      window.firebaseService.loadContent(`content/${isDraft ? "draft" : "main"}`, function(data) {
        if (data) {
          resolve(data);
        } else {
          reject(new Error("Keine Inhalte gefunden"));
        }
      });
    });
  },
  
  /**
   * Lädt Wortwolkendaten
   * @returns {Promise} - Promise mit den Wortwolkendaten
   */
  loadWordCloud: function() {
    return window.firebaseService.loadWordCloud();
  },
  
  /**
   * Aktualisiert Bildvorschauen aus Contentdaten
   * @param {Object} data - Content-Daten mit Bildpfaden
   * @param {Object} imageElements - Objekt mit Bild-DOM-Elementen
   */
  updateImagePreviews: function(data, imageElements) {
    if (!data || !imageElements) return;
    
    // Jedes Bild aktualisieren, falls vorhanden
    Object.keys(imageElements).forEach(key => {
      const imgElement = imageElements[key];
      if (!imgElement) return;
      
      const dataKey = key.replace('Img', '_image'); // Umwandlung: offer1Img -> offer1_image
      if (data[dataKey]) {
        const imageData = window.firebaseService.normalizeImageData(data[dataKey]);
        imgElement.src = imageData.url || "/api/placeholder/400/300";
        
        if (imageData.url) {
          imgElement.style.display = "block";
          if (imageData.alt) imgElement.alt = imageData.alt;
        } else {
          imgElement.style.display = "none";
        }
      }
    });
  },
  
  /**
   * Rendert Wortwolke in Container
   * @param {HTMLElement} container - DOM-Container für die Wortwolke
   * @param {Array} words - Array mit Wortwolkendaten
   */
  renderWordCloud: function(container, words) {
    if (!container || !words) return;
    
    // Container leeren
    container.innerHTML = '';
    
    // Wortwolkenelemente hinzufügen
    words.forEach(word => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = word.link || '#';
      a.textContent = word.text || '';
      a.setAttribute('data-weight', word.weight || 5);
      
      li.appendChild(a);
      container.appendChild(li);
    });
  },
  
  /**
   * Animiert die Wortwolkenelemente
   * @param {HTMLElement} container - Container für die Wortwolke
   */
  animateWordCloud: function(container) {
    if (!container) return;
    
    const wordElements = container.querySelectorAll('.word-cloud li a');
    
    wordElements.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
};

// 2. firebaseHelper für Kompatibilität mit älteren Skripten
window.firebaseHelper = {
  /**
   * Lädt Content aus Firestore
   * @param {string} path - Pfad zum Dokument
   * @param {Function} callback - Callback-Funktion
   */
  loadContent: function(path, callback) {
    window.firebaseService.loadContent(path, callback);
  },
  
  /**
   * Speichert Content in Firestore
   * @param {string} path - Pfad zum Dokument
   * @param {Object} data - Zu speichernde Daten
   * @param {boolean} merge - Ob die Daten zusammengeführt werden sollen
   * @param {Function} callback - Callback-Funktion
   */
  saveContent: function(path, data, merge, callback) {
    window.firebaseService.saveContent(path, data, merge, callback);
  },
  
  /**
   * Löscht ein Dokument
   * @param {string} path - Pfad zum Dokument
   * @param {Function} callback - Callback-Funktion
   */
  deleteDocument: function(path, callback) {
    window.firebaseService.deleteDocument(path, callback);
  },
  
  /**
   * Lädt Liste von Dokumenten
   * @param {string} collection - Name der Sammlung
   * @param {Function} callback - Callback-Funktion
   */
  getDocumentsList: function(collection, callback) {
    const instances = window.firebaseService.init();
    if (!instances.db) {
      if (callback) callback([]);
      return;
    }
    
    instances.db.collection(collection).get()
      .then(snapshot => {
        const documents = [];
        snapshot.forEach(doc => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        if (callback) callback(documents);
      })
      .catch(error => {
        console.error(`Fehler beim Laden von Dokumenten aus ${collection}:`, error);
        if (callback) callback([]);
      });
  }
};

// Automatische Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initialisiere Firebase Service...");
  window.firebaseService.init();
});