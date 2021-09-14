const Discord = require("discord.js");
require('dotenv').config()
const { QueueService } = require("./services/queueService");
const { default: PlayService } = require("./services/playService");
const { YoutubeService } = require("./services/youtubeService");

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
    console.log("Ready!");
});

client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

client.once("disconnect", () => {
    console.log("Disconnect!");
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.split(" ");

    const filteredMessage = args[0].substr(1, args[0].length);
    console.log(filteredMessage);
    switch (filteredMessage) {
        case 'play':
        case 'p':
            execute(message, message.guild.id);
            break;
        case 'skip':
        case 's':
            PlayService.skip(message, message.guild.id);
            break;
        case 'stop':
            PlayService.stop(message, message.guild.id);
            break;
        case 'loop':
            PlayService.loop(message, message.guild.id);
            break;
        case 'queue':
        case 'q':
            PlayService.queue(message, message.guild.id);
            break;
        default:
            message.channel.send("You need to enter a valid command!");
            break;
    }
});

async function execute(message, id) {
    var args = message.content.split(" ");
    args = args.splice(1, args.length);
    const requestedSong = args.join(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }
    QueueService.setChannels(id, message.channel, voiceChannel);

    const song = await YoutubeService.getSongInfo(requestedSong);
    if (!QueueService.hasSongsQueue(id)) {
        QueueService.addSong(id, song);
        try {
            var connection = await voiceChannel.join();
            QueueService.addConnection(id, connection);
            PlayService.play(message.guild, QueueService.getSong(id));
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        QueueService.addSong(id, song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}
client.login(token);