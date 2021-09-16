const { acceptedMethods } = require("../src/configs/config.json")
const Discord = require("discord.js")
require("dotenv").config()
const { default: PlayService } = require("./services/playService")
const Distube = require("distube")


const prefix = process.env.PREFIX
const token = process.env.TOKEN

const client = new Discord.Client()
const distube = new Distube(client, {
    searchSongs: false,
    emitNewSongOnly: true,
})
PlayService.setDistube(distube)

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
