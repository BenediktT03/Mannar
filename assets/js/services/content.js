/**
 * Content Service
 * 
 * Verwaltet den Zugriff auf und die Bearbeitung von Inhalten der Website.
 * Nutzt Firebase Firestore als Datenspeicher und bietet Methoden für das
 * Abrufen, Erstellen, Aktualisieren und Löschen von Inhalten.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

import firebaseService from './firebase.js';
import { errorHandler } from '../utils/error-handler.js';

/**
 * Content Service Klasse
 */
class ContentService {
  /**
   * Erstellt eine neue ContentService-Instanz
   */
  constructor() {
    this.cachedContent = new Map();
    this.activeContentListeners = new Map();
  }
  
  /**
   * Ruft eine Seite nach ihrer URL ab
   * @param {string} slug - URL-Pfad der Seite
   * @returns {Promise<Object>} Seitenobjekt oder null, falls nicht gefunden
   */
  async getPageBySlug(slug) {
    try {
      await firebaseService.initialize();
      
      // Cache-Key erstellen
      const cacheKey = `page_${slug}`;
      
      // Prüfen, ob die Seite im Cache ist
      if (this.cachedContent.has(cacheKey)) {
        return this.cachedContent.get(cacheKey);
      }
      
      // Seite aus Firebase abrufen
      const querySnapshot = await firebaseService.db.collection('pages')
        .where('slug', '==', slug)
        .where('status', '==', 'published')
        .limit(1)
        .get();
      
      if (querySnapshot.empty) {
        console.warn(`Seite mit Slug "${slug}" nicht gefunden.`);
        return null;
      }
      
      const pageData = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
      
      // Seite im Cache speichern (5 Minuten)
      this.cachedContent.set(cacheKey, pageData);
      setTimeout(() => this.cachedContent.delete(cacheKey), 5 * 60 * 1000);
      
      return pageData;
    } catch (error) {
      errorHandler.logError(`Fehler beim Abrufen der Seite mit Slug "${slug}":`, error);
      return null;
    }
  }
  
  /**
   * Ruft die aktuelle Version des Navigationsmenüs ab
   * @returns {Promise<Object>} Menüstruktur oder null bei Fehler
   */
  async getNavigation() {
    try {
      await firebaseService.initialize();
      
      // Cache-Key für das Menü
      const cacheKey = 'navigation';
      
      // Prüfen, ob das Menü im Cache ist
      if (this.cachedContent.has(cacheKey)) {
        return this.cachedContent.get(cacheKey);
      }
      
      // Navigation aus Firebase abrufen
      const navDoc = await firebaseService.db.collection('settings').doc('navigation').get();
      
      if (!navDoc.exists) {
        console.warn('Navigationseinstellungen nicht gefunden.');
        return null;
      }
      
      const navData = navDoc.data();
      
      // Menü im Cache speichern (10 Minuten)
      this.cachedContent.set(cacheKey, navData);
      setTimeout(() => this.cachedContent.delete(cacheKey), 10 * 60 * 1000);
      
      return navData;
    } catch (error) {
      errorHandler.logError('Fehler beim Abrufen der Navigation:', error);
      return null;
    }
  }
  
  /**
   * Ruft alle veröffentlichten Seiten ab
   * @param {Object} options - Abfrageoptionen
   * @returns {Promise<Array>} Array von Seitenobjekten
   */
  async getAllPages(options = {}) {
    try {
      await firebaseService.initialize();
      
      const defaultOptions = {
        onlyPublished: true,
        sortBy: 'title',
        sortDirection: 'asc',
        limit: 100
      };
      
      const queryOptions = { ...defaultOptions, ...options };
      
      // Query erstellen
      let query = firebaseService.db.collection('pages');
      
      // Filter für veröffentlichte Seiten
      if (queryOptions.onlyPublished) {
        query = query.where('status', '==', 'published');
      }
      
      // Sortierung
      query = query.orderBy(queryOptions.sortBy, queryOptions.sortDirection);
      
      // Limit
      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit);
      }
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      errorHandler.logError('Fehler beim Abrufen aller Seiten:', error);
      return [];
    }
  }
  
  /**
   * Ruft eine Seite nach ihrer ID ab
   * @param {string} id - ID der Seite
   * @returns {Promise<Object>} Seitenobjekt oder null, falls nicht gefunden
   */
  async getPageById(id) {
    try {
      return await firebaseService.getDocument('pages', id);
    } catch (error) {
      errorHandler.logError(`Fehler beim Abrufen der Seite mit ID "${id}":`, error);
      return null;
    }
  }
  
  /**
   * Speichert eine Seite (erstellt oder aktualisiert)
   * @param {Object} pageData - Seitendaten
   * @returns {Promise<Object>} Ergebnisobjekt mit ID der gespeicherten Seite
   */
  async savePage(pageData) {
    try {
      await firebaseService.initialize();
      
      // Sicherstellen, dass der Slug vorhanden ist
      if (!pageData.slug) {
        if (pageData.title) {
          pageData.slug = this._generateSlug(pageData.title);
        } else {
          throw new Error('Seitentitel oder Slug ist erforderlich.');
        }
      }
      
      // ID extrahieren, falls vorhanden
      const id = pageData.id;
      const cleanPageData = { ...pageData };
      delete cleanPageData.id;
      
      // Zeitstempel hinzufügen
      cleanPageData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      
      if (!id) {
        cleanPageData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      // Seitenstatus standardmäßig auf Entwurf setzen, falls nicht angegeben
      if (!cleanPageData.status) {
        cleanPageData.status = 'draft';
      }
      
      const docId = await firebaseService.saveDocument('pages', cleanPageData, id);
      
      // Cache für diese Seite löschen
      const cacheKey = `page_${pageData.slug}`;
      this.cachedContent.delete(cacheKey);
      
      return { success: true, id: docId };
    } catch (error) {
      errorHandler.logError('Fehler beim Speichern der Seite:', error);
      return { success: false, error: 'Beim Speichern der Seite ist ein Fehler aufgetreten.' };
    }
  }
  
  /**
   * Löscht eine Seite
   * @param {string} id - ID der zu löschenden Seite
   * @returns {Promise<boolean>} True bei Erfolg
   */
  async deletePage(id) {
    try {
      // Seite zuerst abrufen, um den Slug für Cache-Invalidierung zu erhalten
      const page = await this.getPageById(id);
      
      if (page && page.slug) {
        // Cache für diese Seite löschen
        const cacheKey = `page_${page.slug}`;
        this.cachedContent.delete(cacheKey);
      }
      
      return await firebaseService.deleteDocument('pages', id);
    } catch (error) {
      errorHandler.logError(`Fehler beim Löschen der Seite mit ID "${id}":`, error);
      return false;
    }
  }
  
  /**
   * Aktualisiert den Status einer Seite
   * @param {string} id - ID der Seite
   * @param {string} status - Neuer Status ('draft', 'published', 'archived')
   * @returns {Promise<boolean>} True bei Erfolg
   */
  async updatePageStatus(id, status) {
    try {
      if (!['draft', 'published', 'archived'].includes(status)) {
        throw new Error('Ungültiger Seitenstatus.');
      }
      
      await firebaseService.initialize();
      
      // Seite abrufen, um den Slug für Cache-Invalidierung zu erhalten
      const page = await this.getPageById(id);
      
      await firebaseService.db.collection('pages').doc(id).update({
        status: status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      if (page && page.slug) {
        // Cache für diese Seite löschen
        const cacheKey = `page_${page.slug}`;
        this.cachedContent.delete(cacheKey);
      }
      
      return true;
    } catch (error) {
      errorHandler.logError(`Fehler beim Aktualisieren des Status der Seite "${id}":`, error);
      return false;
    }
  }
  
  /**
   * Speichert die Navigationseinstellungen
   * @param {Object} navData - Navigationsdaten
   * @returns {Promise<boolean>} True bei Erfolg
   */
  async saveNavigation(navData) {
    try {
      await firebaseService.initialize();
      
      await firebaseService.db.collection('settings').doc('navigation').set({
        ...navData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Navigation-Cache löschen
      this.cachedContent.delete('navigation');
      
      return true;
    } catch (error) {
      errorHandler.logError('Fehler beim Speichern der Navigation:', error);
      return false;
    }
  }
  
  /**
   * Ruft Wortwolken-Daten aus einer Sammlung ab
   * @param {string} collectionPath - Pfad zur Sammlung
   * @returns {Promise<Array>} Array von Wort-Objekten [{ text: 'Wort', weight: 10 }]
   */
  async getWordCloudData(collectionPath) {
    try {
      await firebaseService.initialize();
      
      // Cache-Key für die Wortwolke
      const cacheKey = `wordcloud_${collectionPath}`;
      
      // Prüfen, ob die Daten im Cache sind
      if (this.cachedContent.has(cacheKey)) {
        return this.cachedContent.get(cacheKey);
      }
      
      let wordData = [];
      
      // Prüfen, ob es sich um einen direkten Dokumentpfad handelt
      if (collectionPath.includes('/')) {
        const [collection, document] = collectionPath.split('/');
        const docRef = await firebaseService.db.collection(collection).doc(document).get();
        
        if (docRef.exists) {
          wordData = docRef.data().words || [];
        }
      } else {
        // Alle Dokumente in der Sammlung abrufen
        const querySnapshot = await firebaseService.db.collection(collectionPath).get();
        
        // Wörter aus allen Dokumenten zusammenführen
        wordData = [];
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          if (docData.text && docData.weight) {
            wordData.push({
              text: docData.text,
              weight: docData.weight
            });
          }
        });
      }
      
      // Daten im Cache speichern (15 Minuten)
      this.cachedContent.set(cacheKey, wordData);
      setTimeout(() => this.cachedContent.delete(cacheKey), 15 * 60 * 1000);
      
      return wordData;
    } catch (error) {
      errorHandler.logError(`Fehler beim Abrufen der Wortwolken-Daten aus "${collectionPath}":`, error);
      return [];
    }
  }
  
  /**
   * Richtet einen Echtzeit-Listener für Inhaltsänderungen ein
   * @param {string} collectionPath - Pfad zur zu überwachenden Sammlung
   * @param {string} documentId - Optionale Dokument-ID (falls vorhanden, wird nur dieses Dokument überwacht)
   * @param {Function} callback - Callback-Funktion, die bei Änderungen aufgerufen wird
   * @returns {Function} Funktion zum Entfernen des Listeners
   */
  async listenForContentChanges(collectionPath, documentId, callback) {
    try {
      await firebaseService.initialize();
      
      let unsubscribe;
      
      // Listener-ID generieren
      const listenerId = documentId ? 
        `${collectionPath}_${documentId}` : 
        `${collectionPath}_collection`;
      
      // Vorhandenen Listener entfernen, falls vorhanden
      if (this.activeContentListeners.has(listenerId)) {
        this.activeContentListeners.get(listenerId)();
      }
      
      if (documentId) {
        // Einzelnes Dokument überwachen
        unsubscribe = firebaseService.db.collection(collectionPath).doc(documentId)
          .onSnapshot(docSnapshot => {
            if (docSnapshot.exists) {
              callback({
                id: docSnapshot.id,
                ...docSnapshot.data()
              });
            } else {
              callback(null);
            }
          });
      } else {
        // Gesamte Sammlung überwachen
        unsubscribe = firebaseService.db.collection(collectionPath)
          .onSnapshot(querySnapshot => {
            const documents = [];
            querySnapshot.forEach(doc => {
              documents.push({
                id: doc.id,
                ...doc.data()
              });
            });
            callback(documents);
          });
      }
      
      // Listener speichern
      this.activeContentListeners.set(listenerId, unsubscribe);
      
      // Funktion zum Entfernen des Listeners zurückgeben
      return () => {
        if (unsubscribe) {
          unsubscribe();
          this.activeContentListeners.delete(listenerId);
        }
      };
    } catch (error) {
      errorHandler.logError(`Fehler beim Einrichten des Content-Listeners für "${collectionPath}":`, error);
      return () => {}; // Leere Funktion zurückgeben
    }
  }
  
  /**
   * Lädt alle Einstellungen aus Firestore
   * @returns {Promise<Object>} Einstellungsobjekt
   */
  async getSettings() {
    try {
      await firebaseService.initialize();
      
      // Cache-Key für Einstellungen
      const cacheKey = 'settings';
      
      // Prüfen, ob die Einstellungen im Cache sind
      if (this.cachedContent.has(cacheKey)) {
        return this.cachedContent.get(cacheKey);
      }
      
      const settingsDoc = await firebaseService.db.collection('settings').doc('general').get();
      
      const settingsData = settingsDoc.exists ? settingsDoc.data() : {};
      
      // Einstellungen im Cache speichern (15 Minuten)
      this.cachedContent.set(cacheKey, settingsData);
      setTimeout(() => this.cachedContent.delete(cacheKey), 15 * 60 * 1000);
      
      return settingsData;
    } catch (error) {
      errorHandler.logError('Fehler beim Abrufen der Einstellungen:', error);
      return {};
    }
  }
  
  /**
   * Speichert allgemeine Einstellungen
   * @param {Object} settingsData - Einstellungsdaten
   * @returns {Promise<boolean>} True bei Erfolg
   */
  async saveSettings(settingsData) {
    try {
      await firebaseService.initialize();
      
      await firebaseService.db.collection('settings').doc('general').set({
        ...settingsData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Einstellungs-Cache löschen
      this.cachedContent.delete('settings');
      
      return true;
    } catch (error) {
      errorHandler.logError('Fehler beim Speichern der Einstellungen:', error);
      return false;
    }
  }
  
  /**
   * Generiert einen URL-freundlichen Slug aus einem Titel
   * @param {string} title - Titel, aus dem der Slug generiert werden soll
   * @returns {string} URL-freundlicher Slug
   * @private
   */
  _generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, match => {
        switch (match) {
          case 'ä': return 'ae';
          case 'ö': return 'oe';
          case 'ü': return 'ue';
          case 'ß': return 'ss';
          default: return match;
        }
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Eine Singleton-Instanz des ContentService erstellen
const contentService = new ContentService();

// Service exportieren
export default contentService;