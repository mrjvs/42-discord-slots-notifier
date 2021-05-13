const Discord = require('discord.js');
const cmds = require("./commands");
const { sendError } = require("./utils/error");
const { startScheduler } = require('./notification');
const { token, prefix } = require("./config.json");
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Starting scheduler`);
    startScheduler(client);
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    // dont respond to bots
    if (msg.author && msg.author.bot)
        return;
    // must start with prefix
    if (!msg.content.startsWith(prefix))
        return;

    // split into args
    const args = msg.content.split(" ").filter(v=>v.length!==0);

    // try every command
    for (const cmd of cmds) {
        if (args[0] === `${prefix}${cmd.command}`) {
            // match found, execute
            try {
                const prom = cmd.run(client, msg, args);
                if (prom instanceof Promise)
                    await prom;
            } catch (err) {
                // failed to execute
                console.error("Command execution failed", err);
                sendError(msg.channel, "Failed to execute command");
            }
            return;
        }
    }
});

client.login(token)
.then(() => "Logged in!")
.catch(err => {
    console.error("Error occured trying to login", err)
})
