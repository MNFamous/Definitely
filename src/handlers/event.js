const fs = require("fs");

module.exports = (client) => {
    console.logDate("Registering Events.");
    const eventFiles = fs.readdirSync('./src/events').filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`../events/${file}`);
        const eventName = file.split('.')[0];
        client.events.set(eventName, event);
        client.on(eventName, (...args) => client.events.get(eventName)(client, ...args));
    }
    console.logDate("Registering Events Completed.");
}