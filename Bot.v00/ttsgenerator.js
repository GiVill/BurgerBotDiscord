const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const prism = require('prism-media');
const { Readable } = require('stream');
const { elevenlabsApiKey } = require('./config.json');

const { ElevenLabsClient } = require("elevenlabs");

// Endpoint API di ElevenLabs
const apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech';

// Parametri per la richiesta
const voiceName = 'Adam';  // Inserisci l'ID della voce che desideri usare

const elevenlabs = new ElevenLabsClient({ apiKey: elevenlabsApiKey });

// Funzione per generare l'audio
async function generateAudio(text, voiceName) {
    try {
        const response = await elevenlabs.generate({
            stream: true,
            voice: voiceName,
            text: text,
            model_id: "eleven_multilingual_v2"
        });

        // Genera un nome dinamico per il file con data e ora
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-'); // Rimuove i caratteri non validi
        const fileName = `voice_${timestamp}.mp3`;

        // Definisci il percorso per salvare il file nella cartella ./commands/burger/assets
        const filePath = path.join(__dirname, 'commands', 'burger', 'assets', fileName);

        // Creare un file stream per scrivere l'output in formato MP3
        const fileStream = fs.createWriteStream(filePath);

        // Scrivere lo stream audio nel file
        response.pipe(fileStream);

        // Restituisce il nome del file solo dopo che la scrittura è stata completata
        return new Promise((resolve, reject) => {
            // Eventi di completamento e gestione degli errori
            fileStream.on('finish', () => {
                console.log('File MP3 generato con successo:', fileName);
                resolve(fileName);  // Restituisce il nome del file quando la scrittura è completata
            });

            fileStream.on('error', (error) => {
                console.error('Errore durante la scrittura del file:', error);
                reject(error);  // Propaga l'errore se qualcosa va storto
            });
        });

    } catch (error) {
        console.error('Errore durante la generazione dell\'audio:', error.message);
        throw error;  // Propaga l'errore in modo che possa essere gestito all'esterno
    }
}

module.exports = { generateAudio };
