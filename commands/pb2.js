const prefix = process.env.prefix
const { parse } = require('path');
const superagent = require('superagent');
const PB2User = require('../schemas/PB2User.js').PB2User;
const PB2Cache = require('../schemas/PB2Cache.js').PB2Cache;

//determines rank in pb discord. its currently based on old siegmeyer code and
//will need to be fixed later on. doing my best to decipher all this.
  async function rankcolor(data) {
	if (data.chat_admin === "1") {
	  return "0xFF0000"; //if player is admin, return red
	} else if (data.chat_moderator === "2") {
	  return "0x3498DB"; //^but headmoderator dark blue
	} else if (data.chat_moderator === "1") {
	  return "0x00F5FF"; //moderator
	} else if (data.multiplayer_moderator === "1") {
	  return "0x26FF00";//pretty sure i never figured out if this is trial staff or support. look into.
	} else { //XXX ADD DB QUERY TO SEE IF VERIFIED USER LATER??? XXX
		return "0xF1C40F"; //Unknown User
	  };
	}

	//takes data.mdl and uses it to determine profile avatar
	//in the first stages of pb2 some profile avatars had different name formats,
	//most notably proxy, so thats why this is needed.
	function profilepicture(data) { 
		var number = ("0000" + data.mdl).slice(-4);
		if (data.mdl >= 41 && data.mdl <= 49) {
		  var chicken = data.mdl - 40;
		  var number = ("0000" + chicken).slice(-4);
		  return "http://mcshroom.com/pb2characters/pb2characters/chars_hero" + number + ".jpg";
		} else if (data.mdl === 61) {
		  return "http://mcshroom.com/pb2characters/pb2characters/chars_proxy.jpg";
		} else {
		  return "http://mcshroom.com/pb2characters/pb2characters/chars" + number + ".jpg";
		}
	  }
	  function blank(value) {
		if (value) {
		  return value;
		} else {
		  return "None";
		}
	  }

	  async function rank(data) {
		if (data.chat_admin === "1") {
		  return ["Admin","0xFF0000"];
		} else if (data.chat_moderator === "2") {
		  return ["Head Moderator","0x3498DB"];
		} else if (data.chat_moderator === "1") {
		  return ["Moderator","0x00F5FF"];
		} else if (data.multiplayer_moderator === "1") { // ?????
		  return ["Trial Staff / Site Support","0x26FF00"];
		} else {
			return ["Unknown","0xF1C40F"]
	  }}






module.exports = {
	name: 'PB2 Profile',
	description: 'Display info from a PB2 account.',
	aliases: ['p','profile','pb2','pb'],
	usage: '[!pb2 PlazmaBuddy]',
	cooldown: 5,
	async execute(message, args) {
		let Discord = require('discord.js');
		message.discordAccess = Discord;
        let client = message.client;
		const db = message.client.mongoose;
		let username = args.join("%20");
		let mongo = client.mongo
		async function makePB2Embed(data,author,message) {
			var kdr = data.s_kills / data.s_deaths;
			var loginurlformat = data.login;
			loginurlformat = loginurlformat.replace(/\s/g, '%20');
			let prank = await rank(data,message);
			let creationDate = new Date(data.currentDateStamp);
			var creationdate = new Date(data.real_register * 1000);
			let embed = new Discord.MessageEmbed()
			  .setDescription(data.nickname + `'s PB2 Profile \n Slogan: \`${ blank(data.slogan) }\` \nCountry: \`${ blank(data.country_code) }\`\nGender \`${ blank(data.gender) }\`\nBirthday \`${ blank(data.birth) }\`\nKills \`${ blank(data.s_kills) }\`\nDeaths \`${ blank(data.s_deaths) }\`\nPPP \`${ blank(data.s_kills) }\`\nLDR \`${ blank(data.dev_rank) }\`\nKDR \`${ blank(kdr) }\`\nRank \`${ prank[0] }\`\nSkype \`${ blank(data.skype) }\`\nDiscord \`${ blank(data.icq) }\`\nXMPP \`${ blank(data.xmpp) }\`\nEarliest Action On Acc \`${ creationdate }\`
			  `)
			  
			  .addField("Profile Link", 'http://plazmaburst2.com/?a=&s=7&ac=' + loginurlformat + '&id=' + data.uid, true)
			  .setThumbnail(profilepicture(data))
			  .setColor(prank[1])
			  .setTimestamp()
			  if(author) {
				  console.log(typeof(author))
				  if(typeof(author) === "object") {
					  embed.setFooter("👍 " + author.likes.length + " 👎 " + author.dislikes.length + " ⭐ 0")
					  let user = await client.users.fetch(author.discordUserID)
					  embed.setAuthor(user.tag, user.displayAvatarURL({dynamic: true}));
				  } else {
					let user = await client.users.fetch(author)
					embed.setAuthor(user.tag, user.displayAvatarURL({dynamic: true}));
				  }

			  }

			  if(data.currentDateStamp) {
				  embed.addField("Cached Profile", "This profile is a cache, meaning there is either a site error, or it is less than one hour old. Cache from: \`" + creationDate + "`")
			  }
			  return embed;
		  }
		  
		 async function requestPB2Data(username) {
			 
			const res = await superagent.get('http://plazmaburst2.com/extract.php?login=' + username + '&api_key=' + process.env.pb2apikey);
			var data = JSON.parse(res.text);
			if (data.Error === "User not found") {
				message.channel.send("This user didn't exist! Possibly deleted?! Crazy. Not going to send a cache because of.");
				   return false;
			}
			return data;
		 }
		if (message.mentions.users.first()) {
			let query =  await PB2User.findOne({ 'discordUserID': [message.mentions.users.first().id] });
			if(query) {
				if(query.otherLinkedPB2Accs.length >= 1) { // we gonna have to check cache for every account
					let partialusersArray = []
					partialusersArray.push(query.mainPB2Login)
					usersArray = partialusersArray.concat(query.otherLinkedPB2Accs);
					let userCacheArrays = []
					function grabPB2ProfileLoginCache(user) {
						userCacheArrays.push(Object.values(query.PB2ProfileCache.logins[user]));
						console.log("Pushing to login cache")
					}
					usersArray.forEach(grabPB2ProfileLoginCache);
					console.table(userCacheArrays);
					let embedArray = []
					async function parseCacheData(userCache) {
						if(userCache.length <= 1) {
							//request code here, we're making a new entry.
							try {
								console.log("trying to get data")
								console.log(userCache[0].data[0])
								let data = await requestPB2Data(userCache[0].data[0].login);
								let currentDateStamp = Date.now();
								console.log(data);


									let newembed = await makePB2Embed(data,query,message);
									//console.log(newembed + "    <--- New Embed");
								
								embedArray.push(newembed);
								data.currentDateStamp = currentDateStamp;
								newCache = {
										data: [data]
								}
								query.PB2ProfileCache.logins[data.login][currentDateStamp] = {}
								Object.assign(query.PB2ProfileCache.logins[data.login][currentDateStamp],newCache);
								console.table(query.PB2ProfileCache.logins[data.login][currentDateStamp].data);
								let update = await query.updateOne(query);

								  console.log(update)
							} catch(error) {//looks like we're using cache. Site error.
							console.error(error)
							embedArray.push(makePB2Embed(userCache[0].data[0],query),message)
							}
						} else {  //theres more than one cached profile per login. we're checking cache
						let mostRecentCache = userCache.reduce((prev, cur) => (prev.data.currentDateStamp > cur.data.currentDateStamp) ? prev : cur)
						console.table(mostRecentCache.data[0].currentDateStamp);
						oneHour = 6600000;
						oneWeek = 604800000;
						//((new Date) - myDate) < ONE_HOUR
						console.log((new Date) - mostRecentCache.data[0].currentDateStamp)
						if((new Date) - mostRecentCache.data[0].currentDateStamp < oneWeek) { 
							console.log("within one week")//within one week
							if((new Date) - mostRecentCache.data[0].currentDateStamp < oneHour) { 
								let newembed = await makePB2Embed(mostRecentCache.data[0],query,message);
								embedArray.push(newembed);
								//post embed
							} else { //replace the current cache with the new one you request
								
								
								let data = await requestPB2Data(mostRecentCache.data[0].login);
								let currentDateStamp = Date.now();
								let newembed = await makePB2Embed(data,query,message);
								embedArray.push(newembed);
								data.currentDateStamp = currentDateStamp;
								newCache = {
									data: [data]
								}
								delete query.PB2ProfileCache.logins[mostRecentCache.data[0].login][mostRecentCache.data[0].currentDateStamp];
								query.PB2ProfileCache.logins[data.login][currentDateStamp] = {}
								Object.assign(query.PB2ProfileCache.logins[data.login][currentDateStamp],newCache);
								let update = await query.updateOne(query);
								console.log(update)


							}
						} else { 
							console.log("not within one week, request and send another, which must be saved")//not within one week, request and send another, which must be saved
							let data = await requestPB2Data(mostRecentCache.data[0].login);
							let currentDateStamp = Date.now();
							let newembed = await makePB2Embed(data,query,message);
							embedArray.push(newembed);
							data.currentDateStamp = currentDateStamp;
							newCache = {
								data: [data]
							}
							query.PB2ProfileCache.logins[data.login][currentDateStamp] = {}
								Object.assign(query.PB2ProfileCache.logins[data.login][currentDateStamp],newCache);
								console.table(query.PB2ProfileCache.logins[data.login][currentDateStamp].data);
								let update = await query.updateOne(query);
								  console.log(update)
						}

						}
					}
					async function forLoop(userCacheArrays) {
						for (var i = 0; i < userCacheArrays.length; i++) {
							console.log(1)
							await parseCacheData(userCacheArrays[i]);
						}
					}
					

					await forLoop(userCacheArrays)
					let sentEmbed = await message.channel.send([embedArray[0]]);
					  await sentEmbed.react("◀️");
					  await sentEmbed.react("▶️");
					  await sentEmbed.react("👍");
					  await sentEmbed.react("👎");
					  let embedCount = 0;
					  const pageFilter = (reaction, user) => {
						return (reaction.emoji.name === "◀️" || reaction.emoji.name === "▶️") && user.id === message.author.id;
					};
					console.log(pageFilter)
					const pageCount = sentEmbed.createReactionCollector(pageFilter, { time: 120000 });
					pageCount.on('collect', (reaction, user) =>  {
						console.log("Collected")
						if(reaction.emoji.name === "◀️") {
							if(embedCount === "0") {
								console.log(embedCount + " <--- Embed Count  " + embedArray.length + "   <-- embedarraylength   " + sentEmbed  + "   <---")
								embedCount = embedArray.length
								console.log([embedArray[embedCount]])
								sentEmbed.edit([embedArray.length])
							} else {
								embedCount = embedCount
								sentEmbed.edit([embedArray[embedCount]])
							}
						}
							if(reaction.emoji.name === "▶️") {
								console.log("2")
								console.log(embedArray.length -1 )
								if(embedCount === embedArray.length -1) {
									embedCount = 0
									sentEmbed.edit([embedArray[0]])
								} else {
									embedCount = embedCount + 1
									console.log("Gonna edit " + sentEmbed + "     Embed count = " + embedCount);
									console.log("\n\n\n\n to" + [embedArray[embedCount]])
									sentEmbed.edit([embedArray[embedCount]])
								}
							}
					});





				} else { //basically we gonna replace pb2 command wit pb2history command rn since only one acc
					embedArray = []
					async function parseCacheData(userCache) {
						if(userCache.length <= 1) {
							//request code here, we're making a new history embed to add.
							try {
								console.log("trying to get data")
								console.log(userCache[0].data[0])
								let data = await requestPB2Data(userCache[0].data[0].login);
								let currentDateStamp = Date.now();
								console.log(data);


									let newembed = await makePB2Embed(data,query,message);
									//console.log(newembed + "    <--- New Embed");
								
								embedArray.push(newembed);
								data.currentDateStamp = currentDateStamp;
								newCache = {
										data: [data]
								}
								query.PB2ProfileCache.logins[data.login][currentDateStamp] = {}
								Object.assign(query.PB2ProfileCache.logins[data.login][currentDateStamp],newCache);
								console.table(query.PB2ProfileCache.logins[data.login][currentDateStamp].data);
								let update = await query.updateOne(query);

								  console.log(update)
							} catch(error) {//looks like we're using cache. Site error.
							console.error(error)
							embedArray.push(makePB2Embed(userCache[0].data[0],query),message)
							}
						} else { 
							console.log('hello')
							console.table(userCache) //theres more than one cached profile per login. we're checking cache
						async function forloop(userCache) { 
							for (var i = 0; i < userCache.length; i++) {
								console.log(userCache[i].data[0])
								await embedArray.push(await makePB2Embed(userCache[i].data[0],query),message)
							}
						}
												let mostRecentCache = userCache.reduce((prev, cur) => (prev.data.currentDateStamp > cur.data.currentDateStamp) ? prev : cur)
						console.table(mostRecentCache.data[0].currentDateStamp);
						oneHour = 6600000;
						oneWeek = 604800000;
						//((new Date) - myDate) < ONE_HOUR
						console.log((new Date) - mostRecentCache.data[0].currentDateStamp)
						if((new Date) - mostRecentCache.data[0].currentDateStamp < oneWeek) { 
							console.log("within one week")//within one week
							if((new Date) - mostRecentCache.data[0].currentDateStamp < oneHour) { 
								let newembed = await makePB2Embed(mostRecentCache.data[0],query,message);
								embedArray.push(newembed);

								//post embed
							} else { //replace the current cache with the new one you request
								
								
								let data = await requestPB2Data(mostRecentCache.data[0].login);
								let currentDateStamp = Date.now();
								let newembed = await makePB2Embed(data,query,message);
								embedArray.push(newembed);
								data.currentDateStamp = currentDateStamp;
								newCache = {
									data: [data]
								}
								delete query.PB2ProfileCache.logins[mostRecentCache.data[0].login][mostRecentCache.data[0].currentDateStamp];
								query.PB2ProfileCache.logins[data.login][currentDateStamp] = {}
								Object.assign(query.PB2ProfileCache.logins[data.login][currentDateStamp],newCache);
								let update = await query.updateOne(query);
								console.log(update)


							}
						} else { 
							console.log("not within one week, request and send another, which must be saved")//not within one week, request and send another, which must be saved
							let data = await requestPB2Data(mostRecentCache.data[0].login);
							let currentDateStamp = Date.now();
							let newembed = await makePB2Embed(data,query,message);
							embedArray.push(newembed);
							data.currentDateStamp = currentDateStamp;
							newCache = {
								data: [data]
							}
							query.PB2ProfileCache.logins[data.login][currentDateStamp] = {}
								Object.assign(query.PB2ProfileCache.logins[data.login][currentDateStamp],newCache);
								console.table(query.PB2ProfileCache.logins[data.login][currentDateStamp].data);
								let update = await query.updateOne(query);
								  console.log(update)
						}
						await forloop(userCache);

						}
					}
					
					async function forLoop(userCache) {
						for (var i = 0; i < userCache.length; i++) {
							console.log(userCache[i])
							await parseCacheData(userCache[i])
						}
					}
					let userCache = [Object.values(query.PB2ProfileCache.logins[query.mainPB2Login])]
					console.log(userCache)
					await forLoop(userCache)

						let sentEmbed = await message.channel.send([embedArray[0]]);
						await sentEmbed.react("◀️");
						await sentEmbed.react("▶️");
						await sentEmbed.react("👍");
					  	await sentEmbed.react("👎");
						let embedCount = 0;
						const pageFilter = (reaction, user) => {
						  return (reaction.emoji.name === "◀️" || reaction.emoji.name === "▶️") && user.id === message.author.id;
					  };
					  const likeFilter = (reaction, user) => {
						return (reaction.emoji.name === "👍" || reaction.emoji.name === "👎");
					};
					  console.log(pageFilter)
					  const likeCount = sentEmbed.createReactionCollector(likeFilter, { time: 120000 });
					  const pageCount = sentEmbed.createReactionCollector(pageFilter, { time: 120000 });
					  likeCount.on('collect',async (reaction, user) => {
						console.log("Collected")
						async function editFooters(embeds,likeordislike,query){ 
								for (var i = 0; i < embeds.length; i++) {
									if(likeordislike) {
										console.log("Editting embed " + i)
										embeds[i].footer.text = "👍 " + query.likes.length + " 👎 " + query.dislikes.length + " ⭐ 0"
									} else {
										embeds[i].footer.text = "👍 " + query.likes.length + " 👎 " + query.dislikes.length + " ⭐ 0"
									}
									
								}
							}
						if(query.likes.includes(user.id)) {
							if(reaction.emoji.name === "👍") {
								console.log("returning!")
								return;
							}
								if(reaction.emoji.name === "👎") {
									query.dislikes.push(user.id)
									let update = await query.updateOne(query);
									console.log(update)
									editFooters(embedArray,true,query);
								  }
						}
						if(query.dislikes.includes(user.id)) {
							if(reaction.emoji.name === "👍") {
								query.likes.push(user.id)
								let update = await query.updateOne(query);
								console.log(update)
								editFooters(embedArray,true,query);
							}
								if(reaction.emoji.name === "👎") {
									return
								  }
						}
						if(reaction.emoji.name === "👍") {
							query.likes.push(user.id)
							let update = await query.updateOne(query);
							console.log(update)
							editFooters(embedArray,true,query);
						}
							if(reaction.emoji.name === "👎") {
								query.dislikes.push(user.id)
								let update = await query.updateOne(query);
								console.log(update)
								editFooters(embedArray,true,query);
							  }
					});
					  pageCount.on('collect', (reaction, user) =>  {
						  console.log("Collected")
						  if(reaction.emoji.name === "◀️") {
							  if(embedCount === "0") {
								  console.log(embedCount + " <--- Embed Count  " + embedArray.length + "   <-- embedarraylength   " + sentEmbed  + "   <---")
								  embedCount = embedArray.length
								  console.log([embedArray[embedCount]])
								  sentEmbed.edit([embedArray.length])
							  } else {
								  embedCount = embedCount
								  sentEmbed.edit([embedArray[embedCount]])
							  }
						  }
							  if(reaction.emoji.name === "▶️") {
								  console.log("2")
								  console.log(embedArray.length -1 )
								  if(embedCount === embedArray.length -1) {
									  embedCount = 0
									  sentEmbed.edit([embedArray[0]])
								  } else {
									  embedCount = embedCount + 1
									  console.log("Gonna edit " + sentEmbed + "     Embed count = " + embedCount);
									  console.log("\n\n\n\n to" + [embedArray[embedCount]])
									  sentEmbed.edit([embedArray[embedCount]])
								  }
								}
					  });
					
				}
				console.log("Main: " + query.mainPB2Login + "   Alternate:" + query.otherLinkedPB2Accs.length);
				//let cacheDateArray = Object.values(query.PB2ProfileCache.logins[query.])
				//Object.values(PB2ProfileCache.logins.strato026)
			} else {
				return message.reply("This user hasn't verified a PB2 account. We have nothing to display.")
			}
		} else {//non pb2 mention profile code
			let username = args.join(" ");
			let query = await PB2User.findOne({ $or: [ { 'mainPB2Login': username }, { 'otherLinkedPB2Accs': username } ] });
			if(query) {//linked (go repeat one of the mention methods for retreiving profile)

			} else {//unlinked (looking through non linked cache)
				let query =  await PB2Cache.findOne({ 'mainPB2Login': [username] });
				if(query) { //found a cache of this profile

				} else { //did not find a cache of this profile
					//request data
					let data = await requestPB2Data(username);
					let now = Date.now();
						let userlogin = data.login;
						data.currentDateStamp = now;
						let user = new PB2Cache();
						user.discordUserID = message.author.id;
						user.mainPB2Login = data.login;
						user.firstBotInteraction = now;
						user.PB2ProfileCache = {
								[userlogin]: {
									[now]: {
										data: [data]
									}
								}
							}

							user.save(function (err) {
								if (err) return console.error(err);
							  })
							  let newembed = await makePB2Embed(data,false,message);
							  let sentEmbed = await message.channel.send(newembed);


			}
			//let query =  await PB2User.findOne({ 'mainPB2Login': [username] || 'otherLinkedPB2Accs': [username]});
		}
		try {


		  } catch (err) {
			console.error(err);
			message.reply("We got an error. Try sending this to `MrMcShroom#4652` ```" + err + '```')
		  }

	}
}
}