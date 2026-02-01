// Fonction pour empecher  l'ouverture du fichier dans le navigateur)
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// gerer lorsqu'un fichier est importé via l'input
function choixFichier(e) {
    if (e.target.files.length > 0) {
        updateFileName(e.target.files[0]);
    }
}

// gerer lorsqu'il y a Drop de fichier
function dropFichier(e) {
    const DT = e.dataTransfer;
    const FILES = DT.files;

    if (FILES.length > 0) {
        AUDIOINPUT.FILES = FILES;
        updateFileName(FILES[0]);

        // On déclenche manuellement l'événement change
        const EVENT = new Event('change');
        AUDIOINPUT.dispatchEvent(event);
    }
}

// Fonction utilitaire pour le texte (inchangée)
function updateFileName(file) {
    if (file) {
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.style.color = '#4285f4';
    } else {
        fileNameDisplay.textContent = "Cliquez ou glissez un fichier audio ici";
        fileNameDisplay.style.color = '#334155';
    }
}


const AUDIOINPUT = document.getElementById('audioInput');
const DROPZONE = document.getElementById('dropZone');
let fileNameDisplay = document.getElementById('fileNameDisplay');

// Gestion du clic
AUDIOINPUT.addEventListener('change', choixFichier);

// Gestion du Drag / Drop
DROPZONE.addEventListener('dragenter', preventDefaults);
DROPZONE.addEventListener('dragover', preventDefaults);
DROPZONE.addEventListener('dragleave', preventDefaults);
DROPZONE.addEventListener('drop', preventDefaults);

// Gestion du Drop final
DROPZONE.addEventListener('drop', dropFichier);
