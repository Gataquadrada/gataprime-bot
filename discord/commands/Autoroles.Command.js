import "dotenv/config"

import { ConsoleLogger, DBQuery, ObjectId } from "../../gata-utils/index.js"

import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    AttachmentBuilder,
} from "discord.js"

import { createCanvas } from "@napi-rs/canvas"

export const command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("autoroles")
        .setDescription(
            "Create self service roles users can assign to themselves."
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("create")
                .setDescription(
                    "Adds a self-service role picker to a channel (message with reactions)."
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("Brief description")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("preview_colors")
                        .setDescription("Preview colors?")
                        .setRequired(true)
                        .addChoices(
                            { name: "Yes ✅", value: "yes" },
                            { name: "No ❌", value: "no" }
                        )
                )
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Channel users will self-service at.")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_1")
                        .setDescription("1st role")
                        .setRequired(true)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_2")
                        .setDescription("2nd role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_3")
                        .setDescription("3rd role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_4")
                        .setDescription("4th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_5")
                        .setDescription("5th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_6")
                        .setDescription("6th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_7")
                        .setDescription("7th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_8")
                        .setDescription("8th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_9")
                        .setDescription("9th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_10")
                        .setDescription("10th role")
                        .setRequired(false)
                )
        })
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("edit")
                .setDescription("Edit an existing autorole.")
                .addStringOption((option) =>
                    option
                        .setName("autorole_id")
                        .setDescription("Select and item from the list")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("Brief description")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("preview_colors")
                        .setDescription("Preview colors?")
                        .setRequired(true)
                        .addChoices(
                            { name: "Yes ✅", value: "yes" },
                            { name: "No ❌", value: "no" }
                        )
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_1")
                        .setDescription("1st role")
                        .setRequired(true)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_2")
                        .setDescription("2nd role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_3")
                        .setDescription("3rd role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_4")
                        .setDescription("4th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_5")
                        .setDescription("5th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_6")
                        .setDescription("6th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_7")
                        .setDescription("7th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_8")
                        .setDescription("8th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_9")
                        .setDescription("9th role")
                        .setRequired(false)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role_10")
                        .setDescription("10th role")
                        .setRequired(false)
                )
        })
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("delete")
                .setDescription("Remove a previously created role picker.")
                .addStringOption((option) =>
                    option
                        .setName("autorole_id")
                        .setDescription("Select and item from the list")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        }),
    async prepare({ interaction, socketClient, discordClient, guildClass }) {
        const focused = interaction.options.getFocused(true)

        if ("autorole_id" == focused.name) {
            try {
                const choices = []

                const items = await DBQuery("service-autoroles")
                    .find({
                        guild_id: guildClass.guild.id,
                    })
                    .toArray()

                if (items.length) {
                    for (const item of items) {
                        const roles = []

                        for (const role of item.roles) {
                            roles.push(`@${role.name}`)
                        }

                        choices.push({
                            name: `${item.guild_channel.name} - ${item.description}`.slice(
                                0,
                                99
                            ),
                            value: item._id.toString(),
                        })
                    }
                }

                choices.push({ name: "Cancel", value: "_cancel" })

                // if (interaction.isAutocomplete()) {
                interaction.respond(choices).catch(console.error)
                // }
            } catch (err) {
                console.log(err)
            }
        }

        return true
    },
    async execute({ interaction, socketClient, discordClient, guildClass }) {
        const subCommand = interaction.options.getSubcommand()

        if ("create" === subCommand) {
            const description =
                interaction.options.getString("description") ?? null

            const previewColors =
                "yes" == interaction.options.getString("preview_colors")

            const channel = interaction.options.getChannel("channel") ?? null

            const roles = []

            for (let i = 1; i <= 10; i++) {
                const role = interaction.options.getRole(`role_${i}`) ?? null

                if (role) {
                    roles.push(role)
                }
            }

            if (!channel) {
                return interaction
                    .reply(`You must select a channel.`)
                    .then(() => {
                        setTimeout(() => {
                            interaction.deleteReply()
                        }, 10000)
                    })
            }

            if (!roles.length) {
                return interaction
                    .reply(`You must select at least one role.`)
                    .then(() => {
                        setTimeout(() => {
                            interaction.deleteReply()
                        }, 10000)
                    })
            }

            await interaction.reply("Role menu created!")

            const messageRolesList = []

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

            let i = 1

            for (const role of roles) {
                messageRolesList.push(`${numbers[i]} ${role.name}`)
                i++
            }

            // interaction.guild.channels
            // .fetch(channel.id)
            // .then(async (channel) => {
            const newMessage = {
                content:
                    (description ? description + "```\n" : "") +
                    messageRolesList.join("\n") +
                    (description ? "\n```" : ""),
            }

            if (previewColors) {
                const canvas = createCanvas(300, 200)
                const ctx = canvas.getContext("2d")

                const segmentWidth = 300 / roles.length
                i = 0

                for (const role of roles) {
                    ctx.strokeStyle =
                        "#" + role.color.toString(16).padStart(6, "0")

                    ctx.fillStyle =
                        "#" + role.color.toString(16).padStart(6, "0")

                    ctx.fillRect(i * segmentWidth, 0, segmentWidth, 200)

                    i++
                }

                const attachment = new AttachmentBuilder(
                    await canvas.encode("png"),
                    { name: "roles-image.png" }
                )

                newMessage.files = [attachment]
            }

            try {
                const message = await channel.send(newMessage)

                await DBQuery("service-autoroles").insertOne({
                    guild_id: guildClass.guild.id,
                    guild_channel: {
                        id: channel.id,
                        name: channel.name,
                    },
                    description,
                    message: {
                        id: message.id,
                        content: newMessage.content,
                    },
                    roles: roles.map((v, i) => {
                        return {
                            id: v.id,
                            name: v.name,
                            color: "#" + v.color.toString(16).padStart(6, "0"),
                            color_bin: v.color,
                        }
                    }),
                })

                await guildClass.serviceReload("autoroles")
            } catch (err) {
                console.err(err)
            }
        } else if ("edit" === subCommand) {
            const autoroleID =
                interaction.options.getString("autorole_id") ?? null

            if (!autoroleID) {
                return await interaction.reply("Invalid option.")
            } else if ("_cancel" == autoroleID) {
                return await interaction.reply("Canceled by user.")
            }

            try {
                const item = await DBQuery("service-autoroles").findOne({
                    _id: new ObjectId(autoroleID),
                })

                if (item) {
                    const channel = discordClient.channels.cache.get(
                        item.guild_channel.id
                    )

                    const message = await channel.messages.fetch(
                        item.message.id
                    )

                    const description =
                        interaction.options.getString("description") ?? null

                    const previewColors =
                        "yes" == interaction.options.getString("preview_colors")

                    const roles = []

                    for (let i = 1; i <= 10; i++) {
                        const role =
                            interaction.options.getRole(`role_${i}`) ?? null

                        if (role) {
                            roles.push(role)
                        }
                    }

                    if (!roles.length) {
                        return interaction
                            .reply(`You must select at least one role.`)
                            .then(() => {
                                setTimeout(() => {
                                    interaction.deleteReply()
                                }, 10000)
                            })
                    }

                    const messageRolesList = []

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

                    let i = 1

                    for (const role of roles) {
                        messageRolesList.push(`${numbers[i]} ${role.name}`)
                        i++
                    }

                    const newMessage = {
                        content:
                            (description ? description + "```\n" : "") +
                            messageRolesList.join("\n") +
                            (description ? "\n```" : ""),
                    }

                    if (previewColors) {
                        const canvas = createCanvas(300, 200)
                        const ctx = canvas.getContext("2d")

                        const segmentWidth = 300 / roles.length
                        i = 0

                        for (const role of roles) {
                            ctx.strokeStyle =
                                "#" + role.color.toString(16).padStart(6, "0")

                            ctx.fillStyle =
                                "#" + role.color.toString(16).padStart(6, "0")

                            ctx.fillRect(i * segmentWidth, 0, segmentWidth, 200)

                            i++
                        }

                        const attachment = new AttachmentBuilder(
                            await canvas.encode("png"),
                            {
                                name: "roles-image.png",
                            }
                        )

                        newMessage.files = [attachment]
                    } else {
                        newMessage.files = []
                    }

                    await DBQuery("service-autoroles").findOneAndReplace(
                        {
                            _id: new ObjectId(autoroleID),
                        },
                        {
                            guild_id: guildClass.guild.id,
                            guild_channel: {
                                id: channel.id,
                                name: channel.name,
                            },
                            description,
                            message: {
                                id: message.id,
                                content: newMessage.content,
                            },
                            roles: roles.map((v, i) => {
                                return {
                                    id: v.id,
                                    name: v.name,
                                    color:
                                        "#" +
                                        v.color.toString(16).padStart(6, "0"),
                                    color_bin: v.color,
                                }
                            }),
                        }
                    )

                    message.edit(newMessage)

                    await interaction.reply(`Item updated!`)
                } else {
                    await interaction.reply(`Original message not present!`)
                }
            } catch (err) {
                console.log(err)
            }

            await guildClass.serviceReload("autoroles")

            return true
        } else if ("delete" === subCommand) {
            const autoroleID =
                interaction.options.getString("autorole_id") ?? null

            if (!autoroleID) {
                return await interaction.reply("Invalid option.")
            } else if ("_cancel" == autoroleID) {
                return await interaction.reply("Canceled by user.")
            }

            try {
                const item = await DBQuery("service-autoroles").findOne({
                    _id: new ObjectId(autoroleID),
                })

                if (item) {
                    const channel = discordClient.channels.cache.get(
                        item.guild_channel.id
                    )

                    const message = await channel.messages.fetch(
                        item.message.id
                    )

                    message.delete()

                    await interaction.reply(`Removed item!`)
                } else {
                    await interaction.reply(`Original message not present!`)
                }
            } catch (err) {
                console.log(err)
            }

            try {
                await DBQuery("service-autoroles").deleteOne({
                    _id: new ObjectId(autoroleID),
                })
            } catch (err) {
                console.log(err)
            }

            await guildClass.serviceReload("autoroles")

            return true
        }
    },
}

export default command
