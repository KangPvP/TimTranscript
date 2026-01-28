# AppAudioVersTexte

**AudioVersTexte** est une application web légère conçue pour transformer instantanément des fichiers audio en archives textuelles exploitables.

En s'appuyant sur l'intelligence artificielle de **Google Cloud Speech-to-Text**, l'outil permet aux utilisateurs d'uploader des enregistrements (mémos vocaux, messages de répondeur, notes de réunion) et d'obtenir une transcription écrite précise. Chaque fichier traité est automatiquement loger et ajouté à dans les sauvegardes.

## Role des fichiers
Projet en PWA voir les fichiers:
manifest.js pour changer le nom et l'hébergement du site https://srv-peda2.iut-acy.univ-smb.fr/jacqutim/AppAudioVersTexte-main/
pwa.js pour installer et recharger la page
voir la balise head de index.html
dossier favion générer par https://realfavicongenerator.net/

## Prérequis
Crée un compte Google Cloud, actuellement il existe une offre 90 gratuit avec 200euro de crédit.
Etape 1: Crée une zone projet
Etape 2: Accéder a la rubrique API et Service
Etape 3: Activé l'API Speech to Text
Etape 4: Générer un clé API

## Technique & Bibliothèques

**TailwindCSS** : Framework CSS utilisé pour gérer le responsive design.
**Wavesurfer.js** : Librairie open-source de visualisation audio pour créer des formes d'ondes interactives et personnalisables.
**LocalForage** : Librairie de stockage asynchrone pour stocker des fichiers volumineux côté client.
**Google Cloud Speech-to-Text** : API de transcription.

## Sutructure du projet
Fichier index.html
Fichier index.js
Il contient les listeners qui vérifie si des actions on été effectuer par l'utilisateurs.
Le bouton submit de l'audio, est une fonction async car elle contient un requete vers une API, on utilise cela car il y a du délais avant de recevoir la réponse. En faisant ca on met "en pause" le code javascript
https://docs.cloud.google.com/speech-to-text/docs/sync-recognize?hl=fr

Plutôt que d'affichier des messages en console, on utilise une champs de text pour affichiers le status et les erreurs à l'utilisateurs. L'id de la div est "status"
En cas d'erreur l'utilisateurs sera informé du problème rencontré

Fichier audiotraitement.js
Ce fichier est utile pour le traitement des fichiers audios, il est indispensable car il permet de d'envoyer à l'API un fichier audio universelle, l'utilisateurs n'a pas a se soucier de l'extentions de son fichier audio.
Pour que le fichier soit lu par l'API speech to text il faut que l'audio soit en Single Channel (mono)
Lors que l'enregistrement des audio avec Wavesurfer par défault il enregistre avec 2 channel, pour changer ca il faut modifier les option de la fonction startRecording(options)
https://wavesurfer.xyz/docs/classes/plugins_record.default#startRecording
```javascript
const PARAMRECORD = {
  deviceId: deviceId,
  channelCount: 1, // Force le mode mono
}

```

## Problème et Solutions Techniques
Utilisation du local storage pour crée un historique des fichiers. Rapidement je me suis conforonté au problème que les fichiers mp3 ne peuvent pas être stoquer dans les local storages surtout que cette base de donnée est limité a 5Mo. J'ai trouvé l'alternative d'utiliser une API nommé **localforage** et qui permet de stoquer des types de fichiers dans le navigateurs. J'ai besoin de stoquer les ces fichiers pour que l'historique des fichiers reste persistant même lorsqu'on quitte la page.
https://github.com/localForage/localForage

---

Lorsque le user enregistre un audio avec le micro cette audio est sur le navigateur. Pour le placer dans le champs value de la balise input de type="file", il faut une autorisation, c'est pour cela qu'on utilise l'API DataTransfère pour simuler un upload utilisateur.
https://developer.mozilla.org/fr/docs/Web/API/DataTransfer

```javascript
const DATATRANSFER = new DataTransfer();
const FILE = new File(["contenu"], "test.txt");

DATATRANSFER.items.add(FILE);

// Injection dans l'input
document.querySelector('input').files = DATATRANSFER.files;

```
---

Système de Glisser/Déposer (Drag & Drop)
Implémenté via un champ `input` caché, recouvert par une zone visuelle active pour le drop. Utilise également l'API File.


## Les library Graphique
J'utilise le Framework TailwindCSS pour gérer plus facilement le responsive designe. Download le fichier tailwind.css avec NPM
J'utilise le Wavesurfer, Wavesurfer.js is an open-source audio visualization library for creating interactive, customizable waveforms.
est une library de visualization d'audio open-source. Elle permet de custom la forme des audios et d'exploiter si il y a du son.

## 📱 Progressive Web App (PWA)

Le projet est configuré pour être installable comme une application native.

**URL de démo** : `https://srv-peda2.iut-acy.univ-smb.fr/jacqutim/AppAudioVersTexte-main/`
**`manifest.json`** : Gère le nom, les icônes et l'affichage de l'application.
**`pwa.js`** : Script de gestion pour l'installation et le rechargement de la page/cache.
**Favicons** : Générés via RealFaviconGenerator.

Projet API web en Javascript Université
