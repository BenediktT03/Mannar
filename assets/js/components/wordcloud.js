/**
 * Word Cloud Component
 * 
 * Handles the functionality for the interactive word cloud on the Mannar website.
 * Manages word display, animations, and interactions.
 * 
 * @module WordCloud
 */

// Import services
import { ContentService } from '../services/content.js';

/**
 * Word Cloud namespace
 */
export const WordCloud = {
    /**
     * Configuration options
     */
    config: {
        containerSelector: '.word-cloud',
        animationDelay: 50,
        animationClass: 'animated',
        loadingClass: 'loading',
        shuffleWords: true,
        enableHoverEffects: true
    },
    
    /**
     * Word Cloud state
     */
    state: {
        words: [],
        isLoading: false,
        initialized: false,
        containers: []
    },
    
    /**
     * Initialize Word Cloud
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
        // Merge options with default config
        this.config = { ...this.config, ...options };
        
        // Find all word cloud containers
        const containers = document.querySelectorAll(this.config.containerSelector);
        
        if (containers.length === 0) {
            // No containers found, nothing to initialize
            return;
        }
        
        // Store containers
        this.state.containers = Array.from(containers);
        this.state.initialized = true;
        
        // Load word cloud data for each container
        this.state.containers.forEach(container => {
            // Add loading class
            container.classList.add(this.config.loadingClass);
            
            // Check if container has a data source
            const dataSource = container.getAttribute('data-source');
            
            if (dataSource) {
                // Load from specific data source
                this.loadFromSource(dataSource, container);
            } else {
                // Load from default source
                this.loadWordCloudData(container);
            }
        });
        
        // Set up event listeners
        if (this.config.enableHoverEffects) {
            this.setupHoverEffects();
        }
        
        console.log('Word Cloud initialized');
    },
    
    /**
     * Load word cloud data from Firebase
     * @param {Element} container - Container element
     */
    loadWordCloudData: function(container) {
        this.state.isLoading = true;
        
        ContentService.loadWordCloud()
            .then(words => {
                this.state.words = words;
                this.renderWordCloud(words, container);
            })
            .catch(error => {
                console.error('Error loading word cloud:', error);
                this.showError(container);
            })
            .finally(() => {
                this.state.isLoading = false;
                container.classList.remove(this.config.loadingClass);
            });
    },
    
    /**
     * Load word cloud data from a specific source
     * @param {string} source - Data source
     * @param {Element} container - Container element
     */
    loadFromSource: function(source, container) {
        this.state.isLoading = true;
        
        if (source.startsWith('firebase:')) {
            // Load from Firebase path
            const path = source.replace('firebase:', '');
            
            ContentService.loadContent(path)
                .then(data => {
                    if (data && data.words && Array.isArray(data.words)) {
                        this.state.words = data.words;
                        this.renderWordCloud(data.words, container);
                    } else {
                        this.showError(container);
                    }
                })
                .catch(error => {
                    console.error(`Error loading word cloud from ${path}:`, error);
                    this.showError(container);
                })
                .finally(() => {
                    this.state.isLoading = false;
                    container.classList.remove(this.config.loadingClass);
                });
        } else if (source.startsWith('element:')) {
            // Load from element ID
            const elementId = source.replace('element:', '');
            const element = document.getElementById(elementId);
            
            if (element && element.textContent) {
                try {
                    const words = JSON.parse(element.textContent);
                    this.state.words = words;
                    this.renderWordCloud(words, container);
                } catch (error) {
                    console.error(`Error parsing JSON from element ${elementId}:`, error);
                    this.showError(container);
                }
            } else {
                this.showError(container);
            }
            
            this.state.isLoading = false;
            container.classList.remove(this.config.loadingClass);
        } else {
            // Unsupported source
            console.error(`Unsupported data source: ${source}`);
            this.showError(container);
            
            this.state.isLoading = false;
            container.classList.remove(this.config.loadingClass);
        }
    },
    
    /**
     * Render word cloud
     * @param {Array} words - Array of word objects
     * @param {Element} container - Container element to render into
     */
    renderWordCloud: function(words, container = null) {
        // If no container specified, use all containers
        const containers = container ? [container] : this.state.containers;
        
        containers.forEach(container => {
            // Clear container
            container.innerHTML = '';
            
            // If no words, show message
            if (!words || !Array.isArray(words) || words.length === 0) {
                container.innerHTML = '<li class="word-cloud-empty">No words available</li>';
                return;
            }
            
            // Copy words array to avoid modifying original
            let wordsToRender = [...words];
            
            // Shuffle words if enabled
            if (this.config.shuffleWords) {
                wordsToRender = this.shuffleArray(wordsToRender);
            }
            
            // Render each word
            wordsToRender.forEach(word => {
                if (!word.text) return;
                
                const li = document.createElement('li');
                const a = document.createElement('a');
                
                a.href = word.link || '#';
                a.textContent = word.text;
                a.setAttribute('data-weight', word.weight || 5);
                
                if (word.title) {
                    a.setAttribute('title', word.title);
                }
                
                if (word.target) {
                    a.setAttribute('target', word.target);
                }
                
                li.appendChild(a);
                container.appendChild(li);
            });
            
            // Trigger animation after short delay
            setTimeout(() => {
                container.classList.add(this.config.animationClass);
            }, 100);
        });
    },
    
    /**
     * Set up hover effects for word cloud items
     */
    setupHoverEffects: function() {
        this.state.containers.forEach(container => {
            container.addEventListener('mouseover', event => {
                const target = event.target;
                if (target.tagName.toLowerCase() === 'a') {
                    // Add hover effect
                    target.style.transform = 'scale(1.1)';
                    target.style.transition = 'transform 0.2s ease';
                }
            });
            
            container.addEventListener('mouseout', event => {
                const target = event.target;
                if (target.tagName.toLowerCase() === 'a') {
                    // Remove hover effect
                    target.style.transform = '';
                }
            });
        });
    },
    
    /**
     * Show error message in container
     * @param {Element} container - Container element
     */
    showError: function(container) {
        container.innerHTML = '<li class="word-cloud-error">Failed to load word cloud</li>';
    },
    
    /**
     * Shuffle array randomly
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray: function(array) {
        const newArray = [...array];
        
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        
        return newArray;
    },
    
    /**
     * Create a word cloud from a text
     * @param {string} text - Text to analyze
     * @param {number} maxWords - Maximum number of words to include
     * @param {string[]} excludeWords - Words to exclude
     * @returns {Array} Word cloud data
     */
    createFromText: function(text, maxWords = 30, excludeWords = []) {
        if (!text) return [];
        
        // Common words to exclude (stop words)
        const stopWords = [
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
            'at', 'from', 'by', 'for', 'with', 'about', 'to', 'in', 'on', 'of',
            'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
            'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
            'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours',
            'hers', 'ours', 'theirs'
        ];
        
        // Combine stop words with exclude words
        const wordsToExclude = [...stopWords, ...excludeWords].map(word => word.toLowerCase());
        
        // Clean text and split into words
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/) // Split by whitespace
            .filter(word => word.length > 2) // Filter out short words
            .filter(word => !wordsToExclude.includes(word)); // Filter out stop words
        
        // Count word frequency
        const wordCounts = {};
        
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        // Convert to array of objects
        const wordArray = Object.entries(wordCounts).map(([text, count]) => ({
            text,
            count,
            weight: Math.min(Math.ceil(count / 2), 10) // Convert count to weight (1-10)
        }));
        
        // Sort by count (descending)
        wordArray.sort((a, b) => b.count - a.count);
        
        // Limit to maxWords
        const limitedWords = wordArray.slice(0, maxWords);
        
        // Format for word cloud
        return limitedWords.map(word => ({
            text: word.text,
            weight: word.weight,
            link: `#${word.text}`
        }));
    }
};

// Export the WordCloud module
export default WordCloud;