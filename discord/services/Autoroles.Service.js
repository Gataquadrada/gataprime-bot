import { ConsoleLogger, DBQuery } from "../../gata-utils/index.js"

import ServiceConstructor from "./ServiceConstructor.class.js"

import { Events } from "discord.js"

export class Autoroles extends ServiceConstructor {
    #listeningTo = new Map()

    run = async () => {
        await this.kill()

        ConsoleLogger(
            `DISCORD: Guild ${this.guild.name}: Autoroles: Loading...`,
            "white"
        )

        try {
            const items = await DBQuery("service-autoroles")
                .find({
                    guild_id: this.guild.id,
                })
                .toArray()

            if (items.length) {
                const numbers = [
                    "0️⃣",
                    "1️⃣",
                    "2️⃣",
                    "3️⃣",
                    "4️⃣",
                    "5️⃣",
                    "6️⃣",
                    "7️⃣",
                    "8️⃣",
                    "9️⃣",
                    "🔟",
                ]

                for (const item of items) {
                    const listenTo = {
                        id: item.message.id,
                        guild_id: item.guild_id,
                        channel: item.guild_channel.id,
                        roles: item.roles,
                        roles_index: {},
                    }

                    const channel = this.discordClient.channels.cache.get(
                        item.guild_channel.id
                    )

                    const message = await channel.messages.fetch(
                        item.message.id
                    )

                    await message.reactions.removeAll()

                    let i = 1

                    for (const role of item.roles) {
                        await message.react(`${numbers[i]}`)
                        listenTo.roles_index[numbers[i]] = role
                        i++
                    }

                    this.#listeningTo.set(item.message.id, listenTo)
                }
            } else {
                ConsoleLogger(
                    `DISCORD: Guild ${this.guild.name}: Autoroles: Nothing found!`,
                    "white"
                )
            }
        } catch (err) {
            console.log(err)
        }

        // DISCORD ON MEMBER REACTION ADD
        this.discordClient.on(
            Events.MessageReactionAdd,
            this.discordTrackMemberReactionAdd
        )
    }

    discordTrackMemberReactionAdd = async (reaction, user) => {
        try {
            if (reaction.partial) {
                try {
                    await reaction.fetch()
                } catch (error) {
                    return null
                }
            }

            if (!this.#listeningTo.has(reaction?.message?.id)) return null

            if (this.discordClient.user.id == user.id) return null

            reaction.users.remove(user.id)

            const listenTo = this.#listeningTo.get(reaction?.message?.id)

            if (!listenTo.roles_index[reaction?.emoji?.name]) return null

            // const guild = client.guilds.cache.get(listener.guild.guild_id)

            const member = reaction.message.guild.members.cache.get(user.id)

            const role = reaction.message.guild.roles.cache.find(
                (role) =>
                    role.id === listenTo.roles_index[reaction.emoji.name].id
            )

            if (!role) return null

            let message = `\`${member.displayName}\` (\`@${member.user.tag}\`) `

            if (await member.roles.cache.find((r) => r.id === role.id)) {
                await member.roles.remove(role).catch((err) => console.log(err))

                // DM User
                user.send(
                    `\`${reaction.message.guild.name}\`: You have been removed from the role \`${role.name}\``
                )

                // Log
                message += ` left the \`${role.name}\` role.`
            } else {
                await member.roles.add(role).catch((err) => console.log(err))

                // DM User
                user.send(
                    `\`${reaction.message.guild.name}\`: You have been given the role \`${role.name}\``
                )

                // Log
                message += ` joined the \`${role.name}\` role.`
            }

            this.socketClient.emit("discord__event", {
                event: `log_${this.guild.id}`,
                data: message,
            })
        } catch (err) {
            console.log(err)
        }
    }

    kill = async () => {
        ConsoleLogger(
            `DISCORD: Guild ${this.guild.name}: Autoroles: Killing Service...`,
            "white"
        )

        this.#listeningTo = new Map()

        // Remove DISCORD MEMBER REACTION ADD tracker
        this.discordClient.off(
            Events.GuildBanRemove,
            this.discordTrackMemberReactionAdd
        )

        return true
    }
}

export default Autoroles
