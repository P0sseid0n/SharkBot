import Client from './src/Structures/Client'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] })

client.start(process.env.NODE_ENV == 'production' ? process.env['PROD_BOT_TOKEN'] : process.env['DEV_BOT_TOKEN'])
