const prefix = process.env.prefix
const superagent = require('superagent');
const PB2User = require('../schemas/PB2User.js').PB2User;
const discordFunctions = require('../discordFunctions.js')

module.exports = {
	name: 'main',
	description: 'Set your main account in the bot. This also changes your nickname in PBC discord.',
	aliases: ['setmain','changemain','changenick'],
	usage: '[!main _Mew]',
	cooldown: 5,
	async execute(message, args) {

		const db = message.client.mongoose;
        client = message.client;
		mongo = client.mongo
        let username = args.join(" ");
        let member = message.member;
		try {
            let query =  await PB2User.findOne({ 'discordUserID': [message.author.id] });
					if(query) {
                        if(query.otherLinkedPB2Accs.includes(username)) {
                            if(username === member.displayName) {
                                member.setNickname(username + ".");
                            } else {
                                member.setNickname(username)
                            }
                            query.otherLinkedPB2Accs.push(query.mainPB2Login)
                            query.mainPB2Login = username;
                            let update = await query.updateOne(query);
                            console.log(update)
                        } else {
                            if(query.otherLinkedPB2Accs.length === 1) {
                                const user = otherLinkedPB2Accs[0]
                                query.otherLinkedPB2Accs.push(query.mainPB2Login)
                                query.mainPB2Login = user;
                                let update = await query.updateOne(query);
                                console.log(update)
                                if(user === member.displayName) {
                                    member.setNickname(user + ".");
                                } else {
                                    member.setNickname(user)
                                }
                            } else { message.reply("You must provide a linked PB2 login name! Ex: Eric Gurt") }

                        }
                    } else {
                        message.reply(
                            "You have no accounts linked with the bot!"
                        )
                    }
		  } catch (err) {
			console.error(err);
			message.reply("We got an error. Try sending this to `MrMcShroom#4652` ```" + err + '```')
		  }

	}
}

