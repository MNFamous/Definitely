const Connections = require("../schemas/connections.js")
module.exports = (client, guild) => {
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
}