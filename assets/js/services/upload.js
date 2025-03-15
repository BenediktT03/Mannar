/**
 * Upload Service
 * 
 * Verwaltet den Upload von Dateien zur Website.
 * Unterstützt Uploads zu Firebase Storage und optional zu anderen Speicheranbietern.
 * Bietet Funktionen für Dateivalidierung, Bildoptimierung und Fortschrittsüberwachung.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

import firebaseService from './firebase.js';
import authService from './auth.js';
import { errorHandler } from '../utils/error-handler.js';

/**
 * Upload Service Klasse
 */
class UploadService {
  /**
   * Erstellt eine neue UploadService-Instanz
   */
  constructor() {
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    this.allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    this.maxFileSize = 10 * 1024 * 1024; // 10 MB Standardgröße
  }
  
  /**
   * Prüft, ob eine Datei den gültigen Kriterien entspricht
   * @param {File} file - Zu prüfende Datei
   * @param {Object} options - Prüfungsoptionen
   * @returns {Object} Validierungsergebnis
   */
  validateFile(file, options = {}) {
    const result = {
      valid: true,
      errors: []
    };
    
    // Dateigröße prüfen
    const maxSize = options.maxSize || this.maxFileSize;
    if (file.size > maxSize) {
      result.valid = false;
      result.errors.push(`Die Datei ist zu groß. Maximale Größe: ${this._formatFileSize(maxSize)}.`);
    }
    
    // Dateityp prüfen
    if (options.allowedTypes && Array.isArray(options.allowedTypes)) {
      if (!options.allowedTypes.includes(file.type)) {
        result.valid = false;
        result.errors.push(`Ungültiger Dateityp. Erlaubte Typen: ${options.allowedTypes.join(', ')}.`);
      }
    } else if (options.fileCategory === 'image') {
      // Prüfen, ob es sich um ein gültiges Bild handelt
      if (!this.allowedImageTypes.includes(file.type)) {
        result.valid = false;
        result.errors.push('Ungültiges Bildformat. Erlaubte Formate: JPG, PNG, GIF, SVG, WebP.');
      }
    } else if (options.fileCategory === 'document') {
      // Prüfen, ob es sich um ein gültiges Dokument handelt
      if (!this.allowedDocumentTypes.includes(file.type)) {
        result.valid = false;
        result.errors.push('Ungültiges Dokumentformat. Erlaubte Formate: PDF, DOC, DOCX.');
      }
    }
    
    return result;
  }
  
  /**
   * Lädt eine Datei zu Firebase Storage hoch
   * @param {File} file - Hochzuladende Datei
   * @param {Object} options - Upload-Optionen
   * @returns {Promise<Object>} Upload-Ergebnis
   */
  async uploadFile(file, options = {}) {
    try {
      // Datei validieren
      const validationOptions = {
        maxSize: options.maxSize || this.maxFileSize,
        fileCategory: options.fileCategory || 'all',
        allowedTypes: options.allowedTypes || null
      };
      
      const validation = this.validateFile(file, validationOptions);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      // Firebase initialisieren
      await firebaseService.initialize();
      
      // Standard-Speicherpfad festlegen
      let storagePath = options.path || 'uploads';
      
      // Benutzer-Unterordner hinzufügen, falls authentifiziert
      const userId = authService.getCurrentUserId();
      if (userId && !options.skipUserFolder) {
        storagePath = `${storagePath}/${userId}`;
      }
      
      // Eindeutigen Dateinamen generieren
      const timestamp = Date.now();
      const fileName = options.fileName || this._sanitizeFileName(file.name);
      const fullPath = `${storagePath}/${timestamp}_${fileName}`;
      
      // Bild-Optimierung durchführen, falls für Bilder aktiviert
      let fileToUpload = file;
      if (options.optimizeImage && this.allowedImageTypes.includes(file.type) && file.type !== 'image/svg+xml') {
        fileToUpload = await this._optimizeImage(file, options.imageOptions);
      }
      
      // Upload-Task erstellen
      const uploadTask = firebaseService.storage.ref(fullPath).put(fileToUpload, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedBy: userId || 'anonymous',
          uploadedAt: timestamp.toString()
        }
      });
      
      // Fortschritts-Tracking
      if (options.onProgress && typeof options.onProgress === 'function') {
        uploadTask.on('state_changed', snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress(progress, snapshot);
        });
      }
      
      // Auf Upload-Abschluss warten
      await uploadTask;
      
      // Download-URL abrufen
      const downloadURL = await firebaseService.storage.ref(fullPath).getDownloadURL();
      
      // Metadaten abrufen
      const metadata = await firebaseService.storage.ref(fullPath).getMetadata();
      
      // Bei Bildern: Speichere einen Eintrag in der images-Sammlung
      if (this.allowedImageTypes.includes(file.type)) {
        await this._saveImageReference(downloadURL, metadata, file);
      }
      
      return {
        success: true,
        url: downloadURL,
        path: fullPath,
        fileName: fileName,
        originalName: file.name,
        contentType: file.type,
        size: metadata.size,
        metadata: metadata
      };
    } catch (error) {
      errorHandler.logError('Fehler beim Hochladen der Datei:', error);
      return {
        success: false,
        errors: ['Beim Hochladen der Datei ist ein Fehler aufgetreten.']
      };
    }
  }
  
  /**
   * Lädt mehrere Dateien hoch
   * @param {FileList|Array} files - Hochzuladende Dateien
   * @param {Object} options - Upload-Optionen
   * @returns {Promise<Array>} Upload-Ergebnisse
   */
  async uploadMultipleFiles(files, options = {}) {
    const results = [];
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const result = await this.uploadFile(file, options);
      results.push(result);
      
      // Gesamtfortschritt berechnen
      if (options.onProgress && typeof options.onProgress === 'function') {
        const currentIndex = fileArray.indexOf(file);
        const totalProgress = ((currentIndex + 1) / fileArray.length) * 100;
        options.onProgress(totalProgress, { currentFile: file, currentIndex, totalFiles: fileArray.length });
      }
    }
    
    return results;
  }
  
  /**
   * Löscht eine Datei aus dem Firebase Storage
   * @param {string} path - Pfad der zu löschenden Datei
   * @returns {Promise<boolean>} True bei Erfolg
   */
  async deleteFile(path) {
    try {
      await firebaseService.initialize();
      
      // Referenz zur Datei erstellen
      const fileRef = firebaseService.storage.ref(path);
      
      // Metadaten abrufen (für Bildverweise)
      let metadata;
      try {
        metadata = await fileRef.getMetadata();
      } catch (error) {
        // Datei existiert möglicherweise nicht
        console.warn(`Datei ${path} existiert nicht oder Metadaten konnten nicht abgerufen werden.`);
      }
      
      // Datei löschen
      await fileRef.delete();
      
      // Bei Bildern: Eintrag in der images-Sammlung löschen
      if (metadata && this.allowedImageTypes.includes(metadata.contentType)) {
        await this._deleteImageReference(path);
      }
      
      return true;
    } catch (error) {
      errorHandler.logError(`Fehler beim Löschen der Datei ${path}:`, error);
      return false;
    }
  }
  
  /**
   * Ruft Dateien aus einem Verzeichnis im Firebase Storage ab
   * @param {string} directory - Abzurufendes Verzeichnis
   * @returns {Promise<Array>} Array von Dateiobjekten
   */
  async getFiles(directory) {
    try {
      await firebaseService.initialize();
      
      const storageRef = firebaseService.storage.ref(directory);
      const result = await storageRef.listAll();
      
      // Metadaten und URLs für alle Dateien abrufen
      const filePromises = result.items.map(async (itemRef) => {
        try {
          const url = await itemRef.getDownloadURL();
          const metadata = await itemRef.getMetadata();
          
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url: url,
            contentType: metadata.contentType,
            size: metadata.size,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            customMetadata: metadata.customMetadata || {}
          };
        } catch (error) {
          console.warn(`Fehler beim Abrufen der Metadaten für ${itemRef.fullPath}:`, error);
          return null;
        }
      });
      
      // Unterverzeichnisse abrufen
      const prefixes = result.prefixes.map(prefix => ({
        name: prefix.name,
        fullPath: prefix.fullPath,
        isDirectory: true
      }));
      
      // Auf alle Datei-Promises warten
      const files = await Promise.all(filePromises);
      
      // Nullwerte filtern und mit Verzeichnissen zusammenführen
      return [...prefixes, ...files.filter(file => file !== null)];
    } catch (error) {
      errorHandler.logError(`Fehler beim Abrufen der Dateien aus ${directory}:`, error);
      return [];
    }
  }
  
  /**
   * Speichert einen Eintrag über ein hochgeladenes Bild in Firestore
   * @param {string} url - Download-URL des Bildes
   * @param {Object} metadata - Metadaten des Bildes
   * @param {File} originalFile - Originale Datei-Referenz
   * @returns {Promise<string>} ID des erstellten Dokuments
   * @private
   */
  async _saveImageReference(url, metadata, originalFile) {
    try {
      const imageData = {
        url: url,
        path: metadata.fullPath,
        fileName: metadata.name,
        originalName: originalFile.name,
        contentType: metadata.contentType,
        size: metadata.size,
        dimensions: await this._getImageDimensions(originalFile),
        uploadedBy: metadata.customMetadata?.uploadedBy || 'anonymous',
        uploadedAt: new Date(parseInt(metadata.customMetadata?.uploadedAt || Date.now())),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // In Firestore speichern
      const docRef = await firebaseService.db.collection('images').add(imageData);
      return docRef.id;
    } catch (error) {
      console.warn('Fehler beim Speichern der Bildreferenz:', error);
      return null;
    }
  }
  
  /**
   * Löscht den Eintrag eines Bildes aus Firestore
   * @param {string} path - Pfad des Bildes im Storage
   * @returns {Promise<boolean>} True bei Erfolg
   * @private
   */
  async _deleteImageReference(path) {
    try {
      const querySnapshot = await firebaseService.db.collection('images')
        .where('path', '==', path)
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        await querySnapshot.docs[0].ref.delete();
      }
      
      return true;
    } catch (error) {
      console.warn('Fehler beim Löschen der Bildreferenz:', error);
      return false;
    }
  }
  
  /**
   * Optimiert ein Bild vor dem Upload
   * @param {File} imageFile - Zu optimierendes Bild
   * @param {Object} options - Optimierungsoptionen
   * @returns {Promise<Blob>} Optimiertes Bild
   * @private
   */
  async _optimizeImage(imageFile, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Standardoptionen
        const defaultOptions = {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: 'jpeg'
        };
        
        const imageOptions = { ...defaultOptions, ...options };
        
        // Bild in ein HTML-Bild laden
        const img = new Image();
        img.onload = () => {
          // Canvas erstellen
          const canvas = document.createElement('canvas');
          
          // Bildabmessungen berechnen
          let width = img.width;
          let height = img.height;
          
          // Bild bei Bedarf verkleinern
          if (width > imageOptions.maxWidth || height > imageOptions.maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = Math.min(width, imageOptions.maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, imageOptions.maxHeight);
              width = height * aspectRatio;
            }
          }
          
          // Canvas-Größe festlegen
          canvas.width = width;
          canvas.height = height;
          
          // Bild auf Canvas zeichnen
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Bild komprimieren und in gewünschtem Format exportieren
          const mimeType = imageOptions.format === 'png' ? 'image/png' : 'image/jpeg';
          
          // Canvas in Blob umwandeln
          canvas.toBlob(blob => {
            resolve(blob);
          }, mimeType, imageOptions.quality);
        };
        
        img.onerror = () => {
          // Bei Fehler die Originaldatei verwenden
          console.warn('Bildoptimierung fehlgeschlagen, verwende Originaldatei.');
          resolve(imageFile);
        };
        
        // Bild laden
        img.src = URL.createObjectURL(imageFile);
      } catch (error) {
        console.warn('Fehler bei der Bildoptimierung:', error);
        resolve(imageFile); // Originaldatei zurückgeben
      }
    });
  }
  
  /**
   * Ermittelt die Abmessungen eines Bildes
   * @param {File} imageFile - Bilddatei
   * @returns {Promise<Object>} Bildabmessungen { width, height }
   * @private
   */
  _getImageDimensions(imageFile) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
          URL.revokeObjectURL(img.src); // Ressource freigeben
        };
        
        img.onerror = () => {
          resolve({ width: 0, height: 0 });
          URL.revokeObjectURL(img.src);
        };
        
        img.src = URL.createObjectURL(imageFile);
      } catch (error) {
        resolve({ width: 0, height: 0 });
      }
    });
  }
  
  /**
   * Formatiert die Dateigröße in lesbare Einheiten
   * @param {number} bytes - Dateigröße in Bytes
   * @returns {string} Formatierte Dateigröße
   * @private
   */
  _formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
  
  /**
   * Bereinigt einen Dateinamen für die Verwendung in URLs
   * @param {string} fileName - Zu bereinigender Dateiname
   * @returns {string} Bereinigter Dateiname
   * @private
   */
  _sanitizeFileName(fileName) {
    // Dateinamen in Basis- und Erweiterungsteil aufteilen
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
    
    // Basisname bereinigen: Umlaute ersetzen, unerwünschte Zeichen entfernen
    const cleanBaseName = baseName
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
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Bereinigten Namen mit Erweiterung zurückgeben
    return cleanBaseName + extension;
  }
}

// Eine Singleton-Instanz des UploadService erstellen
const uploadService = new UploadService();

// Service exportieren
export default uploadService;