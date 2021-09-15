const Discord = require("discord.js");
require('dotenv').config()
const { QueueService } = require("./services/queueService");
const { default: PlayService } = require("./services/playService");
const { YoutubeService } = require("./services/youtubeService");
const Distube = require("distube");

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;

const client = new Discord.Client();
const distube = new Distube(client, { searchSongs: false, emitNewSongOnly: true });
PlayService.setDistube(distube);

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

    const cmd = args[0].substr(1, args[0].length);
    console.log(cmd);
    switch (cmd) {
        case 'play':
        case 'p':
            execute(message, message.guild.id);
            break;
        case 'skip':
        case 's':
            PlayService.skip(message);
            break;
        case 'stop':
            PlayService.stop(message);
            break;
        case 'loop':
            PlayService.loop(message, args[1]);
            break;
        case 'queue':
        case 'q':
            PlayService.queue(message);
            break;
        case 'fastforward':
        case 'ff':
            PlayService.jumpSong(message, Number(args[1]));
            break;
        case 'rewind':
            PlayService.jumpSong(message, -1 * Number(args[1]));
            break;
        case 'pause':
            PlayService.pause(message);
            break;
        case 'shuffle':
            PlayService.shuffle(message);
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
    PlayService.play(message, requestedSong);
}
// Queue status template
const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;


distube
    .on("playSong", (message, queue, song) => message.channel.send(
        `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    .on("error", (message, e) => {
        console.error(e)
        message.channel.send("An error encountered: " + e);
    });

client.login(token);