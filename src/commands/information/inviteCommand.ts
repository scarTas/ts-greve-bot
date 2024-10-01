import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

const inviteCommandMetadata: CommandMetadata<null, { content: string }> = {
    category: "Information", description: "Sends the invite link of the bot.",
    aliases: ["invite", "inv"], usage: "`ham invite`",

    // Actual core command with business logic implementation
    command: (_input, callback) => {
        callback({ content: "Inviation link: https://discord.com/api/oauth2/authorize?client_id=803895490483322941&permissions=140227505729&scope=applications.commands%20bot" });
    },

    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command(null, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default inviteCommandMetadata;