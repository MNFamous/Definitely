const Connections = require("../schemas/connections.js")
module.exports = (client, message) => {
	if(message.author.bot || message.content == "" ||!message.guild) return;
	Connections.findOne({ guildId:message.guild.id }, (error, guild) => {
		if (error) return console.log("An error has occurred: " + error);
		if (!guild) return;
		let channel = client.channels.cache.get(guild.connectionChannel);
		if (channel) channel.send({content: `**${message.member.user.tag}**: ${message.content}`});})
}