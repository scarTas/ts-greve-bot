import { defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";

const shuffleCommandMetadata: CommandMetadata<{ msg: Message }, void> = {
    category: "Music", description: "Shuffles the queue songs.",
    aliases: ["shuffle", "sh"], usage: "TODO",
    
    command: async ({ msg }, callback) => {
        await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.shuffle();
        });
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, _args, command) => {
        await command({ msg }, reactCallback(msg))
    },
    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default shuffleCommandMetadata;