const communitypolls = process.env.communitypolls;
const kirismapchannel = process.env.kirisfeed
const prefix = process.env.prefix
const discordFunctions = require('../discordFunctions.js')


module.exports = async (client, message) => {
    const Discord = require('discord.js');
    if (message.channel.id === discordFunctions.communitypolls) discordFunctions.extractemoji(client,message)
	if (message.channel.id === discordFunctions.kirismapchannel) discordFunctions.logtoPB2(client,message);
	if (message.channel.id === "760606216220704779")  {
		await message.react("✅");
		message.react("❌")
	}

	if (!message.content.startsWith(prefix) || message.author.bot) return;
    const cooldowns = new Discord.Collection();
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
  };