const { SlashCommandBuilder: Builder } = require('@discordjs/builders');
const Connections = require("../../schemas/connections.js")
module.exports = {
    data: new Builder()
        .setName("disconnect")
        .setDescription("Disconnects the channel."),
	options: {
		cooldown: 5
	},
    async execute(client, interaction) {
        Connections.findOne({guildId:interaction.guild.id},async (error,guild) =>{
			if(error){console.log(error)}
			if(!guild){interaction.reply("You have to connect first with another server for disconnecting.")}
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
}