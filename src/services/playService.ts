import { QueueService } from "./queueService";
import { YoutubeService } from "./youtubeService";
export default class PlayService {

    static async play(guild, song) {

        if (!song) {
            QueueService.exit(guild.id);
            return;
        }

        const dispatcher = QueueService.playConnection(guild.id, YoutubeService.getVideo(song.url))
            .on("finish", () => {
                if(QueueService.loopAllIsEnabled(guild.id)){
                    QueueService.addSong(guild.id,QueueService.getSong(guild.id))
                    QueueService.shiftSong(guild.id);
                }
                else if(!QueueService.loopOneIsEnabled(guild.id)){
                    QueueService.shiftSong(guild.id);
                }
                PlayService.play(guild, QueueService.getSong(guild.id));
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(QueueService.getVolume(guild.id) / 5);
        QueueService.sendMessage(guild.id, `Now playing: **${song.title}**`);
    }

    static async skip(message, id) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            );
        if (!QueueService.hasQueue(id))
            return message.channel.send("There is no song that I could skip!");
        QueueService.skip(id);
    }

    static async stop(message, id) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            );

        if (!QueueService.hasQueue(id))
            return message.channel.send("There is no song that I could stop!");

        QueueService.stop(id);
    }

    static loop(message, id) {
        var command = message.content.split(" ")[1];
        switch (command) {
            case 'all':
                if (QueueService.switchLoopAll(id))
                    message.channel.send("Loop all has been turned on");
                else
                    message.channel.send("Loop all has been turned off");
                break;
            case 'one':
                if (QueueService.switchLoopOne(id))
                    message.channel.send("Loop one has been turned on");
                else
                    message.channel.send("Loop one has been turned off");
                break;
            case 'off':
                QueueService.turnLoopOff(id);
                message.channel.send("Loop has been turned off");
                break;
            default:
                message.channel.send("Please specify what loop you want. [one/all/off]");
        }
    }

    static queue(message, id) {
        var nowPlaying = QueueService.getSong(id);
        var qMSg = `Now Playing: ${nowPlaying.title}\n ------------------------------------ \n`;
        const songList = QueueService.getRemainingSongs(id);
        songList.forEach((song, i) => {
            qMSg += `${i+1}. ${song.title}\n`;
        });
        message.channel.send("```" + qMSg + "```");
    }

}