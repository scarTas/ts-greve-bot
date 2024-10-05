import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";
import { deferUpdateErrorHandler, deferUpdateResponseTransformer } from "../../events/onInteractionCreate";

const clearCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Stops playing and disconnects the bot.",
    aliases: ["clear", "stop"], usage: "`ham clear`\n`ham stop`",
    
    command: async ({ i }) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.destroy();
        });
    },

    onMessage: {
        requestTransformer: (msg, _content, _args) => {
            return { i: msg };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    },

    onButton: {
        requestTransformer: (interaction) => {
            return { i: interaction };
        },
        responseTransformer: deferUpdateResponseTransformer,
        errorHandler: deferUpdateErrorHandler
    }

    // TODO: slash command handler
}
export default clearCommandMetadata;