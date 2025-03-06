 <?php
// Gemeinsame Kopfzeile für alle Seiten
$page_title = isset($page_title) ? $page_title . ' - Mannar' : 'Mannar';
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo $page_title; ?></title>
  <meta name="description" content="Mannar - Peer, Genesungsbegeleiter">
  
  <!-- Styles -->
  <link rel="stylesheet" href="./assets/css/styles.css">
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  
  <?php if (isset($include_template_css) && $include_template_css): ?>
  <!-- Enhanced Template Styles -->
  <link rel="stylesheet" href="./assets/css/templates.css">
  <?php endif; ?>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  <?php if (isset($include_firebase_auth) && $include_firebase_auth): ?>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <?php endif; ?>
  
  <?php if (isset($custom_head_content)) echo $custom_head_content; ?>
</head>
<body<?php if (isset($body_class)) echo ' class="'.$body_class.'"'; ?>>