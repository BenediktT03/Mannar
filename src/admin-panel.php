 <!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Panel</title>
  <!-- Bestehende Styles einbinden -->
  <link rel="stylesheet" href="./styles.css" />
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <!-- Firebase SDKs einbinden (Auth & Firestore) -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>
</head>
<body>

  <h2 class="w3-center">Admin-Bereich</h2>
  <!-- Logout-Button (wird nur angezeigt, wenn eingeloggt) -->
  <div style="text-align:right; margin: 10px 20px;">
    <button id="logoutBtn" class="w3-button w3-red">Abmelden</button>
  </div>

  <!-- Login-Formular -->
  <div id="loginDiv" class="w3-card w3-padding" style="max-width: 400px; margin: 50px auto;">
    <h3>Anmelden</h3>
    <input id="emailField" class="w3-input w3-margin-bottom" type="email" placeholder="Email" />
    <input id="passField" class="w3-input w3-margin-bottom" type="password" placeholder="Passwort" />
    <button id="loginBtn" class="w3-button w3-black w3-block">Login</button>
    <p id="loginError" class="w3-text-red"></p>
  </div>

  <!-- Admin-Panel Inhalte (nur für angemeldete Nutzer sichtbar) -->
  <div id="adminDiv" class="w3-container" style="max-width: 800px; margin: 20px auto; display: none;">
    <!-- Abschnitt "Über mich" -->
    <h3>Über mich</h3>
    <label for="aboutTitle">Titel:</label>
    <input id="aboutTitle" type="text" class="w3-input w3-margin-bottom" />
    <label for="aboutSubtitle">Untertitel:</label>
    <input id="aboutSubtitle" type="text" class="w3-input w3-margin-bottom" />
    <label for="aboutText">Beschreibung:</label>
    <textarea id="aboutText" class="w3-input w3-margin-bottom" rows="5"></textarea>

    <!-- Abschnitt "Angebote/Portfolio" -->
    <h3>Meine Angebote</h3>
    <label for="offeringsTitle">Bereich-Titel:</label>
    <input id="offeringsTitle" type="text" class="w3-input w3-margin-bottom" />
    <label for="offeringsSubtitle">Bereich-Untertitel:</label>
    <input id="offeringsSubtitle" type="text" class="w3-input w3-margin-bottom" />
    <!-- Angebot 1 -->
    <p><strong>Angebot 1:</strong></p>
    <label for="offer1Title">Titel Angebot 1:</label>
    <input id="offer1Title" type="text" class="w3-input w3-margin-bottom" />
    <label for="offer1Desc">Beschreibung Angebot 1:</label>
    <textarea id="offer1Desc" class="w3-input w3-margin-bottom" rows="3"></textarea>
    <label for="offer1Image">Bild für Angebot 1:</label>
    <input id="offer1Image" type="file" class="w3-input w3-margin-bottom" accept="image/*" />
    <!-- Angebot 2 -->
    <p><strong>Angebot 2:</strong></p>
    <label for "offer2Title">Titel Angebot 2:</label>
    <input id="offer2Title" type="text" class="w3-input w3-margin-bottom" />
    <label for="offer2Desc">Beschreibung Angebot 2:</label>
    <textarea id="offer2Desc" class="w3-input w3-margin-bottom" rows="3"></textarea>
    <label for="offer2Image">Bild für Angebot 2:</label>
    <input id="offer2Image" type="file" class="w3-input w3-margin-bottom" accept="image/*" />
    <!-- Angebot 3 -->
    <p><strong>Angebot 3:</strong></p>
    <label for="offer3Title">Titel Angebot 3:</label>
    <input id="offer3Title" type="text" class="w3-input w3-margin-bottom" />
    <label for="offer3Desc">Beschreibung Angebot 3:</label>
    <textarea id="offer3Desc" class="w3-input w3-margin-bottom" rows="3"></textarea>
    <label for="offer3Image">Bild für Angebot 3:</label>
    <input id="offer3Image" type="file" class="w3-input w3-margin-bottom" accept="image/*" />

    <!-- Abschnitt "Kontakt" -->
    <h3>Kontakt</h3>
    <label for="contactTitle">Titel:</label>
    <input id="contactTitle" type="text" class="w3-input w3-margin-bottom" />
    <label for="contactSubtitle">Untertitel/Notiz:</label>
    <input id="contactSubtitle" type="text" class="w3-input w3-margin-bottom" />
    <label for="contactImage">Bild für Kontaktbereich (z.B. Karte):</label>
    <input id="contactImage" type="file" class="w3-input w3-margin-bottom" accept="image/*" />

    <!-- Vorschau- und Speichern-Buttons -->
    <button id="previewBtn" class="w3-button w3-blue w3-margin-top w3-margin-right">Vorschau</button>
    <button id="saveBtn" class="w3-button w3-green w3-margin-top">Speichern</button>

    <!-- Vorschau-Bereich -->
    <div id="previewArea" class="w3-padding w3-light-gray" style="margin-top: 30px; display: none;"></div>
  </div>

  <!-- Haupt-Skript -->
  <script>
    // ** Firebase-Konfiguration und Initialisierung **
    // TODO: Ersetze die folgenden Konfigurationswerte durch deine Firebase-Projekt-Daten
    var firebaseConfig = {
     apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
  authDomain: "mannar-129a5.firebaseapp.com",
  projectId: "mannar-129a5",
  storageBucket: "mannar-129a5.firebasestorage.app",
  messagingSenderId: "687710492532",
  appId: "1:687710492532:web:c7b675da541271f8d83e21",
  measurementId: "G-NXBLYJ5CXL"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();  // Firestore-Referenz
    const auth = firebase.auth();     // Auth-Referenz

    // Element-Referenzen
    const loginDiv     = document.getElementById('loginDiv');
    const adminDiv     = document.getElementById('adminDiv');
    const emailField   = document.getElementById('emailField');
    const passField    = document.getElementById('passField');
    const loginBtn     = document.getElementById('loginBtn');
    const loginError   = document.getElementById('loginError');
    const logoutBtn    = document.getElementById('logoutBtn');
    // Formularfelder für Texte
    const aboutTitle        = document.getElementById('aboutTitle');
    const aboutSubtitle     = document.getElementById('aboutSubtitle');
    const aboutText         = document.getElementById('aboutText');
    const offeringsTitle    = document.getElementById('offeringsTitle');
    const offeringsSubtitle = document.getElementById('offeringsSubtitle');
    const offer1Title       = document.getElementById('offer1Title');
    const offer1Desc        = document.getElementById('offer1Desc');
    const offer2Title       = document.getElementById('offer2Title');
    const offer2Desc        = document.getElementById('offer2Desc');
    const offer3Title       = document.getElementById('offer3Title');
    const offer3Desc        = document.getElementById('offer3Desc');
    const contactTitle      = document.getElementById('contactTitle');
    const contactSubtitle   = document.getElementById('contactSubtitle');
    // File-Inputs für Bilder
    const offer1ImageInput  = document.getElementById('offer1Image');
    const offer2ImageInput  = document.getElementById('offer2Image');
    const offer3ImageInput  = document.getElementById('offer3Image');
    const contactImageInput = document.getElementById('contactImage');
    // Buttons und Vorschau
    const previewBtn = document.getElementById('previewBtn');
    const saveBtn    = document.getElementById('saveBtn');
    const previewArea = document.getElementById('previewArea');

    // Variablen zum Speichern der aktuellen Bild-Dateinamen (aus Firestore)
    let offer1ImageName = "", offer2ImageName = "", offer3ImageName = "", contactImageName = "";

    // Auth-Zustand überwachen und entsprechend UI umschalten
    auth.onAuthStateChanged(user => {
      if (user) {
        // Eingeloggt: Admin-Panel anzeigen, Login-Formular verbergen
        loginDiv.style.display = 'none';
        adminDiv.style.display = 'block';
        // Optional: prüfen ob Benutzer berechtigt ist (z.B. per uid oder Email)
        // if (user.email !== "admin@beispiel.de") { auth.signOut(); return; }

        // Aktuelle Inhalte aus Firestore laden
        db.collection("content").doc("siteTexts").get().then(docSnap => {
          let data = {};
          if (docSnap.exists) {
            data = docSnap.data();
          }
          // Felder vorbelegen (oder leer, falls noch nicht vorhanden)
          aboutTitle.value        = data.aboutTitle || "";
          aboutSubtitle.value     = data.aboutSubtitle || "";
          aboutText.value         = data.aboutText || "";
          offeringsTitle.value    = data.offeringsTitle || "";
          offeringsSubtitle.value = data.offeringsSubtitle || "";
          offer1Title.value       = data.offer1Title || "";
          offer1Desc.value        = data.offer1Desc || "";
          offer2Title.value       = data.offer2Title || "";
          offer2Desc.value        = data.offer2Desc || "";
          offer3Title.value       = data.offer3Title || "";
          offer3Desc.value        = data.offer3Desc || "";
          contactTitle.value      = data.contactTitle || "";
          contactSubtitle.value   = data.contactSubtitle || "";
          // Bild-Dateinamen merken und vorhandene Bilder anzeigen (als Vorschau)
          offer1ImageName  = data.offer1_image || "";
          offer2ImageName  = data.offer2_image || "";
          offer3ImageName  = data.offer3_image || "";
          contactImageName = data.contact_image || "";
          // Falls bereits Bilder vorhanden, kleine Vorschau im Formular anzeigen (z.B. Dateinamen als Hinweis)
          if (offer1ImageName) {
            offer1ImageInput.setAttribute('data-filename', offer1ImageName);
          }
          if (offer2ImageName) {
            offer2ImageInput.setAttribute('data-filename', offer2ImageName);
          }
          if (offer3ImageName) {
            offer3ImageInput.setAttribute('data-filename', offer3ImageName);
          }
          if (contactImageName) {
            contactImageInput.setAttribute('data-filename', contactImageName);
          }
        }).catch(err => {
          console.error("Fehler beim Laden der Inhalte:", err);
        });
      } else {
        // Nicht eingeloggt: Login-Formular anzeigen, Admin-Bereich verbergen
        adminDiv.style.display = 'none';
        loginDiv.style.display = 'block';
      }
    });

    // Login-Button Event
    loginBtn.addEventListener('click', () => {
      const email = emailField.value;
      const pass  = passField.value;
      loginError.textContent = "";  // alte Fehlermeldung zurücksetzen
      auth.signInWithEmailAndPassword(email, pass)
        .catch(err => {
          console.error("Login-Fehler:", err);
          loginError.textContent = "Login fehlgeschlagen: " + err.message;
        });
    });

    // Logout-Button Event
    logoutBtn.addEventListener('click', () => {
      auth.signOut();
      // Nach Abmeldung: Admin-Panel ausblenden, Login anzeigen
      adminDiv.style.display = 'none';
      loginDiv.style.display = 'block';
    });

    // Vorschau-Button Event – zeigt eine Vorschau der aktuellen Eingaben
    previewBtn.addEventListener('click', () => {
      // Für jede Bild-Eingabe den passenden Vorschau-Pfad bestimmen
      const getImagePreviewSrc = (fileInput, currentName) => {
        if (fileInput.files.length > 0) {
          // Neues Bild ausgewählt: ObjectURL dafür erzeugen
          return URL.createObjectURL(fileInput.files[0]);
        } else if (currentName) {
          // Kein neues Bild, aber bereits existierendes Bild vorhanden: lokalen Pfad verwenden
          return "/uploads/" + currentName;
        } else {
          return ""; // kein Bild vorhanden
        }
      };
      const src1 = getImagePreviewSrc(offer1ImageInput, offer1ImageName);
      const src2 = getImagePreviewSrc(offer2ImageInput, offer2ImageName);
      const src3 = getImagePreviewSrc(offer3ImageInput, offer3ImageName);
      const srcContact = getImagePreviewSrc(contactImageInput, contactImageName);

      // HTML für Vorschau zusammenbauen (orientiert sich am Design der Website)
      let previewHTML = `
        <div class="w3-content w3-container w3-padding-16">
          <h2 class="w3-center">${aboutTitle.value}</h2>
          <p class="w3-center"><em>${aboutSubtitle.value}</em></p>
          <p>${aboutText.value}</p>
        </div>
        <hr/>
        <div class="w3-content w3-container w3-padding-16">
          <h2 class="w3-center">${offeringsTitle.value}</h2>
          <p class="w3-center"><em>${offeringsSubtitle.value}</em></p>
          <div class="w3-row-padding">
            <div class="w3-col m4 w3-container">
              ${src1 ? `<img src="${src1}" style="width:100%" alt="${offer1Title.value}">` : ""}
              <h3>${offer1Title.value}</h3>
              <p>${offer1Desc.value}</p>
            </div>
            <div class="w3-col m4 w3-container">
              ${src2 ? `<img src="${src2}" style="width:100%" alt="${offer2Title.value}">` : ""}
              <h3>${offer2Title.value}</h3>
              <p>${offer2Desc.value}</p>
            </div>
            <div class="w3-col m4 w3-container">
              ${src3 ? `<img src="${src3}" style="width:100%" alt="${offer3Title.value}">` : ""}
              <h3>${offer3Title.value}</h3>
              <p>${offer3Desc.value}</p>
            </div>
          </div>
        </div>
        <hr/>
        <div class="w3-content w3-container w3-padding-16">
          <h2 class="w3-center">${contactTitle.value}</h2>
          <p class="w3-center"><em>${contactSubtitle.value}</em></p>
          ${srcContact ? `<div class="w3-center"><img src="${srcContact}" style="width:100%; max-width:400px;" alt="Kontakt Bild"></div>` : ""}
        </div>
      `;
      previewArea.innerHTML = previewHTML;
      previewArea.style.display = 'block';
    });

    // Speichern-Button Event – speichert Texte in Firestore und lädt neue Bilder hoch
    saveBtn.addEventListener('click', async () => {
      try {
        // 1. Bilder hochladen (falls neue ausgewählt) und Dateinamen aktualisieren
        let uploadedOffer1 = offer1ImageName;
        let uploadedOffer2 = offer2ImageName;
        let uploadedOffer3 = offer3ImageName;
        let uploadedContact = contactImageName;

        // Angebot 1 Bild
        if (offer1ImageInput.files.length > 0) {
          const formData1 = new FormData();
          formData1.append('image', offer1ImageInput.files[0]);
          const res1 = await fetch('/upload', { method: 'POST', body: formData1 });
          if (!res1.ok) throw new Error("Upload für Bild 1 fehlgeschlagen");
          const json1 = await res1.json();
          uploadedOffer1 = json1.filename;
        }
        // Angebot 2 Bild
        if (offer2ImageInput.files.length > 0) {
          const formData2 = new FormData();
          formData2.append('image', offer2ImageInput.files[0]);
          const res2 = await fetch('/upload', { method: 'POST', body: formData2 });
          if (!res2.ok) throw new Error("Upload für Bild 2 fehlgeschlagen");
          const json2 = await res2.json();
          uploadedOffer2 = json2.filename;
        }
        // Angebot 3 Bild
        if (offer3ImageInput.files.length > 0) {
          const formData3 = new FormData();
          formData3.append('image', offer3ImageInput.files[0]);
          const res3 = await fetch('/upload', { method: 'POST', body: formData3 });
          if (!res3.ok) throw new Error("Upload für Bild 3 fehlgeschlagen");
          const json3 = await res3.json();
          uploadedOffer3 = json3.filename;
        }
        // Kontakt Bild
        if (contactImageInput.files.length > 0) {
          const formData4 = new FormData();
          formData4.append('image', contactImageInput.files[0]);
          const res4 = await fetch('/upload', { method: 'POST', body: formData4 });
          if (!res4.ok) throw new Error("Upload für Kontakt-Bild fehlgeschlagen");
          const json4 = await res4.json();
          uploadedContact = json4.filename;
        }

        // 2. Daten in Firestore speichern (Texte und Bildpfade)
        await db.collection("content").doc("siteTexts").set({
          aboutTitle:        aboutTitle.value,
          aboutSubtitle:     aboutSubtitle.value,
          aboutText:         aboutText.value,
          offeringsTitle:    offeringsTitle.value,
          offeringsSubtitle: offeringsSubtitle.value,
          offer1Title:       offer1Title.value,
          offer1Desc:        offer1Desc.value,
          offer2Title:       offer2Title.value,
          offer2Desc:        offer2Desc.value,
          offer3Title:       offer3Title.value,
          offer3Desc:        offer3Desc.value,
          contactTitle:      contactTitle.value,
          contactSubtitle:   contactSubtitle.value,
          // Bild-Dateinamen speichern (zur Verwendung im Frontend)
          offer1_image:  uploadedOffer1,
          offer2_image:  uploadedOffer2,
          offer3_image:  uploadedOffer3,
          contact_image: uploadedContact
        }, { merge: true });

        // 3. Lokale Variablen aktualisieren und Erfolgsmeldung
        offer1ImageName = uploadedOffer1;
        offer2ImageName = uploadedOffer2;
        offer3ImageName = uploadedOffer3;
        contactImageName = uploadedContact;
        // Datei-Auswahlfelder zurücksetzen
        offer1ImageInput.value = "";
        offer2ImageInput.value = "";
        offer3ImageInput.value = "";
        contactImageInput.value = "";
        alert("Änderungen erfolgreich gespeichert!");
      } catch (err) {
        console.error("Fehler beim Speichern:", err);
        alert("Speichern fehlgeschlagen: " + err.message);
      }
    });
  </script>
</body>
</html>
