import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";

/** Define command metadata and handler methods for text and slash commands. */
const inviteCommandMetadata: CommandMetadata<null, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Information", description: "Sends the invite link of the bot.",
    aliases: ["invite", "inv"], usage: "`ham invite`",

    // Actual core command with business logic implementation
    command: (_input, callback) =>
        callback({ content: "Inviation link: https://discord.com/api/oauth2/authorize?client_id=803895490483322941&permissions=140227505729&scope=applications.commands%20bot" }),

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) =>
        command(null, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}
export default inviteCommandMetadata;