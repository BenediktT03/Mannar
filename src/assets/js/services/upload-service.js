 // Create new file: src/assets/js/services/upload-service.js

/**
 * Upload Service - Handles file uploads to Cloudinary and local server
 */
const UploadService = (function() {
  // Cloudinary configuration
  const cloudinaryConfig = {
    cloudName: 'dlegnsmho',
    uploadPreset: 'ml_default',
    apiKey: '811453586293945'
  };
  
  // Upload widget instance
  let uploadWidget = null;
  
  // Initialize Cloudinary widget
  function initCloudinaryWidget(options = {}) {
    if (!window.cloudinary) {
      console.error('Cloudinary SDK not loaded');
      return null;
    }
    
    const widgetOptions = {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      maxFileSize: 5000000, // 5MB
      cropping: false,
      ...options
    };
    
    uploadWidget = cloudinary.createUploadWidget(
      widgetOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          if (options.onError) options.onError(error);
          return;
        }
        
        if (result && result.event === "success") {
          if (options.onSuccess) options.onSuccess(result.info);
        }
      }
    );
    
    return uploadWidget;
  }
  
  // Open upload widget
  function openUploadWidget() {
    if (!uploadWidget) {
      console.error('Upload widget not initialized');
      return false;
    }
    
    uploadWidget.open();
    return true;
  }
  
  // Upload file using fetch API
  async function uploadFile(file, endpoint = './api/upload.php', extraData = {}) {
    if (!file) {
      throw new Error('No file provided');
    }
    
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
    
    // Upload file
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Format image data consistently
  function formatImageData(imageData) {
    if (typeof imageData === 'string') {
      return { url: imageData, public_id: '', alt: '' };
    } else if (imageData && typeof imageData === 'object') {
      return {
        url: imageData.url || imageData.secure_url || '',
        public_id: imageData.public_id || '',
        alt: imageData.alt || ''
      };
    }
    
    return { url: '', public_id: '', alt: '' };
  }
  
  // Public API
  return {
    initCloudinaryWidget,
    openUploadWidget,
    uploadFile,
    formatImageData
  };
})();

// For global access
window.uploadService = UploadService;