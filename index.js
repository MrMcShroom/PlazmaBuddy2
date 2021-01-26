require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const forumEmojis = require('./PB2ForumEmojis.js')
client.commands = new Discord.Collection();
const fs = require('fs');
const superagent = require('superagent');
let RssFeedEmitter = require('rss-feed-emitter');
let feeder = new RssFeedEmitter();
let feeder2 = new RssFeedEmitter();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const mongoose = require('mongoose');
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
const mongousername = process.env.mongousername
const mongoauthsource = process.env.mongoauthsource
const mongopassword = process.env.mongopassword
const mongoip = process.env.mongoip
const mongoport = process.env.port

mongoose.connect('mongodb://' + mongousername + ':' + mongopassword + '@' + mongoip + ':' + mongoport + '/?authSource=' + mongoauthsource + '&readPreference=primary&appname=' + process.env.programName + '&ssl=false', {useNewUrlParser: true});
client.mongoose = mongoose.connection;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Successfully connected to the DB.")
});
// This loop reads the /schemas/ folder and requires each schema file to make sure they are all registered.
fs.readdir("./schemas/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    // If the file is not a JS file, ignore it (thanks, Apple)
    if (!file.endsWith(".js")) return;
    // Load the event file itself
    const event = require(`./schemas/${file}`);
  })
  });
// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    // If the file is not a JS file, ignore it (thanks, Apple)
    if (!file.endsWith(".js")) return;
    // Load the event file itself
    const event = require(`./events/${file}`);
    // Get just the event name from the file name
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    // without going into too many details, this means each event will be called with the client argument,
    // followed by its "normal" arguments, like message, member, etc etc.
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client,));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});
//"703623269789466635";


//console.log('Now the value for FOO is:', process.env.FOO);
client.once('ready', () => {
  console.log('Ready, going to login now.');
	feeder.add({
        url: 'https://www.plazmaburst2.com/forum/feed.php',
        refresh: 40000
      });
      feeder2.add({
        url: 'https://www.plazmaburst2.com/forum/feed.php?f=167',
        refresh: 180000
      });
    console.log("Logged in!");
        var game = " the forums"
       client.user.setActivity(game,{ type: 'WATCHING' });
});
let number = 1;
let counter = 1;
feeder.on('new-item', async function(item) {
  const PB2User = require('./schemas/PB2User.js').PB2User;
    if(number < 21) { console.log(number); number = number + 1; return; }
    else {
        let parsed = item.description, // parsed text
        image_link; // image src
        console.log(parsed + "parsed")
    // parses image tags
    parsed = parsed.replace(/(.*)<img.*src="(.*\....)".*\/>(.*)/g, function(_, a, b, c) {
        image_link = b;
        return a + image_link + c;
        console.log(image_link);
    });
    console.log(parsed + "parsed")
    parsed = parsed.split('<p>')[0].replace(/<br\s\/>/g, '\n'); // fixes line breaks & removes trailing post info
    parsed = parsed.replace(/<blockquote>[\s\S]*<\/blockquote>/g, '').trim(); // removes blockquotes
	parsed = parsed.replace(/&quot;/g, '\\"');
  parsed = parsed.replace(/<[^>]*>/g, '');
  //console.log(parsed + "parsed")
  //let links = Object.keys(forumEmojis.emojis)
 // let emojis = Object.values(forumEmojis.emojis)
 // function filter(item,index) {

 //   console.log(emojis[index])
 //  parsed = parsed.replace(item,emojis[index]);

 // }
  console.log(parsed + "parsed")
 // links.forEach(filter)
  parseddesc =parsed.slice(0, 2047);
  parsedremaining =parsed.slice(2048, parsed.length);

  function divideEqual(str, num) {
     const len = str.length / num;
     const creds = str.split("").reduce((acc, val) => {
        let { res, currInd } = acc;
        if(!res[currInd] || res[currInd].length < len){
           res[currInd] = (res[currInd] || "") + val;
        }else{
           res[++currInd] = val;
        };
        return { res, currInd };
     }, {
        res: [],
        currInd: 0
     });
     return creds.res;
  };
  let parsedsplit = divideEqual(parsedremaining, 1022);
  console.log(parsedremaining + "parsed split")
  async function requestPB2Data(username) {
    const res = await superagent.get('http://plazmaburst2.com/extract.php?login=' + username + '&api_key=' + process.env.pb2apikey);
    var data = JSON.parse(res.text);
    if (data.Error === "User not found") {
         return;
    }
    return data;
   }
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
		let embed = new Discord.MessageEmbed()
            //.setTitle("New PB2 Forum Post By " + item.author)
            .setDescription(parseddesc)

            .setFooter(item.date)
            if(item.title.includes("Re:")) {
              embed.setTitle("New thread reply by " + item.author)
            } else {
              embed.setTitle("New forum thread by " + item.author)
            }
            //see if verified discord user
            let query = await PB2User.findOne({ $or: [ { 'mainPB2Login': item.author }, { 'otherLinkedPB2Accs': item.author } ] });
            if(query) { //linked
              let user = await client.users.fetch(query.discordUserID)
              if(user){ //verified user
                
                embed.setAuthor(user.tag, user.displayAvatarURL({dynamic: true}));
                let userCache = Object.values(query.PB2ProfileCache.logins[item.author])
                let mostRecentCache = userCache.reduce((prev, cur) => (prev.data.currentDateStamp > cur.data.currentDateStamp) ? prev : cur)
                let data = mostRecentCache.data[0]
                embed.setThumbnail(profilepicture(data))
                let color = await rank(data);
                embed.setColor(color[1]);
              } else{ //do same as unlinked
                let data = await requestPB2Data(item.author);
                if(data) {
                  embed.setThumbnail(profilepicture(data))
                  let color = await rank(data);
                  embed.setColor(color[1]);
                  embed.setAuthor(item.author)
                } else {
                  return;
                }
              }
              
              
            } else { //unlinked
              let data = await requestPB2Data(item.author);
              if(data) {
                embed.setThumbnail(profilepicture(data))
                let color = await rank(data);
                embed.setColor(color[1]);
                embed.setAuthor(item.author)
                
              } else {
                return;
              }
              
            }
            embed.addField("Link",`[${item.title}](${item.link})`)
            embed.addField("Author", item.author)
            if(parsedremaining.length > 0) {
              function fieldAdder(item,index) {
                if(index > 10) return;
                embed.addField("Post Chunk " + index, item);
              }
              parsedsplit.forEach(fieldAdder())
            }

            
    
			client.channels.cache.get(process.env.pb2feedchannel).send({embed:embed}).then(async (oldembed) => {
        await oldembed.react("✅");
        await oldembed.react("❌");
        await oldembed.react("😂");
        await oldembed.react("❤️");
        await oldembed.react("🤮");
        await oldembed.react("😢");
        await oldembed.react("😠");
        
        });
        console.log(number);
        number = number + 1;
    }
});

feeder2.on('new-item', async function(item) {
    if(counter < 21) { console.log(counter); counter = counter + 1; return; }
    else {
        let threadtitle = item.title; 
        if(threadtitle.includes("• Re:")) {
            console.log("There was RE:");
            return;
        }
        let parsed = item.description, // parsed text
        image_link; // image src
    
    // parses image tags
    parsed = parsed.replace(/(.*)<img.*src="(.*\....)".*\/>(.*)/g, function(_, a, b, c) {
        image_link = b;
        return a + image_link + c;
    });
    
    parsed = parsed.split('<p>')[0].replace(/<br\s\/>/g, '\n'); // fixes line breaks & removes trailing post info
    parsed = parsed.replace(/<blockquote>[\s\S]*<\/blockquote>/g, '').trim(); // removes blockquotes
    parsed = parsed.replace(/&quot;/g, '\\"');
    parsed = parsed.replace(/<[^>]*>/g, '');
		let embed = new Discord.MessageEmbed()
            .setTitle("New Approval Request By " + item.author)
            .setDescription(`[${item.title}](${item.link})`)
            .addField("Post", parsed)
            .addField("Author", item.author)
            .setColor("0xFFFFFF")
            .setThumbnail(client.user.avatarURL)
            .setFooter(item.date)

			
			const mapchannel = client.channels.cache.get(process.env.kirismapforumfeed);
    
        mapchannel.send({embed:embed}).then(async (oldembed) => {
            await oldembed.react("✅");
            await oldembed.react("🤷");
            await oldembed.react("❌");
            });
        console.log(counter);
        counter = counter + 1;
    }
});


process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));
//handles rejected promises to prevent bot shutoff










client.login(process.env.BOTTOKEN)
