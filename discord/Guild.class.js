import { Collection } from "discord.js"
import { ConsoleLogger, DBQuery } from "../gata-utils/index.js"

import discordServices from "./services/index.js"

import discordCommands from "./commands/index.js"

export default class DiscordGuild {
    socket = null
    client = null
    guild = null
    dbGuild = null

    cooldowns = new Collection()

    services = new Map()

    constructor({ socketClient, discordClient, guild }) {
        this.socket = socketClient
        this.client = discordClient
        this.guild = guild

        ConsoleLogger(`DISCORD: Connected to Guild: ${this.guild.name}`, "blue")
    }

    init = async () => {
        this.dbGuild = await DBQuery("guilds").findOneAndUpdate(
            { guild_id: this.guild.id },
            {
                $set: {
                    name: this.guild.name,
                },
            },
            { upsert: true, returnDocument: "after" }
        )

        await this.servicesInit()
    }

    servicesInit = async () => {
        discordServices.forEach(async ({ name, service }) => {
            ConsoleLogger(
                `DISCORD: Guild ${this.guild.name}: Initializing Service "${name}"...`,
                "yellow"
            )

            this.serviceReload(name)
        })
    }

    serviceKill = async (serviceName) => {
        // Attempting to kill the service
        try {
            ConsoleLogger(`Killing service ${serviceName}...`, "cyan")
            this.services.get(serviceName)?.kill()
        } catch (err) {
            ConsoleLogger(`Service ${serviceName} not found!`, "red")
            console.log(err)
        }
    }

    serviceReload = async (serviceName) => {
        ConsoleLogger(`Reloading service ${serviceName}...`, "cyan")

        // Killing the service first
        this.serviceKill(serviceName)

        ConsoleLogger(`Starting service ${serviceName}...`, "cyan")

        // Getting the service and re-initializing it
        const _service = discordServices.get(serviceName)

        if (!_service) {
            ConsoleLogger(`Service ${serviceName} not found!`, "red")
            return
        }

        const s = new _service.service({
            discordClient: this.client,
            guild: this.guild,
            socketClient: this.socket,
            guildClass: this,
        })

        await s.run()

        // Storing the service into a MAP for later usage
        this.services.set(_service.name, s)
    }

    commandCooldownCheck = async (interaction, command) => {
        if (command?.cooldown) {
            const cooldown_name = command.data.name

            const now = Date.now()

            if (this.cooldowns.has(cooldown_name)) {
                const defaultCooldownDuration = 5

                const cooldownAmount =
                    (command.cooldown ?? defaultCooldownDuration) * 1000

                const expirationTime =
                    this.cooldowns.get(cooldown_name) + cooldownAmount

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000)

                    await interaction
                        .reply({
                            content: `Command on cooldown (<t:${expiredTimestamp}:R>).`,
                            ephemeral: true,
                        })
                        .then(() => {
                            setTimeout(() => {
                                interaction.deleteReply()
                            }, Math.abs(expirationTime - now))
                        })

                    return true
                }
            }

            this.cooldowns.set(cooldown_name, now)
        }

        return false
    }

    commandPrepare = async (interaction) => {
        try {
            const { name, command } = discordCommands.get(
                interaction.commandName
            )

            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                )

                return null
            }

            // if (!this.commandCooldownCheck(interaction, command)) {
            //     return null
            // }

            if (command?.prepare) {
                await command.prepare({
                    interaction,
                    socketClient: this.socket,
                    discordClient: this.client,
                    guildClass: this,
                })
            }

            return true
        } catch (error) {
            return false
        }
    }

    commandExecute = async (interaction) => {
        try {
            const { name, command } = discordCommands.get(
                interaction.commandName
            )

            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                )

                return null
            }

            if (!interaction.isCommand() && !interaction.isChatInputCommand())
                return

            const cooldownCheck = await this.commandCooldownCheck(
                interaction,
                command
            )

            if (cooldownCheck) {
                return null
            }

            const commandResult = await command.execute({
                interaction,
                socketClient: this.socket,
                discordClient: this.client,
                guildClass: this,
            })

            return commandResult
        } catch (error) {
            console.error(error)

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                })
            } else {
                // await interaction.reply({
                //     content: "There was an error while executing this command!",
                //     ephemeral: true,
                // })
            }

            return null
        }
    }

    // async getGuilds() {
    //     return this.client.guilds.cache
    // }

    // async getGuildById(id = null) {
    //     if (!id) return console.log("No ID specified!")

    //     return this.client.guilds.cache.get(id)
    // }

    // async getGuildChannels(guild = null) {
    //     if (!guild) return console.log("No guild specified!")

    //     return guild.channels.cache
    // }

    // async getGuildMembers(guild = null) {
    //     if (!guild) return console.log("No guild specified!")

    //     return guild.members.cache
    // }

    // async getGuildRoles(guild = null) {
    //     if (!guild) return console.log("No guild specified!")

    //     return guild.roles.cache
    // }

    // async getGuildEmojis(guild = null) {
    //     if (!guild) return console.log("No guild specified!")

    //     return guild.emojis.cache
    // }

    // async getGuildVoiceStates(guild = null) {
    //     if (!guild) return console.log("No guild specified!")

    //     return guild.voiceStates.cache
    // }

    // async getGuildInvites(guild = null) {
    //     if (!guild) return console.log("No guild specified!")

    //     return guild.invites.cache
    // }

    // async getGuildBans(guild = null) {
    //     if (!guild) return console.log("No guild specified!")

    //     return guild.bans.cache
    // }
}
