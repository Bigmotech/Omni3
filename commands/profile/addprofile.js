const {Command} = require('discord.js-commando');
const fs = require('fs');
const SERVERSPATH = './GuildsInfo/Servers.json'
const SERVERS = fs.readFileSync(SERVERSPATH);

module.exports = class addprofile extends Command{
    constructor(client){
        super(client,{
            name: 'addprofile',
            group: 'profile',
            memberName: 'addprofile',
            description: 'Add your profile'
        });
    }

    run(message){
        var guildID = message.guild.id;
        var userID = message.author.id;
        var file = JSON.parse(SERVERS);
        if(file[guildID][userID].name){console.log("This profile already exist"); return undefined};
        if(!file[guildID]){file[guildID] = {}}
        if(!file[guildID][userID]){file[guildID][userID] = {}}
        if(!file[guildID][userID]["name"]) { 
            file[guildID][userID] = {
                "name" : message.author.username,
                "ingame" : false,
                "rules" : [],
                "coins" : 10
            }
        }

        var ToSave = JSON.stringify(file,null,2);
        fs.writeFileSync(SERVERSPATH, ToSave);
        fs.closeSync(2);

    }
} 


/* if(!file[guildID]){
            
    file[guildID] = {};
    if(!file[guildID[userID]]){
        file[guildID][userID] = {};
        if(!file[guildID][userID]["name"]){
            file[guildID][userID] ={
                "name" : message.author.username,
                "ingame" : false,
                "coins" : 0,
                "rules" : {}
            } 
        }
    }
}
else if(!file[guildID[userID]]){
    file[guildID][userID] = {};
    if(!file[guildID][userID]["name"]){
        file[guildID][userID] ={
            "name" : message.author.username,
            "ingame" : false,
            "coins" : 0,
            "rules" : {}
        } 
    }
}
else if(!file[guildID][userID]["name"]){

} */