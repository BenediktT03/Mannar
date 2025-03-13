/**
 * Upload Service
 * Centralized service for handling file uploads and storage
 */
const UploadService = (function() {
  // Configuration
  const config = {
    // Cloudinary configuration
    cloudinary: {
      cloudName: 'dlegnsmho',
      uploadPreset: 'ml_default',
      apiKey: '811453586293945'
    },
    // Default upload endpoint (PHP fallback)
    defaultEndpoint: './api/upload.php',
    // File size limits
    maxFileSize: 5 * 1024 * 1024, // 5MB
    // Allowed mime types
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
  };
  
  // Cloudinary widget instance
  let uploadWidget = null;
  
  // Current upload context for tracking callbacks
  let currentUploadContext = null;
  
  /**
   * Initialize the upload service
   * @returns {boolean} True if initialization succeeded
   */
  function init() {
    // Check if Cloudinary is available
    if (typeof cloudinary !== 'undefined') {
      initCloudinaryWidget();
      return true;
    } else {
      console.warn('Cloudinary SDK not loaded, falling back to PHP upload');
      return false;
    }
  }
  
  /**
   * Initialize Cloudinary upload widget
   * @param {Object} options - Additional widget options
   * @returns {Object} Cloudinary widget instance
   */
  function initCloudinaryWidget(options = {}) {
    if (typeof cloudinary === 'undefined') {
      console.error('Cloudinary SDK not loaded');
      return null;
    }
    
    // Default widget options
    const defaultOptions = {
      cloudName: config.cloudinary.cloudName,
      uploadPreset: config.cloudinary.uploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      maxFileSize: config.maxFileSize,
      cropping: false,
      showAdvancedOptions: false,
      styles: {
        palette: {
          window: "#FFFFFF",
          sourceBg: "#F8F8F8",
          windowBorder: "#DDDDDD",
          tabIcon: "#000000",
          inactiveTabIcon: "#555555",
          menuIcons: "#000000",
          link: "#0078FF",
          action: "#339933",
          inProgress: "#0078FF",
          complete: "#339933",
          error: "#CC0000",
          textDark: "#000000",
          textLight: "#FFFFFF"
        }
      }
    };
    
    // Create widget with merged options
    const widgetOptions = { ...defaultOptions, ...options };
    
    uploadWidget = cloudinary.createUploadWidget(
      widgetOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          
          // Call error callback if defined
          if (currentUploadContext && typeof currentUploadContext.onError === 'function') {
            currentUploadContext.onError(error);
          }
          
          return;
        }
        
        if (result && result.event === "success") {
          console.log('Upload successful:', result.info);
          
          // Format result data
          const uploadResult = {
            url: result.info.secure_url,
            public_id: result.info.public_id,
            original_filename: result.info.original_filename,
            format: result.info.format,
            width: result.info.width,
            height: result.info.height,
            size: result.info.bytes
          };
          
          // Call success callback if defined
          if (currentUploadContext && typeof currentUploadContext.onSuccess === 'function') {
            currentUploadContext.onSuccess(uploadResult);
          }
        }
      }
    );
    
    return uploadWidget;
  }
  
  /**
   * Upload a file using Cloudinary widget
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  function uploadWithWidget(options = {}) {
    return new Promise((resolve, reject) => {
      // Ensure widget is initialized
      if (!uploadWidget) {
        if (!initCloudinaryWidget()) {
          reject(new Error('Failed to initialize Cloudinary widget'));
          return;
        }
      }
      
      // Set upload context with callbacks
      currentUploadContext = {
        onSuccess: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
        ...options
      };
      
      // Open widget
      uploadWidget.open();
    });
  }
  
  /**
   * Upload a file using fetch API
   * @param {File} file - File to upload
   * @param {string} endpoint - Upload endpoint URL
   * @param {Object} extraData - Additional data to include in the request
   * @returns {Promise<Object>} Upload result
   */
  async function uploadWithFetch(file, endpoint = config.defaultEndpoint, extraData = {}) {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Check file size
    if (file.size > config.maxFileSize) {
      throw new Error(`File is too large. Maximum size is ${config.maxFileSize / (1024 * 1024)}MB`);
    }
    
    // Check file type
    if (config.allowedTypes.length > 0 && !config.allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    
    // Add CSRF token if available
    const csrfToken = window.csrfToken || document.querySelector('input[name="csrf_token"]')?.value;
    if (csrfToken) {
      formData.append('csrf_token', csrfToken);
    }
    
    // Add any extra data
    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    try {
      // Make request
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Parse response
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
  
  /**
   * Upload a file using the best available method
   * @param {File|null} file - File to upload (null to use widget)
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async function uploadFile(file = null, options = {}) {
    try {
      // If no file is provided, use the widget
      if (!file) {
        return await uploadWithWidget(options);
      }
      
      // If Cloudinary is available and no endpoint is specified, use the widget
      if (typeof cloudinary !== 'undefined' && !options.endpoint) {
        // Create a widget with file already selected (if possible)
        // Otherwise fall back to fetch upload
        return await uploadWithFetch(file, options.endpoint, options.extraData);
      }
      
      // Otherwise use fetch upload
      return await uploadWithFetch(file, options.endpoint, options.extraData);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Show file picker dialog and upload selected file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  function pickAndUploadFile(options = {}) {
    return new Promise((resolve, reject) => {
      // Create file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.display = 'none';
      
      // Set accept attribute if specified
      if (options.accept) {
        fileInput.accept = options.accept;
      } else if (config.allowedTypes.length > 0) {
        fileInput.accept = config.allowedTypes.join(',');
      }
      
      // Handle file selection
      fileInput.addEventListener('change', async () => {
        if (fileInput.files && fileInput.files.length > 0) {
          try {
            const result = await uploadFile(fileInput.files[0], options);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            // Clean up
            document.body.removeChild(fileInput);
          }
        } else {
          // No file selected
          document.body.removeChild(fileInput);
          reject(new Error('No file selected'));
        }
      });
      
      // Add to document and click
      document.body.appendChild(fileInput);
      fileInput.click();
    });
  }
  
  /**
   * Format image data consistently
   * @param {string|Object} imageData - Image data to format
   * @returns {Object} Formatted image data
   */
  function formatImageData(imageData) {
    if (!imageData) {
      return { url: '', public_id: '', alt: '' };
    }
    
    if (typeof imageData === 'string') {
      return { url: imageData, public_id: '', alt: '' };
    }
    
    return {
      url: imageData.url || imageData.secure_url || '',
      public_id: imageData.public_id || '',
      alt: imageData.alt || ''
    };
  }
  
  /**
   * Get image dimensions
   * @param {string} url - Image URL
   * @returns {Promise<Object>} Image dimensions
   */
  function getImageDimensions(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
  
  // Initialize when loaded
  if (typeof cloudinary !== 'undefined') {
    init();
  }
  
  // Public API
  return {
    uploadFile,
    pickAndUploadFile,
    uploadWithWidget,
    uploadWithFetch,
    formatImageData,
    getImageDimensions,
    init
  };
})();

// Make service globally available
window.UploadService = UploadService;