require('dotenv').config();

//MongoDB
const mongoose = require('mongoose');
(async () => {
	await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	  console.log("Mongoose - Connected to database successfully.");
	}).catch(err => {
	  console.error("Mongoose - Could not connect to the database! " + err);
	});
})();
let Connections = require('./schema.js');

// - Discord -

const { Client, GatewayIntentBits, SlashCommandBuilder, Routes} = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages,GatewayIntentBits.Guilds]
});

// - Commands - 
const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('What?'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!').addBooleanOption(option => option.setName('sexy').setDescription('sexy or not?')),
	new SlashCommandBuilder().setName('connect').setDescription('Adds the bot to connection queue.'),
	new SlashCommandBuilder().setName('disconnect').setDescription('Disconnects the bot from connection.')
].map(command => command.toJSON());

const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const temp = [];

// - Events	-

client.on("ready", () => {
    console.log("Bot is Sexy");
});

client.on("guildCreate", async guild => {
	client.channels.cache.get("1014960665309487124").send(`${guild.name}(${guild.id}) Has added the bot. Total server count: ${client.guilds.cache.size}`);
	rest.put(Routes.applicationGuildCommands(process.env.CLIENTID , guild.id),{ body: commands })
		.then(() => console.log(`Successfully registered application commands. ${guild.name}`))
		.catch(console.error);
});

client.on("guildDelete", async guild => {
	client.channels.cache.get("1014960665309487124").send(`${guild.name}(${guild.id}) Has removed the bot. Total server count: ${client.guilds.cache.size}`);
	Connections.findOne({guildId:guild.id}, async (error,dbguild) => {
		if (error) return console.log(error);
		if (dbguild) {
			dbguild.remove().then(() => {
				Connections.findOne({ guildId: client.channels.cache.get(dbguild.connectionChannel).guild.id }, (error,dbguild2) => {
					if (error) return console.log(error);
					dbguild2.remove().then(() => {
						client.channels.cache.get(dbguild.connectionChannel).send('Bot is disconnected by other channel. Please type "/connect".');
					});
				});	
			});
		}
	});
});

client.on("messageCreate", async message => {
	if(message.member.user.bot || message.content == "") return;
	Connections.findOne({ guildId:message.guild.id }, (error, guild) => {
		if (error) return console.log("An error has occurred, " + error);
		if (!guild) return;
		let channel = client.channels.cache.get(guild.connectionChannel);
		if (channel) channel.send({content: `**${message.member.user.tag}**: ${message.content}`});})
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply(`What?`);
	} else if (commandName === 'user') {
        if (interaction.options.getBoolean('sexy')) {
		    await interaction.reply(`${interaction.user.username} is so sexy today.`);
		} else {
            await interaction.reply(`${interaction.user.username} isn't sexy today. ;-;`);
		}
	} else if (commandName === 'connect') {
		Connections.findOne({guildId:interaction.guild.id}, (error,guild) => {
			if (error) console.log(error);
			if (!guild) {
				if (temp.length < 2) {
					if (temp.length == 0) {
						temp.push([interaction.guild.id,interaction.channelId]);
						interaction.reply('Channel joined to queue.')
					} else if(temp[0][0] == interaction.guild.id) {
						return interaction.reply("Server already in a queue.");
					} else {
						temp.push([interaction.guild.id,interaction.channelId]);
					}
				}	
				if (temp.length == 2) {
					Connections.findOne({ guildId: interaction.guild.id }, async (error, guild) => {
						if (error) return console.log(error);
						if (!guild) {
							var connect = new Connections({
								guildId: temp[0][0],
								guildChannel: temp[0][1],
								connectionChannel: temp[1][1]
							});
							var connect2 = new Connections({
								guildId: temp[1][0],
								guildChannel: temp[1][1],
								connectionChannel: temp[0][1]
							});
							connect.save();
							connect2.save();
							temp.length = 0;
							await interaction.reply("Server successfully connected an another channel!");
						} else if (guild) return;
					});
				}
			}
			if (guild) return interaction.reply("You've already connected.");
		});
	} else if (commandName === 'disconnect') {
		Connections.findOne({guildId:interaction.guild.id}, async (error,guild) => {
			if (error) return console.log(error);
			if (!guild) return interaction.reply("You have to connect first.");
			if (guild) {
				guild.remove().then(() => {
					Connections.findOne({ guildId: client.channels.cache.get(guild.connectionChannel).guild.id }, (error,guild2) => {
						if (error) return console.log(error);
						guild2.remove().then(() => {
							client.channels.cache.get(guild.connectionChannel).send('Bot is disconnected by other channel. Please type "/connect".');
							return interaction.reply('Bot is disconnected.');
						});
					});	
				});
			}
		});
	}
});

client.login(process.env.TOKEN);