import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

/** Coinflip possible outcomes - always 2 */
const emojis: string[] = [":head_bandage:", ":cross:"];

const coinflipCommandMetadata: CommandMetadata<null, { content: string }> = {
    category: "Messages", description: "Lets the bot decide for you.",
    aliases: ["coinflip", "coin"], usage: "`ham coinflip`",
    
    command: (_input, callback) => {
        // Generate number between 0 (inclusive) and 2 (exclusive)
        const rand: number = Math.floor(Math.random() * 2);

        // Retrieve outcome from random index and invoke callback
        callback({ content: emojis[rand] })
    },

    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command(null, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default coinflipCommandMetadata;