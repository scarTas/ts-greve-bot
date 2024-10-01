import Logger from "../../classes/logging/Logger";
import UserRepository from "../../classes/user/UserRepository";
import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const regex: RegExp = /^\w{0,20}$/g;

/** Define command metadata and handler methods for text and slash commands. */
const prefixCommandMetadata: CommandMetadata<{ userId: string, prefix?: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "Manage the bot text commands prefix.",
    aliases: ["prefix"], usage: "`ham prefix`  // display current prefix\
    \n`ham prefix pls`  // change current prefix to `pls`",
    
    // Actual core command with business logic implementation
    command: async ({ userId, prefix }, callback) => {
        // If there are no arguments, don't call the callback and return
        if(!prefix?.length) {
            const p: string | undefined = await UserRepository.getUserPrefix(userId)
            callback({ content: `Current prefix is \`${p || process.env.PREFIX}\`.` });
        }
        
        // If the rpefix is valid, save it to database
        else if(regex.test(prefix)) {
            await UserRepository.updateUserPrefix(userId, prefix)
            callback({ content: `Prefix set to \`${prefix}\`.` });
        }
        
        // If the provided prefix is invalid, return error message
        else {
            callback({ content: `Invalid prefix: you must use at most 20 alphanumeric characters.` });
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: async (msg, _content, args, command) => {
        await command({ userId: msg.author.id, prefix: args.shift() }, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default prefixCommandMetadata;