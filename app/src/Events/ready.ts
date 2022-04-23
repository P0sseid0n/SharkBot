import { Client } from 'discord.js'
import { Events } from '../Types'

export default class extends Events {
	run(client: Client<true>) {
		console.log('Ready')
	}
}
