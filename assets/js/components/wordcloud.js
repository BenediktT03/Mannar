 /**
 * WordCloud Component
 * 
 * Erstellt und verwaltet eine interaktive Wortwolke zur Visualisierung von Begriffen
 * mit unterschiedlicher Gewichtung. Die Größe jedes Wortes ist proportional zu
 * seiner Häufigkeit oder Wichtigkeit.
 * 
 * @author Ihr Name
 * @version 1.0.0
 */

import { errorHandler } from '../utils/error-handler.js';
import { animateElement } from '../utils/ui-utils.js';
import { contentService } from '../services/content.js';

/**
 * WordCloud Klasse - Verwaltet die Wortwolke-Funktionalität
 */
class WordCloud {
  /**
   * Erstellt eine neue WordCloud-Instanz
   * @param {string} containerId - ID des Container-Elements für die Wortwolke
   * @param {Object} options - Konfigurationsoptionen für die Wortwolke
   */
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      errorHandler.logError(`Container mit ID "${containerId}" wurde nicht gefunden.`);
      return;
    }
    
    // Standard-Optionen mit übergebenen Optionen zusammenführen
    this.options = {
      maxFontSize: options.maxFontSize || 36,
      minFontSize: options.minFontSize || 12,
      fontFamily: options.fontFamily || 'Arial, sans-serif',
      colorScheme: options.colorScheme || ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'],
      shuffleColors: options.shuffleColors !== undefined ? options.shuffleColors : true,
      animated: options.animated !== undefined ? options.animated : true,
      clickable: options.clickable !== undefined ? options.clickable : true,
      maxWords: options.maxWords || 100,
      dataSrc: options.dataSrc || null
    };
    
    this.words = [];
    this.isInitialized = false;
    
    // Event-Listener registrieren
    if (this.options.clickable) {
      this.container.addEventListener('click', this._handleWordClick.bind(this));
    }
    
    // Fenstergröße beachten
    window.addEventListener('resize', this._debounce(this.redraw.bind(this), 250));
  }
  
  /**
   * Initialisiert die Wortwolke
   * @param {Array} data - Array von Wort-Objeken [{ text: 'Wort', weight: 10 }]
   * @returns {Promise} - Promise, der nach Abschluss der Initialisierung aufgelöst wird
   */
  async init(data = null) {
    try {
      // Wenn keine Daten übergeben wurden, versuche sie über dataSrc zu laden
      if (!data && this.options.dataSrc) {
        data = await this._fetchData(this.options.dataSrc);
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        errorHandler.logError('Keine gültigen Daten für die Wortwolke gefunden.');
        return false;
      }
      
      // Auf die maximale Anzahl von Wörtern begrenzen
      this.words = data.slice(0, this.options.maxWords);
      
      // Höchstes und niedrigstes Gewicht finden
      this._normalizeWeights();
      
      // Wortwolke zeichnen
      this.redraw();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      errorHandler.logError('Fehler bei der Initialisierung der Wortwolke:', error);
      return false;
    }
  }
  
  /**
   * Zeichnet die Wortwolke neu
   */
  redraw() {
    if (!this.container || this.words.length === 0) return;
    
    // Container leeren
    this.container.innerHTML = '';
    
    // Wortwolke erstellen
    const fragment = document.createDocumentFragment();
    const containerWidth = this.container.offsetWidth;
    
    this.words.forEach((word, index) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'wordcloud-word';
      wordEl.textContent = word.text;
      wordEl.dataset.weight = word.weight;
      wordEl.dataset.normalizedWeight = word.normalizedWeight;
      
      // Wortgröße basierend auf normalisiertem Gewicht
      const fontSize = this._calculateFontSize(word.normalizedWeight);
      wordEl.style.fontSize = `${fontSize}px`;
      
      // Farbe zuweisen
      const colorIndex = this.options.shuffleColors ? 
        Math.floor(Math.random() * this.options.colorScheme.length) : 
        index % this.options.colorScheme.length;
      wordEl.style.color = this.options.colorScheme[colorIndex];
      
      // Weitere Stile
      wordEl.style.fontFamily = this.options.fontFamily;
      wordEl.style.margin = '0.2em';
      wordEl.style.display = 'inline-block';
      wordEl.style.cursor = this.options.clickable ? 'pointer' : 'default';
      
      // Animation hinzufügen, wenn aktiviert
      if (this.options.animated) {
        const delay = index * 50; // Verzögerung für gestaffelte Animation
        setTimeout(() => {
          animateElement(wordEl, 'fadeIn');
        }, delay);
      }
      
      fragment.appendChild(wordEl);
    });
    
    this.container.appendChild(fragment);
    
    // Layout optimieren
    this._optimizeLayout();
  }
  
  /**
   * Aktualisiert die Wortwolke mit neuen Daten
   * @param {Array} newData - Neue Wortdaten
   */
  update(newData) {
    if (!newData || !Array.isArray(newData)) return;
    
    this.words = newData.slice(0, this.options.maxWords);
    this._normalizeWeights();
    this.redraw();
  }
  
  /**
   * Fügt Wörter zur bestehenden Wortwolke hinzu
   * @param {Array} additionalWords - Hinzuzufügende Wörter
   */
  addWords(additionalWords) {
    if (!additionalWords || !Array.isArray(additionalWords)) return;
    
    // Vorhandene Wörter ergänzen
    this.words = [...this.words, ...additionalWords]
      .slice(0, this.options.maxWords);
    
    this._normalizeWeights();
    this.redraw();
  }
  
  /**
   * Normalisiert die Gewichte der Wörter für konsistente Darstellung
   * @private
   */
  _normalizeWeights() {
    if (this.words.length === 0) return;
    
    // Höchstes und niedrigstes Gewicht finden
    const maxWeight = Math.max(...this.words.map(word => word.weight));
    const minWeight = Math.min(...this.words.map(word => word.weight));
    
    // Gewichte auf einen Wert zwischen 0 und 1 normalisieren
    this.words.forEach(word => {
      if (maxWeight === minWeight) {
        word.normalizedWeight = 0.5; // Falls alle Gewichte gleich sind
      } else {
        word.normalizedWeight = (word.weight - minWeight) / (maxWeight - minWeight);
      }
    });
  }
  
  /**
   * Berechnet die Schriftgröße basierend auf dem normalisierten Gewicht
   * @param {number} normalizedWeight - Normalisiertes Gewicht (0-1)
   * @returns {number} Schriftgröße in Pixeln
   * @private
   */
  _calculateFontSize(normalizedWeight) {
    return this.options.minFontSize + normalizedWeight * 
      (this.options.maxFontSize - this.options.minFontSize);
  }
  
  /**
   * Optimiert das Layout der Wortwolke
   * @private
   */
  _optimizeLayout() {
    // Hier könnte ein komplexerer Algorithmus für bessere Wortverteilung implementiert werden
    // Für einfache Implementierung wird CSS verwendet (siehe wordcloud.css)
  }
  
  /**
   * Event-Handler für Klicks auf Wörter
   * @param {Event} event - Click-Event
   * @private
   */
  _handleWordClick(event) {
    const target = event.target;
    
    // Prüfen, ob ein Wort angeklickt wurde
    if (target.classList.contains('wordcloud-word')) {
      const wordText = target.textContent;
      const wordWeight = parseFloat(target.dataset.weight);
      
      // Benutzerdefiniertes Event auslösen
      const wordClickEvent = new CustomEvent('wordcloud:wordclick', {
        detail: {
          word: wordText,
          weight: wordWeight,
          element: target
        },
        bubbles: true
      });
      
      this.container.dispatchEvent(wordClickEvent);
      
      // Optional: Zum Beispiel zum entsprechenden Begriff navigieren
      // window.location.href = `/search?q=${encodeURIComponent(wordText)}`;
    }
  }
  
  /**
   * Holt Daten für die Wortwolke vom Server
   * @param {string|Object} source - Datenquelle (URL oder Konfigurationsobjekt)
   * @returns {Promise<Array>} - Promise mit den geladenen Daten
   * @private
   */
  async _fetchData(source) {
    try {
      // Firebase-Integration über den contentService
      if (typeof source === 'string' && source.startsWith('firebase:')) {
        const collection = source.replace('firebase:', '');
        return await contentService.getWordCloudData(collection);
      }
      
      // Lokale oder API-URL
      if (typeof source === 'string') {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        return await response.json();
      }
      
      // Direktes Konfigurationsobjekt
      if (typeof source === 'object' && source !== null) {
        return source.data || [];
      }
      
      return [];
    } catch (error) {
      errorHandler.logError('Fehler beim Laden der Wortwolke-Daten:', error);
      return [];
    }
  }
  
  /**
   * Debounce-Hilfsfunktion für Event-Handler
   * @param {Function} func - Auszuführende Funktion
   * @param {number} wait - Wartezeit in Millisekunden
   * @returns {Function} Debounced Funktion
   * @private
   */
  _debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Export der Klasse für die Verwendung in anderen Modulen
export default WordCloud;

// Beispiel für die Verwendung:
/*
import WordCloud from './components/wordcloud.js';

document.addEventListener('DOMContentLoaded', async () => {
  const wordcloud = new WordCloud('wordcloud-container', {
    maxFontSize: 42,
    minFontSize: 14,
    colorScheme: ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8']
  });
  
  const wordData = [
    { text: 'Genesung', weight: 100 },
    { text: 'Begleitung', weight: 85 },
    { text: 'Unterstützung', weight: 75 },
    { text: 'Selbsthilfe', weight: 65 },
    { text: 'Gemeinschaft', weight: 60 },
    // weitere Wörter...
  ];
  
  await wordcloud.init(wordData);
  
  // Event-Listener für Wort-Klicks
  document.getElementById('wordcloud-container').addEventListener('wordcloud:wordclick', event => {
    console.log(`Wort geklickt: ${event.detail.word} (Gewicht: ${event.detail.weight})`);
  });
});
*/