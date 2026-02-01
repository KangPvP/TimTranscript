// Convertir un Fichier audio en fichier WAV
async function convertFileToWavBase64(file) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {
        const arrayBuffer = await file.arrayBuffer();
        // Décodage natif du navigateur (gère MP3, AAC/M4A, OGG...)
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Conversion RAW -> WAV
        const wavBlob = bufferToWav(audioBuffer);

        // Blob -> Base64
        const base64 = await blobToBase64(wavBlob);

        return {
            base64: base64,
            sampleRate: audioBuffer.sampleRate
        };
    } finally {
        // Toujours fermer le contexte pour libérer la mémoire
        if (audioContext.state !== 'closed') {
            audioContext.close();
        }
    }
}

// Convertit un Blob en chaîne Base64 pure (sans l'en-tête "data:audio/...")
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
    });
}

// Convertit un AudioBuffer en fichier WAV (Blob)
// Algorithme standard pour écrire les en-têtes RIFF WAVE
function bufferToWav(abuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // Fonction helper pour écrire des chaînes
    function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }
    function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }

    // 1. Écriture en-tête RIFF
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // taille fichier - 8
    setUint32(0x45564157); // "WAVE"

    // 2. Écriture en-tête fmt
    setUint32(0x20746d66); // "fmt "
    setUint32(16);         // longueur PCM
    setUint16(1);          // Audio format (1 = PCM)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16);            // bits per sample

    // 3. Écriture en-tête data
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // taille chunk data

    // 4. Écriture des données audio (entrelacées)
    for(i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {
            // Le sample est entre -1 et 1 (float), on le convertit en Int16
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });
}
