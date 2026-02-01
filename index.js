const API_KEY = 'AIzaSyDvhEEI4Nb7yo1b1RRwitaU9Y7JpgguTUY';

const STATUSDIV = document.getElementById('status');
const RESULTOUTPUT = document.getElementById('resultOutput');
const sendBtn = document.getElementById('sendBtn');

// Configuration de la clé de stockage
const LOGSCONTAINER = document.getElementById('logsContainer');
const LOGVIDE = document.getElementById('emptyMsg');

// Fonction qui recupere les audios Save et les affiches
async function setupEntrersAudioLog() {
    try {
        // On récupère le tableau des audios Save
        const TABLEAUDIOSAVE = await localforage.getItem("historique_transcriptions");

        if (TABLEAUDIOSAVE != null && TABLEAUDIOSAVE.length > 0) {

            LOGVIDE.style.display = 'none'; // On cache le message "Aucun historique"

            // On boucle sur chaque audio Sauvegarder
            for(const LOGDATA of TABLEAUDIOSAVE) {
                addEntrerAudioLog(LOGDATA);
            }
        }
    } catch (err) {
        console.error("Erreur lors du chargement de l'historique:", err);
    }
}

// Au chargment de la page, on setup l'historique si il existe
setupEntrersAudioLog();

import WaveSurfer from './library/wavesurfer.esm.js'

// Fonction qui ajoute un audio dans l'historique HTML
function addEntrerAudioLog(logData) {
    // 1. Créer l'URL du blob
    const AUDIOURL = URL.createObjectURL(logData.audio);

    const DIV = document.createElement('div');
    DIV.className = 'log-entry mb-6 p-4 bg-white rounded-xl shadow';

    const UNIQUEID = `waveform-${logData.id}`;

    // Format HTML d'un audio sauvegardé
    DIV.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h4 class="font-bold text-slate-700 truncate max-w-[200px] sm:max-w-md">${logData.fileName}</h4>

            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${logData.date}</p>
        </div>
        <div id="${UNIQUEID}" class="mb-4"></div>
        <button class="w-full sm:w-auto bg-blue-600 text-white bg-blue-600 px-3 py-1 mb-2 rounded-xl font-bold" id="btn-${UNIQUEID}">Lecture</button>

        <div class="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">${logData.text}</div>

    `;

    // Ajouter a la DIV parent au début
    LOGSCONTAINER.prepend(DIV);

    // 5. Initialisation de WaveSurfer sur l'ID unique
    const WAVESURFER = WaveSurfer.create({
        container: `#${UNIQUEID}`, // On met l'audio dans le container DIV avec l'id UNIQUEID
        waveColor: '#4F4A85',
        progressColor: '#383351',
        url: AUDIOURL,             // L'URL du fichier audio

        height: 60,
        barWidth: 2,               // Style
        barGap: 1,
        cursorColor: '#ff5722',
    });

    // Gestion du Bouton Play/Pause
    const PLAYBTN = document.getElementById(`btn-${UNIQUEID}`);

    // Quand on clique sur le bouton
    PLAYBTN.onclick = function() {
        WAVESURFER.playPause();
    };

    // Changer le texte du bouton quand le son joue ou se met en pause
    WAVESURFER.on('play', function() { PLAYBTN.textContent = 'Pause'; });
    WAVESURFER.on('pause', function() { PLAYBTN.textContent = 'Lecture'; });

    // Quand le son est fini, on remet le bouton à zéro
    WAVESURFER.on('finish', function() { PLAYBTN.textContent = 'Lecture'; });
}

sendBtn.addEventListener('click', async function() {
    const inputElement = document.getElementById('audioInput');

    // Si la PWA est Offline On affiche un message d'erreur Propre
    if (!navigator.onLine) {
        STATUSDIV.innerHTML = `
            <strong style="color: #e67e22;"> Mode Hors Ligne détecté</strong><br>
            La transcription nécessite une connexion Internet pour utiliser l'API
        `;
        STATUSDIV.className = "status";

    } else {
      if (inputElement.files.length == 0) {
          STATUSDIV.innerHTML = "Veuillez sélectionner un fichier d'abord.";
          STATUSDIV.className = "status";
      } else {

         // Si il y a un fichier dans le input
        const FILE = inputElement.files[0];

        // On reste l'output du fichier précédant
        RESULTOUTPUT.value = "";
        STATUSDIV.className = "status";
        STATUSDIV.textContent = "1/4. Lecture et décodage du fichier audio...";
        sendBtn.disabled = true;

        try {
            // ÉTAPE 1 : Conversion universelle en WAV (LINEAR16)
            // Cela gère le M4A, le MP3, et récupère le bon SampleRate
            const audioData = await convertFileToWavBase64(FILE);

            STATUSDIV.textContent = `2/4. Fichier converti en WAV (${audioData.sampleRate}Hz). Envoi à Google...`;

            // ÉTAPE 2 : Préparation de la requête Google
            const PAYLOAD = {
                config: {
                    encoding: "LINEAR16", // On force LINEAR16 car on vient de convertir en WAV
                    sampleRateHertz: audioData.sampleRate, // La fréquence exacte issue du décodage
                    languageCode: "fr-FR",
                    enableAutomaticPunctuation: true,
                    model: "default"
                },
                audio: {
                    content: audioData.base64
                }
            };

            // ÉTAPE 3 : Appel API Fetch
            const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(PAYLOAD)
            });

            const DATA = await response.json();

            // ÉTAPE 4 : Gestion du résultat
            STATUSDIV.textContent = "Terminé.";

            if (DATA.error) {
                throw new Error(`Erreur API Google (${DATA.error.code}): ${DATA.error.message}`);
            }

            if (DATA.results) {
              let transcript = "";

              // On parcourt chaque résultat un par un
              for (const RESULT of DATA.results) {
                // On ajoute le texte + un saut de ligne
                transcript += RESULT.alternatives[0].transcript + "\n";
              }

              RESULTOUTPUT.value = transcript;
                // Struncture du JSON a sauvegarder
                const NEWLOGJSON = {
                    id: Date.now(), // ID unique
                    date: new Date().toLocaleString('fr-FR'),
                    fileName: FILE.name,
                    text: transcript,
                    audio: FILE // Fichier audio
                };

                LOGVIDE.style.display = 'none';
                addEntrerAudioLog(NEWLOGJSON);

                // Sauvegarde dans LocalForage
                try {
                    // On récupère l'existant ou un tableau vide
                    let tableaudiosave = await localforage.getItem("historique_transcriptions");
                    if (!tableaudiosave) {
                        tableaudiosave = [];
                    }

                    // On ajoute le nouveau log au début du tableau = .append
                    tableaudiosave.unshift(NEWLOGJSON);

                    // On sauvegarde le tout
                    await localforage.setItem("historique_transcriptions", tableaudiosave);

                } catch (err) {
                    console.error("Erreur de sauvegarde LocalForage:", err);
                }

                STATUSDIV.textContent = "Transcription terminée et ajoutée aux logs.";

            } else {
                RESULTOUTPUT.value = "(Aucune parole détectée ou audio trop silencieux)";
            }

        } catch (error) {
            console.error(error);
            STATUSDIV.textContent = error.message;
            STATUSDIV.className = "status error";
        }
        sendBtn.disabled = false;
      }
    }
});
