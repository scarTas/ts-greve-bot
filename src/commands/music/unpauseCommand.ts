import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";
import { deferUpdateErrorHandler, deferUpdateResponseTransformer } from "../../events/onInteractionCreate";

const unpauseCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Unpauses the playing song.",
    aliases: ["unpause", "ups"], usage: "`ham unpause`\n`ham ups`",
    
    command: async ({ i }) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.unpause();
        })
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
export default unpauseCommandMetadata;