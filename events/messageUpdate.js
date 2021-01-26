require('dotenv').config();
const discordFunctions = require('../discordFunctions.js')
module.exports = (client, oldMessage, newMessage) => {
    const Discord = require('discord.js');
console.log('Seen edit!')
if (oldMessage.channel.id === discordFunctions.communitypolls) discordFunctions.extractemoji(client,newMessage)
}