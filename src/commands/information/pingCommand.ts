import HaramLeotta from "../..";
import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const pingCommandMetadata: CommandMetadata<null, { content: string }> = {
    category: "Information", description: "WebSocket ping in milliseconds.",
    aliases: ["ping"], usage: "`ham ping`",

    command: () => {
        return { content: `Pong! (${HaramLeotta.get().ws.ping}ms)` };
    },

    onMessage: {
        requestTransformer: (_msg, _content, _args) => null,
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default pingCommandMetadata;