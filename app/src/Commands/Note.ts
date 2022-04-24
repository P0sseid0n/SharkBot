import { CommandFn } from '@/Types'
import { MessageActionRow, MessageButton, MessageEmbed, TextBasedChannel } from 'discord.js'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const Command: CommandFn = client => {
	async function getMessageById(id: string, channel: TextBasedChannel) {
		if (!/[0-9]{18}/.test(id)) return false

		try {
			const message = await channel.messages.fetch(id)
			return message
		} catch {
			return false
		}
	}

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

				prisma.note
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
				const noteDb = await prisma.note.findFirst({
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

			/*

			if (msg.command.args.length == 0) return console.log('Args vazio')
			// msg.reply(msg.url)

			// TODO: Verificar se o msg.command.args[0] é um link para uma mensagem
			const messageNote = await getMessageById(msg.command.args[0], msg.channel)

			if (messageNote) msg.command.args.shift()

			const title = msg.command.args.join(' ')
			if (!title) return console.log('Titulo vazio')

			if (messageNote) {
				const noteDb = await prisma.note.upsert({
					where: {
						title,
					},
					update: {
						title,
					},
					create: {
						title,
						url: messageNote.url,
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

				const embed = new MessageEmbed().setTitle('Nota salva').setDescription(`
               \`Titulo\`: ${noteDb.title},
            `)

				msg.reply({ embeds: [embed] })
			} else {
				const noteDb = await prisma.note.findFirst({
					where: {
						title: {
							contains: title,
						},
					},
				})

				if (!noteDb) return await msg.reply('Nota não encontrada')

				const row = new MessageActionRow().addComponents(
					new MessageButton().setLabel('Ir até a nota').setStyle('LINK').setURL(noteDb.url)
				)

				const embed = new MessageEmbed().setDescription(`
               **Id: \`${noteDb.id}\`**
               **Titulo: \`${noteDb.title}\`**
            `)

				msg.reply({ embeds: [embed], components: [row] })
			}
         */
		},
	}
}

export default Command

/*
 1. Ver se o usuario está respondendo a uma mensagem
 2. Ver
*/
