import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { getUserPrefix, updateUserPrefix } from "../../services/userService";
import { CommandMetadata } from "../../types/coreCommand";

/** Define command metadata and handler methods for text and slash commands. */
export const prefixCommandMetadata: CommandMetadata<{ userId: string, prefix: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "Manage the bot text commands prefix.",
    aliases: ["prefix"], usage: "`ham prefix`  // display current prefix\
    \n`ham prefix pls`  // change current prefix to `pls`",
    
    // Actual core command with business logic implementation
    command: (_self, { userId, prefix }, callback) => {
        // If there are no arguments, don't call the callback and return
        if(!prefix?.length) {
            getUserPrefix(userId)
                .then(p => callback({ content: `Current prefix is \`${p ?? process.env.PREFIX}\`.` }));
        } else {
            updateUserPrefix(userId, prefix)
                .then(() => callback({ content: `Prefix set to \`${prefix}\`.` }));
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (self, msg, _content, args, command) =>
        command(self, { userId: msg.author.id, prefix: args[0] }, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}