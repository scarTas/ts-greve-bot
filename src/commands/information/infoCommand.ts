import { EmbedBuilder } from "discord.js";
import { CommandMetadata } from "../../types/types";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import HaramLeotta from "../..";

/** Define command metadata and handler methods for text and slash commands. */
export const infoCommandMetadata: CommandMetadata<null, { embeds: EmbedBuilder[] }> = {
    // Command metadata for "help" command and general info about the command
    category: "Information", description: "Lets the bot speak a bit about himself",
    aliases: ["info"], usage: "`ham info`",
    
    // Actual core command with business logic implementation
    command: (_input, callback) => {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(HaramLeotta.get().embedColor)
            .setTitle("Haram Leotta informations")
            .setThumbnail(HaramLeotta.get().user?.avatarURL() as string | null)
            .addFields(
                { name: "First name",   value: "Haram",                 inline: true },
                { name: "Middle name",  value: "Ibra",                  inline: true },
                { name: "Surname",      value: "Leotta",                inline: true },
                { name: "Birthday",     value: "December 17st, 2020",   inline: true },
                { name: "Version",      value: HaramLeotta.get().version,            inline: true }
            )
            //.setFooter({text:`Created by Boquobbo#5645            Special Thanks to Depa`})
    
        callback({ embeds: [ embed ] })
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) =>
        command(null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}