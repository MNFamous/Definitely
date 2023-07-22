module.exports = async (client) => {
    console.logDate("Initiliazing client...");

    const args = process.argv.slice(2);
    if (args.includes("--deployCommands") || args.includes("-dc")) {
        await require("../util/deployCommands.js")(client);
    }

    client.ready = true;
    console.logDate("Ready!");
}