import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/coreCommand";

/** Define command metadata and handler methods for text and slash commands. */
export const pingCommandMetadata: CommandMetadata<null, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Information", description: "WebSocket ping in milliseconds.",
    aliases: ["ping"], usage: "`ham ping`",

    // Actual core command with business logic implementation
    command: (self, _input, callback) => 
        callback({ content: `Pong! (${self.ws.ping}ms)` }),

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (self, msg, _content, _args, command) =>
        command(self, null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}