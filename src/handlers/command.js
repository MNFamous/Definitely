const fs = require("fs");

module.exports = (client) => {
    console.logDate("Registering Commands.");
    const categories = fs.readdirSync('./src/commands').filter(file => !file.endsWith('.js'));
    const miscCommands = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
    for (const category of categories) {
        const commands = fs.readdirSync(`./src/commands/${category}`).filter(file => file.endsWith('.js'));
        for (const file of commands) {
            const command = require(`../commands/${category}/${file}`);
            const commandName = file.split('.')[0];
            if (command.data) {
                client.commands.set(commandName, command);
            } else {
                console.logDate(`Warning - Command ${commandName} is missing data therefore cannot be registered.`);
            }
            
        }
    }
    for (const commands of miscCommands) {
        const command = require(`../commands/${category}/${file}`);
        const commandName = file.split('.')[0];
        if (command.data) {
            client.commands.set(commandName, command);
        } else {
            console.logDate(`Warning - Command ${commandName} is missing data therefore cannot be registered.`);
        }
    }
    console.logDate("Registering Commands Complete.");
}