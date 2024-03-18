import "dotenv/config"

import { REST, Routes } from "discord.js"
import { ConsoleLogger } from "../gata-utils/index.js"

import discordCommands from "./commands/index.js"

export class DiscordUtils {
    #socket = null
    #client = null

    constructor({ socketClient, discordClient }) {
        this.#socket = socketClient
        this.#client = discordClient
    }

    async say(room = null, message = null) {
        if (!room) return console.log("No room specified!")
        if (!message) return console.log("No message specified!")

        try {
            const discordRoom = await this.#client.channels.cache.get(room)
            discordRoom.send(message ?? "Hey!")
        } catch (err) {
            console.log(err)
        }
    }

    async commandsReload() {
        this.#socket.emit("bot__moduleSay", {
            module: "DISCORD",
            say: "Reloading Discord commands...",
        })

        // Construct and prepare an instance of the REST module
        const rest = new REST().setToken(process?.env?.DISCORD_TOKEN ?? null)

        // clear cache
        await (async () => {
            try {
                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    Routes.applicationCommands(process.env.DISCORD_APP_ID),
                    {
                        body: [],
                    }
                )

                ConsoleLogger(
                    `Successfully cleared cache of application (/) commands.`,
                    "red"
                )
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error)
            }
        })()

        // and deploy your commands!
        setTimeout(async () => {
            await (async () => {
                try {
                    ConsoleLogger(
                        `Reloading ${discordCommands.size} application (/) commands.`,
                        "red"
                    )

                    // Prepare JSON
                    const commandsJSON = []

                    // Loop through existing commands and push them to the JSON array
                    discordCommands.forEach(({ name, command }) => {
                        commandsJSON.push(command.data.toJSON())
                    })

                    // The put method is used to fully refresh all commands in the guild with the current set
                    const data = await rest.put(
                        Routes.applicationCommands(process.env.DISCORD_APP_ID),
                        {
                            body: commandsJSON,
                        }
                    )

                    ConsoleLogger(
                        `Successfully reloaded ${data.length} application (/) commands.`,
                        "green"
                    )

                    this.#socket.emit("bot__moduleSay", {
                        module: "DISCORD",
                        say: "Discord commands reloaded!",
                    })

                    // this.#client.guilds.cache.each((guild) => {
                    //     this.#socket.emit("discord__event", {
                    //         event: `log_${guild.id}`,
                    //         data: "Discord commands reloaded!",
                    //     })
                    // })
                } catch (error) {
                    // And of course, make sure you catch and log any errors!
                    console.error(error)
                }
            })()
        }, 30000)
    }
}

// Don't forget to have the Bot's Role above roles it'll be managing
export const DiscordInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${
    process?.env?.DISCORD_APP_ID ?? "0000000"
}&permissions=2064068766912&scope=bot%20applications.commands`
