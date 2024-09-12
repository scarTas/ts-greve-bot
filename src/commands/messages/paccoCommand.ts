import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

/** Define command metadata and handler methods for text and slash commands. */
const paccoCommandMetadata: CommandMetadata<null, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "Pacco Amazon 😳", aliases: ["pacco"],
    usage: "`ham pacco`",
    
    // Actual core command with business logic implementation
    command: (_input, callback) =>
        callback({ content: ":billed_cap:\n:flushed:      :selfie_tone5:\n:coat::package:\n:shorts:\n:hiking_boot:" }),

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) =>
        command(null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}
export default paccoCommandMetadata;