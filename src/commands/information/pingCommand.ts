import HaramLeotta from "../..";
import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const pingCommandMetadata: CommandMetadata<null, { content: string }> = {
    category: "Information", description: "WebSocket ping in milliseconds.",
    aliases: ["ping"], usage: "`ham ping`",

    command: (_input, callback) => {
        callback({ content: `Pong! (${HaramLeotta.get().ws.ping}ms)` });
    },

    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command(null, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default pingCommandMetadata;