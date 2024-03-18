// BASE MODULE
import "dotenv/config"
import { ConsoleLogger, SocketClient, NTFY } from "../gata-utils/index.js"

import { DiscordUtils, DiscordInviteLink } from "./utils.js"

import DiscordGuild from "./Guild.class.js"

ConsoleLogger("BOOTING DISCORD MODULE...", "red")

// DISCORD API
import {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    Partials,
} from "discord.js"

// SOCKET
const socketClient = new SocketClient(
    `${process.env.SOCKET_URL}:${process.env.SOCKET_PORT}`
)

ConsoleLogger(`Creating Discord instance...`, "yellow")
ConsoleLogger(`Invite link: ${DiscordInviteLink}`, "cyan")

// Create Guilds index
const discordGuilds = new Collection()

// Create a new client instance
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

// UTILS
const discordUtils = new DiscordUtils({ socketClient, discordClient })

// discordClient.on(Events.Raw, async (message) => {
// console.log(Events.Raw)
// console.log(message)
// })

// Joined a Guild for the first time
discordClient.on(Events.GuildCreate, async (guild) => {
    NTFY(`Joined a Guild: ${guild.name}`)

    const discordGuild = new DiscordGuild({
        socketClient,
        discordClient,
        guild,
    })

    await discordGuild.init()

    discordGuilds.set(guild.id, discordGuild)
})

// Joined a Guild after a restart
discordClient.on(Events.GuildAvailable, async (guild) => {
    const discordGuild = new DiscordGuild({
        socketClient,
        discordClient,
        guild,
    })

    await discordGuild.init()

    discordGuilds.set(guild.id, discordGuild)
})

// Left a Guild or got kicked out
discordClient.on(Events.GuildDelete, (guild) => {
    NTFY(`Left a Guild: ${guild.name}`)
    discordGuilds.delete(guild.id)
})

discordClient.on(Events.InteractionCreate, async (interaction) => {
    if (interaction?.commandName) {
        if (interaction?.guildId) {
            // Prepare command (if applicable)
            await discordGuilds
                .get(interaction.guildId)
                ?.commandPrepare(interaction)

            // Run command (if applicable)
            if (interaction.isCommand()) {
                await discordGuilds
                    .get(interaction.guildId)
                    .commandExecute(interaction)
            }
        }
    }

    return null
})

// Client is ready
discordClient.on(Events.ClientReady, () => {
    ConsoleLogger(`DISCORD: Logged in as ${discordClient.user.tag}`, "green")
})

// Log in to Discord with your client's token
discordClient.login(process.env.DISCORD_TOKEN)

// SOCKET EVENTS

// Socket connected
socketClient.on("connect", () => {
    ConsoleLogger(`Connected to the socket server!`, "green")
    socketClient.emit("bot__moduleConnected", "DISCORD")
})

// Reload Discord commands
socketClient.on("discord__action_commands-reload", async () => {
    // for (const guild of discordGuilds.values()) {
    //     guild.servicesInit()

    //     socketClient.emit("discord__event", {
    //         event: `log_${guild.guild.id}`,
    //         data: "Reloading Discord commands...",
    //     })
    // }

    await discordUtils.commandsReload()
})

socketClient.on("discord__action_cmds-r", async () => {
    // for (const guild of discordGuilds.values()) {
    //     guild.servicesInit()

    //     socketClient.emit("discord__event", {
    //         event: `log_${guild.guild.id}`,
    //         data: "Reloading Discord commands...",
    //     })
    // }

    await discordUtils.commandsReload()
})
