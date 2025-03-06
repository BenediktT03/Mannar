// navbar.js - Spezifisches Skript für die Navbar-Funktionalität
// Dieses Skript wird vor allen anderen Skripten geladen, um die toggleFunction global verfügbar zu machen

// Globale Funktion zum Umschalten des mobilen Menüs
function toggleFunction() {
  const navDemo = document.getElementById('navDemo');
  if (navDemo) {
    if (navDemo.classList.contains('w3-show')) {
      navDemo.classList.remove('w3-show');
    } else {
      navDemo.classList.add('w3-show');
    }
  }
}

// Diese Funktion muss im globalen Bereich verfügbar sein
window.toggleFunction = toggleFunction;

// Zusätzliche Event-Listener nach DOM-Ladung
document.addEventListener('DOMContentLoaded', function() {
  const navbarToggleBtn = document.querySelector('.w3-right.w3-hide-medium.w3-hide-large');
  const navDemo = document.getElementById('navDemo');

  // Falls der Toggle-Button existiert, einen Klick-Listener hinzufügen
  if (navbarToggleBtn) {
    navbarToggleBtn.addEventListener('click', function(event) {
      event.preventDefault(); // Verhindern, dass der Link gefolgt wird
      toggleFunction();
    });
  }

  // Schließen des Menüs beim Klick außerhalb
  document.addEventListener('click', function(event) {
    if (navDemo && navDemo.classList.contains('w3-show')) {
      // Wenn das geklickte Element nicht Teil des Menüs oder des Toggle-Buttons ist
      if (!navDemo.contains(event.target) && 
          (!navbarToggleBtn || !navbarToggleBtn.contains(event.target))) {
        navDemo.classList.remove('w3-show');
      }
    }
  });
}); 