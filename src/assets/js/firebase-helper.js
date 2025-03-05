/**
 * Firebase Helper - Ein einfaches Modul zum Verwalten von Firebase-Operationen
 * Speziell für die Mannar-Website auf W3Schools Space
 */

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

/**
 * Initialisiert Firebase und gibt Firebase-Instanzen zurück
 * @returns {Object} Objekt mit Firebase-Instanzen (app, db, auth)
 */
function initFirebase() {
  // Initialisierung für die compat-Version
  if (typeof firebase !== 'undefined') {
    // Prüfen, ob Firebase bereits initialisiert wurde
    if (firebase.apps && firebase.apps.length > 0) {
      return {
        app: firebase.app(),
        db: firebase.firestore ? firebase.firestore() : null,
        auth: firebase.auth ? firebase.auth() : null
      };
    }
    
    // Initialisierung
    firebase.initializeApp(FIREBASE_CONFIG);
    
    return {
      app: firebase.app(),
      db: firebase.firestore ? firebase.firestore() : null,
      auth: firebase.auth ? firebase.auth() : null
    };
  }
  
  console.error('Firebase ist nicht verfügbar - stellen Sie sicher, dass die Firebase-SDK geladen wurde');
  return {
    app: null,
    db: null,
    auth: null
  };
}

/**
 * Lädt Inhalte aus Firestore
 * @param {string} docPath - Der Pfad zum Dokument (z.B. "content/main")
 * @param {Function} callback - Callback-Funktion, die mit den Daten aufgerufen wird
 */
function loadContent(docPath, callback) {
  const { db } = initFirebase();
  if (!db) {
    console.error('Firestore ist nicht verfügbar');
    callback(null);
    return;
  }

  // Pfad in Sammlung und Dokument aufteilen
  const [collection, doc] = docPath.split('/');
  
  // Daten abrufen
  db.collection(collection).doc(doc).get()
    .then(docSnap => {
      if (docSnap.exists) {
        callback(docSnap.data());
      } else {
        console.log(`Dokument ${docPath} wurde nicht gefunden.`);
        callback(null);
      }
    })
    .catch(error => {
      console.error(`Fehler beim Laden von ${docPath}:`, error);
      callback(null);
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
  const { db } = initFirebase();
  if (!db) {
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
  db.collection(collection).doc(doc).set(data, { merge })
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
  const { auth } = initFirebase();
  if (!auth) {
    console.error('Firebase Auth ist nicht verfügbar');
    callback(null);
    return;
  }
  
  auth.onAuthStateChanged(user => {
    callback(user);
  });
}

/**
 * Meldet einen Benutzer mit E-Mail und Passwort an
 * @param {string} email - Die E-Mail-Adresse des Benutzers
 * @param {string} password - Das Passwort des Benutzers
 * @param {Function} callback - Callback-Funktion, die nach dem Anmelden aufgerufen wird
 */
function login(email, password, callback) {
  const { auth } = initFirebase();
  if (!auth) {
    console.error('Firebase Auth ist nicht verfügbar');
    if (callback) callback(false, new Error('Firebase Auth ist nicht verfügbar'));
    return;
  }
  
  auth.signInWithEmailAndPassword(email, password)
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
  const { auth } = initFirebase();
  if (!auth) {
    console.error('Firebase Auth ist nicht verfügbar');
    if (callback) callback(false, new Error('Firebase Auth ist nicht verfügbar'));
    return;
  }
  
  auth.signOut()
    .then(() => {
      console.log('Abmeldung erfolgreich');
      if (callback) callback(true);
    })
    .catch(error => {
      console.error('Abmeldefehler:', error);
      if (callback) callback(false, error);
    });
}

// Exportiere Funktionen für die globale Verwendung
window.firebaseHelper = {
  init: initFirebase,
  loadContent,
  saveContent,
  onAuthStateChanged,
  login,
  logout
};