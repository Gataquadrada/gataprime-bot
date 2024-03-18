const DiscordServices = new Map()

import logger from "./Logger.Service.js"
DiscordServices.set("logger", {
    name: "logger",
    service: logger,
})

import autoroles from "./Autoroles.Service.js"
DiscordServices.set("autoroles", {
    name: "autoroles",
    service: autoroles,
})

export default DiscordServices
