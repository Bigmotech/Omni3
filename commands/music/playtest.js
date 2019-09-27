
const commando = require("discord.js-commando");
const ytdl = require("ytdl-core");
const Youtube = require("simple-youtube-api");
const config = require('../../config.json');
var servers = require('../../GuildsInfo/Servers.json');
const youtube = new Youtube(config.YToken);
 
const queue = new Map();

function play(guild, song){
    const server = queue.get(guild.id);

 
    //client.user.setPresence({game: song.title});
    const dispatcher = servers[message.guild.id].connection.playStream(ytdl(song.url))
        .on('end', function(){

            if(servers[message.guild.id].songs[1]){
                servers[message.guild.id].songs.shift();
                
                play(guild, servers[message.guild.id].songs[0]);
            }
            else{
            console.log("Song ended");
            servers[message.guild.id].connection.disconnect();
            }
        });
        dispatcher.setVolumeLogarithmic(servers[message.guild.id].volume/5);
    
}
class playtest extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'playtest',
            group: 'music',
            memberName: 'playtest',
            description: 'Play linked song if nothing is playing',
            args: [
                {
                    key: 'link',
                    prompt: 'Please link a youtube video',
                    type: 'string'
                }
            ],
        });
    }
    async run(message, { link }) {

        const voiceChannel = message.member.voiceChannel;
        
        if(!voiceChannel) return message.say("Join a voice channel");
        try{
            var video = await youtube.getVideo(link);
        }catch(error)
        {
            try{
                var videos = await youtube.searchVideos(link,1);
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

        

        if(!servers[message.guild.id]){
            //servers[message.guild.id] 
            var textT = {
                'textChannel': 'message.channel',
                'voiceChannel': 'voiceChannel',
                'songs': [],
                'connection': 'null',
                'volume': '5',
                'playing': 'true'
            };
            servers[message.guild.id] = JSON.stringify(textT, null,2);
            
            servers[message.guild.id].songs.push(song);

            try{
                var connection = await voiceChannel.join();
                servers[message.guild.id].connection = connection;
                play(message.guild, servers[message.guild.id].songs[0]);
            }catch(error){
                queue.delete(message.guild.id);
                return undefined;
            }



        }
        else{
            servers[message.guild.id].songs.push(song);
            message.channel.send(song.title + " was added");
            var lists = servers[message.guild.id].songs.join();
            message.channel.send(lists);
        }

    }




}
module.exports = playtest;