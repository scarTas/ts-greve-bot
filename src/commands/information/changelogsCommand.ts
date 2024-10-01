import { EmbedBuilder } from "discord.js";
import { CommandMetadata } from "../types";
import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import HaramLeotta from "../..";

const changelogsCommandMetadata: CommandMetadata<null, { embeds: EmbedBuilder[] }> = {
    category: "Information", description: "News and notes about the bot code and functionalities.",
    aliases: ["changelogs", "changelog", "changes"], usage: "`ham changes`",
    
    command: (_input, callback) => {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(HaramLeotta.get().embedColor)
            .setTitle(`Haram Leotta v${HaramLeotta.get().version} changelog: `)
            .addFields({ name: "v5 is here!", value:"Complete code refactor (again)" })
            .setFooter({text: "For any suggestion or bug report feel free to DM me - Boquobbo#5645"})
    
        callback({ embeds: [ embed ] });
    },

    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command(null, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default changelogsCommandMetadata;