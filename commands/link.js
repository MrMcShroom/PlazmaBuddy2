const prefix = process.env.prefix
const superagent = require('superagent');
const PB2User = require('../schemas/PB2User.js').PB2User;
const discordFunctions = require('../discordFunctions.js')

module.exports = {
	name: 'link',
	description: 'Link a PB2 account to your discord account.',
	aliases: ['verify','v','l'],
	usage: '[!link PlazmaBuddy]',
	cooldown: 5,
	async execute(message, args) {

		const db = message.client.mongoose;
        client = message.client;
		mongo = client.mongo
		let username = args.join("%20");
		try {
			const res = await superagent.get('http://plazmaburst2.com/extract.php?login=' + username + '&api_key=' + process.env.pb2apikey);
			var data = JSON.parse(res.text);
			if (data.Error === "User not found") {
				message.channel.send("This user didn't exist! `!l login name`");
		   		return;
			} else {
				if(data.xmpp === message.author.tag || data.skype === message.author.tag || data.icq === message.author.tag ) {
					let query =  await PB2User.findOne({ 'discordUserID': [message.author.id] });
					if(query) {
						if(query.mainPB2Login === data.login || query.otherLinkedPB2Accs.includes(data.login)) {
							let guild = await client.guilds.cache.get('328650645793931267')
							let userid = await message.author.id
							if(guild.member(userid)) {
								let member = await guild.members.fetch(userid)
								console.log(member)
								await discordFunctions.checkPB2Verify(data,member,client);
							}
							message.reply("Sorry, you've already verified this PB2 account. If you're in PB2 Chat and trying to be verified, taken care of.")
							return;
						} else {
							let now = Date.now();
							data.currentDateStamp = now;
							let option1 = await message.reply("Would you like to set this as a main account?")
							await option1.react("✅");
							await option1.react("❌")
							const filter = (reaction, user) => {
								return reaction.emoji.name === '✅' || reaction.emoji.name === '❌' && user.id === message.author.id;
							};
							let answer1 = await option1.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
							if(answer1.first().emoji.name === "✅"){
									message.reply("Alright, setting you up with this as your main account")
									query.otherLinkedPB2Accs.push(query.mainPB2Login);
									query.mainPB2Login = data.login;
								} else {
									message.reply("Alright, adding this as an alternate account.")
									query.otherLinkedPB2Accs.push(data.login);
								}
								
								query.PB2ProfileCache.logins[data.login] = {
									[now]: {
										data: [data]
									}
							}
							let update = await query.updateOne(query);
							let guild = client.guilds.cache.get('328650645793931267')
							let userid = message.author.id
							if(guild.member(userid)) {
								let member = await guild.members.fetch(userid)
								console.log(member)
								await discordFunctions.checkPB2Verify(data,member,client);
							}
								console.log(update);
							 //obj1.innerObj = Object.assign(obj1.innerObj,obj2);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
						}
					} else {
						let now = Date.now();
						let userlogin = data.login;
						data.currentDateStamp = now;
						let user = new PB2User();
						user.discordUserID = message.author.id;
						user.mainPB2Login = data.login;
						user.firstBotInteraction = now;
						user.PB2ProfileCache = {
							logins: {
								[userlogin]: {
									[now]: {
										data: [data]
									}
								}
							}
						}
						message.reply("Congratulations you've been verified as \`" + userlogin + "\` You now have access to some new features!" )
							console.log(user.PB2ProfileCache.logins[userlogin][now].data);
							let guild = await client.guilds.cache.get('328650645793931267')
							let userid = message.author.id
							if(guild.member(userid)) {
								let member =  await guild.members.fetch(userid)
								await discordFunctions.checkPB2Verify(data,member,client);
							}
							user.save(function (err) {
								if (err) return console.error(err);
							  })
					}

					
				} else {
					message.reply("Try setting your discord in the edit profile page as \`" + message.author.tag + "\`")
				}

			}
		  } catch (err) {
			console.error(err);
			message.reply("We got an error. Try sending this to `MrMcShroom#4652` ```" + err + '```')
		  }

	}
}

