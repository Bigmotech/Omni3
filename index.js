const discord = require("discord.js");
const Commando = require("discord.js-commando");
const client = new Commando.Client({
    owner: '113474887049289728'
});
const fs = require('fs');
const SERVERSPATH = './GuildsInfo/Servers.json'
const SERVERS = fs.readFileSync(SERVERSPATH);
const ytdl = require("ytdl-core");
const Youtube = require("simple-youtube-api");
const path = require('path');
const config = require('./config.json');



const youtube = new Youtube(config.YToken);
const PREFIX = "+"
 
const queue = new Map();




client.on("message", async message=>{
    if(message.author.bot) return undefined;
    if(!message.content.startsWith(PREFIX)) return undefined;
 
    var args = message.content.split(" ");
    const search = args.slice(1).join(' ');
    const url = args[1];
    const serverQueue = queue.get(message.guild.id);
    
    if(message.content.startsWith(PREFIX + "play")){


        const voiceChannel = message.member.voiceChannel;
        
        if(!voiceChannel) return message.channel.send("Join a voice channel");
        try{
            var video = await youtube.getVideo(url);
        }catch(error)
        {
            try{
                var videos = await youtube.searchVideos(search,1);
                var video = await youtube.getVideoByID(videos[0].id);
                
            
            }catch(error){
                console.log("Error found nothing");
            }
        }
        

        const song = {
            title: video.title,
            id: video.id,
            url: `https://www.youtube.com/watch?v=${video.id}`

        };

        

        if(!serverQueue){
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                songs: [],
                connection: null,
                volume: 5,
                playing: true
            };
            queue.set(message.guild.id, queueConstruct);

            queueConstruct.songs.push(song);

            try{
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(message.guild, queueConstruct.songs[0]);
            }catch(error){
                queue.delete(message.guild.id);
                return undefined;
            }



        }
        else{
            serverQueue.songs.push(song);
            message.channel.send(song.title + " was added");
            var lists = serverQueue.songs.join();
            message.channel.send(lists);
        }


 

        
 
    }
    else if(message.content.startsWith(PREFIX + "pause")){
        if(serverQueue && serverQueue.playing)
        {
            serverQueue.playing = false;
            client.user.setPresence({game: "Paused"})
            serverQueue.connection.dispatcher.pause();
        }
         return message.channel.send("There is no music");
        
        
    }
    else if(message.content.startsWith(PREFIX + "resume")){
        if(serverQueue && !serverQueue.playing)
        {
            serverQueue.playing = true;
            client.user.setPresence({game: serverQueue.songs[0].title})
            serverQueue.connection.dispatcher.resume();
        }
        
    }
    else if(message.content.startsWith(PREFIX + "skip")){
        if(!serverQueue) return message.channel.send("End of song list");
        serverQueue.connection.dispatcher.end();
        return undefined;
        
    }
    else if(message.content.startsWith(PREFIX + "np")){
        if(!serverQueue) return message.channel.send("There is no music");

        return message.channel.send("Now playing " + serverQueue.songs.title);
    }
    else if(message.content.startsWith(PREFIX + "volume")){
        if(!serverQueue) return message.channel.send("There is no music");
        if(!args[1]) return message.channel.send("Current volume: " + serverQueue.volume);
        if(isNaN(args[1])) return message.channel.send("Enter a number");
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1]/ 5);
        return message.channel.send("Volume set to " + args[1].toString());
    }
    else if(message.content.startsWith(PREFIX+"search")){
        try{
            var videos = await youtube.searchVideos(search,4);
            const searchEmbed = new discord.RichEmbed()
            .setTitle("Here are your searches")
            .addField(videos[0].title, "https://www.youtube.com/watch?v="+videos[0].id,true)
            .addField(videos[1].title, "https://www.youtube.com/watch?v="+videos[1].id,true)
            .addField(videos[2].title, "https://www.youtube.com/watch?v="+videos[2].id,true)
            .addField(videos[3].title, "https://www.youtube.com/watch?v="+videos[3].id,true)
            message.channel.send(searchEmbed);
            return undefined;
        }catch(error){
            message.channel.send("Error: Lookup failure");
            console.log("Error found nothing");
        }
    }
    else if(message.content.startsWith(PREFIX + "stop")){
        if(!message.member.voiceChannel) return message.channel.send("You are not in a voice channel");
        if(!serverQueue) return message.channel.send("There is no music");
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
    
    
    return undefined;
});



function play(guild, song){
    const serverQueue = queue.get(guild.id);

 
    //client.user.setPresence({game: song.title});
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', function(){

            if(serverQueue.songs[1]){
                serverQueue.songs.shift();
                
                play(guild, serverQueue.songs[0]);
            }
            else{
            console.log("Song ended");
            serverQueue.connection.disconnect();
            }
        });
        dispatcher.setVolumeLogarithmic(serverQueue.volume/5);
    
}

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['music', 'Music Options'],
        ['profile','Profile Mangament']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));


client.login(config.BoToken);


