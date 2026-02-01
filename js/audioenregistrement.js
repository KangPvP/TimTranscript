//  https://wavesurfer.xyz/examples/?record.js

import WaveSurfer from '../library/wavesurfer.esm.js'
import RecordPlugin from '../library/record.esm.js'

let wavesurfer, record

function createWaveSurfer() {
  // Détruire l'instance précédente
  if (wavesurfer) {
    wavesurfer.destroy()
  }

  // Créer une nouvelle instance
  wavesurfer = WaveSurfer.create({
    container: '#mic',
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
  })

  // Initialiser le plugin d'enregistrement
  record = wavesurfer.registerPlugin(
    RecordPlugin.create({
      renderRecordedAudio: false,
      scrollingWaveform: false,
      continuousWaveform: true,
      continuousWaveformDuration: 30,
    }),
  )

  // Gérer la fin de l'enregistrement
  // On enregistre une fonction avec un argument blob qui fait referance a un enregistrement dans les logs audios
  record.on('record-end', function(blob) {
    const CONTAINER = document.getElementById('recordings')
    const recordedUrl = URL.createObjectURL(blob)

    const wavesurferInstance = WaveSurfer.create({
      container: CONTAINER,
      waveColor: 'rgb(200, 100, 0)',
      progressColor: 'rgb(100, 50, 0)',
      url: recordedUrl,
    })

    // Bouton de lecture
    const BUTTON = CONTAINER.appendChild(document.createElement('button'))
    BUTTON.textContent = 'Play'

    BUTTON.onclick = function() {
      wavesurferInstance.playPause()
    }

    wavesurferInstance.on('pause', function() {
      BUTTON.textContent = 'Play'
    })
    wavesurferInstance.on('play', function() {
      BUTTON.textContent = 'Pause'
    })

    const AUDIOINPUT = document.getElementById('audioInput');
    let fileNameDisplay = document.getElementById('fileNameDisplay');

    // On devine l'extension (webm ou wav souvent)
    const FILETYPE = blob.type.split(';')[0].split('/')[1] || 'webm';
    const FILENAME = `enregistrement_${Date.now()}.${FILETYPE}`;

    // On transforme le Blob en File (nécessaire pour l'input)
    const file = new File([blob], FILENAME, { type: blob.type });

    // 3. Utiliser DataTransfer pour "forcer" le fichier dans l'input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    AUDIOINPUT.files = dataTransfer.files;


    fileNameDisplay.textContent = FILENAME;
    fileNameDisplay.style.color = '#4285f4';
  })

  PAUSEBUTTON.style.display = 'none'
  RECBUTTON.textContent = 'Record'

  record.on('record-progress', function(time) {
    updateProgress(time)
  })
}

const progress = document.getElementById('progress')

function updateProgress(time) {
  const minutes = Math.floor((time % 3600000) / 60000)
  const seconds = Math.floor((time % 60000) / 1000)

  const formattedTime = [minutes, seconds]
    .map(function(v) {
      return v < 10 ? '0' + v : v
    })
    .join(':')

  progress.textContent = formattedTime
}

const PAUSEBUTTON = document.getElementById('pause')
PAUSEBUTTON.onclick = function() {
  if (record.isPaused()) {
    record.resumeRecording()
    PAUSEBUTTON.textContent = 'Pause'
    return
  } else {
    record.pauseRecording()
    PAUSEBUTTON.textContent = 'Reprendre'
  }

}

const MICSELECT = document.getElementById('mic-select')
RecordPlugin.getAvailableAudioDevices().then(function(devices) {
  devices.forEach(function(device) {
    const option = document.createElement('option')
    option.value = device.deviceId
    option.text = device.label || device.deviceId
    MICSELECT.appendChild(option)
  })
})

const RECBUTTON = document.getElementById('record')
const MICELEMENT = document.getElementById("mic")
RECBUTTON.onclick = async function() {
  if (record.isRecording() || record.isPaused()) {
    record.stopRecording()
    RECBUTTON.textContent = 'Enregistrer'
    PAUSEBUTTON.style.display = 'none'
    return
  }

  RECBUTTON.disabled = true

  const DEVICEID = MICSELECT.value

  const PARAMRECORD = {
    deviceId: DEVICEID,
    channelCount: 1,
  }


  await record.startRecording(PARAMRECORD);

  // On met à jour l'interface
  RECBUTTON.textContent = 'Stop';
  RECBUTTON.disabled = false;
  MICELEMENT.style.display = 'block';
  PAUSEBUTTON.style.display = 'inline';
}


// Initialisation
createWaveSurfer()
