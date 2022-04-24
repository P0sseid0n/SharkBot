import { CommandFn, Message } from '@/Types'
import { MessageActionRow, MessageButton } from 'discord.js'

import db from '@/Database'
import { Note } from '@prisma/client'

const Command: CommandFn = client => {
	function getMessageId(msg: string) {
		const regex = /[0-9]{18}/
		const match = msg.match(regex)

		if (!match) return false

		return match[0]
	}

	async function sendOneNote(noteDb: Note, msg: Message) {
		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setLabel('Ir até a nota')
				.setStyle('LINK')
				.setURL(`https://discord.com/channels/${msg.guildId}/${noteDb.channelId}/${noteDb.msgId}`),
			new MessageButton().setLabel('Excluir nota').setStyle('DANGER').setCustomId('deleteNote')
		)

		const reply = await msg.reply({
			content: `***Nota encontrada*** \n**ID:** \`\`${noteDb.id}\`\` \n**Titulo:** \`\`${noteDb.title}\`\` `,
			components: [row],
		})

		reply.awaitMessageComponent({ filter: c => c.id !== msg.author.id }).then(interaction => {
			if (!interaction.isButton()) return
			if (interaction.customId === 'deleteNote') {
				db.note
					.delete({
						where: {
							id: noteDb.id,
						},
					})
					.then(() => {
						reply.delete()
						msg.reply('**Nota excluída com sucesso**')
					})
					.catch(err => {
						interaction.update({ components: [] })
					})
			}
		})
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
						msg.reply('**Nota salva**')
					})
					.catch(err => {
						console.error(err)
						msg.reply('Ocorreu um erro ao salvar nota. Tente novamente.')
					})
			} else {
				let notes

				if (msg.command.args.length > 0) {
					notes = await db.note.findMany({
						where: {
							userId: msg.author.id,

							OR: [
								{
									title: {
										contains: msg.command.args.join(' '),
									},
								},
								{
									id: msg.command.args[0],
								},
							],
						},
					})
				} else {
					notes = await db.note.findMany({
						where: {
							userId: msg.author.id,
						},
					})
				}

				if (notes.length <= 0) msg.reply('Nenhuma nota encontrada')
				else if (notes.length == 1) sendOneNote(notes[0], msg as Message)
				else {
					msg.reply('Multiplas notas encontradas')
				}
			}
		},
	}
}

export default Command
