import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const paccoCommandMetadata: CommandMetadata<null, { content: string }> = {
    category: "Messages", description: "Pacco Amazon 😳", aliases: ["pacco"],
    usage: "`ham pacco`",
    
    command: (_input, callback) => {
        callback({ content: ":billed_cap:\n:flushed:      :selfie_tone5:\n:coat::package:\n:shorts:\n:hiking_boot:" });
    },
    
    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command(null, defaultMessageCallback(msg));
    },

    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default paccoCommandMetadata;