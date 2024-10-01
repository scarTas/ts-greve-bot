import { EmbedBuilder } from "discord.js";
import { CommandMetadata } from "../types";
import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import HaramLeotta from "../..";

const infoCommandMetadata: CommandMetadata<null, { embeds: EmbedBuilder[] }> = {
    category: "Information", description: "Lets the bot speak a bit about himself",
    aliases: ["info"], usage: "`ham info`",
    
    command: (_input, callback) => {
        const bot = HaramLeotta.get();
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(bot.embedColor)
            .setTitle("Haram Leotta informations")
            .setThumbnail(bot.user?.avatarURL() as string | null)
            .addFields(
                { name: "First name",   value: "Haram",             inline: true },
                { name: "Middle name",  value: "Ibra",              inline: true },
                { name: "Surname",      value: "Leotta",            inline: true },
                { name: "Birthday",     value: `<t:1608163200:D>`,  inline: true },
                { name: "Version",      value: bot.version,         inline: true }
            );
    
        callback({ embeds: [ embed ] })
    },

    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command(null, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default infoCommandMetadata;