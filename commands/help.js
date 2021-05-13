const { sendError, sendMessage } = require("../utils/error");
const { prefix } = require("../config.json");

module.exports = {
    command: "help",
    async run(_, message, __) {
        if (!message.author)
           return await sendError(message.channel, "Couldnt find the author");
        const commands = [
            "help - shows this",
            "notifs list - lists all current notifications",
            "notifs help - Provides info on how to get notification data (project, teamid or cookie)",
            "notifs delete <project> <teamid> - Deletes a notification",
            "notifs create <project> <teamid> <cookie> - creates a new slot notification"
        ].map(v=>`${prefix}${v}`).join("\n")
        await sendMessage(message.author, "Help", `\`\`\`${commands}\`\`\``)
    }
};
