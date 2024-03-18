import { DBUtils } from "../../gata-utils/index.js"

import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
} from "discord.js"

export const command = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName("logger")
        .setDescription("Replies with Pong!")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("start")
                .setDescription("Choose a channel to save logs to.")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription(
                            "Will log when users join/leave the server/voice channels and more."
                        )
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
        })
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("stop")
                .setDescription("Stop logging actions.")
        }),
    async execute({ interaction, socketClient, discordClient, guildClass }) {
        if ("start" === interaction.options.getSubcommand()) {
            const channel = interaction.options.getChannel("channel") ?? null

            if (!channel) {
                return interaction
                    .reply(`You must select a channel.`)
                    .then(() => {
                        setTimeout(() => {
                            interaction.deleteReply()
                        }, 10000)
                    })
            }

            await DBUtils.setSetting(
                `guild_${interaction.guild.id}_logger_channel`,
                {
                    guild_id: interaction.guild.id,
                    channel_id: channel.id,
                }
            )

            await interaction.reply(`I'll log stuff to \`${channel.name}\`!`)
        } else if ("stop" === interaction.options.getSubcommand()) {
            try {
                await DBUtils.delSetting(
                    `guild_${interaction.guild.id}_logger_channel`
                )

                await interaction.reply(`I'll no longer log stuff!`)
            } catch (err) {
                await interaction.reply(`I don't know about any log channel.`)
            }
        }

        await guildClass.serviceReload("logger")
    },
}

export default command
