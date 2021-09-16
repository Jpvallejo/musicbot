var distube

export default class PlayService {
    static async play(message, song) {
        console.log(distube)
        distube.isPaused(message) && !song
            ? distube.resume(message) && message.react("⏯️")
            : distube.play(message, song)
    }

    static async skip(message) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            )
        distube.skip(message)
        message.react("⏭️")
    }

    static async stop(message) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            )

        distube.stop(message)
        message.react("⏹️")
    }

    static loop(message, mode) {
        const loopModes = {
            off: 0,
            one: 1,
            all: 2,
        }
        if (!loopModes.hasOwnProperty(mode)) {
            return message.channel.send(
                "Please send a valid Loop mode. [off | one | all]"
            )
        }
        distube.setRepeatMode(message, loopModes[mode])
    }

    static queue(message) {
        let queue = distube.getQueue(message)
        message.channel.send(
            "Current queue:\n" +
                queue.songs
                    .map(
                        (song, id) =>
                            `**${id + 1}**. ${song.name} - \`${
                                song.formattedDuration
                            }\``
                    )
                    .slice(0, 10)
                    .join("\n")
        )
    }

    static seek(message, seconds) {
        const queue = distube.getQueue(message)
        let seekTime = seconds * 1000
        if (seekTime > queue.songs[0].duration) {
            seekTime = queue.songs[0].duration - 1
        }
        distube.seek(message, seekTime)
    }

    static jumpSong(message, seconds) {
        const queue = distube.getQueue(message)
        let seekTime = queue.currentTime + seconds * 1000
        console.log(seekTime)
        console.log(queue.songs[0].duration)
        if (seekTime >= queue.songs[0].duration * 1000) {
            seekTime = queue.songs[0].duration - 1000
        }
        distube.seek(message, seekTime)
        const emoji = seconds > 0 ? "⏩" : "⏪"
        message.react(emoji)
    }

    static fastforward(message, seconds) {
        this.jumpSong(message, Number(seconds))
    }

    static rewind(message, seconds) {
        this.jumpSong(message, -1 * Number(seconds[1]))
    }
    static jump(message, position) {
        distube.jump(message, position)
    }

    static pause(message) {
        distube.pause(message)
        message.react("⏸️")
    }

    static shuffle(message) {
        distube.shuffle(message)
    }

    static setDistube(elem) {
        distube = elem
        const status = (queue) =>
            `Volume: \`${queue.volume}%\` | Filter: \`${
                queue.filter || "Off"
            }\` | Loop: \`${
                queue.repeatMode
                    ? queue.repeatMode == 2
                        ? "All Queue"
                        : "This Song"
                    : "Off"
            }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``
        distube
            .on("playSong", (message, queue, song) =>
                message.channel.send(
                    `Playing \`${song.name}\` - \`${
                        song.formattedDuration
                    }\`\nRequested by: ${song.user}\n${status(queue)}`
                )
            )
            .on("addSong", (message, queue, song) =>
                message.channel.send(
                    `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
                )
            )
            .on("playList", (message, queue, playlist, song) =>
                message.channel.send(
                    `Play \`${playlist.name}\` playlist (${
                        playlist.songs.length
                    } songs).\nRequested by: ${song.user}\nNow playing \`${
                        song.name
                    }\` - \`${song.formattedDuration}\`\n${status(queue)}`
                )
            )
            .on("addList", (message, queue, playlist) =>
                message.channel.send(
                    `Added \`${playlist.name}\` playlist (${
                        playlist.songs.length
                    } songs) to queue\n${status(queue)}`
                )
            )
            .on("error", (message, e) => {
                console.error(e)
                message.channel.send("An error encountered: " + e)
            })
    }
}
