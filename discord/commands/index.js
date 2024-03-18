const DiscordCommands = new Map()

import Commands from "./Commands.Command.js"
DiscordCommands.set("commands", {
    name: "commands",
    command: Commands,
})

import Ping from "./Ping.Command.js"
DiscordCommands.set("ping", {
    name: "ping",
    command: Ping,
})

import Logger from "./Logger.Command.js"
DiscordCommands.set("logger", {
    name: "logger",
    command: Logger,
})

import Autoroles from "./Autoroles.Command.js"
DiscordCommands.set("autoroles", {
    name: "autoroles",
    command: Autoroles,
})

export default DiscordCommands
