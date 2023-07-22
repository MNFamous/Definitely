const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const devs = process.env.DEV.split(",");

const addGuildCommands = async (client, commands) => {
    let deployCount = 0;
    
    for (const guild of client.guilds.cache.values()) {
        let a = await restPut(client.application.id, guild.id, commands);
        deployCount += a;
    }
    return deployCount;
}
    
const restPut = (clientId, guildId, commands) =>
    new Promise(async (resolve, reject) => {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { 
            body: commands 
        }).then(() => { 
            resolve(1); 
        }).catch((err) => {
            console.error(err);
            reject(0);
        });
    });


module.exports = async (client) => {
    const devCommands = client.commands.filter(c => c.options?.dev).map(c => c.data.toJSON());
    const commands = client.commands.map(c => c.data.toJSON())
        .filter(c => !devCommands.some(d => d.name === c.name));

    try {
        console.logDate("Deploying the application commands...");

        if (commands.length > 0) {
            deployCount = await addGuildCommands(client, commands);
        }

        console.logDate(`Successfully deployed ${commands.length} commands into ${deployCount}/${client.guilds.cache.size} guilds.`);

        if (devCommands.length > 0) {
            devCommands.push(...commands);
            await rest.put(Routes.applicationGuildCommands(client.application.id, process.env.DEV_GUILD), {
                body: devCommands
            });
        }
    } catch(err) {
        console.logDate("An error occured while deploying commands: " + err);
    }
    return;
}