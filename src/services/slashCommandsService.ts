import { Client } from "discord-slash-commands-client"
const { slashCommands } = require("../../src/configs/config.json")

export default class SlashCommandsService {
    static async createSlashCommands(dsClient) {
        const client = new Client(process.env.TOKEN, "887331401748336651")

        Object.keys(slashCommands).forEach(async function (key, index) {
            const data =
                slashCommands[key].options === undefined
                    ? {
                          name: key,
                          description: slashCommands[key].description,
                      }
                    : {
                          name: key,
                          description: slashCommands[key].description,
                          options: slashCommands[key].options,
                      }

            console.log(data)
                await client.createCommand(data)
        })

        // list all your existing commands.
        const commands = await client.getCommands({})

        console.log(commands)
    }
}
