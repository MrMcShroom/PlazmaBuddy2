const prefix = process.env.prefix
const superagent = require('superagent');

	/*schema plan
	let mongo generate id
	discord id
	main pb2 id (or first linked account)
	other linked ids
	id link history
	array oj json objects one for each profile containing  json objects caching each cache between every week
	*/


	const mongoose = require('mongoose');
	

module.exports = {
	name: 'DeletePB2User',
	description: 'Completely wipe a PB2User Data by PB2 Username',
	aliases: ['delpb2','delpb'],
	usage: '[!delpb ZapruderFilm]',
	cooldown: 5,
	async execute(message, args) {
        const PB2User = require('../schemas/PB2User.js').PB2User;
		if(!message.author.id === "255545156378427393") return message.reply("Sorry, this command locked for now.")
		const db = message.client.mongoose;
		try{
			let query =  await PB2User.findOneAndDelete({ 'mainPB2Login': [args.join(" ")] || { 'otherLinkedPB2Accs': { "$in" : [args.join(" ")]} }});
			if(query === null) {
				message.reply("This user doesn't exist.")
				return;
			} else {
				message.reply("Done.");
				console.log(query)
			}
		}
		 catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
		}

	}
}