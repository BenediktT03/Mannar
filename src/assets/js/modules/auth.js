/**
 * auth.js
 * Verbessertes Authentifizierungsmanagement mit Sicherheitsverbesserungen
 */

import { getAuth } from '../core/firebase.js';
import { showStatus } from '../core/utils.js';
import { API_ENDPOINTS, SECURITY_CONFIG } from '../core/config.js';

// Status
let currentUser = null;
let authListeners = [];
let tokenRefreshTimer = null;
let sessionTimeout = null;
let lastActivityTime = Date.now();

/**
 * Authentifizierungsmodul initialisieren
 * @returns {Object} Auth-Methoden
 */
export function initAuth() {
  const auth = getAuth();
  if (!auth) return null;
  
  // Auth-State-Listener einrichten
  auth.onAuthStateChanged(handleAuthStateChange);
  
  // Token-Aktualisierungstimer einrichten
  setupTokenRefresh();
  
  // Sitzungs-Timeout-Prüfung einrichten
  setupSessionTimeoutCheck();
  
  // Aktivitäts-Tracking einrichten
  setupActivityTracking();
  
  // Gegebenenfalls gespeicherte Anmeldeinformationen wiederherstellen
  restoreSession();
  
  return {
    login,
    logout,
    getCurrentUser,
    addAuthStateListener,
    removeAuthStateListener,
    refreshToken,
    validateToken,
    isAuthenticated
  };
}

/**
 * Auth-Status-Änderungen behandeln
 * @param {Object} user - Firebase-Benutzerobjekt oder null, wenn abgemeldet
 */
function handleAuthStateChange(user) {
  currentUser = user;
  
  // UI-Elemente aktualisieren
  updateAuthUI(user);
  
  // Alle Listener benachrichtigen
  authListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error('Fehler im Auth-State-Listener:', error);
    }
  });
  
  // Bei Anmeldung Benutzerinformationen lokal speichern
  if (user) {
    // Token aktualisieren und im localStorage speichern
    user.getIdToken().then(token => {
      localStorage.setItem('auth_token', token);
      
      // Die sensiblen Benutzerinformationen werden nur temporär gespeichert
      sessionStorage.setItem('user_email', user.email);
      
      console.log(`Benutzer angemeldet: ${user.email}`);
      
      // Aktivitätszeit zurücksetzen
      updateLastActivityTime();
    });
  } else {
    // Bei Abmeldung localStorage und sessionStorage bereinigen
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_email');
    console.log('Benutzer abgemeldet');
  }
}

/**
 * UI-Elemente basierend auf Authentifizierungsstatus aktualisieren
 * @param {Object} user - Firebase-Benutzerobjekt oder null
 */
function updateAuthUI(user) {
  const loginDiv = document.getElementById('loginDiv');
  const adminDiv = document.getElementById('adminDiv');
  
  if (loginDiv) {
    loginDiv.style.display = user ? 'none' : 'block';
  }
  
  if (adminDiv) {
    adminDiv.style.display = user ? 'block' : 'none';
  }
  
  // Anmeldeformular zurücksetzen
  if (!user) {
    const emailField = document.getElementById('emailField');
    const passField = document.getElementById('passField');
    const loginError = document.getElementById('loginError');
    
    if (emailField) emailField.value = '';
    if (passField) passField.value = '';
    if (loginError) {
      loginError.textContent = '';
      loginError.style.display = 'none';
    }
  }
  
  // Benutzername anzeigen, wenn vorhanden
  const userInfoSpan = document.getElementById('userInfoSpan');
  if (userInfoSpan && user) {
    userInfoSpan.textContent = user.email || 'Admin';
  }
}

/**
 * Einen Listener für Auth-Status-Änderungen hinzufügen
 * @param {Function} listener - Bei Auth-Status-Änderungen aufzurufende Funktion
 */
export function addAuthStateListener(listener) {
  if (typeof listener !== 'function') return;
  
  // Denselben Listener nicht zweimal hinzufügen
  if (!authListeners.includes(listener)) {
    authListeners.push(listener);
    
    // Sofort mit aktuellem Status aufrufen, falls bereits authentifiziert
    if (currentUser) {
      try {
        listener(currentUser);
      } catch (error) {
        console.error('Fehler beim Ausführen des Auth-Listeners:', error);
      }
    }
  }
}

/**
 * Einen Auth-Status-Listener entfernen
 * @param {Function} listener - Zu entfernender Listener
 */
export function removeAuthStateListener(listener) {
  const index = authListeners.indexOf(listener);
  if (index !== -1) {
    authListeners.splice(index, 1);
  }
}

/**
 * Den aktuellen authentifizierten Benutzer abrufen
 * @returns {Object} Benutzerobjekt oder null
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Prüfen, ob ein Benutzer authentifiziert ist
 * @returns {boolean} Ob authentifiziert
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Token-Aktualisierungstimer einrichten
 */
function setupTokenRefresh() {
  // Bestehenden Timer löschen
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
  }
  
  // Neuen Timer einrichten (alle 30 Minuten)
  tokenRefreshTimer = setInterval(() => {
    if (isAuthenticated()) {
      refreshToken().catch(error => {
        console.error('Fehler bei der Token-Aktualisierung:', error);
        
        // Bei einem kritischen Fehler abmelden
        if (error.code === 'auth/network-request-failed' || 
            error.code === 'auth/user-token-expired' ||
            error.code === 'auth/invalid-user-token') {
          logout(true);
        }
      });
    }
  }, SECURITY_CONFIG.tokenRefreshInterval);
}

/**
 * Token aktualisieren
 * @returns {Promise} Aktualisierungsresultat
 */
export async function refreshToken() {
  if (!isAuthenticated()) {
    return Promise.reject(new Error('Nicht authentifiziert'));
  }
  
  try {
    // Token aktualisieren
    const token = await currentUser.getIdToken(true);
    
    // Aktualisiertes Token speichern
    localStorage.setItem('auth_token', token);
    
    return { success: true, token };
  } catch (error) {
    console.error('Token-Aktualisierungsfehler:', error);
    return Promise.reject(error);
  }
}

/**
 * Gespeicherte Sitzung wiederherstellen (wenn vorhanden)
 */
async function restoreSession() {
  // Token aus localStorage abrufen
  const storedToken = localStorage.getItem('auth_token');
  
  if (storedToken) {
    try {
      // Token validieren
      const result = await validateToken(storedToken);
      
      if (result.valid) {
        // Sitzung wiederherstellen
        // In einer echten Anwendung würde hier Firebase Auth verwendet
        // Für diese Übung simulieren wir den Benutzer
        
        const userEmail = sessionStorage.getItem('user_email') || 'admin@example.com';
        
        // Manuell den Auth-Status aktualisieren (vereinfacht)
        handleAuthStateChange({
          email: userEmail,
          getIdToken: () => Promise.resolve(storedToken)
        });
        
        return true;
      } else {
        // Ungültiges Token entfernen
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_email');
      }
    } catch (error) {
      console.error('Fehler beim Wiederherstellen der Sitzung:', error);
      
      // Bei einem Fehler Token entfernen
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_email');
    }
  }
  
  return false;
}

/**
 * Token validieren
 * @param {string} token - Zu validierendes Token
 * @returns {Promise} Validierungsresultat
 */
export async function validateToken(token) {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.VALIDATE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return { valid: false };
    }
    
    const data = await response.json();
    return { 
      valid: data.valid || false, 
      role: data.role || 'user',
      email: data.email || ''
    };
  } catch (error) {
    console.error('Token-Validierungsfehler:', error);
    return { valid: false };
  }
}

/**
 * Sitzungs-Timeout-Prüfung einrichten
 */
function setupSessionTimeoutCheck() {
  // Bestehenden Timer löschen
  if (sessionTimeout) {
    clearInterval(sessionTimeout);
  }
  
  // Neuen Timer einrichten (alle Minute prüfen)
  sessionTimeout = setInterval(() => {
    if (isAuthenticated()) {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivityTime;
      
      // Bei Inaktivität abmelden (Standard: 1 Stunde)
      if (inactiveTime > SECURITY_CONFIG.sessionTimeout) {
        console.log('Sitzung aufgrund von Inaktivität beendet');
        logout(true);
      }
    }
  }, 60000); // Jede Minute prüfen
}

/**
 * Aktivitätsverfolgung einrichten
 */
function setupActivityTracking() {
  // Bei jeder Benutzeraktivität die Zeit aktualisieren
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  activityEvents.forEach(eventType => {
    document.addEventListener(eventType, updateLastActivityTime, { passive: true });
  });
}

/**
 * Letzte Aktivitätszeit aktualisieren
 */
function updateLastActivityTime() {
  lastActivityTime = Date.now();
}

/**
 * Mit E-Mail und Passwort anmelden
 * @param {string} email - Benutzer-E-Mail
 * @param {string} password - Benutzerpasswort
 * @returns {Promise} Anmeldeergebnis
 */
export async function login(email, password) {
  const auth = getAuth();
  if (!auth) return { success: false, error: 'Auth nicht initialisiert' };
  
  // Eingabevalidierung
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' };
  }
  
  if (!password || password.length < 6) {
    return { success: false, error: 'Passwort muss mindestens 6 Zeichen lang sein' };
  }
  
  // Ratenbegrenzung anwenden
  const jetzt = Date.now();
  const letzterVersuch = parseInt(localStorage.getItem('lastLoginAttempt') || '0');
  const versuchsAnzahl = parseInt(localStorage.getItem('loginAttemptCount') || '0');
  
  if (versuchsAnzahl >= SECURITY_CONFIG.maxLoginAttempts && 
      (jetzt - letzterVersuch) < SECURITY_CONFIG.lockoutTime) {
    const verbleibend = Math.ceil((SECURITY_CONFIG.lockoutTime - (jetzt - letzterVersuch)) / 1000 / 60);
    return { 
      success: false, 
      error: `Zu viele Versuche. Bitte versuchen Sie es in ${verbleibend} Minute${verbleibend !== 1 ? 'n' : ''} erneut.` 
    };
  }
  
  // Versuchsverfolgung aktualisieren
  localStorage.setItem('lastLoginAttempt', jetzt.toString());
  localStorage.setItem('loginAttemptCount', 
    (jetzt - letzterVersuch > 300000) ? '1' : (versuchsAnzahl + 1).toString()); // Nach 5 Minuten zurücksetzen
  
  try {
    // CSRF-Token für API-Anfragen abrufen
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Ladestatus anzeigen
    showStatus('Anmeldung...', false, 0);
    
    // Bei Firebase oder über die API anmelden
    // In einer echten Anwendung würden wir Firebase Auth verwenden:
    // const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Da wir jedoch eine Direktanmeldung bei der API durchführen,
    // verwenden wir einen API-Anfrageansatz:
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || ''
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Anmeldefehler');
    }
    
    // Versuchszähler bei Erfolg zurücksetzen
    localStorage.setItem('loginAttemptCount', '0');
    
    // Token und Benutzerinformationen speichern
    localStorage.setItem('auth_token', data.token);
    if (data.refreshToken) {
      // Refresh-Token im sessionStorage (nicht localStorage) speichern
      sessionStorage.setItem('refresh_token', data.refreshToken);
    }
    sessionStorage.setItem('user_email', email);
    
    // Benutzer manuell erstellen (vereinfacht)
    const user = {
      email: email,
      role: data.user?.role || 'admin',
      getIdToken: () => Promise.resolve(data.token)
    };
    
    // Auth-Status aktualisieren
    handleAuthStateChange(user);
    
    // Erfolgsmeldung
    showStatus('Erfolgreich angemeldet');
    
    return { success: true, user };
  } catch (error) {
    console.error('Anmeldefehler:', error);
    showStatus(`Anmeldung fehlgeschlagen: ${error.message}`, true);
    return { success: false, error: error.message };
  }
}

/**
 * Aktuellen Benutzer abmelden
 * @param {boolean} force - Ob Abmeldung auch bei ungespeicherten Änderungen erzwungen werden soll
 * @returns {Promise} Abmeldeergebnis
 */
export async function logout(force = false) {
  const auth = getAuth();
  if (!auth) return { success: false, error: 'Auth nicht initialisiert' };
  
  // Auf ungespeicherte Änderungen prüfen
  const hatUngespeicherteÄnderungen = window.isDirty === true;
  
  if (hatUngespeicherteÄnderungen && !force) {
    const bestätigt = confirm('Sie haben ungespeicherte Änderungen. Möchten Sie sich wirklich abmelden?');
    if (!bestätigt) {
      return { success: false, error: 'Abmeldung aufgrund ungespeicherter Änderungen abgebrochen' };
    }
  }
  
  try {
    // Ladestatus anzeigen
    showStatus('Abmeldung...', false, 0);
    
    // CSRF-Token für API-Anfragen abrufen
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Token aus localStorage abrufen
    const token = localStorage.getItem('auth_token');
    
    // Bei der API abmelden
    if (token) {
      try {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
          }
        });
      } catch (error) {
        console.warn('API-Abmeldung fehlgeschlagen:', error);
        // Wir setzen fort, da wir trotzdem lokal abmelden können
      }
    }
    
    // Lokale Speicherung bereinigen
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_email');
    
    // In einer echten Anwendung: Firebase-Abmeldung
    // await auth.signOut();
    
    // Manuell Auth-Status aktualisieren
    handleAuthStateChange(null);
    
    // Erfolgsmeldung
    showStatus('Erfolgreich abgemeldet');
    
    return { success: true };
  } catch (error) {
    console.error('Abmeldefehler:', error);
    
    showStatus(`Fehler bei der Abmeldung: ${error.message}`, true);
    
    return { success: false, error: error.message };
  }
}

/**
 * Anmeldeformular einrichten
 */
export function setupLoginForm() {
  const emailField = document.getElementById('emailField');
  const passField = document.getElementById('passField');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  
  if (!emailField || !passField || !loginBtn) return;
  
  // Vorherige Listener löschen, um Duplikate zu vermeiden
  const newEmailField = emailField.cloneNode(true);
  const newPassField = passField.cloneNode(true);
  const newLoginBtn = loginBtn.cloneNode(true);
  
  emailField.parentNode.replaceChild(newEmailField, emailField);
  passField.parentNode.replaceChild(newPassField, passField);
  loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
  
  // Funktion zum Anzeigen von Fehlern
  const showError = (message) => {
    if (loginError) {
      loginError.textContent = message;
      loginError.style.display = 'block';
    }
  };
  
  // Funktion zum Ausblenden von Fehlern
  const hideError = () => {
    if (loginError) {
      loginError.textContent = '';
      loginError.style.display = 'none';
    }
  };
  
  // Bei Eingabe Fehler ausblenden
  newEmailField.addEventListener('input', hideError);
  newPassField.addEventListener('input', hideError);
  
  // Anmeldefunktion
  const handleLoginAttempt = async () => {
    // Schaltfläche während der Anmeldung deaktivieren
    newLoginBtn.disabled = true;
    newLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmeldung...';
    
    // Vorherigen Fehler löschen
    hideError();
    
    const result = await login(newEmailField.value, newPassField.value);
    
    // UI basierend auf Ergebnis aktualisieren
    if (!result.success) {
      showError(result.error);
    }
    
    // Schaltfläche zurücksetzen
    newLoginBtn.disabled = false;
    newLoginBtn.innerHTML = 'Anmelden';
  };
  
  // Klick-Handler für Anmeldebutton
  newLoginBtn.addEventListener('click', handleLoginAttempt);
  
  // Enter-Taste-Handler
  newPassField.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
      handleLoginAttempt();
    }
  });
  
  // "Remember Me"-Funktionalität (falls vorhanden)
  const rememberCheck = document.getElementById('rememberCheck');
  if (rememberCheck) {
    // Gespeicherten Zustand abrufen
    const remembered = localStorage.getItem('remember_login') === 'true';
    rememberCheck.checked = remembered;
    
    // Wenn "Remember Me" aktiviert ist, E-Mail aus localStorage abrufen
    if (remembered && newEmailField) {
      const savedEmail = localStorage.getItem('saved_email');
      if (savedEmail) {
        newEmailField.value = savedEmail;
      }
    }
    
    // Bei Änderung speichern
    rememberCheck.addEventListener('change', () => {
      if (rememberCheck.checked) {
        localStorage.setItem('remember_login', 'true');
        if (newEmailField.value) {
          localStorage.setItem('saved_email', newEmailField.value);
        }
      } else {
        localStorage.removeItem('remember_login');
        localStorage.removeItem('saved_email');
      }
    });
  }
}

// Initialisieren, wenn dieses Modul geladen wird
initAuth();

// Export der globalen Anmeldefunktion
window.handleLogin = login;