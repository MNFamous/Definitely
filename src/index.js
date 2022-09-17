require("dotenv").config();

console.logDate = (str) => {
    let date = new Date().toLocaleDateString("tr-TR", { year:"numeric", month:"2-digit", day:"2-digit",hour: "numeric", minute: "numeric", second: "numeric" });
    console.log(`[${date}] - ${str}`);
}

const mongoose = require('mongoose');
(async () => {
	await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	  console.log("Mongoose - Connected to database successfully.");
	}).catch(err => {
	  console.error("Mongoose - Could not connect to the database! " + err);
	});
})();

const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds,GatewayIntentBits.MessageContent]
});

client.events = new Collection();
client.commands = new Collection();
client.cooldowns = new Collection();
client.ready = false;
client.temp = [];
client.developers = process.env.DEV.split(",").map(id => id.trim());

["event","command"].forEach(handler => {
    require(`./handlers/${handler}.js`)(client);
});

client.login(process.env.TOKEN);