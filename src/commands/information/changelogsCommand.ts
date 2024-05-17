import { EmbedBuilder } from "discord.js";
import { CommandMetadata } from "../../types/coreCommand";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";

/** Define command metadata and handler methods for text and slash commands. */
export const changelogsCommandMetadata: CommandMetadata<null, { embeds: EmbedBuilder[] }> = {
    // Command metadata for "help" command and general info about the command
    category: "Information", description: "News and notes about the bot code and functionalities.",
    aliases: ["changelogs", "changes"], usage: "`ham changes`",
    
    // Actual core command with business logic implementation
    command: (self, _input, callback) => {
        const embed: EmbedBuilder = new EmbedBuilder()
        .setColor(self.embedColor)
        .setTitle(`Haram Leotta v${self.version} changelog: `)
        .addFields(
            { name: "v5 is here!", value:"Complete code refactor (again)" },
        )
        .setFooter({text: "For any suggestion or bug report feel free to DM me - Boquobbo#5645"})
    
        // Retrieve list of guilds the bot is in
        callback({ embeds: [ embed ] });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (self, msg, _content, _args, command) =>
        command(self, null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}