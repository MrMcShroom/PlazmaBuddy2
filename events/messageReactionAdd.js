require('dotenv').config();
const discordFunctions = require('../discordFunctions.js')
module.exports =async (client, reaction, user) => {
    const Discord = require('discord.js');
    console.log("Seen react!")
	  
	//
	const message = reaction.message;
	let guilduser = await message.guild.members.fetch(message.author.id);
	if (message.channel.id === discordFunctions.communitypolls) return;
    if (reaction.emoji.name !== '⭐') return;
    if (message.author.id === user.id) return;
    if (message.author.bot) return;
	//const { starboardChannel } = client.settings.get(message.guild.id);
	//channel.messages.fetch
	const channel = client.channels.cache.get(process.env.starboard);
    const starChannel = channel
    if (!starChannel) return message.channel.send(`It appears that you do not have a \`${channel}\` channel.`); 
    const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
    const stars = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));
    if (stars) {
      const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      const foundStar = stars.embeds[0];
      const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
	  const embed = new Discord.MessageEmbed()
		.setColor(foundStar.color)
		
        .setDescription(foundStar.description)
        .setAuthor(message.author.tag + " / " + guilduser.nickname, message.author.displayAvatarURL({dynamic:true }))
        .setTimestamp()
        .setFooter(`⭐ ${parseInt(star[1])+1} | ${message.id}`)
		.setImage(image)
		
		const starMsg = await starChannel.messages.fetch(stars.id);
      await starMsg.edit({ embed });
    }
    if (!stars && reaction.emoji.name == '⭐' && reaction.count >= 3) {
      const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
      if (image === '' && message.cleanContent.length < 1) return 
	  const embed = new Discord.MessageEmbed()
		.setColor(15844367)
		
        .setDescription(message.cleanContent + " [Here](" + message.url + ")")
        .setAuthor(message.author.tag + " / " + guilduser.nickname, message.author.displayAvatarURL({dynamic:true }))
        .setTimestamp(new Date())
        .setFooter(`⭐ 3 | ${message.id}`)
        .setImage(image);
      await starChannel.send({ embed });
	}
	function extension(reaction, attachment) {
		const imageLink = attachment.split('.');
		const typeOfImage = imageLink[imageLink.length - 1];
		const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
		if (!image) return '';
		return attachment;
	  }
}