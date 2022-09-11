const { SlashCommandBuilder: Builder } = require('@discordjs/builders');

module.exports = {
    data: new Builder()
        .setName("test")
        .setDescription("Test command."),
    async execute(client, interaction) {
        interaction.reply("Testing!");
    }
}