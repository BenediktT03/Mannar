# Mannar Website

## Overview

The Mannar Website is a PHP and Firebase-based platform for a Peer and Genesungsbegleiter (recovery companion) that offers both public-facing content and an administrative backend for content management. The website uses modern web development technologies and follows a modular, maintainable architecture.

## 🚀 Features

- Responsive, mobile-friendly design
- Content management system with Firebase backend
- Dynamic page creation and management
- Real-time preview of content changes
- Word cloud component with customizable tags
- Contact form with server-side validation
- User authentication for admin area
- Image upload and management via Cloudinary

## 📂 Directory Structure

```
mannar/
├── config/                  # Configuration files
│   ├── app.php              # Main application configuration
│   ├── database.php         # Database configuration
│   ├── firebase.php         # Firebase configuration
│   └── constants.php        # Application constants
├── public/                  # Webroot for public access
│   ├── index.php            # Main entry point
│   ├── admin.php            # Admin area entry point
│   ├── preview.html         # Preview page
│   ├── assets/              # Compiled/public assets
│   │   ├── css/             # CSS files
│   │   ├── js/              # JavaScript files
│   │   └── img/             # Image files
│   ├── api/                 # API endpoints
│   │   ├── contact.php      # Contact form handler
│   │   └── upload.php       # File upload handler
│   └── .htaccess            # Server configuration
├── src/                     # Application source code
│   ├── core/                # Core functionality
│   │   ├── controller.php   # Base controller
│   │   ├── database.php     # Database connection
│   │   ├── router.php       # URL router
│   │   ├── init.php         # Application initialization
│   │   └── version.php      # Version information
│   ├── utils/               # Utility functions
│   │   ├── security.php     # Security utilities (CSRF, etc.)
│   │   ├── formatting.php   # Text formatting functions
│   │   └── filesystem.php   # Filesystem operations
│   ├── services/            # Service layer
│   │   ├── authservice.php  # Authentication service
│   │   ├── contentservice.php # Content service
│   │   └── uploadservice.php # Upload service
│   └── templates/           # Template files
│       ├── components/      # Reusable components
│       │   ├── header.php   # Header component
│       │   ├── footer.php   # Footer component
│       │   └── navigation.php # Navigation component
│       ├── layouts/         # Page layouts
│       │   ├── base.php     # Base layout
│       │   └── admin.php    # Admin layout
│       └── pages/           # Page-specific templates
│           ├── home.php     # Homepage
│           ├── admin-panel.php # Admin panel
│           ├── preview.php  # Preview page
│           └── page.php     # Dynamic page
├── assets/                  # Source assets
│   ├── css/                 # CSS source files
│   │   ├── base/            # Base styles
│   │   ├── components/      # Component styles
│   │   ├── layout/          # Layout styles
│   │   ├── pages/           # Page-specific styles
│   │   ├── utils/           # Utility styles
│   │   └── main.css         # Main CSS file (imports)
│   ├── js/                  # JavaScript source files
│   │   ├── admin/           # Admin scripts
│   │   ├── components/      # Component scripts
│   │   ├── services/        # Service scripts
│   │   ├── utils/           # Utility scripts
│   │   ├── app.js           # Main application script
│   │   └── main.js          # Main JavaScript file
│   └── img/                 # Image source files
├── data/                    # Data storage
│   ├── cache/               # Cache files
│   ├── logs/                # Log files
│   └── messages/            # Contact form messages
├── bootstrap.php            # Application bootstrap
└── README.md                # Project documentation
```

## 🔧 Installation

### Prerequisites

- PHP 7.4 or higher
- Apache or Nginx web server
- Firebase account with Firestore enabled
- Cloudinary account (for image uploads)

### Step-by-Step Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mannar-website.git
cd mannar-website
```

2. **Create required directories**

```bash
mkdir -p data/cache data/logs data/messages
chmod -R 755 data
```

3. **Configure the application**

Copy and edit configuration files:

```bash
cp config/app.example.php config/app.php
cp config/firebase.example.php config/firebase.php
# Edit the configuration files with your settings
```

4. **Set up Firebase**

- Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
- Enable Firestore database
- Set up Authentication with Email/Password provider
- Create a web app and copy the configuration to `config/firebase.php`

5. **Set up Cloudinary (optional)**

If you're using Cloudinary for image uploads:

- Create a Cloudinary account
- Copy your Cloud name, API Key, and API Secret to `config/app.php`

6. **Set up the web server**

For Apache, ensure that the `.htaccess` file is correctly set up:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.php [L]
</IfModule>
```

For Nginx, use a configuration like:

```nginx
server {
    listen 80;
    server_name mannar.example.com;
    root /path/to/mannar/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
    }
}
```

7. **Initialize the database**

For Firebase, the initial data structure needs to be set up:

- Create a `content` collection with `main` and `draft` documents
- Create a `wordCloud` document in the `content` collection
- Create a `settings` collection with a `global` document

8. **Create admin user**

In the Firebase Console:
- Go to Authentication
- Add a new user with email and password
- This user will be able to log in to the admin panel

## ⚙️ Configuration

### Firebase Configuration

The Firebase configuration (`config/firebase.php`) requires the following:

```php
<?php
// Firebase Configuration
define('FIREBASE_CONFIG', [
    'apiKey' => "your-api-key",
    'authDomain' => "your-project-id.firebaseapp.com",
    'projectId' => "your-project-id",
    'storageBucket' => "your-project-id.appspot.com",
    'messagingSenderId' => "your-messaging-sender-id",
    'appId' => "your-app-id"
]);
```

### Application Configuration

The main application configuration (`config/app.php`) includes:

```php
<?php
// Application Configuration
define('APP_NAME', 'Mannar');
define('APP_ENV', 'production'); // 'production', 'development', or 'testing'
define('APP_DEBUG', false);

// URLs
define('BASE_URL', 'https://your-domain.com');
define('ASSETS_URL', BASE_URL . '/assets');

// Features
define('ENABLE_CONTACT_FORM', true);
define('ENABLE_WORD_CLOUD', true);

// Email settings
define('EMAIL_CONFIG', [
    'contact_email' => 'contact@example.com',
    'from_email' => 'noreply@example.com',
    'from_name' => 'Mannar Website'
]);

// Cloudinary settings
define('CLOUDINARY_CONFIG', [
    'cloud_name' => 'your-cloud-name',
    'api_key' => 'your-api-key',
    'api_secret' => 'your-api-secret',
    'upload_preset' => 'your-upload-preset'
]);
```

## 🔄 Development Workflow

### Local Development

1. Clone the repository to your local environment
2. Configure your local web server to point to the `public` directory
3. Copy configuration files and update with your development settings
4. Run the application and start developing

### Code Structure

- Separate business logic from presentation
- Use services for external API interactions
- Keep templates focused on presentation
- Use utilities for common functions

### JavaScript Development

- Maintain the modular structure
- Follow the established patterns for services and components
- Use the provided utility functions

### CSS Development

- Use the existing CSS organization
- Maintain the component-based approach
- Follow the BEM methodology for naming

## 📤 Deployment

### Production Deployment

1. Set up your production server with the required PHP version
2. Configure your web server to point to the `public` directory
3. Ensure all directories have the correct permissions
4. Update configuration files for production settings
5. Deploy the code to your server

### Important Production Settings

- Set `APP_ENV` to 'production' in `config/app.php`
- Set `APP_DEBUG` to false
- Ensure all log directories are writable
- Configure proper error handling
- Set up SSL certificate

## 🛠️ Technologies Used

- **Backend**: PHP 7.4+
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Frontend**: HTML5, CSS3, JavaScript
- **CSS Framework**: W3.CSS
- **JavaScript Libraries**: None (vanilla JS)
- **Image Storage**: Cloudinary
- **Fonts**: Font Awesome, Google Fonts

## 🔍 Troubleshooting

### Common Issues

#### Firebase Connection Issues

If you encounter problems connecting to Firebase:

1. Check that your Firebase configuration is correct
2. Ensure your Firebase project has Firestore enabled
3. Verify that your IP is not blocked by Firebase security rules

#### File Upload Issues

If file uploads are not working:

1. Check your Cloudinary configuration
2. Ensure PHP file upload settings are correctly configured
3. Verify folder permissions for local file storage

#### Admin Login Issues

If you can't log in to the admin panel:

1. Check that your Firebase Authentication is set up correctly
2. Verify that your user exists in Firebase Authentication
3. Clear browser cache and cookies

### Logging

Logs are stored in the `data/logs` directory:

- `error.log`: General errors
- `exception.log`: Caught exceptions
- `fatal.log`: Fatal errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Credits

Developed by [Your Name/Company] - 2025 