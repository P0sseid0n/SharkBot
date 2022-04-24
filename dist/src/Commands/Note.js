"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Database_1 = __importDefault(require("@/Database"));
const Command = client => {
    function getMessageId(msg) {
        const regex = /[0-9]{18}/;
        const match = msg.match(regex);
        if (!match)
            return false;
        return match[0];
    }
    return {
        aliases: [],
        async run(msg) {
            if (msg.reference || getMessageId(msg.content)) {
                const newNote = {
                    channelId: msg.reference?.channelId || msg.channel.id,
                    guildId: msg.reference?.guildId || msg.guildId,
                    messageId: msg.reference?.messageId || getMessageId(msg.content),
                    title: msg.command.args.filter(arg => !getMessageId(arg)).join(' '),
                };
                Database_1.default.note
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
                    const embed = new discord_js_1.MessageEmbed()
                        .addField('ID', '``' + noteDb.id + '``')
                        .addField('Titulo', '``' + noteDb.title + '``');
                    msg.reply({ content: '**Nota salva**', embeds: [embed] });
                })
                    .catch(err => {
                    console.error(err);
                    msg.reply('Ocorreu um erro ao salvar nota. Tente novamente.');
                });
            }
            else {
                const noteDb = await Database_1.default.note.findFirst({
                    where: {
                        userId: msg.author.id,
                        title: {
                            contains: msg.command.args.join(' '),
                        },
                    },
                });
                if (!noteDb)
                    return await msg.reply('Nota não encontrada');
                console.log(noteDb);
                const row = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
                    .setLabel('Ir até a nota')
                    .setStyle('LINK')
                    .setURL(`https://discord.com/channels/${msg.guildId}/${noteDb.channelId}/${noteDb.msgId}`));
                const embed = new discord_js_1.MessageEmbed()
                    .addField('ID', '``' + noteDb.id + '``')
                    .addField('Titulo', '``' + noteDb.title + '``');
                msg.reply({ content: '**Nota encontrada**', embeds: [embed], components: [row] });
            }
        },
    };
};
exports.default = Command;
