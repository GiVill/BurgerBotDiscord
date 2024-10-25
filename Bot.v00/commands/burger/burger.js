const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { Readable } = require('stream'); // Importa il modulo Readable
const path = require('node:path');
const fs = require('fs');
const { ElevenLabsClient } = require("elevenlabs");

const { ttsgenerator, generateAudio } = require('../../ttsgenerator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('burger')
		.setDescription('Burger story.')
		.addStringOption(option => 
			option.setName('message')
				.setDescription('Type your burger story')
				.setRequired(true)), // Il campo del messaggio è obbligatorio
	async execute(interaction) {
		let filePath;
		let fileName;
		const userMessage = interaction.options.getString('message') || "No story provided.";

		// Controlla se l'utente è in un canale vocale
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			return interaction.reply('Devi essere in un canale vocale per usare questo comando!');
		}

		if (userMessage === "prova") {
			// Usa il file MP3 predefinito
			filePath = path.join(__dirname, 'assets', 'prova.mp3');
			console.log('Playing file from path:', filePath);
		}else if(userMessage === "storia1"){
			filePath = path.join(__dirname, 'assets', 'storia1.mp3');
			console.log('Playing file from path:', filePath);
		}else if(userMessage === "jacopo"){
			filePath = path.join(__dirname, 'assets', 'jacopo.mp3');
			console.log('Playing file from path:', filePath);
		}else if(userMessage === "sh"){
			filePath = path.join(__dirname, 'assets', 'sh.mp3');
			console.log('Playing file from path:', filePath);
		} else {
			// Genera l'audio usando ElevenLabs e aspetta che il file sia pronto
			try {
				fileName = await generateAudio(userMessage,'Adam')
				filePath = path.join(__dirname, 'assets',fileName );
				// Rispondi subito all'interazione per evitare timeout
		await interaction.channel.send(`Burger sta parlando ...   ${fileName}`);

				console.log(`File audio generato con successo: ${filePath}`);
			} catch (error) {
				console.error(`Errore nella generazione del TTS: ${error}`);
				return interaction.followUp('Errore durante la generazione del TTS.');
			}
		}

		// Unisci il bot al canale vocale
		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: interaction.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		// Crea un player audio
		const player = createAudioPlayer();

		// Crea la risorsa audio dal file e riproducila
		try {
			const resource = createAudioResource(filePath);
			player.play(resource);
			connection.subscribe(player);

			player.on(AudioPlayerStatus.Playing, () => {
				console.log('Il file audio sta riproducendo!');
			});

			player.on('error', error => {
				console.error(`Errore durante la riproduzione dell'audio: ${error.message}`);
			});
		} catch (error) {
			console.error(`Errore nel riprodurre il file audio: ${error.message}`);
			return interaction.followUp('Errore durante la riproduzione del file audio.');
		}
	},
};
