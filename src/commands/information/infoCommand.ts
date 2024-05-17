import { EmbedBuilder } from "discord.js";
import { CommandMetadata } from "../../types/coreCommand";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";

/** Define command metadata and handler methods for text and slash commands. */
export const infoCommandMetadata: CommandMetadata<null, { embeds: EmbedBuilder[] }> = {
    // Command metadata for "help" command and general info about the command
    category: "Information", description: "Lets the bot speak a bit about himself",
    aliases: ["info"], usage: "`ham info`",
    
    // Actual core command with business logic implementation
    command: (self, _input, callback) => {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(self.embedColor)
            .setTitle("Haram Leotta informations")
            .setThumbnail(self.user?.avatarURL() as string | null)
            .addFields(
                { name: "First name",   value: "Haram",                 inline: true },
                { name: "Middle name",  value: "Ibra",                  inline: true },
                { name: "Surname",      value: "Leotta",                inline: true },
                { name: "Birthday",     value: "December 17st, 2020",   inline: true },
                { name: "Version",      value: self.version,            inline: true }
            )
            //.setFooter({text:`Created by Boquobbo#5645            Special Thanks to Depa`})
    
        callback({ embeds: [ embed ] })
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (self, msg, _content, _args, command) =>
        command(self, null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}