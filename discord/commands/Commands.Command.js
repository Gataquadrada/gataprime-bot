import "dotenv/config"

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"

export const command = {
    cooldown: 180,
    data: new SlashCommandBuilder()
        .setName("commands")
        .setDescription("Actions related to Discord Commands.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("reload")
                .setDescription("Reload Commands.")
        }),
    async execute({ interaction, socketClient, discordClient, guildClass }) {
        if (process?.env?.DISCORD_ADMIN !== interaction.user.id) {
            await interaction.reply("You are not allowed to use this command.")
            return
        }

        const subCommand = interaction.options.getSubcommand()

        if ("reload" === subCommand) {
            await interaction.reply("Rebooting commands...")

            socketClient.emit("discord__action", {
                action: "commands-reload",
                data: null,
            })

            const now = Date.now()

            let expirationTime = now + 30 * 1000

            const expiredTimestamp = Math.round(expirationTime / 1000)

            return interaction
                .editReply({
                    content: `Rebooting commands... (<t:${expiredTimestamp}:R>)`,
                    ephemeral: true,
                })
                .then(() => {
                    setTimeout(() => {
                        interaction.editReply(`Commands rebooted!`)
                    }, Math.abs(expirationTime - now))
                })
        }
    },
}

export default command
