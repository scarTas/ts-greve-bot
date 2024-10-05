import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const echoCommandMetadata: CommandMetadata<{ content: string }, { content: string }> = {
    category: "Messages", description: "Repeats some text.", aliases: ["echo"],
    usage: "`ham echo yoooooo` // Repeats `yoooooo`",
    
    command: ({ content }) => {
        return { content };
    },

    onMessage: {
        requestTransformer: (_msg, content, _args) => {
            if(!content.length) throw new Error("No text specified");
            return { content };
        },
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default echoCommandMetadata;