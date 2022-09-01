require('dotenv').config();
const { Client, GatewayIntentBits,SlashCommandBuilder, Routes, Collection, DataResolver, APIApplicationCommandPermissionsConstant} = require('discord.js');
const { REST } = require('@discordjs/rest');
const mongoose = require('mongoose');
(async () => {
	await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	  console.log("Mongoose - Connected to database successfully.");
	}).catch(err => {
	  console.error("Mongoose - Could not connect to the database! " + err);
	});
})();
let Connections = require('./schema.js');
const token = process.env.TOKEN;
const clientId = process.env.CLIENTID
const temp = []
const client = new Client({
    intents: [GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages,GatewayIntentBits.Guilds]
})
const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('What?'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!').addBooleanOption(option => option.setName('sexy').setDescription('sexy or not?')),
	new SlashCommandBuilder().setName('connect').setDescription('Enables Cock Dock'),
	new SlashCommandBuilder().setName('disconnect').setDescription('Enables Cock Dock')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
client.on("guildCreate",async guild =>{
	rest.put(Routes.applicationGuildCommands(clientId , guild.id),{ body: commands })
	.then(() => console.log(`Successfully registered application commands. ${guild.name}`))
	.catch(console.error);
})

client.on("messageCreate",async message =>
{
	if(message.member.user.bot || message.content == "")return;
	Connections.findOne({ guildId:message.guild.id }, (error, guild) => {if(error){
		console.log("An error has occurred,",error);return;}
		if(!guild)return;
		let channel = client.channels.cache.get(guild.connectionChannel)
		if (channel) channel.send({content: `**${message.member.user.tag}**: ${message.content}`});})
}	
);

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply(`What?`);
	}else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	}else if (commandName === 'user') {
        if(interaction.options.getBoolean('sexy')){
		    await interaction.reply(`${interaction.user.username} is so sexy today.`);}
        if(!interaction.options.getBoolean('sexy')){
            await interaction.reply(`${interaction.user.username} isn't sexy today. ;-;`);}
	}else if (commandName === 'connect') {
		Connections.findOne({guildId:interaction.guild.id}, (error,guild) => {
			if(error)console.log(error);
			if(!guild){
				if(temp.length < 2){
					console.log("temp:" + temp.length);
					if(temp.length==0){
					temp.push([interaction.guild.id,interaction.channelId]);
					console.log("first temp")
					interaction.reply('Bot is connected.')}
					else if(temp[0][0] == interaction.guild.id){interaction.reply("Server already in a queue.");return;}
					else{temp.push([interaction.guild.id,interaction.channelId]);
					console.log("second temp")}
					console.log("array added");}	
					if(temp.length == 2)
					{
						console.log("sequence");
						Connections.findOne({ guildId:interaction.guild.id }, async (error, guild) => {
							if (error){console.log(error)}
							if (!guild)
							{
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
								console.log("Connections added");
								temp.length = 0;
								await interaction.reply("Server successfully connected an another channel!");
							};
							if (guild)return;})
						}			
			
				}
			if(guild){
				interaction.reply("You've already connected.")
				console.log("in but not executed")
			}
		})
		console.log("outside: "+ temp.length);
	}else if (commandName === 'disconnect') {
		Connections.findOne({guildId:interaction.guild.id},async (error,guild) =>{
			if(error){console.log(error)}
			if(!guild){interaction.reply("You have to connect first. Bitch!")}
			if(guild)
			{
				guild.remove().then(() => {
					console.log(client.channels.cache.get(guild.connectionChannel).guild.id)
					Connections.findOne({guildId:client.channels.cache.get(guild.connectionChannel).guild.id},(error,guild2) =>{
						if(error)console.log(error);
						guild2.remove().then(() => {
							client.channels.cache.get(guild.connectionChannel).send('Bot is disconnected by other channel. Please type "/connect".');
							interaction.reply('Bot is disconnected.');
						});
					});	
				});
			}
			})
			
	}
});
client.on("ready",()=>{
    console.log("Bot is Sexy")
})
client.login(token);