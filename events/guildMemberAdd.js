require('dotenv').config();
const superagent = require('superagent');
const discordFunctions = require('../discordFunctions.js')
const PB2User = require('../schemas/PB2User.js').PB2User;
module.exports = async (client, member) => {
    const Discord = require('discord.js');
    //await discordFunctions.checkPB2Verify(data,member,client);
    if(member.guild.id = "328650645793931267") {
        let query =  await PB2User.findOne({ 'discordUserID': [member.id] });
        if(query) {
            var loginurlformat = query.mainPB2Login;
			loginurlformat = loginurlformat.replace(/\s/g, '%20');
            const res = await superagent.get('http://plazmaburst2.com/extract.php?login=' + loginurlformat + '&api_key=' + process.env.pb2apikey);
            var data = JSON.parse(res.text);
            if(query.otherLinkedPB2Accs.length >= 1) {
                let users = query.otherLinkedPB2Accs;
                users.unshift(query.mainPB2Login);
                await discordFunctions.checkPB2Verifymultiple(users,member,client);
            } else {
                await discordFunctions.checkPB2Verify(data,member,client);
            }
            
        } else {
            return;
        }
        
    }
}