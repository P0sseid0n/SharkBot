import { Client as client, Collection } from 'discord.js'
import { readdir } from 'fs/promises'
import path from 'path'
import { Command, CommandFn, Events } from '@/Types'

interface CommandListKey {
	name: string
	aliases: Command['aliases']
}

class Client extends client {
	public commands: Collection<CommandListKey, CommandFn> = new Collection()

	async start(token?: string) {
		await this.loadEvents()
		await this.loadCommands()
		this.login(token)
	}

	async loadCommands() {
		const folderPath = path.join(__dirname, '../Commands/')
		const commands = await readdir(folderPath)

		commands.forEach(file => {
			const command = require('../Commands/' + file).default as CommandFn
			this.commands.set({ name: file.replace(/[.].+/, ''), aliases: command().aliases }, command)
		})
	}

	async loadEvents() {
		const folderPath = path.join(__dirname, '../Events/')
		const events = await readdir(folderPath)

		events.forEach(eventFile => {
			const eventImport = require('../Events/' + eventFile).default
			const eventClass = new eventImport(this) as Events
			const eventRun = eventClass.run.bind(eventClass)

			this.on(eventFile.replace(/[.].+/, ''), eventRun)
		})
	}
}

export default Client
