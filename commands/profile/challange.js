const {Command} = require('discord.js-commando');
const fs = require('fs');
const SERVERSPATH = './GuildsInfo/Servers.json'
const SERVERS = fs.readFileSync(SERVERSPATH);

module.exports = class challenge extends Command{
    constructor(client){
        super(client,{
            name: 'challenge',
            group: 'profile',
            memberName: 'challenge',
            description: 'Challenge another user',
            args: [
                {key : 'user',
                prompt: 'Select a user',
                type : 'user'
            }

            ]
        });
    }

    run(message, {user}){
        var guildID = message.guild.id;
        var userID = message.author.id;
        var file = JSON.parse(SERVERS);
        if(file[guildID][userID].ingame || file[guildID][user.id].ingame){message.say("One or both of these players are already in a game"); return undefined;}
        file[guildID][userID].ingame = true;
        file[guildID][user.id].ingame = true;

        var ToSave = JSON.stringify(file,null,2);
        fs.writeFileSync(SERVERSPATH, ToSave);
        fs.closeSync(2);
        message.say(file[guildID][user.id].name + " " + message.author.username + " has challenged you");
        

    }
} 