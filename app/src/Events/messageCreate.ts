import { Message, Events, CommandFn } from '../Types'

export default class extends Events {
	run(msg: Message) {
		if (msg.author.bot) return
		console.log(`${msg.author.tag}: ${msg.content}`)

		// Retirar o prefixo da mensagem

		const args = msg.content.split(' ')

		const mainArg = args.shift()?.toLowerCase()

		if (!mainArg) return

		const usedCommand = this.client.commands.findKey((value, key) => {
			return key.aliases.includes(mainArg) || key.name.toLowerCase() == mainArg
		})

		if (!usedCommand) return

		console.log(`Running command '${usedCommand.name}'`)

		const command = this.client.commands.get(usedCommand) as CommandFn

		msg.command = { name: usedCommand.name, args }

		console.log(msg.command)

		command(this.client).run(msg)
	}
}
