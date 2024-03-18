import "dotenv/config"
import { ConsoleLogger, NTFY } from "./gata-utils/index.js"

import express from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"

const app = express()
const server = createServer(app)
const io = new Server(server)

app.get("/", (req, res) => {
    res.send("<h1>I am alive!</h1>")

    const twitchCode = req?.query?.code ?? null

    if (twitchCode) {
        // const accessTokenURL = `https://id.twitch.tv/oauth2/token?client_id=CLIENT_ID
        // &client_secret=nk8dxla80y3wi8titj6qjfs9lrhfpn
        // &code=ujfkwu0ovqz6a47zs5nustdbfi8wdi
        // &grant_type=authorization_code
        // &redirect_uri=${encodeURIComponent("http://localhost:3007")}`
    }
})

io.on("connection", (socket) => {
    ConsoleLogger("NEW MODULE CONNECTED!", "yellow")

    socket.on("bot__moduleConnected", (module) => {
        socket._gata_moduleName = module.toLocaleUpperCase()

        ConsoleLogger(`MODULE CONNECTED: ${socket._gata_moduleName}`, "green")
    })

    socket.on("bot__moduleSay", ({ module, say }) => {
        ConsoleLogger(`${module}: ${say}`, "white")
    })

    socket.on("bot__moduleWarn", ({ module, say }) => {
        ConsoleLogger(`${module}: ${say}`, "yellow")
    })

    socket.on("bot__moduleErr", ({ module, say }) => {
        ConsoleLogger(`${module}: ${say}`, "red")
    })

    // TODO Limit to current guild only
    // ROOMS?
    socket.on("discord__action", ({ action, data }) => {
        io.emit(`discord__action_${action}`, data)
    })

    socket.on("discord__event", ({ event, data }) => {
        io.emit(`discord__event_${event}`, data)
    })

    socket.on("twitch__action", ({ action, data }) => {
        io.emit(`twitch__action_${action}`, data)
    })

    socket.on("twitch__event", ({ event, data }) => {
        io.emit(`twitch__event_${event}`, data)
    })

    socket.on("disconnect", async () => {
        ConsoleLogger("MODULE DISCONNECTED!", "red")

        if (!process?.env?.DEBUG) {
            await NTFY(`Module Disconnected (${socket._gata_moduleName})!`, {
                Priority: "max",
            })
        }
    })

    // socket.on("twitch__getUserByName", (channel) => {
    //     console.log(`Requested Twitch Channel Data: ${channel}`)
    //     io.emit("twitch__getUserByName", channel)
    // })
})

server.listen(process?.env?.SOCKET_SERVER_PORT ?? 6006, () => {
    ConsoleLogger([
        [`SERVER RUNNING AT`, "green"],
        [
            `${process?.env?.SOCKET_SERVER_URL ?? "http://localhost"}:${
                process?.env?.SOCKET_SERVER_PORT ?? 6006
            }`,
            "yellow",
        ],
        [`@GataQuadrada`, "blue"],
    ])
})

process.stdin.on("data", function (text) {
    text = text.toString().trim()

    if (text.match(/(discord|d)\:/gi)) {
        const action = text.replace(/(discord|d)\:/gi, "").trim()
        io.emit(`discord__action_${action}`, null)
    } else if (text.trim().match(/exit|quit/gi)) {
        exit()
    }
})

function exit() {
    process.exit()
}
