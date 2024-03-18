import "dotenv/config"
import { ConsoleLogger } from "./index.js"

export const NTFY = async (message, headers = {}) => {
    headers = {
        ...{
            Priority: "default",
            Tags: "smiley_cat",
            Markdown: "yes",
        },
        ...headers,
        ...{
            Title: process?.env?.BOT_NAME ?? "Gata Prime",
        },
    }

    try {
        const response = await fetch(
            `https://ntfy.sh/${process?.env?.NTFY_ROOM ?? "gata-prime"}`,
            {
                method: "POST",
                body: message,
                headers,
            }
        )

        if (200 !== response.status) {
            ConsoleLogger("NTFY ERROR:", "red")
            console.log(await response.text())
        }
    } catch (err) {
        ConsoleLogger("NTFY ERROR:", "red")
        console.err(err)
    }
}
