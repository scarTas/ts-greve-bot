import { ephemeralReplyErrorHandler, ephemeralReplyResponseTransformer } from "../../events/onInteractionCreate";
import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const inviteCommandMetadata: CommandMetadata<null, { content: string }> = {
    hidden: true, category: "Information", description: "Sends the invite link of the bot.",
    aliases: ["invite", "inv"], usage: "`ham invite`",

    command: () => {
        return { content: "Inviation link: sdad" };
    },

    onMessage: {
        requestTransformer: (_msg, _content, _args) => null,
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    },

    onSlash: {
        requestTransformer: (_interaction) => null,
        responseTransformer: ephemeralReplyResponseTransformer,
        errorHandler: ephemeralReplyErrorHandler
    }
}
export default inviteCommandMetadata;