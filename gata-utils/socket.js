// BASE MODULE
import "dotenv/config"
import { ConsoleLogger } from "../gata-utils/index.js"

import { io } from "socket.io-client"

export class SocketClient {
    #socket = null

    constructor(
        { onConnect = null } = {
            onConnect: null,
        }
    ) {
        ConsoleLogger(
            `CONNECTING TO ${process?.env?.SOCKET_SERVER_URL ?? "/"}:${
                process?.env?.SOCKET_SERVER_PORT ?? 6006
            }`,
            "red"
        )

        this.#socket = io(
            `${process?.env?.SOCKET_SERVER_URL}:${
                process?.env?.SOCKET_SERVER_PORT ?? 6006
            }`
        )

        this.on("connect", () => {
            ConsoleLogger("MODULE CONNECTED!", "green")

            if (typeof onConnect == typeof function () {}) onConnect(this)
        })

        this.on("disconnect", () => {
            ConsoleLogger("MODULE CONNECTION LOST!", "red")
        })

        this.on("error", (err) => {
            ConsoleLogger("MODULE ERROR!", "red")
            console.error(err)
        })

        this.on("reconnect_attempt", () => {
            ConsoleLogger(
                `MODULE RECONNECTING TO ${
                    process?.env?.SOCKET_SERVER_URL ?? "/"
                }:${process?.env?.SOCKET_SERVER_PORT ?? 6006}`,
                "red"
            )
        })

        this.on("reconnect", () => {
            ConsoleLogger("MODULE RECONNECTED!", "green")
        })

        this.on("reconnect_error, reconnect_failed", (err) => {
            ConsoleLogger("MODULE RECONNECT ERROR", "red")
            console.error(err)
        })
    }

    on(event = null, callback = null) {
        if (!event) return console.log("No event specified!")
        if (!callback) return console.log("No callback specified!")

        this.#socket.on(event, callback)
    }

    emit(event = null, data = null) {
        if (!event) return console.log("No event specified!")
        // if (!data) return console.log("No data specified!")

        this.#socket.emit(event, data)
    }
}
