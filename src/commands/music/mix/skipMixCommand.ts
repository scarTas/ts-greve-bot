import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import { CommandMetadata } from "../../types";
import { defaultMessageErrorHandler, reactCallback } from "../../../events/onMessageCreate";

const skipMixCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "skips the current song or mix in the queue, \
    playing the next song (if any).",
    aliases: ["skipmix", "sm"], usage: "TODO",
    
    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.skip(true);
        });
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, _args, command) => {
        await command({ i: msg }, reactCallback(msg));
    },
    onMessageErrorHandler: defaultMessageErrorHandler,


    // TODO: slash command handler
}
export default skipMixCommandMetadata;