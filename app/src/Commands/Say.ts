import { Formatters, TextBasedChannel } from 'discord.js'
import { CommandFn } from '@/Types'

const Command: CommandFn = client => {
	function getChannelId(possibleId: string): string | null {
		const result = /([0-9]{18})/.exec(possibleId)
		return result == null ? null : result[0]
	}

	return {
		aliases: ['say'],
		async run(msg) {
			let channel: TextBasedChannel
			const channelId = getChannelId(msg.command.args[0])

			if (channelId) {
				msg.command.args.shift()
				const channelSearched = await msg.guild?.channels.fetch(channelId)

				if (!channelSearched) return msg.reply('Canal não encontrado')

				if (!channelSearched.isText()) return msg.reply('Canal invalido')

				channel = channelSearched

				// msg.react('✅')

				msg.reply(` Mensagem enviada no canal ${Formatters.channelMention(channel.id)}`)
			} else {
				channel = msg.channel
			}
			const msgToSay = msg.command.args.join(' ').trim()

			if (!msgToSay) return msg.reply('A mensagem não pode ser vazia')

			channel.send(msgToSay)
		},
	}
}

export default Command
