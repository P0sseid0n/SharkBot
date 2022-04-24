"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command = client => {
    function getChannelId(possibleId) {
        const result = /([0-9]{18})/.exec(possibleId);
        return result == null ? null : result[0];
    }
    return {
        aliases: ['say'],
        async run(msg) {
            let channel;
            const channelId = getChannelId(msg.command.args[0]);
            if (channelId) {
                msg.command.args.shift();
                const channelSearched = await msg.guild?.channels.fetch(channelId);
                if (!channelSearched)
                    return msg.reply('Canal não encontrado');
                if (!channelSearched.isText())
                    return msg.reply('Canal invalido');
                channel = channelSearched;
                // msg.react('✅')
                msg.reply(` Mensagem enviada no canal ${discord_js_1.Formatters.channelMention(channel.id)}`);
            }
            else {
                channel = msg.channel;
            }
            const msgToSay = msg.command.args.join(' ').trim();
            if (!msgToSay)
                return msg.reply('A mensagem não pode ser vazia');
            channel.send(msgToSay);
        },
    };
};
exports.default = Command;
