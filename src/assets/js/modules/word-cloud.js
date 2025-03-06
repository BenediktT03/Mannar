 /**
 * word-cloud.js
 * Manages the word cloud functionality for both frontend and admin
 */

import { loadWordCloud, saveWordCloud } from './content-manager.js';
import { showStatus } from '../core/utils.js';
import { WORD_CLOUD_DEFAULTS } from '../core/config.js';

// Module state
let wordCloudData = [];
let wordCloudInitialized = false;
let isDirty = false;

/**
 * Initialize the word cloud module
 * @param {string} mode - 'frontend' or 'admin'
 * @returns {Object} Word cloud methods
 */
export function initWordCloud(mode = 'frontend') {
  // Initialize for frontend or admin based on mode
  if (mode === 'admin') {
    initAdminWordCloud();
  } else {
    initFrontendWordCloud();
  }
  
  return {
    renderWordCloud,
    addWord,
    removeWord,
    updateWord,
    saveChanges,
    getWordCloudData,
    previewWordCloud
  };
}

/**
 * Initialize word cloud for the frontend
 */
async function initFrontendWordCloud() {
  const wordCloudContainer = document.querySelector('.textbubble');
  if (!wordCloudContainer) return;
  
  try {
    // Load word cloud data
    const words = await loadWordCloud();
    
    if (words && words.length > 0) {
      wordCloudData = words;
    } else {
      wordCloudData = WORD_CLOUD_DEFAULTS.defaultWords;
    }
    
    // Render word cloud
    renderWordCloud(wordCloudData, 'wordCloudList');
    
    wordCloudInitialized = true;
  } catch (error) {
    console.error('Error initializing frontend word cloud:', error);
    
    // Use default words as fallback
    wordCloudData = WORD_CLOUD_DEFAULTS.defaultWords;
    renderWordCloud(wordCloudData, 'wordCloudList');
  }
}

/**
 * Initialize word cloud for the admin panel
 */
async function initAdminWordCloud() {
  const wordCloudContainer = document.getElementById('wordCloudContainer');
  if (!wordCloudContainer) return;
  
  try {
    // Load word cloud data
    const words = await loadWordCloud();
    
    if (words && words.length > 0) {
      wordCloudData = words;
    } else {
      wordCloudData = WORD_CLOUD_DEFAULTS.defaultWords;
    }
    
    // Render admin word cloud interface
    renderAdminWordCloud();
    
    // Set up event handlers
    setupAdminEventHandlers();
    
    wordCloudInitialized = true;
  } catch (error) {
    console.error('Error initializing admin word cloud:', error);
    showStatus('Error loading word cloud data', true);
    
    // Use default words as fallback
    wordCloudData = WORD_CLOUD_DEFAULTS.defaultWords;
    renderAdminWordCloud();
  }
}

/**
 * Render word cloud in the frontend
 * @param {Array} words - Word cloud items
 * @param {string} containerId - Container element ID
 */
export function renderWordCloud(words, containerId = 'wordCloudList') {
  const wordCloudList = document.getElementById(containerId);
  if (!wordCloudList) return;
  
  // Clear existing content
  wordCloudList.innerHTML = '';
  
  // Create word cloud items
  words.forEach(word => {
    if (!word || !word.text) return;
    
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    a.href = word.link || "#";
    a.setAttribute('data-weight', word.weight || "5");
    a.textContent = word.text;
    
    // Add animation properties
    a.style.opacity = '0';
    a.style.transform = 'translateY(20px)';
    
    li.appendChild(a);
    wordCloudList.appendChild(li);
  });
  
  // Animate word cloud items
  animateWordCloud();
}

/**
 * Animate word cloud items
 */
function animateWordCloud() {
  const wordCloudContainer = document.querySelector('.textbubble');
  if (!wordCloudContainer) return;
  
  const wordCloudLinks = document.querySelectorAll('.word-cloud li a');
  if (!wordCloudLinks.length) return;
  
  // Use IntersectionObserver if available
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateWords(wordCloudLinks);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(wordCloudContainer);
  } else {
    // Fallback for older browsers
    animateWords(wordCloudLinks);
  }
}

/**
 * Animate individual words with staggered delay
 * @param {NodeList} wordCloudLinks - Word elements to animate
 */
function animateWords(wordCloudLinks) {
  wordCloudLinks.forEach((word, index) => {
    setTimeout(() => {
      word.style.opacity = '1';
      word.style.transform = 'translateY(0)';
    }, 50 * index);
  });
}

/**
 * Render word cloud editor in the admin panel
 */
function renderAdminWordCloud() {
  const wordCloudContainer = document.getElementById('wordCloudContainer');
  if (!wordCloudContainer) return;
  
  wordCloudContainer.innerHTML = '';
  
  if (wordCloudData.length === 0) {
    wordCloudContainer.innerHTML = `
      <div class="w3-panel w3-pale-yellow w3-center">
        <p>No words in the word cloud. Click "Add New Word" to get started.</p>
      </div>
    `;
    return;
  }
  
  // Create table for better structure
  const tableContainer = document.createElement('div');
  tableContainer.className = 'w3-responsive';
  
  const table = document.createElement('table');
  table.className = 'w3-table w3-bordered w3-striped';
  
  // Table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr class="w3-light-grey">
      <th style="width:5%">Nr.</th>
      <th style="width:35%">Word</th>
      <th style="width:15%">Weight (1-9)</th>
      <th style="width:35%">Link</th>
      <th style="width:10%">Action</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  tbody.id = 'wordCloudTableBody';
  
  wordCloudData.forEach((word, index) => {
    const tr = createWordTableRow(word, index);
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  wordCloudContainer.appendChild(tableContainer);
  
  // Initialize drag-and-drop functionality if Sortable is available
  if (typeof Sortable !== 'undefined') {
    Sortable.create(tbody, {
      handle: '.draggable-handle',
      animation: 150,
      onEnd: function() {
        // Update word cloud data based on new order
        updateWordCloudOrder();
      }
    });
  }
}

/**
 * Create a table row for a word in the admin panel
 * @param {Object} word - Word data
 * @param {number} index - Word index
 * @returns {HTMLElement} Table row element
 */
function createWordTableRow(word, index) {
  const tr = document.createElement('tr');
  tr.className = 'word-item';
  tr.dataset.index = index;
  
  tr.innerHTML = `
    <td class="draggable-handle" style="cursor:move">
      <i class="fas fa-grip-lines"></i> ${index + 1}
    </td>
    <td>
      <input type="text" class="w3-input w3-border word-text" value="${word.text || ''}" data-original="${word.text || ''}" placeholder="Word text">
    </td>
    <td>
      <input type="number" class="w3-input w3-border word-weight" value="${word.weight || 5}" data-original="${word.weight || 5}" min="1" max="9" placeholder="1-9">
    </td>
    <td>
      <input type="text" class="w3-input w3-border word-link" value="${word.link || '#'}" data-original="${word.link || '#'}" placeholder="Link (optional)">
    </td>
    <td class="w3-center">
      <button class="w3-button w3-red w3-round delete-word-btn">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  
  return tr;
}

/**
 * Set up event handlers for the admin word cloud
 */
function setupAdminEventHandlers() {
  // Add word button
  const addWordBtn = document.getElementById('addWordBtn');
  if (addWordBtn) {
    addWordBtn.addEventListener('click', () => {
      addWord({ text: '', weight: 5, link: '#' });
    });
  }
  
  // Save button
  const saveWordCloudBtn = document.getElementById('saveWordCloudBtn');
  if (saveWordCloudBtn) {
    saveWordCloudBtn.addEventListener('click', saveChanges);
  }
  
  // Preview button
  const previewWordCloudBtn = document.getElementById('previewWordCloudBtn');
  if (previewWordCloudBtn) {
    previewWordCloudBtn.addEventListener('click', previewWordCloud);
  }
  
  // Add event delegation for word item interactions
  const wordCloudContainer = document.getElementById('wordCloudContainer');
  if (wordCloudContainer) {
    wordCloudContainer.addEventListener('click', (event) => {
      // Delete button
      if (event.target.closest('.delete-word-btn')) {
        const tr = event.target.closest('.word-item');
        if (tr) {
          const index = parseInt(tr.dataset.index, 10);
          if (!isNaN(index)) {
            removeWord(index);
          }
        }
      }
    });
    
    // Handle input changes
    wordCloudContainer.addEventListener('change', (event) => {
      if (event.target.classList.contains('word-text') ||
          event.target.classList.contains('word-weight') ||
          event.target.classList.contains('word-link')) {
        
        const tr = event.target.closest('.word-item');
        if (tr) {
          const index = parseInt(tr.dataset.index, 10);
          if (!isNaN(index)) {
            const textInput = tr.querySelector('.word-text');
            const weightInput = tr.querySelector('.word-weight');
            const linkInput = tr.querySelector('.word-link');
            
            updateWord(index, {
              text: textInput.value,
              weight: parseInt(weightInput.value, 10) || 5,
              link: linkInput.value || '#'
            });
          }
        }
      }
    });
  }
}

/**
 * Update word cloud data order based on DOM order
 */
function updateWordCloudOrder() {
  const tbody = document.getElementById('wordCloudTableBody');
  if (!tbody) return;
  
  const rows = tbody.querySelectorAll('.word-item');
  const newData = [];
  
  rows.forEach((row, index) => {
    // Update row index
    row.dataset.index = index;
    
    // Update row number display
    const indexCell = row.querySelector('.draggable-handle');
    if (indexCell) {
      indexCell.innerHTML = `<i class="fas fa-grip-lines"></i> ${index + 1}`;
    }
    
    // Get input values
    const textInput = row.querySelector('.word-text');
    const weightInput = row.querySelector('.word-weight');
    const linkInput = row.querySelector('.word-link');
    
    if (textInput && weightInput && linkInput) {
      newData.push({
        text: textInput.value,
        weight: parseInt(weightInput.value, 10) || 5,
        link: linkInput.value || '#'
      });
    }
  });
  
  // Update word cloud data
  wordCloudData = newData;
  isDirty = true;
}

/**
 * Add a new word to the word cloud
 * @param {Object} word - Word data
 */
export function addWord(word = {}) {
  // Create default word if not provided
  const newWord = {
    text: word.text || '',
    weight: word.weight || 5,
    link: word.link || '#'
  };
  
  // Add to word cloud data
  wordCloudData.push(newWord);
  
  // Update the UI if in admin mode
  const tbody = document.getElementById('wordCloudTableBody');
  if (tbody) {
    const index = wordCloudData.length - 1;
    const tr = createWordTableRow(newWord, index);
    tbody.appendChild(tr);
  }
  
  isDirty = true;
}

/**
 * Remove a word from the word cloud
 * @param {number} index - Word index to remove
 */
export function removeWord(index) {
  if (index < 0 || index >= wordCloudData.length) return;
  
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this word?')) {
    return;
  }
  
  // Remove from word cloud data
  wordCloudData.splice(index, 1);
  
  // Re-render admin word cloud
  renderAdminWordCloud();
  
  isDirty = true;
}

/**
 * Update a word in the word cloud
 * @param {number} index - Word index to update
 * @param {Object} newData - New word data
 */
export function updateWord(index, newData) {
  if (index < 0 || index >= wordCloudData.length) return;
  
  // Update word
  wordCloudData[index] = {
    ...wordCloudData[index],
    ...newData
  };
  
  isDirty = true;
}

/**
 * Save word cloud changes to Firestore
 */
export async function saveChanges() {
  try {
    // Show loading status
    showStatus('Saving word cloud...', false, 0);
    
    // Save to Firestore
    await saveWordCloud(wordCloudData);
    
    // Success message
    showStatus('Word cloud saved successfully');
    
    isDirty = false;
  } catch (error) {
    console.error('Error saving word cloud:', error);
    showStatus(`Error saving word cloud: ${error.message}`, true);
  }
}

/**
 * Get the current word cloud data
 * @returns {Array} Word cloud data
 */
export function getWordCloudData() {
  return wordCloudData;
}

/**
 * Preview the word cloud in a new window
 */
export function previewWordCloud() {
  // Create preview window
  const previewWindow = window.open('', '_blank');
  
  // Create preview HTML
  const previewHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Word Cloud Preview</title>
      <link rel="stylesheet" href="./assets/css/styles.css">
      <style>
        body { padding: 2rem; font-family: 'Lato', sans-serif; }
        .preview-container { max-width: 800px; margin: 0 auto; }
        .preview-title { text-align: center; margin-bottom: 2rem; }
        .back-btn { position: fixed; top: 1rem; right: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        
        /* Word Cloud Styles */
        .textbubble {
          width: 90%;
          max-width: 1000px;
          margin: 2rem auto;
          padding: 2rem 0;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .word-cloud {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          list-style: none;
          padding: 0;
          margin: 0;
          line-height: 2.5rem;
          width: 100%;
        }

        .word-cloud li {
          display: inline-block;
          margin: 0.25rem;
        }

        .word-cloud a {
          display: inline-block;
          padding: 0.125rem 0.25rem;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s ease;
          will-change: transform, opacity, color;
        }

        /* Weight-based styling */
        .word-cloud a[data-weight="1"] { font-size: 0.8rem; color: #909090; }
        .word-cloud a[data-weight="2"] { font-size: 0.9rem; color: #808080; }
        .word-cloud a[data-weight="3"] { font-size: 1rem; color: #707070; }
        .word-cloud a[data-weight="4"] { font-size: 1.1rem; color: #606060; }
        .word-cloud a[data-weight="5"] { font-size: 1.2rem; color: #505050; }
        .word-cloud a[data-weight="6"] { font-size: 1.4rem; color: #404040; }
        .word-cloud a[data-weight="7"] { font-size: 1.6rem; color: #303030; }
        .word-cloud a[data-weight="8"] { font-size: 1.8rem; color: #202020; }
        .word-cloud a[data-weight="9"] { font-size: 2.0rem; color: #101010; }
      </style>
    </head>
    <body>
      <button class="back-btn" onclick="window.close()">Close</button>
      <div class="preview-container">
        <h1 class="preview-title">Word Cloud Preview</h1>
        
        <div class="textbubble">
          <ul class="word-cloud" role="navigation" aria-label="Word Cloud">
            ${wordCloudData.map(word => `
              <li>
                <a href="${word.link || '#'}" data-weight="${word.weight || 5}">${word.text || 'Word'}</a>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Write to preview window
  previewWindow.document.write(previewHTML);
  previewWindow.document.close();
}

// Initialize when this module is loaded
initWordCloud();