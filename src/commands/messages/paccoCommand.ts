import { ephemeralReplyErrorHandler, interactionReplyResponseTransformer } from "../../events/onInteractionCreate";
import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const paccoCommandMetadata: CommandMetadata<null, { content: string }> = {
    hidden: true, category: "Messages", description: "Pacco Amazon 😳", aliases: ["pacco"],
    usage: "`ham pacco`",
    
    command: () => {
        return { content: ":billed_cap:\n:flushed:      :selfie_tone5:\n:coat::package:\n:shorts:\n:hiking_boot:" };
    },
    
    onMessage: {
        requestTransformer: (_msg, _content, _args) => null,
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    },

    onSlash: {
        requestTransformer: (_interaction) => null,
        responseTransformer: interactionReplyResponseTransformer,
        errorHandler: ephemeralReplyErrorHandler
    }
}
export default paccoCommandMetadata;