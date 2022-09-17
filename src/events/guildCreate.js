const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9"); 

module.exports = (client, guild) => {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const devCommands = client.commands.filter(c => c.options?.dev).map(c => c.data.toJSON());
	client.channels.cache.get("1014960665309487124").send(`${guild.name}(${guild.id}) Has invited the bot. Total server count: ${client.guilds.cache.size}`);    
    const commands = client.commands.map(c => c.data.toJSON())
        .filter(c => !devCommands.some(d => d.name === c.name));
    
    try {
        if (commands.length > 0) {
            rest.put(Routes.applicationGuildCommands(client.application.id, guild.id), {
                body: commands
            }).then(console.logDate("New guild has been added: " + guild.name + ` (${guild.id})`)).catch(console.error);
        }
    } catch(err) {
        console.logDate("An error occured while adding commands to a new guild: " + guild.name + ` (${guild.id})` + err);
    }
}