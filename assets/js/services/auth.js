/**
 * Authentication Service
 * 
 * Verwaltet die Benutzerauthentifizierung und -autorisierung.
 * Nutzt Firebase Authentication und stellt Methoden für Login, Logout,
 * Registrierung und Zugriffskontrolle bereit.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

import firebaseService from './firebase.js';
import { errorHandler } from '../utils/error-handler.js';

/**
 * Authentication Service Klasse
 */
class AuthService {
  /**
   * Erstellt eine neue AuthService-Instanz
   */
  constructor() {
    this.currentUser = null;
    this.userRoles = null;
    this.authStateListeners = [];
    
    // Auth-Status überwachen, sobald Firebase initialisiert ist
    this._initAuthStateListener();
  }
  
  /**
   * Initialisiert den Auth-State-Listener
   * @private
   */
  async _initAuthStateListener() {
    await firebaseService.initialize();
    
    // Auth-Status überwachen
    firebaseService.auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      
      if (user) {
        // Benutzerrollen abrufen
        await this._loadUserRoles();
        
        // Benutzertoken für Backend-Authentifizierung bereitstellen
        this._setupUserTokenRefresh();
      } else {
        this.userRoles = null;
      }
      
      // Registrierte Listener benachrichtigen
      this._notifyAuthStateListeners();
    });
  }
  
  /**
   * Benutzerrollen aus Firestore laden
   * @private
   */
  async _loadUserRoles() {
    try {
      if (!this.currentUser) return;
      
      const userDoc = await firebaseService.getDocument('users', this.currentUser.uid);
      
      if (userDoc && userDoc.roles) {
        this.userRoles = userDoc.roles;
      } else {
        // Standardrolle für neue Benutzer
        this.userRoles = ['user'];
        
        // Benutzer in Firestore speichern, falls noch nicht vorhanden
        if (!userDoc) {
          await this._createUserProfile();
        }
      }
    } catch (error) {
      errorHandler.logError('Fehler beim Laden der Benutzerrollen:', error);
      this.userRoles = ['user']; // Fallback zur Standardrolle
    }
  }
  
  /**
   * Richtet die automatische Token-Aktualisierung ein für Backend-Authentifizierung
   * @private
   */
  _setupUserTokenRefresh() {
    if (!this.currentUser) return;
    
    // Token für Backend-Authentifizierung alle 55 Minuten aktualisieren (Token läuft nach 60 Minuten ab)
    this.tokenRefreshInterval = setInterval(async () => {
      try {
        const token = await this.currentUser.getIdToken(true);
        localStorage.setItem('authToken', token);
      } catch (error) {
        errorHandler.logError('Fehler bei der Token-Aktualisierung:', error);
      }
    }, 55 * 60 * 1000);
  }
  
  /**
   * Benachrichtigt alle registrierten Auth-State-Listener
   * @private
   */
  _notifyAuthStateListeners() {
    this.authStateListeners.forEach(listener => {
      try {
        listener(this.currentUser, this.userRoles);
      } catch (error) {
        errorHandler.logError('Fehler in Auth-State-Listener:', error);
      }
    });
  }
  
  /**
   * Erstellt ein neues Benutzerprofil in Firestore
   * @private
   */
  async _createUserProfile() {
    try {
      if (!this.currentUser) return;
      
      const user = this.currentUser;
      
      const userData = {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        roles: ['user'],
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await firebaseService.saveDocument('users', userData, user.uid);
    } catch (error) {
      errorHandler.logError('Fehler beim Erstellen des Benutzerprofils:', error);
    }
  }
  
  /**
   * Registriert einen Auth-State-Listener
   * @param {Function} listener - Callback-Funktion, die bei Auth-State-Änderungen aufgerufen wird
   * @returns {Function} Funktion zum Entfernen des Listeners
   */
  onAuthStateChanged(listener) {
    if (typeof listener !== 'function') return;
    
    this.authStateListeners.push(listener);
    
    // Den Listener sofort mit dem aktuellen Status aufrufen
    try {
      listener(this.currentUser, this.userRoles);
    } catch (error) {
      errorHandler.logError('Fehler beim Ausführen des Auth-State-Listeners:', error);
    }
    
    // Funktion zum Entfernen des Listeners zurückgeben
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Meldet einen Benutzer mit E-Mail und Passwort an
   * @param {string} email - E-Mail-Adresse
   * @param {string} password - Passwort
   * @returns {Promise<Object>} Angemeldeter Benutzer oder Fehler
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      await firebaseService.initialize();
      
      const result = await firebaseService.auth.signInWithEmailAndPassword(email, password);
      
      // Last Login aktualisieren
      if (result.user) {
        await firebaseService.db.collection('users').doc(result.user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      errorHandler.logError('Anmeldefehler:', error);
      
      // Benutzerfreundliche Fehlermeldungen
      let errorMessage = 'Bei der Anmeldung ist ein Fehler aufgetreten.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Die E-Mail-Adresse ist ungültig.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Dieses Benutzerkonto wurde deaktiviert.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'E-Mail oder Passwort ist falsch.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Registriert einen neuen Benutzer mit E-Mail und Passwort
   * @param {string} email - E-Mail-Adresse
   * @param {string} password - Passwort
   * @param {Object} userData - Zusätzliche Benutzerdaten (optional)
   * @returns {Promise<Object>} Registrierter Benutzer oder Fehler
   */
  async createUserWithEmailAndPassword(email, password, userData = {}) {
    try {
      await firebaseService.initialize();
      
      const result = await firebaseService.auth.createUserWithEmailAndPassword(email, password);
      
      if (result.user) {
        // Benutzerprofil aktualisieren
        if (userData.displayName) {
          await result.user.updateProfile({
            displayName: userData.displayName
          });
        }
        
        // Zusätzliche Benutzerdaten in Firestore speichern
        const userDocData = {
          email: result.user.email,
          displayName: userData.displayName || '',
          roles: ['user'],
          ...userData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebaseService.saveDocument('users', userDocData, result.user.uid);
        
        // E-Mail-Bestätigung senden
        await result.user.sendEmailVerification();
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      errorHandler.logError('Registrierungsfehler:', error);
      
      // Benutzerfreundliche Fehlermeldungen
      let errorMessage = 'Bei der Registrierung ist ein Fehler aufgetreten.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Die E-Mail-Adresse ist ungültig.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres Passwort.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Meldet den aktuellen Benutzer ab
   * @returns {Promise<boolean>} True bei erfolgreicher Abmeldung
   */
  async signOut() {
    try {
      await firebaseService.initialize();
      
      // Token-Aktualisierung stoppen
      if (this.tokenRefreshInterval) {
        clearInterval(this.tokenRefreshInterval);
        this.tokenRefreshInterval = null;
      }
      
      // Token aus dem lokalen Speicher entfernen
      localStorage.removeItem('authToken');
      
      // Abmelden
      await firebaseService.auth.signOut();
      
      return true;
    } catch (error) {
      errorHandler.logError('Fehler bei der Abmeldung:', error);
      return false;
    }
  }
  
  /**
   * Sendet eine E-Mail zum Zurücksetzen des Passworts
   * @param {string} email - E-Mail-Adresse
   * @returns {Promise<Object>} Ergebnisobjekt
   */
  async sendPasswordResetEmail(email) {
    try {
      await firebaseService.initialize();
      
      await firebaseService.auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      errorHandler.logError('Fehler beim Senden der Passwort-Reset-E-Mail:', error);
      
      let errorMessage = 'Beim Senden der E-Mail ist ein Fehler aufgetreten.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Die E-Mail-Adresse ist ungültig.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Es wurde kein Benutzer mit dieser E-Mail-Adresse gefunden.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Aktualisiert das Passwort des aktuellen Benutzers
   * @param {string} newPassword - Neues Passwort
   * @returns {Promise<Object>} Ergebnisobjekt
   */
  async updatePassword(newPassword) {
    try {
      await firebaseService.initialize();
      
      if (!this.currentUser) {
        return { success: false, error: 'Benutzer nicht angemeldet.' };
      }
      
      await this.currentUser.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      errorHandler.logError('Fehler beim Aktualisieren des Passworts:', error);
      
      let errorMessage = 'Beim Aktualisieren des Passworts ist ein Fehler aufgetreten.';
      
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres Passwort.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Für diese Aktion ist eine erneute Anmeldung erforderlich.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Aktualisiert das Benutzerprofil
   * @param {Object} profileData - Zu aktualisierende Profildaten
   * @returns {Promise<Object>} Ergebnisobjekt
   */
  async updateProfile(profileData) {
    try {
      await firebaseService.initialize();
      
      if (!this.currentUser) {
        return { success: false, error: 'Benutzer nicht angemeldet.' };
      }
      
      const updateData = {};
      
      // Profilaktualisierung in Authentication
      if (profileData.displayName || profileData.photoURL) {
        const authUpdate = {};
        
        if (profileData.displayName) {
          authUpdate.displayName = profileData.displayName;
        }
        
        if (profileData.photoURL) {
          authUpdate.photoURL = profileData.photoURL;
        }
        
        await this.currentUser.updateProfile(authUpdate);
      }
      
      // Firestore-Aktualisierung
      for (const key in profileData) {
        if (profileData.hasOwnProperty(key)) {
          updateData[key] = profileData[key];
        }
      }
      
      // Zeitstempel hinzufügen
      updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      
      await firebaseService.db.collection('users').doc(this.currentUser.uid).update(updateData);
      
      return { success: true };
    } catch (error) {
      errorHandler.logError('Fehler beim Aktualisieren des Profils:', error);
      return { success: false, error: 'Beim Aktualisieren des Profils ist ein Fehler aufgetreten.' };
    }
  }
  
  /**
   * Prüft, ob der Benutzer angemeldet ist
   * @returns {boolean} True, wenn ein Benutzer angemeldet ist
   */
  isAuthenticated() {
    return !!this.currentUser;
  }
  
  /**
   * Prüft, ob der Benutzer eine bestimmte Rolle hat
   * @param {string|Array} roles - Rolle(n) zum Prüfen
   * @returns {boolean} True, wenn der Benutzer die angegebene(n) Rolle(n) hat
   */
  hasRole(roles) {
    if (!this.isAuthenticated() || !this.userRoles) return false;
    
    // Einzelne Rolle als String
    if (typeof roles === 'string') {
      return this.userRoles.includes(roles);
    }
    
    // Array von Rollen (ODER-Verknüpfung)
    if (Array.isArray(roles)) {
      return roles.some(role => this.userRoles.includes(role));
    }
    
    return false;
  }
  
  /**
   * Prüft, ob der Benutzer alle angegebenen Rollen hat
   * @param {Array} roles - Array von Rollen
   * @returns {boolean} True, wenn der Benutzer alle angegebenen Rollen hat
   */
  hasAllRoles(roles) {
    if (!this.isAuthenticated() || !this.userRoles) return false;
    
    if (!Array.isArray(roles)) {
      return false;
    }
    
    return roles.every(role => this.userRoles.includes(role));
  }
  
  /**
   * Gibt die ID des aktuellen Benutzers zurück
   * @returns {string|null} Benutzer-ID oder null, falls nicht angemeldet
   */
  getCurrentUserId() {
    return this.currentUser ? this.currentUser.uid : null;
  }
  
  /**
   * Gibt den aktuellen Authentifizierungstoken zurück
   * @returns {Promise<string|null>} Auth-Token oder null bei Fehler
   */
  async getAuthToken() {
    try {
      if (!this.currentUser) return null;
      
      return await this.currentUser.getIdToken();
    } catch (error) {
      errorHandler.logError('Fehler beim Abrufen des Auth-Tokens:', error);
      return null;
    }
  }
}

// Eine Singleton-Instanz des AuthService erstellen
const authService = new AuthService();

// Service exportieren
export default authService;