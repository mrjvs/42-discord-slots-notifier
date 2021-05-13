const { sendError, sendMessage } = require("../utils/error");
const { prefix } = require("../config.json");
const { addNotif, removeNotif, getNotifUser } = require("../utils/db");
const { testSlots } = require("../notification");

module.exports = {
    command: "notifs",
    async run(_, message, args) {
        if (!message.author)
           return await sendError(message.channel, "Couldnt find the author");
        if (args.length == 1)
            return await sendError(message.channel, `Invalid subcommand, try \`${prefix}help\``);
        switch (args[1]) {
            case "create":
                if (args.length < 5)
                    return await sendError(message.channel, `project, teamid or cookie not provided, try \`${prefix}help\``);

                // test slots
                let testNotif = { user: message.author.id, teamId: args[3], project: args[2], authCookie: args.slice(4).join(" ") }
                const testNotifResult = await testSlots(testNotif);
                if (testNotifResult == "invalidAuth") return await sendError(message.author, `Invalid cookie, It cannot be used for checking slots`);
                else if (testNotifResult == "invalidProject") return await sendError(message.author, `Invalid project, It cannot be found on the intra`);
                else if (testNotifResult == "invalidTeam") return await sendError(message.author, `Invalid team Id, Its either invalid, your not teamleader or its a closed team`);
                else if (testNotifResult == "errorFetch") return await sendError(message.author, `An unhanlded error occured, please contact the developer`);

                // create notif
                const createResult = await addNotif(testNotif.user, testNotif.project, testNotif.teamId, testNotif.authCookie);
                if (createResult === "alreadyExists")
                    return await sendError(message.author, "Notification for that project already exists");
                return await sendMessage(message.author, "Success", "Notification has been added", ["Disclaimer", "This bot uses **your** account to check for slots. We are not responsible for any consequences that may be brought to you or your intra account."]);
            case "list":
                const notifications = getNotifUser(message.author.id);
                if (notifications.length == 0)
                    return await sendMessage(message.author, "Notifications", "You have no active notifications");
                await sendMessage(message.author, "Notifications", `\`\`\`${notifications.map((v, i)=>`${i+1}. ${v.project} for team '${v.teamId}'`)}\`\`\``);
                return;
            case "delete":
                if (!args[2] || !args[3])
                    return await sendError(message.channel, `Team id or project not provided, try \`${prefix}help\``);
                const removeResult = await removeNotif(message.author.id, args[2], args[3])
                if (removeResult === "noExist")
                    return await sendError(message.author, "Notification for that project doesnt exists");
                return await sendMessage(message.author, "Success", "Notification has been removed");
            default:
                return await sendError(message.channel, `Invalid subcommand, try \`${prefix}help\``);
        }
    }
};
