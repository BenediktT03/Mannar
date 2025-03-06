 /**
 * firebase-config.js - Zentrale Firebase-Konfiguration
 * Diese Datei enthält die Konfiguration für Firebase und wird in allen Seiten verwendet
 */

(function() {
  // Firebase-Konfiguration
  const firebaseConfig = {
    apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
    authDomain: "mannar-129a5.firebaseapp.com",
    projectId: "mannar-129a5",
    storageBucket: "mannar-129a5.firebasestorage.app",
    messagingSenderId: "687710492532",
    appId: "1:687710492532:web:c7b675da541271f8d83e21",
    measurementId: "G-NXBLYJ5CXL"
  };
  
  // Initialisiere Firebase, falls noch nicht geschehen
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized from firebase-config.js");
  } else if (firebase.apps.length) {
    console.log("Firebase was already initialized");
  } else {
    console.error("Firebase is not available - check if the Firebase SDK is loaded");
  }
})();