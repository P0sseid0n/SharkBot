import { CommandFn } from '@/Types'
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'

import db from '@/Database'

const Command: CommandFn = client => {
	function getMessageId(msg: string) {
		const regex = /[0-9]{18}/
		const match = msg.match(regex)

		if (!match) return false

		return match[0]
	}

	return {
		aliases: [],
		async run(msg) {
			if (msg.reference || getMessageId(msg.content)) {
				const newNote = {
					channelId: msg.reference?.channelId || msg.channel.id,
					guildId: msg.reference?.guildId || msg.guildId!,
					messageId: msg.reference?.messageId || (getMessageId(msg.content) as string),
					title: msg.command.args.filter(arg => !getMessageId(arg)).join(' '),
				}

				db.note
					.upsert({
						where: {
							title_userId: {
								title: newNote.title,
								userId: msg.author.id,
							},
						},
						update: {
							title: newNote.title,
						},
						create: {
							title: newNote.title,
							msgId: newNote.messageId,
							channelId: newNote.channelId,
							user: {
								connectOrCreate: {
									where: {
										id: msg.author.id,
									},
									create: {
										id: msg.author.id,
									},
								},
							},
						},
					})
					.then(noteDb => {
						const embed = new MessageEmbed()
							.addField('ID', '``' + noteDb.id + '``')
							.addField('Titulo', '``' + noteDb.title + '``')

						msg.reply({ content: '**Nota salva**', embeds: [embed] })
					})
					.catch(err => {
						console.error(err)
						msg.reply('Ocorreu um erro ao salvar nota. Tente novamente.')
					})
			} else {
				const noteDb = await db.note.findFirst({
					where: {
						userId: msg.author.id,
						title: {
							contains: msg.command.args.join(' '),
						},
					},
				})

				if (!noteDb) return await msg.reply('Nota não encontrada')

				console.log(noteDb)

				const row = new MessageActionRow().addComponents(
					new MessageButton()
						.setLabel('Ir até a nota')
						.setStyle('LINK')
						.setURL(`https://discord.com/channels/${msg.guildId}/${noteDb.channelId}/${noteDb.msgId}`)
				)

				const embed = new MessageEmbed()
					.addField('ID', '``' + noteDb.id + '``')
					.addField('Titulo', '``' + noteDb.title + '``')

				msg.reply({ content: '**Nota encontrada**', embeds: [embed], components: [row] })
			}
		},
	}
}

export default Command
