import Client from './src/Structures/Client'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] })

client.start(process.env['BOT_TOKEN'])
