 <?php
// Create new file: src/templates/base.php

/**
 * Base template with common structure
 */
?>
<!DOCTYPE html>
<html lang="<?= $lang ?? 'de' ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= $page_title ?? 'Mannar' ?></title>
  <meta name="description" content="<?= $page_description ?? 'Mannar - Peer, Genesungsbegeleiter' ?>">
  
  <!-- Base styles -->
  <link rel="stylesheet" href="./assets/css/main.css?v=<?= ASSET_VERSION ?>">
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  
  <?php if (isset($custom_styles)): ?>
    <?= $custom_styles ?>
  <?php endif; ?>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
  
  <?php if (isset($include_firebase_auth) && $include_firebase_auth): ?>
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <?php endif; ?>
  
  <?php if (isset($include_firebase_storage) && $include_firebase_storage): ?>
    <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-storage-compat.js"></script>
  <?php endif; ?>
  
  <?php if (isset($head_scripts)): ?>
    <?= $head_scripts ?>
  <?php endif; ?>
  
  <?php if (isset($custom_head_content)): ?>
    <?= $custom_head_content ?>
  <?php endif; ?>
</head>
<body<?= isset($body_class) ? ' class="' . $body_class . '"' : '' ?>>
  <a href="#main-content" class="skip-link">Zum Hauptinhalt springen</a>
  
  <?php
  // Include header/navigation if not disabled
  if (!isset($hide_header) || !$hide_header) {
    include __DIR__ . '/components/header.php';
  }
  ?>
  
  <main id="main-content">
    <?= $content ?? '' ?>
  </main>
  
  <?php
  // Include footer if not disabled
  if (!isset($hide_footer) || !$hide_footer) {
    include __DIR__ . '/components/footer.php';
  }
  ?>

  <!-- Core scripts -->
  <script src="./assets/js/services/firebase.js?v=<?= ASSET_VERSION ?>"></script>
  <script src="./assets/js/utils/ui-utils.js?v=<?= ASSET_VERSION ?>"></script>
  
  <?php if (isset($additional_scripts)): ?>
    <?= $additional_scripts ?>
  <?php endif; ?>
</body>
</html>