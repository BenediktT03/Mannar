 /**
 * Word Cloud Manager
 * 
 * Manages the word cloud in the admin panel. Provides functionality to
 * add, edit, delete, and reorder words, with a live preview.
 */

const WordCloudManager = (function() {
    // Private variables
    let words = [];
    let sortable = null;
    let isInitialized = false;
    
    // DOM elements
    let wordCloudContainer;
    let addWordBtn;
    let previewBtn;
    let saveBtn;
    let csrfToken;
    
    /**
     * Initialize the word cloud manager
     */
    function init() {
        // Check if already initialized
        if (isInitialized) return;
        
        // Get DOM elements
        wordCloudContainer = document.getElementById('wordCloudContainer');
        addWordBtn = document.getElementById('addWordBtn');
        previewBtn = document.getElementById('previewWordCloudBtn');
        saveBtn = document.getElementById('saveWordCloudBtn');
        
        // Get CSRF token
        const tokenInput = document.querySelector('input[name="csrf_token"]');
        csrfToken = tokenInput ? tokenInput.value : '';
        
        // Check if required elements exist
        if (!wordCloudContainer || !addWordBtn || !previewBtn || !saveBtn) {
            console.warn('Word Cloud Manager: Required elements not found');
            return;
        }
        
        // Load word cloud data
        loadWordCloudData();
        
        // Set up event listeners
        addWordBtn.addEventListener('click', addNewWord);
        previewBtn.addEventListener('click', previewWordCloud);
        saveBtn.addEventListener('click', saveWordCloud);
        
        isInitialized = true;
        console.log('Word Cloud Manager initialized');
    }
    
    /**
     * Load word cloud data from the server
     */
    function loadWordCloudData() {
        // Show loading state
        wordCloudContainer.innerHTML = '<div class="w3-center"><i class="fas fa-spinner fa-spin"></i> Word Cloud wird geladen...</div>';
        
        // Fetch word cloud data
        fetch('admin.php?action=api&endpoint=wordcloud', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                words = data.data;
                renderWordCloudEditor();
            } else {
                // Show error
                wordCloudContainer.innerHTML = '<div class="w3-panel w3-pale-red w3-leftbar w3-border-red"><p>Fehler beim Laden der Word Cloud. Bitte versuchen Sie es später erneut.</p></div>';
            }
        })
        .catch(error => {
            console.error('Error loading word cloud:', error);
            wordCloudContainer.innerHTML = '<div class="w3-panel w3-pale-red w3-leftbar w3-border-red"><p>Fehler beim Laden der Word Cloud. Bitte versuchen Sie es später erneut.</p></div>';
        });
    }
    
    /**
     * Render the word cloud editor
     */
    function renderWordCloudEditor() {
        // Clear container
        wordCloudContainer.innerHTML = '';
        
        // Show message if no words
        if (!words || words.length === 0) {
            wordCloudContainer.innerHTML = '<div class="w3-panel w3-pale-yellow w3-leftbar w3-border-yellow"><p>Keine Wörter in der Word Cloud. Klicken Sie auf "Neues Wort hinzufügen", um zu beginnen.</p></div>';
            return;
        }
        
        // Create container for sortable words
        const wordsList = document.createElement('div');
        wordsList.id = 'wordsList';
        wordsList.className = 'words-list';
        
        // Add each word
        words.forEach((word, index) => {
            const wordItem = createWordItem(word, index);
            wordsList.appendChild(wordItem);
        });
        
        wordCloudContainer.appendChild(wordsList);
        
        // Initialize sortable
        if (typeof Sortable !== 'undefined') {
            sortable = Sortable.create(wordsList, {
                animation: 150,
                handle: '.word-drag-handle',
                onEnd: handleWordReorder
            });
        }
    }
    
    /**
     * Create a word item element
     * @param {Object} word - Word data
     * @param {number} index - Word index
     * @returns {HTMLElement} Word item element
     */
    function createWordItem(word, index) {
        const item = document.createElement('div');
        item.className = 'word-item';
        item.dataset.index = index;
        
        // Drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'word-drag-handle';
        dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
        item.appendChild(dragHandle);
        
        // Word text input
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'w3-input w3-border word-text';
        textInput.name = `word_text_${index}`;
        textInput.placeholder = 'Wort';
        textInput.value = word.text || '';
        textInput.addEventListener('change', () => updateWord(index, 'text', textInput.value));
        item.appendChild(textInput);
        
        // Word weight select
        const weightSelect = document.createElement('select');
        weightSelect.className = 'w3-select w3-border word-weight';
        weightSelect.name = `word_weight_${index}`;
        
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === (word.weight || 5)) {
                option.selected = true;
            }
            weightSelect.appendChild(option);
        }
        
        weightSelect.addEventListener('change', () => updateWord(index, 'weight', parseInt(weightSelect.value, 10)));
        item.appendChild(weightSelect);
        
        // Word link input
        const linkInput = document.createElement('input');
        linkInput.type = 'text';
        linkInput.className = 'w3-input w3-border word-link';
        linkInput.name = `word_link_${index}`;
        linkInput.placeholder = 'Link (optional)';
        linkInput.value = word.link || '';
        linkInput.addEventListener('change', () => updateWord(index, 'link', linkInput.value));
        item.appendChild(linkInput);
        
        // Word actions
        const actions = document.createElement('div');
        actions.className = 'word-actions';
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-word';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Wort löschen';
        deleteBtn.addEventListener('click', () => deleteWord(index));
        actions.appendChild(deleteBtn);
        
        item.appendChild(actions);
        
        return item;
    }
    
    /**
     * Add a new word to the word cloud
     */
    function addNewWord() {
        const newWord = {
            text: '',
            weight: 5,
            link: ''
        };
        
        words.push(newWord);
        renderWordCloudEditor();
        
        // Focus on the text input of the new word
        setTimeout(() => {
            const wordsList = document.getElementById('wordsList');
            const lastWordItem = wordsList.lastElementChild;
            const textInput = lastWordItem.querySelector('.word-text');
            
            if (textInput) {
                textInput.focus();
            }
        }, 100);
    }
    
    /**
     * Update a word property
     * @param {number} index - Word index
     * @param {string} property - Property to update
     * @param {*} value - New value
     */
    function updateWord(index, property, value) {
        if (!words[index]) return;
        
        words[index][property] = value;
    }
    
    /**
     * Delete a word
     * @param {number} index - Word index
     */
    function deleteWord(index) {
        if (confirm('Sind Sie sicher, dass Sie dieses Wort löschen möchten?')) {
            words.splice(index, 1);
            renderWordCloudEditor();
        }
    }
    
    /**
     * Handle word reordering
     * @param {Event} event - Sortable end event
     */
    function handleWordReorder(event) {
        const oldIndex = event.oldIndex;
        const newIndex = event.newIndex;
        
        if (oldIndex === newIndex) return;
        
        // Move the word in the array
        const word = words.splice(oldIndex, 1)[0];
        words.splice(newIndex, 0, word);
    }
    
    /**
     * Preview the word cloud
     */
    function previewWordCloud() {
        // Validate words
        if (!validateWords()) {
            return;
        }
        
        // Open preview in new window
        const previewWindow = window.open('preview.php?draft=true', '_blank', 'width=800,height=600');
        
        if (!previewWindow) {
            alert('Bitte erlauben Sie Popups für diese Website, um die Vorschau anzuzeigen.');
        }
    }
    
    /**
     * Save the word cloud
     */
    function saveWordCloud() {
        // Validate words
        if (!validateWords()) {
            return;
        }
        
        // Show loading state
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichern...';
        
        // Prepare data
        const data = {
            words: words,
            csrf_token: csrfToken
        };
        
        // Send data to server
        fetch('admin.php?action=api&endpoint=wordcloud', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            // Reset button
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Word Cloud speichern';
            
            if (data.success) {
                // Show success message
                if (typeof AdminCore !== 'undefined' && AdminCore.showStatus) {
                    AdminCore.showStatus('Word Cloud erfolgreich gespeichert', false);
                } else {
                    alert('Word Cloud erfolgreich gespeichert');
                }
            } else {
                // Show error
                if (typeof AdminCore !== 'undefined' && AdminCore.showStatus) {
                    AdminCore.showStatus(data.error || 'Fehler beim Speichern der Word Cloud', true);
                } else {
                    alert(data.error || 'Fehler beim Speichern der Word Cloud');
                }
            }
        })
        .catch(error => {
            console.error('Error saving word cloud:', error);
            
            // Reset button
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Word Cloud speichern';
            
            // Show error
            if (typeof AdminCore !== 'undefined' && AdminCore.showStatus) {
                AdminCore.showStatus('Fehler beim Speichern der Word Cloud', true);
            } else {
                alert('Fehler beim Speichern der Word Cloud');
            }
        });
    }
    
    /**
     * Validate words before saving or previewing
     * @returns {boolean} Validation result
     */
    function validateWords() {
        // Check if there are words
        if (!words || words.length === 0) {
            alert('Die Word Cloud enthält keine Wörter. Bitte fügen Sie mindestens ein Wort hinzu.');
            return false;
        }
        
        // Check if all words have text
        const emptyWords = words.filter(word => !word.text.trim());
        
        if (emptyWords.length > 0) {
            alert('Bitte geben Sie für alle Wörter einen Text ein.');
            return false;
        }
        
        return true;
    }
    
    // Public API
    return {
        init,
        loadWordCloudData,
        renderWordCloudEditor
    };
})();

// Make globally available
window.WordCloudManager = WordCloudManager;