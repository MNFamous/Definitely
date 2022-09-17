module.exports = (client, interaction) => {
    if (!client.ready || !interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply({ content: "An error occured while executing this command.", ephemeral: true });  
    
    //Options
    if (command.options?.dev && !client.developers.includes(interaction.user.id)) 
        return interaction.reply({ content: 'You are not a bot developer!', ephemeral: true });
    if (command.options?.dmsOnly && interaction.channel.type !== 'DM') 
        return interaction.reply({ content: 'This command can only be used in DMs!', ephemeral: true });
    
    //Cooldown
    if (command.cooldown) {
        if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());
        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown ?? 3) * 1000;
        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, ephemeral: true });
            }
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    //Execution
    try {
        command.execute(client, interaction);
    } catch(err) {
        console.error(err);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}