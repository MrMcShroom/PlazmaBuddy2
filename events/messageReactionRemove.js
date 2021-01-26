require('dotenv').config();
const discordFunctions = require('../discordFunctions.js')
module.exports = async (client, reaction, user) => {
    const Discord = require('discord.js');
	const message = reaction.message;
    if (message.author.id === user.id) return;
    if (reaction.emoji.name !== '⭐') return;
	let guilduser = await message.guild.members.fetch(message.author.id);
	const channel = client.channels.cache.get(process.env.starboard);
    const starChannel = channel
    if (!starChannel) return message.channel.send(`It appears that you do not have a \`${starboardChannel}\` channel.`); 
    const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
    const stars = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(reaction.message.id));
    if (stars) {
      const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      const foundStar = stars.embeds[0];
      const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
	  const embed = new Discord.MessageEmbed()
		.setColor(foundStar.color)
		//"[Here](" + message.url + ")"
		
        .setDescription(foundStar.description)
        .setAuthor(message.author.tag + " / " + guilduser.nickname, message.author.displayAvatarURL({dynamic:true }))
        .setTimestamp()
        .setFooter(`⭐ ${parseInt(star[1])-1} | ${message.id}`)
        .setImage(image);
	  const starMsg = await starChannel.messages.fetch(stars.id);
	  //.messages.fetch()
      await starMsg.edit({ embed });
      if(parseInt(star[1]) - 1 == 2) return starMsg.delete();
	}

  

  // Now, it may seem weird that we use this in the messageReactionRemove event, but we still need to check if there's an image so that we can set it, if necessary.
  function extension(reaction, attachment) {
    const imageLink = attachment.split('.');
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return '';
	return attachment; }
  }
