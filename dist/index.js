"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = __importDefault(require("./src/Structures/Client"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new Client_1.default({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
client.start(process.env['BOT_TOKEN']);
