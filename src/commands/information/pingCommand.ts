import HaramLeotta from "../..";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";

/** Define command metadata and handler methods for text and slash commands. */
const pingCommandMetadata: CommandMetadata<null, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Information", description: "WebSocket ping in milliseconds.",
    aliases: ["ping"], usage: "`ham ping`",

    // Actual core command with business logic implementation
    command: (_input, callback) => 
        callback({ content: `Pong! (${HaramLeotta.get().ws.ping}ms)` }),

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) =>
        command(null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}
export default pingCommandMetadata;