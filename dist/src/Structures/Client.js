"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
class Client extends discord_js_1.Client {
    constructor() {
        super(...arguments);
        this.commands = new discord_js_1.Collection();
    }
    async start(token) {
        await this.loadEvents();
        await this.loadCommands();
        this.login(token);
    }
    async loadCommands() {
        const folderPath = path_1.default.join(__dirname, '../Commands/');
        const commands = await (0, promises_1.readdir)(folderPath);
        commands.forEach(file => {
            const command = require('../Commands/' + file).default;
            this.commands.set({ name: file.replace(/[.].+/, ''), aliases: command().aliases }, command);
        });
    }
    async loadEvents() {
        const folderPath = path_1.default.join(__dirname, '../Events/');
        const events = await (0, promises_1.readdir)(folderPath);
        events.forEach(eventFile => {
            const eventImport = require('../Events/' + eventFile).default;
            const eventClass = new eventImport(this);
            const eventRun = eventClass.run.bind(eventClass);
            this.on(eventFile.replace(/[.].+/, ''), eventRun);
        });
    }
}
exports.default = Client;
