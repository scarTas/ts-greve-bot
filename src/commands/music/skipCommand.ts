import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";
import { deferUpdateErrorHandler, deferUpdateResponseTransformer } from "../../events/onInteractionCreate";

const skipCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "skips the current song in the queue, \
    playing the next one (if any).",
    aliases: ["skip", "s"], usage: "`ham skip`\n`ham s`",
    
    command: async ({ i }) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.skip();
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
export default skipCommandMetadata;