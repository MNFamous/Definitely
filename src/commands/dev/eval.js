const { SlashCommandBuilder: Builder } = require('@discordjs/builders');
const { EmbedBuilder: Embed } = require("discord.js");
const { inspect } = require("util");

module.exports = {
    data: new Builder()
    .setName('eval')
    .setDescription('Evaluate a piece of code.')
    .addStringOption(option => 
        option.setName('code')
            .setDescription('The code to evaluate.')
            .setRequired(true)
    ),
    options: {
        dev: true
    },
    async execute(client, interaction) {
        
        let code = interaction.options.getString("code");

        await interaction.reply({
            embeds: [new Embed().setDescription("Evaluating code...")],
            ephemeral: true
        });

        try {
            let output = eval(code);
      
            if (output instanceof Promise || (Boolean(output) && typeof output.then === "function" && typeof output.catch === "function")) output = await output;
            output = inspect(output, {
                depth: 0,
                maxArrayLength: null
            });

            output = clean(output);
      
            if (output.includes(client.token)) return interaction.editReply("Not today.");
      
            if (output.length > 1000 || code.length > 1000) {
                hastebin(output, { url: "https://paste.hep.gg", extension: "txt" }).then(haste => {
                    const embed = new Embed()
                        .setTitle("Output was too long, uploaded to hastebin and logged to console!")
                        .setURL(haste)
                        .setColor("#fcfffd");
                    console.log(output);
                    interaction.editReply({
                        embeds: [embed],
                        ephemeral: true
                    })
                }).catch(err => {
                    console.log("Hastebin error: " + err)
                    interaction.editReply({
                        content: "Hastebin error, output was too long and could not be uploaded, please check the console logs.",
                        ephemeral: true
                    })
                });
            } else {
                const embed = new Embed()
                    .addFields({name: "Input", value: `\`\`\`js\n${code}\`\`\``})
                    .addFields({name: "Output", value:  `\`\`\`js\n${output}\`\`\``})
                    .setColor("#fcfffd");
                interaction.editReply({
                    embeds: [embed],
                    ephemeral: true
                })
            }
        } catch (e) {
            const embed = new Embed()
                .setDescription(`\`\`\`js\n${e}\`\`\``)
            interaction.editReply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
}


function clean(text) {
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  };
  