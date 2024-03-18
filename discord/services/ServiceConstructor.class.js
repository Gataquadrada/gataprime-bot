import { DiscordUtils } from "../utils.js"

export class ServiceConstructor {
    discordUtils = null

    discordClient = null
    socketClient = null
    guild = null

    constructor({ discordClient, socketClient, guild }) {
        this.discordClient = discordClient
        this.socketClient = socketClient
        this.guild = guild

        this.discordUtils = new DiscordUtils({
            socketClient: this.socketClient,
            discordClient: this.discordClient,
        })
    }
}

export default ServiceConstructor
