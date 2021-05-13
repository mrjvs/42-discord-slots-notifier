const { MessageEmbed } = require('discord.js');

module.exports = {
    sendError(channel, message) {
        return channel.send(
            new MessageEmbed()
            .setTitle('Something went wrong')
            .setColor(0xff4646)
            .setDescription(message)
        )
    },
    sendMessage(channel, title, message, fields = []) {
        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor(0x40f783)
            .setDescription(message);
        fields.forEach(v=>embed.addField(v[0], v[1], false));
        return channel.send(embed)
    }
};
