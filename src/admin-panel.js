// admin-panel.js

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveDraft');
    const fileInput = document.getElementById('fileInput');
    const outputMessage = document.getElementById('outputMessage');

    // Datei-Upload
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/upload.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                console.log('Upload erfolgreich:', data);
                outputMessage.textContent = `Upload erfolgreich: ${data.filename}`;
            } else {
                console.error('Fehler beim Upload:', data.error);
                outputMessage.textContent = `Fehler: ${data.error}`;
            }
        } catch (error) {
            console.error('Fehler beim Hochladen:', error);
            outputMessage.textContent = 'Fehler beim Upload.';
        }
    };

    // Datei speichern (mit Fehlerbehandlung)
    saveButton.addEventListener('click', async () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            await uploadFile(file);
        } else {
            outputMessage.textContent = 'Bitte wählen Sie eine Datei aus!';
        }
    });
});
