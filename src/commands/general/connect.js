const { SlashCommandBuilder: Builder } = require('@discordjs/builders');
const Connections = require("../../schemas/connections.js")

module.exports = {
    data: new Builder()
        .setName("connect")
        .setDescription("Connects current channel to another servers channel."),
	options: {
		cooldown: 5
	},
    async execute(client, interaction) {
		if (!interaction.channel.permissionsFor(client.user.id).has("SendMessages")) return interaction.reply("I do not have permission to send messages in this channel, to connnect please give me Send Messages permission.")
        Connections.findOne({ guildId:interaction.guild.id }, (error, guild) => {
			if (error) console.log(error);
			if (!guild) {

				if (client.temp.length < 2) {
					if (client.temp.length == 0) {
						client.temp.push([interaction.guild.id,interaction.channelId]);
						interaction.reply('Bot joined to the connection queue.');
					} else if (client.temp[0][0] == interaction.guild.id){
						interaction.reply("Server already in a queue.");
						return;
					} else {
						client.temp.push([interaction.guild.id,interaction.channelId]);
					}
				}

				if(client.temp.length == 2) {
					Connections.findOne({ guildId:interaction.guild.id }, async (error, guild) => {
						if (error){console.log(error)}
						if (!guild)
						{
							var connect = new Connections({
								guildId: client.temp[0][0],
								guildChannel: client.temp[0][1],
								connectionGuildId: client.temp[1][0],
								connectionChannel: client.temp[1][1]
							});
							var connect2 = new Connections({
								guildId: client.temp[1][0],
								guildChannel: client.temp[1][1],
								connectionGuildId: client.temp[0][0],
								connectionChannel: client.temp[0][1]
							});
							connect.save();
							connect2.save();
							console.log("Connections added");
							client.channels.cache.get(client.temp[0][1]).send('Server successfully connected an another channel!');
							client.temp.length = 0;
							await interaction.reply("Server successfully connected an another channel!");
						};
					})
				}
			}
			if (guild) interaction.reply("You're already connected.")
		})
    }
}