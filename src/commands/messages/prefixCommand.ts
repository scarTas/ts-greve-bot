import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { getUserPrefix, updateUserPrefix } from "../../services/mongoService";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";

const logger: ClassLogger = new ClassLogger("prefix");

/** Define command metadata and handler methods for text and slash commands. */
const prefixCommandMetadata: CommandMetadata<{ userId: string, prefix: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "Manage the bot text commands prefix.",
    aliases: ["prefix"], usage: "`ham prefix`  // display current prefix\
    \n`ham prefix pls`  // change current prefix to `pls`",
    
    // Actual core command with business logic implementation
    command: ({ userId, prefix }, callback) => {
        // If there are no arguments, don't call the callback and return
        if(!prefix?.length) {
            getUserPrefix(userId)
                .then(p => callback({ content: `Current prefix is \`${p ?? process.env.PREFIX}\`.` }))
                .catch( e => logger.error(e) );
        } else {
            updateUserPrefix(userId, prefix)
                .then(() => callback({ content: `Prefix set to \`${prefix}\`.` }))
                .catch( e => logger.error(e) );
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) =>
        command({ userId: msg.author.id, prefix: args[0] }, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}
export default prefixCommandMetadata;