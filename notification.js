const cron = require('node-cron');
const moment = require('moment');
const fetch = require('node-fetch');
const { getAllNotifs, removeNotif } = require('./utils/db');
const { sendMessage, sendError } = require('./utils/error');

async function runFetch(notif) {
    const today = moment();
    const startDate = today.startOf('week').format('YYYY-MM-DD');
    const endDate = today.endOf('week').add(1, 'days').format('YYYY-MM-DD');
    try {
        let response;
        const result = await fetch(`https://projects.intra.42.fr/projects/${notif.project}/slots.json?team_id=${notif.teamId}&start=${startDate}&end=${endDate}`, {
            headers: {
                'Cookie': notif.authCookie,
            }
        })
        .then(v=>{
            response = v;
            return v.json()
        });
        if (response.status === 401)
            return "invalidAuth"
        if (response.status === 404)
            return "invalidProject"
        if (response.status === 403)
            return "invalidTeam"
        if (response.status != 200) {
            console.error("unhandled fetch response", response);
            return "errorFetch";
        }
        if (result.length > 0)
            return "foundNotif"
        return "noNotif"
    } catch (err) {
        console.error("error running fetch", err);
        return "errorFetch";
    }
}

function init(client) {
    // run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        const notifs = getAllNotifs();
        for (let notif of notifs) {
            try {
                const result = await runFetch(notif);
                if (result == "foundNotif") {
                    const user = await client.users.fetch(notif.user);
                    sendMessage(user, `Slot found for ${notif.project}`, `Hey there, we found some evaluation slots for you use for your ${notif.project} code`);
                    continue;
                } else if (result == "invalidAuth") {
                    const user = await client.users.fetch(notif.user);
                    removeNotif(notif.user, notif.project, notif.teamId);
                    sendError(user, `Hey there, It seems the cookie for ${notif.project} has expired, the notification has been removed. If you want to, you can add it back with a new cookie`);
                    continue;
                } else if (result == "invalidProject") {
                    const user = await client.users.fetch(notif.user);
                    removeNotif(notif.user, notif.project, notif.teamId);
                    sendError(user, `Hey there, it seems that the project ${notif.project} has been removed, the notification for it has been removed`);
                    continue;
                } else if (result == "invalidTeam") {
                    const user = await client.users.fetch(notif.user);
                    removeNotif(notif.user, notif.project, notif.teamId);
                    sendError(user, `Hey there, it seems that the team ${notif.teamId} for project ${notif.project} has been closed, the notification for it has been removed`);
                    continue;
                }
            } catch (err) {}
        }
    });
}

function testSlots(notif) {
    return runFetch(notif);
}

module.exports = {
    startScheduler: init,
    testSlots,
};
