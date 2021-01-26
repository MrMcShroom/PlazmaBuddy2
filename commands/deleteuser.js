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
	name: 'deleteuser',
	description: 'Deletes all data of a discord user by their ID.',
	aliases: ['deluser','del'],
	usage: '[!deluser 255545156378427393]',
	cooldown: 5,
	async execute(message, args) {
		console.log("Hi")
        let PB2User = require('../schemas/PB2User.js').PB2User;
		if(!message.author.id === "255545156378427393") return message.reply("Sorry, this command locked for now.")
		const db = message.client.mongoose;
		console.log(args);
        let query =  await PB2User.findOneAndDelete({ 'discordUserID': [args[0]]});
					if(query === null) {
						message.reply("No user!")
						return;
					} else {
						message.reply("Done.")
						return;
                    }


	}
}