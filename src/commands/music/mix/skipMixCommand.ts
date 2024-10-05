import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import { CommandMetadata } from "../../types";
import { msgReactErrorHandler, msgReactResponseTransformer } from "../../../events/onMessageCreate";

const skipMixCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "skips the current song or mix in the queue, \
    playing the next song (if any).",
    aliases: ["skipmix", "sm"], usage: "TODO",
    
    command: async ({ i }) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.skip(true);
        });
    },

    onMessage: {
        requestTransformer: (msg, _content, _args) => {
            return { i: msg };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default skipMixCommandMetadata;