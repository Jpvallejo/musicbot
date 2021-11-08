import { MessageEmbed } from "discord.js"
const {
    acceptedMethods,
    methodDescriptions,
} = require("../../src/configs/config.json")
const pagination = require("./paginationService")

const embedColor = "#0099ff"
const wrongColor = ""

const spotifyToYT = require("spotify-to-yt")
var distube

export default class PlayService {
    static async play(message, song) {
        if (song && song.includes("spotify")) {
            if (song.includes("playlist")) {
                const result = await spotifyToYT.playListGet(song)
                console.log(result)
                distube.playCustomPlaylist(message, result.songs, {
                    name: result.info.name,
                    thumbnail: result.info.images[0].url,
                    url: result.info.external_urls.spotify,
                })
                message.react("✅")
                return
            }
            console.log("3")
            song = (await spotifyToYT.trackGet(song)).url
            console.log(song)
        }
        !song
            ? distube.resume(message) && message.react("⏯️")
            : distube.play(message, song) && message.react("✅")
    }

    static async skip(message) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            )
        try {
            distube.skip(message)
            message.react("⏭️")
        } catch (err) {
            return message.channel.send("There is nothing playing right now")
        }
    }

    static async stop(message) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "You have to be in a voice channel to stop the music!"
            )
        try {
            distube.stop(message)
            message.react("⏹️")
        } catch (err) {
            return message.channel.send("There is nothing playing right now")
        }
    }

    static loop(message, mode) {
        const loopModes = {
            off: 0,
            one: 1,
            all: 2,
        }
        const loopEmojis = {
            off: "✅",
            one: "🔂",
            all: "🔁",
        }
        if (!loopModes.hasOwnProperty(mode)) {
            return message.channel.send(
                "Please send a valid Loop mode. [off | one | all]"
            )
        }
        try {
            distube.setRepeatMode(message, loopModes[mode])
            message.react(loopEmojis[mode])
        } catch (err) {
            return message.channel.send(
                "You have to be playing something to execute this command!"
            )
        }
    }

    static queue(message) {
        let queue = distube.getQueue(message)
        if (!queue) return message.channel.send("The Queue is empty right now!")

        const embeds = []
        const mappedSongs = queue.songs.map(
            (song, id) =>
                `**${id + 1}** [${song.name}](${song.url}) - ${
                    song.formattedDuration
                }`
        )
        let k = 1
        for (let i = 0; i < queue.songs.length; i += 20) {
            let embed = new MessageEmbed()
                .setColor(embedColor)
                .setAuthor(`Queue for ${message.guild.name}`)
                .setTitle(`Page ${k}`)
                .setDescription(mappedSongs.slice(i, i + 19).join("\n"))

            embeds.push(embed)

            k++
        }

        const emojis = ["⬅️", "➡️"]

        pagination(message, embeds, emojis, 20000)
    }

    static seek(message, seconds) {
        const queue = distube.getQueue(message)
        if (!queue)
            return message.channel.send(
                "You have to be playing something to execute this command!"
            )
        let seekTime = seconds * 1000
        if (seekTime > queue.songs[0].duration) {
            seekTime = queue.songs[0].duration - 1
        }
        distube.seek(message, seekTime)
    }

    static clear(message) {
        const queue = distube.getQueue(message)
        queue.songs = queue.pause ? [] : [queue.songs[0]]
        message.react("✅")
    }

    static jumpSong(message, seconds) {
        const queue = distube.getQueue(message)
        if (!queue)
            return message.channel.send(
                "You have to be playing something to execute this command!"
            )
        let seekTime = queue.currentTime + seconds * 1000
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
        try {
            distube.jump(message, Number(position))
        } catch (err) {
            return message.channel.send("Please enter a valid song position")
        }
    }

    static pause(message) {
        try {
            distube.pause(message)
            message.react("⏸️")
        } catch (err) {
            return message.channel.send("There is nothing playing right now")
        }
    }

    static shuffle(message) {
        try {
            distube.shuffle(message)
            message.react("🔀")
        } catch (err) {
            return message.channel.send("There is nothing playing right now")
        }
    }
    static volume(message, volume) {
        try {
            distube.setVolume(Number(volume))
            message.channel.send(`Volume set to ${volume}%`)
        } catch (err) {
            console.log(err);
            return message.channel.send("There is nothing playing right now")
        }
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
            .on("playSong", (queue, song) => {
                let msg = `Playing \`${song.name}\` - \`${song.formattedDuration}\``
                if (song.playlist)
                    msg = `Playlist: ${song.playlist.name}\n${msg}`
                const embed = new MessageEmbed()
                    .setColor(embedColor)
                    .setDescription(
                        `${msg}\nRequested by: \`@${
                            song.user.username
                        }\` \n${status(queue)}`
                    )
                queue.textChannel.send({ embeds: [embed] })
            })
            .on("addSong", (queue, song) =>
                queue.textChannel.send(
                    `Added ${song.name} - \`${song.formattedDuration}\` to the queue by  \`@${song.user.username}\``
                )
            )
            .on("addList", (queue, playlist) =>
                queue.textChannel.send(
                    `Added \`${playlist.name}\` playlist (${
                        playlist.songs.length
                    } songs) to queue\n${status(queue)}`
                )
            )
            .on("error", (textChannel, e) => {
                console.error(e)
                textChannel.send("An error encountered: " + e)
            })
    }

    static pomo(message, song) {
        message.channel.send(",pjoin")
        message.channel.send(",pstart Basic study session")
        this.play(message, song)
    }

    static help(message) {
        const embed = new MessageEmbed().setColor(embedColor).setTitle(`Help`)
        var description = ""
        Object.keys(methodDescriptions).forEach(function (key, index) {
            description += `\`${key}\` \n ${methodDescriptions[key]} \n\n`
        })
        embed.setDescription(description)
        message.channel.send({ embeds: [embed] })
    }
}
