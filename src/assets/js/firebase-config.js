/**
 * firebase-config.js - Zentrale Firebase-Konfiguration
 */

(function() {
  // Initialisiere Firebase, falls noch nicht geschehen
  if (typeof firebase !== 'undefined' && !firebase.apps.length && typeof firebaseConfig !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized from firebase-config.js");
  } else if (firebase.apps.length) {
    console.log("Firebase was already initialized");
  } else {
    console.error("Firebase is not available - check if the Firebase SDK is loaded");
  }
})();