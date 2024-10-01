import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const echoCommandMetadata: CommandMetadata<{ content: string }, { content: string }> = {
    category: "Messages", description: "Repeats some text.", aliases: ["echo"],
    usage: "`ham echo yoooooo` // Repeats `yoooooo`",
    
    command: ({ content }, callback) => {
        callback({ content })
    },

    onMessageCreateTransformer: (msg, content, _args, command) => {
        if(!content.length)
            throw new Error("No text specified");

        command({ content }, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default echoCommandMetadata;