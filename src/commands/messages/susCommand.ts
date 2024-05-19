import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";

/** Collections of "sus" links that can be sent when the command is invoked. */
const links: string[] = [
    "https://cdn.discordapp.com/attachments/280489952385695755/788913780934443028/video0.mov",
    "https://cdn.discordapp.com/attachments/620576156613345310/816641727204950046/video0.mp4",
    "https://cdn.discordapp.com/attachments/722780815087501363/787763691658805258/p.mp4"
];

/** Define command metadata and handler methods for text and slash commands. */
export const susCommandMetadata: CommandMetadata<null, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "SUS!! SUSSY BAKA!!!!", aliases: ["sus"],
    usage: "`ham sus`",

    // Actual core command with business logic implementation
    command: (_input, callback) => {
        // Generate number between 0 (inclusive) and link pool length (exclusive)
        const rand: number = Math.floor(Math.random() * links.length);
    
        // Retrieve link from random index and invoke callback
        callback( { content: links[ rand ] });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) =>
        command(null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}