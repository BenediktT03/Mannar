/**
 * Firebase Service
 * 
 * Zentrale Schnittstelle für alle Firebase-Interaktionen. Dieser Service
 * kapselt die Firebase-Initialisierung und stellt Methoden für den Zugriff
 * auf Firebase-Dienste (Authentifizierung, Firestore, Storage) bereit.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

import { errorHandler } from '../utils/error-handler.js';

/**
 * Firebase Service Klasse
 */
class FirebaseService {
  /**
   * Erstellt eine neue FirebaseService-Instanz
   */
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.storage = null;
    this.initialized = false;
    
    // Firebase-Konfiguration laden
    this._loadConfig();
  }
  
  /**
   * Initialisiert Firebase mit der geladenen Konfiguration
   * @returns {Promise<boolean>} True wenn erfolgreich initialisiert
   */
  async initialize() {
    try {
      if (this.initialized) return true;
      
      // Prüfen, ob Firebase bereits global verfügbar ist
      if (typeof firebase === 'undefined') {
        errorHandler.logError('Firebase ist nicht geladen. Bitte Firebase-SDK einbinden.');
        return false;
      }
      
      // Firebase initialisieren, wenn noch nicht geschehen
      if (!firebase.apps.length) {
        if (!this.config) {
          errorHandler.logError('Firebase-Konfiguration konnte nicht geladen werden.');
          return false;
        }
        
        this.app = firebase.initializeApp(this.config);
      } else {
        this.app = firebase.app();
      }
      
      // Firebase-Dienste initialisieren
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.storage = firebase.storage();
      
      // Firestore-Einstellungen
      this.db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
      });
      
      // Offline-Persistenz aktivieren, falls unterstützt
      try {
        await this.db.enablePersistence({ synchronizeTabs: true });
      } catch (err) {
        if (err.code === 'failed-precondition') {
          // Mehrere Tabs geöffnet, Persistenz in diesem Kontext nicht möglich
          console.warn('Firebase Offline-Persistenz nicht verfügbar: Mehrere Tabs geöffnet.');
        } else if (err.code === 'unimplemented') {
          // Der aktuelle Browser unterstützt keine Persistenz
          console.warn('Firebase Offline-Persistenz wird in diesem Browser nicht unterstützt.');
        }
      }
      
      this.initialized = true;
      console.info('Firebase erfolgreich initialisiert.');
      return true;
    } catch (error) {
      errorHandler.logError('Fehler bei der Firebase-Initialisierung:', error);
      return false;
    }
  }
  
  /**
   * Lädt die Firebase-Konfiguration
   * @private
   */
  async _loadConfig() {
    try {
      // Versuche, die Konfiguration aus dem window-Objekt zu laden (falls inline definiert)
      if (window.firebaseConfig) {
        this.config = window.firebaseConfig;
        return;
      }
      
      // Alternativ: Konfiguration aus einer Konfigurationsdatei laden
      const response = await fetch('/config/firebase-config.json');
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      this.config = await response.json();
    } catch (error) {
      errorHandler.logError('Fehler beim Laden der Firebase-Konfiguration:', error);
      this.config = null;
    }
  }
  
  /**
   * Prüft, ob Firebase initialisiert ist und initialisiert es bei Bedarf
   * @returns {Promise<boolean>} True, wenn Firebase bereit ist
   * @private
   */
  async _ensureInitialized() {
    if (!this.initialized) {
      return await this.initialize();
    }
    return true;
  }
  
  /**
   * Ruft eine Firestore-Sammlung ab
   * @param {string} collectionName - Name der Sammlung
   * @returns {firebase.firestore.CollectionReference} Firestore-Sammlungsreferenz
   */
  async getCollection(collectionName) {
    await this._ensureInitialized();
    return this.db.collection(collectionName);
  }
  
  /**
   * Ruft ein Dokument aus einer Sammlung ab
   * @param {string} collectionName - Name der Sammlung
   * @param {string} documentId - ID des Dokuments
   * @returns {Promise<Object>} Dokumentdaten oder null, falls nicht gefunden
   */
  async getDocument(collectionName, documentId) {
    try {
      await this._ensureInitialized();
      
      const docRef = this.db.collection(collectionName).doc(documentId);
      const doc = await docRef.get();
      
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      } else {
        console.warn(`Dokument nicht gefunden: ${collectionName}/${documentId}`);
        return null;
      }
    } catch (error) {
      errorHandler.logError(`Fehler beim Abrufen des Dokuments ${collectionName}/${documentId}:`, error);
      return null;
    }
  }
  
  /**
   * Ruft Dokumente aus einer Sammlung mit optionaler Filterung ab
   * @param {string} collectionName - Name der Sammlung
   * @param {Object} options - Abfrageoptionen (Felder, Sortierung, Limit)
   * @returns {Promise<Array>} Array von Dokumenten
   */
  async getDocuments(collectionName, options = {}) {
    try {
      await this._ensureInitialized();
      
      let query = this.db.collection(collectionName);
      
      // Filterungen anwenden, falls angegeben
      if (options.where && Array.isArray(options.where)) {
        options.where.forEach(condition => {
          if (condition.length === 3) {
            const [field, operator, value] = condition;
            query = query.where(field, operator, value);
          }
        });
      }
      
      // Sortierung anwenden, falls angegeben
      if (options.orderBy) {
        const orderField = options.orderBy.field || options.orderBy;
        const orderDirection = options.orderBy.direction || 'asc';
        query = query.orderBy(orderField, orderDirection);
      }
      
      // Limit anwenden, falls angegeben
      if (options.limit && typeof options.limit === 'number') {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      
      // Ergebnisse in ein Array umwandeln und IDs hinzufügen
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      errorHandler.logError(`Fehler beim Abrufen von Dokumenten aus ${collectionName}:`, error);
      return [];
    }
  }
  
  /**
   * Speichert ein Dokument in Firestore
   * @param {string} collectionName - Name der Sammlung
   * @param {Object} data - Zu speichernde Daten
   * @param {string} documentId - Optionale Dokument-ID (wird generiert, falls nicht angegeben)
   * @returns {Promise<string>} ID des gespeicherten Dokuments oder null bei Fehler
   */
  async saveDocument(collectionName, data, documentId = null) {
    try {
      await this._ensureInitialized();
      
      // Zeitstempel für Erstellung/Aktualisierung
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const dataToSave = {
        ...data,
        updatedAt: timestamp
      };
      
      // Bei neuen Dokumenten Erstellungszeitstempel hinzufügen
      if (!documentId) {
        dataToSave.createdAt = timestamp;
      }
      
      let docRef;
      
      if (documentId) {
        // Existierendes Dokument aktualisieren
        docRef = this.db.collection(collectionName).doc(documentId);
        await docRef.update(dataToSave);
      } else {
        // Neues Dokument mit generierter ID erstellen
        docRef = await this.db.collection(collectionName).add(dataToSave);
      }
      
      return docRef.id;
    } catch (error) {
      errorHandler.logError(`Fehler beim Speichern des Dokuments in ${collectionName}:`, error);
      return null;
    }
  }
  
  /**
   * Löscht ein Dokument aus Firestore
   * @param {string} collectionName - Name der Sammlung
   * @param {string} documentId - ID des zu löschenden Dokuments
   * @returns {Promise<boolean>} True bei Erfolg, False bei Fehler
   */
  async deleteDocument(collectionName, documentId) {
    try {
      await this._ensureInitialized();
      
      await this.db.collection(collectionName).doc(documentId).delete();
      return true;
    } catch (error) {
      errorHandler.logError(`Fehler beim Löschen des Dokuments ${collectionName}/${documentId}:`, error);
      return false;
    }
  }
  
  /**
   * Lädt eine Datei in Firebase Storage hoch
   * @param {File} file - Hochzuladende Datei
   * @param {string} path - Pfad im Storage
   * @param {Function} progressCallback - Callback für Fortschrittsanzeige
   * @returns {Promise<string>} Download-URL der Datei oder null bei Fehler
   */
  async uploadFile(file, path, progressCallback = null) {
    try {
      await this._ensureInitialized();
      
      const storagePath = path || `uploads/${Date.now()}_${file.name}`;
      const storageRef = this.storage.ref(storagePath);
      
      // Upload-Task erstellen
      const uploadTask = storageRef.put(file);
      
      // Fortschritts-Listener, falls Callback angegeben
      if (progressCallback && typeof progressCallback === 'function') {
        uploadTask.on('state_changed', snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressCallback(progress, snapshot);
        });
      }
      
      // Auf Abschluss des Uploads warten
      await uploadTask;
      
      // Download-URL abrufen
      const downloadURL = await storageRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      errorHandler.logError('Fehler beim Hochladen der Datei:', error);
      return null;
    }
  }
  
  /**
   * Ruft eine Liste von Dateien aus einem Storage-Pfad ab
   * @param {string} path - Pfad im Storage
   * @returns {Promise<Array>} Array von Dateireferenzen
   */
  async listFiles(path) {
    try {
      await this._ensureInitialized();
      
      const storageRef = this.storage.ref(path);
      const result = await storageRef.listAll();
      
      // Metadaten und URLs für alle Dateien abrufen
      const filesPromises = result.items.map(async (itemRef) => {
        const url = await itemRef.getDownloadURL();
        const metadata = await itemRef.getMetadata();
        
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url: url,
          contentType: metadata.contentType,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated
        };
      });
      
      return await Promise.all(filesPromises);
    } catch (error) {
      errorHandler.logError(`Fehler beim Abrufen der Dateien aus ${path}:`, error);
      return [];
    }
  }
  
  /**
   * Löscht eine Datei aus dem Firebase Storage
   * @param {string} path - Vollständiger Pfad der Datei
   * @returns {Promise<boolean>} True bei Erfolg
   */
  async deleteFile(path) {
    try {
      await this._ensureInitialized();
      
      const fileRef = this.storage.ref(path);
      await fileRef.delete();
      return true;
    } catch (error) {
      errorHandler.logError(`Fehler beim Löschen der Datei ${path}:`, error);
      return false;
    }
  }
}

// Eine Singleton-Instanz des FirebaseService erstellen
const firebaseService = new FirebaseService();

// Service exportieren
export default firebaseService;