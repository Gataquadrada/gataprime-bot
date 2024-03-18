import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"

export const command = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute({ interaction, socketClient, discordClient, guildClass }) {
        await interaction.reply("Pong!")
    },
}

export default command
