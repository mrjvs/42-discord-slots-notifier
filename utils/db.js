const fs = require("fs");
const path = require("path");

let notifs = [];

function save() {
    // TODO encrypt cookie data, we dont want no data leaks
    fs.writeFileSync(path.join(__dirname, "../db/data.json"), JSON.stringify({
        notifs: notifs,
    }));
}

function load() {
    const data = fs.readFileSync(path.join(__dirname, "../db/data.json"), { encoding: 'utf8' });
    const parsedData = JSON.parse(data);
    notifs = parsedData.notifs;
}

// setup
if (!fs.existsSync(path.join(__dirname, "../db/data.json"))) {
    if (!fs.existsSync(path.join(__dirname, "../db")))
        fs.mkdirSync(path.join(__dirname, "../db"));
    save();
} else {
    load();
}

async function addNotif(userId, project, teamId, authCookie) {
    if (notifs.find(v=>v.teamId === teamId && v.user === userId && v.project === project))
        return "alreadyExists";
    notifs.push({
        user: userId,
        authCookie,
        project,
        teamId,
    })
    save();
    return "success";
}

async function removeNotif(userId, project, teamId) {
    const notif = notifs.find(v=>v.teamId === teamId && v.user === userId && v.project === project);
    if (!notif)
        return "noExist";
    notifs = notifs.filter(v=>!(v.teamId === teamId && v.user === userId && v.project === project));
    save();
    return "success";
}

function getNotifUser(userId) {
    return notifs.filter(v=>v.user === userId).map(v=>({
        teamId: v.teamId,
        project: v.project,
    }));
}

function getAllNotifs() {
    return notifs;
}

module.exports = {
    addNotif,
    removeNotif,
    getNotifUser,
    getAllNotifs,
};
