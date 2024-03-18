import { ConsoleLogger, DBUtils } from "../../gata-utils/index.js"

import ServiceConstructor from "./ServiceConstructor.class.js"

import { Events } from "discord.js"

export class Logger extends ServiceConstructor {
    // constructor({ discordClient, socketClient, guild }) {
    //     super({ discordClient, socketClient, guild })
    // }

    #logGuild = null
    #logChannel = null

    run = async () => {
        await this.kill()

        ConsoleLogger(
            `DISCORD: Guild ${this.guild.name}: Logger: Checking if Guild has a Logger Channel...`,
            "white"
        )

        const logChannel = await DBUtils.getSetting(
            `guild_${this.guild.id}_logger_channel`
        )

        if (!logChannel) {
            ConsoleLogger(
                `DISCORD: Guild ${this.guild.name}: Logger:     Logger Channel found!`,
                "red"
            )
            return
        }

        ConsoleLogger(
            `DISCORD: Guild ${this.guild.name}: Logger: Logger Channel found: ${logChannel.channel_id}`,
            "green"
        )

        this.#logGuild = logChannel.guild_id
        this.#logChannel = logChannel.channel_id

        // SOCKET LISTENER
        this.socketClient.on(
            `discord__event_log_${this.guild.id}`,
            this.socketListener
        )

        // DISCORD VOICE CHANNELS TRACKER
        this.discordClient.on(
            Events.VoiceStateUpdate,
            this.discordTrackVoiceState
        )

        // DISCORD MEMBER JOIN TRACKER
        this.discordClient.on(Events.GuildMemberAdd, this.discordTrackMemberAdd)

        // DISCORD MEMBER LEAVE TRACKER
        this.discordClient.on(
            Events.GuildMemberRemove,
            this.discordTrackMemberRemove
        )

        // DISCORD MEMBER BAN TRACKER
        this.discordClient.on(Events.GuildBanAdd, this.discordTrackMemberBan)

        // DISCORD MEMBER UNBAN TRACKER
        this.discordClient.on(
            Events.GuildBanRemove,
            this.discordTrackMemberUnban
        )
    }

    socketListener = async (data) => {
        this.discordUtils.say(this.#logChannel, data)
    }

    discordTrackVoiceState = async (before, after) => {
        const { member } = before

        let message = null

        if (before?.channelId == after?.channelId) return null

        message = `\`${member.displayName}\` (\`@${member.user.tag}\`) `

        if (before.channelId && !after.channelId) {
            message += `left <#${before.channel.id}>`
        } else if (before.channelId && after.channelId) {
            message += `left <#${before.channel.id}> and joined <#${after.channel.id}>`
        } else if (!before.channelId && after.channelId) {
            message += `joined <#${after.channel.id}>`
        }

        if (!message) return null

        this.discordUtils.say(this.#logChannel, message)
    }

    discordTrackMemberAdd = async (member) => {
        this.discordUtils.say(
            this.#logChannel,
            `\`${member.displayName}\` (\`${member.user.tag}\`) joined the server`
        )
    }

    discordTrackMemberRemove = async (member) => {
        this.discordUtils.say(
            this.#logChannel,
            `\`${member.displayName}\` (\`${member.user.tag}\`) **LEFT** the server`
        )
    }

    discordTrackMemberBan = async (member) => {
        this.discordUtils.say(
            this.#logChannel,
            `\`${member.displayName}\` (\`${member.user.tag}\`) **GOT BANNED** from the server`
        )
    }

    discordTrackMemberUnban = async (member) => {
        this.discordUtils.say(
            this.#logChannel,
            `\`${member.displayName}\` (\`${member.user.tag}\`) got unbanned from the server`
        )
    }

    kill = async () => {
        ConsoleLogger(
            `DISCORD: Guild ${this.guild.name}: Logger: Killing Logger Service...`,
            "white"
        )

        // Remove SOCKET listener
        try {
            this.socketClient.off(
                `discord__event_log_${this.guild.id}`,
                this.socketListener
            )
        } catch (err) {}

        // Remove DISCORD VOICE CHANNELS TRACKER
        this.discordClient.off(
            Events.VoiceStateUpdate,
            this.discordTrackVoiceState
        )

        // Remove DISCORD MEMBER JOIN TRACKER
        this.discordClient.off(
            Events.GuildMemberAdd,
            this.discordTrackMemberAdd
        )

        // Remove DISCORD MEMBER LEAVE TRACKER
        this.discordClient.off(
            Events.GuildMemberRemove,
            this.discordTrackMemberRemove
        )

        // Remove DISCORD MEMBER BAN TRACKER
        this.discordClient.off(Events.GuildBanAdd, this.discordTrackMemberBan)

        // Remove DISCORD MEMBER UNBAN TRACKER
        this.discordClient.off(
            Events.GuildBanRemove,
            this.discordTrackMemberUnban
        )

        return true
    }
}

export default Logger
