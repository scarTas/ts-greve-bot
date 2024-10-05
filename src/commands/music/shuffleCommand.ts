import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";

const shuffleCommandMetadata: CommandMetadata<{ msg: Message }, void> = {
    category: "Music", description: "Shuffles the queue songs.",
    aliases: ["shuffle", "sh"], usage: "`ham shuffle`",
    
    command: async ({ msg }) => {
        await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.shuffle();
        });
    },

    onMessage: {
        requestTransformer: (msg, _content, _args) => {
            return { msg };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default shuffleCommandMetadata;