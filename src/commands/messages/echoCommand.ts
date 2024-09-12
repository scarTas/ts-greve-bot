import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

/** Define command metadata and handler methods for text and slash commands. */
const echoCommandMetadata: CommandMetadata<{ content: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "Repeats some text.", aliases: ["echo"],
    usage: "`ham echo yoooooo` // Repeats `yoooooo`",
    
    // Actual core command with business logic implementation
    command: ({ content }, callback) =>
        callback({ content }),

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, content, _args, command) =>
        command({ content }, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}
export default echoCommandMetadata;