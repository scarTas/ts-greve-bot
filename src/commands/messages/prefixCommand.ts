import UserRepository from "../../classes/user/UserRepository";
import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const regex: RegExp = /^\w{0,20}$/;

const prefixCommandMetadata: CommandMetadata<{ userId: string, prefix?: string }, { content: string }> = {
    category: "Messages", description: "Manage the bot text commands prefix.",
    aliases: ["prefix"], usage: "`ham prefix`  // display current prefix\
    \n`ham prefix pls`  // change current prefix to `pls`",
    
    command: async ({ userId, prefix }) => {
        // If there are no arguments, don't call the callback and return
        if(!prefix?.length) {
            const p: string | undefined = await UserRepository.getUserPrefix(userId)
            return { content: `Current prefix is \`${p || process.env.PREFIX}\`.` };
        }
        
        // If the rpefix is valid, save it to database
        else if(regex.test(prefix)) {
            await UserRepository.updateUserPrefix(userId, prefix)
            return { content: `Prefix set to \`${prefix}\`.` };
        }
        
        // If the provided prefix is invalid, return error message
        else {
            return { content: `Invalid prefix: you must use at most 20 alphanumeric characters.` };
        }
    },

    onMessage: {
        requestTransformer: (msg, _content, args) => {
            return { userId: msg.author.id, prefix: args.shift() };
        },
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default prefixCommandMetadata;