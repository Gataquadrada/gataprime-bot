export const ConsoleColors = {
    red: "91",
    green: "92",
    yellow: "93",
    blue: "94",
    magenta: "95",
    cyan: "96",
    white: "97",
    reset: "0",
}

export const ConsoleLogger = (message = "", color = "0") => {
    if (Array.isArray(message)) {
        for (let msg of message) {
            if (!Array.isArray(msg)) msg = msg.split("|")

            console.log(
                `\x1b[${
                    ConsoleColors?.[msg[1]] ??
                    ConsoleColors?.[color] ??
                    ConsoleColors.reset
                }m${msg[0] ?? "???"}\x1b[0m`
            )
        }
    } else {
        console.log(
            `\x1b[${
                ConsoleColors?.[color] ?? ConsoleColors.reset
            }m${message}\x1b[0m`
        )
    }
}

export default ConsoleLogger
