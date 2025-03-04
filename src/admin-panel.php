<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin-Panel</title>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
    import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAQszUApKHZ3lPrpc7HOINpdOWW3SgvUBM",
      authDomain: "mannar-129a5.firebaseapp.com",
      projectId: "mannar-129a5",
      storageBucket: "mannar-129a5.firebasestorage.app",
      messagingSenderId: "687710492532",
      appId: "1:687710492532:web:c7b675da541271f8d83e21",
      measurementId: "G-NXBLYJ5CXL"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    function login() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          document.querySelector('.login-form').style.display = 'none';
          document.querySelector('.admin-panel').style.display = 'block';
          document.getElementById("user-name").textContent = userCredential.user.email;
          loadContent();
          loadPages();
        })
        .catch(error => {
          document.getElementById("error-message").textContent = error.message;
        });
    }

    function logout() {
      signOut(auth).then(() => {
        document.querySelector('.login-form').style.display = 'block';
        document.querySelector('.admin-panel').style.display = 'none';
      }).catch(error => {
        console.error('Fehler beim Abmelden: ', error);
      });
    }

    function saveContent() {
      const contentText = document.getElementById("content-text").innerHTML;
      const contentImage = document.getElementById("content-image").files[0];

      if (contentImage) {
        const storageRef = ref(storage, 'images/' + contentImage.name);
        uploadBytes(storageRef, contentImage).then(snapshot => {
          getDownloadURL(snapshot.ref).then(downloadURL => {
            setDoc(doc(db, "content", "mainContent"), {
              text: contentText,
              image: downloadURL
            })
            .then(() => {
              loadContent(); 
            })
            .catch(error => {
              console.error("Fehler beim Speichern:", error);
            });
          });
        });
      } else {
        setDoc(doc(db, "content", "mainContent"), {
          text: contentText,
          image: ""
        })
        .then(() => {
          loadContent();  
        })
        .catch(error => {
          console.error("Fehler beim Speichern:", error);
        });
      }
    }

    function loadContent() {
      getDoc(doc(db, "content", "mainContent")).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          document.getElementById("content-display").innerHTML = ` 
            <p>${data.text}</p>
            ${data.image ? `<img src="${data.image}" alt="Inhalt Bild" width="200">` : ''}
          `;
        }
      });
    }

    function createPage() {
      const pageName = document.getElementById("new-page-name").value;
      const pageContent = document.getElementById("new-page-content").innerHTML;

      if (pageName && pageContent) {
        setDoc(doc(db, "pages", pageName), {
          content: pageContent
        }).then(() => {
          loadPages();
          document.getElementById("new-page-name").value = '';
          document.getElementById("new-page-content").innerHTML = '';
        }).catch(error => {
          console.error("Fehler beim Erstellen der Seite:", error);
        });
      } else {
        alert("Bitte geben Sie sowohl einen Seitennamen als auch den Inhalt ein.");
      }
    }

    function loadPages() {
      const pagesList = document.getElementById("pages-list");
      pagesList.innerHTML = '';
      
      const pagesRef = collection(db, "pages");
      getDocs(pagesRef).then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const pageData = doc.data();
          const pageItem = document.createElement("li");
          pageItem.innerHTML = `
            <strong>${doc.id}</strong>: ${pageData.content.substring(0, 100)}...
            <button onclick="deletePage('${doc.id}')">Löschen</button>
            <button onclick="editPage('${doc.id}')">Bearbeiten</button>
          `;
          pagesList.appendChild(pageItem);
        });
      });
    }

    function deletePage(pageId) {
      deleteDoc(doc(db, "pages", pageId)).then(() => {
        loadPages();
      }).catch(error => {
        console.error("Fehler beim Löschen der Seite:", error);
      });
    }

    function editPage(pageId) {
      const pageContent = prompt("Geben Sie den neuen Inhalt für die Seite ein:");
      if (pageContent) {
        setDoc(doc(db, "pages", pageId), {
          content: pageContent
        }).then(() => {
          loadPages();
        }).catch(error => {
          console.error("Fehler beim Bearbeiten der Seite:", error);
        });
      }
    }

    onAuthStateChanged(auth, user => {
      if (user) {
        document.querySelector('.login-form').style.display = 'none';
        document.querySelector('.admin-panel').style.display = 'block';
        document.getElementById("user-name").textContent = user.email;
        loadContent();
        loadPages();  
      } else {
        document.querySelector('.login-form').style.display = 'block';
        document.querySelector('.admin-panel').style.display = 'none';
      }
    });
  </script>

  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #e9ecef;
      margin: 0;
      padding: 0;
      color: #333;
    }

    .admin-panel, .login-form {
      width: 90%;
      max-width: 1100px;
      margin: auto;
      padding: 20px;
      background-color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .admin-panel h1, .login-form h1 {
      text-align: center;
      color: #007bff;
    }

    .tabs {
      display: flex;
      justify-content: space-around;
      background-color: #007bff;
      padding: 10px;
      border-radius: 8px 8px 0 0;
    }

    .tabs button {
      background-color: #007bff;
      color: white;
      padding: 12px 20px;
      border: none;
      cursor: pointer;
      border-radius: 6px;
      font-size: 16px;
      width: 30%;
    }

    .tabs button:hover {
      background-color: #0056b3;
    }

    .tabs button.active {
      background-color: #0056b3;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group input, .form-group button, .form-group textarea {
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 16px;
    }

    .form-group button {
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
    }

    .form-group button:hover {
      background-color: #0056b3;
    }

    .pages-list {
      list-style-type: none;
      padding: 0;
    }

    .pages-list li {
      background-color: #f9f9f9;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      font-size: 16px;
    }

    .pages-list button {
      background-color: #dc3545;
      color: white;
      border: none;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 6px;
    }

    .pages-list button:hover {
      background-color: #c82333;
    }

    #error-message {
      color: red;
      font-size: 16px;
      margin-top: 10px;
      text-align: center;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }
  </style>
</head>

<body>

  <!-- Admin Panel -->
  <div class="admin-panel" style="display:none;">
    <h1>Willkommen im Admin-Panel</h1>
    <p>Angemeldet als: <span id="user-name"></span></p>
    <button id="logout-button" onclick="logout()">Abmelden</button>
    <hr>

    <!-- Tabs für verschiedene Bereiche -->
    <div class="tabs">
      <button id="tab-content" class="active" onclick="switchTab('content')">Inhalt bearbeiten</button>
      <button id="tab-pages" onclick="switchTab('pages')">Seiten verwalten</button>
      <button id="tab-list" onclick="switchTab('list')">Seitenliste</button>
    </div>

    <!-- Inhalt bearbeiten Tab -->
    <div id="content-tab" class="tab-content active">
      <h2>Inhalt bearbeiten</h2>
      <div class="form-group">
        <textarea id="content-text"></textarea><br>
        <input type="file" id="content-image" />
        <button onclick="saveContent()">Speichern</button>
      </div>
    </div>

    <!-- Seiten verwalten Tab -->
    <div id="pages-tab" class="tab-content">
      <h2>Seiten verwalten</h2>
      <div class="form-group">
        <input type="text" id="new-page-name" placeholder="Seitenname" />
        <div contenteditable="true" id="new-page-content" placeholder="Seiteninhalt"></div>
        <button id="create-page-button" onclick="createPage()">Seite erstellen</button>
      </div>
    </div>

    <!-- Seitenliste Tab -->
    <div id="list-tab" class="tab-content">
      <h2>Seitenliste</h2>
      <ul id="pages-list" class="pages-list"></ul>
    </div>

  </div>

  <!-- Login Form -->
  <div class="login-form">
    <h1>Admin-Login</h1>
    <div class="form-group">
      <input type="email" id="email" placeholder="E-Mail" />
    </div>
    <div class="form-group">
      <input type="password" id="password" placeholder="Passwort" />
    </div>
    <button onclick="login()">Login</button>
    <div id="error-message"></div>
  </div>

</body>

</html>
