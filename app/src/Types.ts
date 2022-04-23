import { Message as message } from 'discord.js'
import Client from './Structures/Client'

export type MessageCommand = { name: string; args: string[] }

export interface Message extends message {
	command: MessageCommand
}

export interface Command {
	aliases: string[]
	run(message: Readonly<Message>): Promise<unknown> | unknown
}

export type CommandFn = <T>(client?: T) => T extends Client ? Command : Omit<Command, 'run'>

export abstract class Events {
	constructor(protected client: Client) {}

	abstract run(...args: unknown[]): void
}
