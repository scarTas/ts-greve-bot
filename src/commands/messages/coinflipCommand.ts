import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";

/** Coinflip possible outcomes - always 2 */
const emojis: string[] = [":head_bandage:", ":cross:"];

/** Define command metadata and handler methods for text and slash commands. */
export const coinflipCommandMetadata: CommandMetadata<null, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "Lets the bot decide for you.",
    aliases: ["coinflip", "coin"], usage: "`ham coinflip`",
    
    // Actual core command with business logic implementation
    command: (_input, callback) => {
        // Generate number between 0 (inclusive) and 2 (exclusive)
        const rand: number = Math.floor(Math.random() * 2);

        // Retrieve outcome from random index and invoke callback
        callback({ content: emojis[rand] })
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) =>
        command(null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}