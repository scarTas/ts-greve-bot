import Logger from "../../classes/logging/Logger";
import UserRepository from "../../classes/user/UserRepository";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const regex: RegExp = /^\w{0,20}$/g;

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
            UserRepository.getUserPrefix(userId)
                .then(p => callback({ content: `Current prefix is \`${p ?? process.env.PREFIX}\`.` }))
                .catch( e => Logger.error("Error retrieving user prefix", e) );
        }
        
        // If the rpefix is valid, save it to database
        else if(regex.test(prefix)) {
            UserRepository.updateUserPrefix(userId, prefix)
                .then(() => callback({ content: `Prefix set to \`${prefix}\`.` }))
                .catch( e => Logger.error("Error updating user prefix", e) );
        }
        
        // If the provided prefix is invalid, return error message
        else {
            callback({ content: `Invalid prefix: you must use at most 20 alphanumeric characters.` });
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) =>
        command({ userId: msg.author.id, prefix: args[0] }, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}
export default prefixCommandMetadata;