import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const pregnantCommandMetadata: CommandMetadata<null, { content: string }> = {
    category: "Messages", description: "PLAP PLAP PLAP GET PREGNANT GET PREGNANT", aliases: ["pregnant"],
    usage: "`ham pregnant`",
    
    command: () => {
        return { content: "https://cdn.discordapp.com/attachments/583333931273682956/1292232041449914378/GET_ME_PREGNANT.mp4?ex=6702fc5f&is=6701aadf&hm=884a101037fb7c11b2c8a365d2a09811f6b8e202ab7c8749f0c59b3f87b84eea&" };
    },
    
    onMessage: {
        requestTransformer: (_msg, _content, _args) => null,
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default pregnantCommandMetadata;