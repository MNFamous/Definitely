module.exports = (client, interaction) => {
    if (!client.ready || !interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply({ content: "An error occured while executing this command.", ephemeral: true });  
    
    //Options
    if (command.options?.dev && !client.developers.includes(interaction.user.id)) 
        return interaction.reply({ content: 'You are not a bot developer!', ephemeral: true });
    if (command.options?.dmsOnly && interaction.channel.type !== 'DM') 
        return interaction.reply({ content: 'This command can only be used in DMs!', ephemeral: true });
        
    //Execution
    try {
        command.execute(client, interaction);
    } catch(err) {
        console.error(err);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}