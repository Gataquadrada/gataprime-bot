import "dotenv/config"

import { MongoClient, ServerApiVersion } from "mongodb"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process?.env?.DB_URI ?? null, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

await client.connect()

export const db = client.db(process?.env?.DB_NAME ?? "gataprime")

export const query = (name = "_test") =>
    client.db(process?.env?.DB_NAME ?? "gataprime").collection(name)

export default query

export const utils = {
    getSetting: async (settingName) => {
        const s = await query("settings").findOne({ name: settingName })

        return s?.value ?? null
    },

    setSetting: async (settingName, value) => {
        return await query("settings").findOneAndUpdate(
            { name: settingName },
            {
                $set: {
                    value: value,
                },
            },
            { upsert: true, returnDocument: "after" }
        )
    },

    delSetting: async (settingName) => {
        return await query("settings").deleteMany({ name: settingName })
    },
}
