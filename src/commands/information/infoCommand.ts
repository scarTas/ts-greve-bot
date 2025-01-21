import { EmbedBuilder } from "discord.js";
import { CommandMetadata } from "../types";
import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import HaramLeotta from "../..";
import { ephemeralReplyErrorHandler, ephemeralReplyResponseTransformer } from "../../events/onInteractionCreate";

const infoCommandMetadata: CommandMetadata<null, { embeds: EmbedBuilder[] }> = {
    category: "Information", description: "Lets the bot speak a bit about himself",
    aliases: ["info"], usage: "`ham info`",
    
    command: () => {
        const bot = HaramLeotta.get();
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(bot.embedColor)
            .setTitle("GreveZi Bot")
            .setThumbnail(bot.user?.avatarURL() as string | null)
            .addFields(
                { name: "First name",   value: "Greve",             inline: true },
                { name: "Surname",      value: "Zi",            inline: true },
                { name: "Birthday",     value: `<t:1608163200:D>`,  inline: true },
                { name: "Version",      value: bot.version,         inline: true }
            );
    
        return { embeds: [ embed ] };
    },

    onMessage: {
        requestTransformer: (_msg, _content, _args) => null,
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    },

    onSlash: {
        requestTransformer: (_interaction) => null,
        responseTransformer: ephemeralReplyResponseTransformer,
        errorHandler: ephemeralReplyErrorHandler
    }
}
export default infoCommandMetadata;