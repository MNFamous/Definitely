const { SlashCommandBuilder: Builder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
    data: new Builder()
        .setName("refresh")
        .setDescription("Refreshes a command.")
        .addStringOption(option => 
            option.setName("command")
                .setDescription("The command to refresh.")
                .setRequired(true)),
    options: {
        dev: true
    },
    async execute(client, interaction) {
        const commandName = interaction.options.getString("command");
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            return interaction.reply({ content: "That command does not exist.", ephemeral: true });
        }

        const commandFolders = fs.readdirSync("./src/commands");
        const folderName = commandFolders.find(folder => fs.readdirSync(`./src/commands/${folder}`).includes(`${commandName}.js`));

        delete require.cache[require.resolve(`../${folderName}/${commandName}.js`)];

        try {
            const newCommand = require(`../${folderName}/${commandName}.js`);
            client.commands.set(newCommand.data.name, newCommand);

            for (guild of client.guilds.cache.values()) {
                let commands = await guild.commands.fetch();
                commands.map(async cmd => {
                    if (cmd.name == command.data.name) {
                        await guild.commands.edit(cmd.id, newCommand.data.toJSON()).catch(console.error)
                    }
                })        
            }

            interaction.reply({ content: `Successfully refreshed command \`${commandName}\`.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: `There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``, ephemeral: true });
        }
    }
}