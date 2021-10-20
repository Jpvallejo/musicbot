import SlashCommandsService from "./services/slashCommandsService"

const { acceptedMethods } = require("../src/configs/config.json")
const Discord = require("discord.js")
require("dotenv").config()
const { default: PlayService } = require("./services/playService")
const { DisTube } = require("distube")

const prefix = process.env.PREFIX
const token = process.env.TOKEN

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_VOICE_STATES] })
const distube = new DisTube(client, {
    searchSongs: 0,
    emitNewSongOnly: true,
})
PlayService.setDistube(distube)

//SlashCommandsService.createSlashCommands(client)

const queue = new Map()

client.once("ready", () => {
    console.log("Ready!")
})

client.once("reconnecting", () => {
    console.log("Reconnecting!")
})

client.once("disconnect", () => {
    console.log("Disconnect!")
})

client.on("message", async (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return
    if (!checkPermissions(message)) return

    var args = message.content.split(" ")
    var cmd = args[0].substr(1, args[0].length)
    args = args.splice(1, args.length)
    const cmdString = args.join(" ")

    if (!acceptedMethods.includes(cmd)) {
        message.channel.send("You need to enter a valid command!")
        return
    }

    console.log(cmd)
    switch (cmd) {
        case "p":
            cmd = "play"
            break
        case "s":
            cmd = "skip"
            break
        case "q":
            cmd = "queue"
            break
        case "ff":
            cmd = "fastforward"
            break
        case "rr":
            cmd = "rewind"
            break
    }
    PlayService[cmd](message, cmdString)
})

client.ws.on("INTERACTION_CREATE", async (interaction) => {
    console.log(typeof interaction)
    console.log(interaction)
    interaction = {
        ...interaction,
        channel: await client.channels.fetch(interaction.channel_id),
    }
    const command = interaction.data.name.toLowerCase()
    let args = interaction.data.options
    args = args !== undefined ? args.join(" ") : ""

    PlayService[command](interaction, args)
})

function checkPermissions(message) {
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel) {
        message.channel.send("You need to be in a voice channel to play music!")
        return false
    }
    const permissions = voiceChannel.permissionsFor(message.client.user)
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        )
        return false
    }
    return true
}
client.login(token)
