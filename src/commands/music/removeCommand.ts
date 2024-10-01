import { defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";

const removeCommandMetadata: CommandMetadata<{ msg: Message, index: number }, void> = {
    category: "Music", description: "Plays the previous song in the queue.",
    aliases: ["remove", "rm"], usage: "TODO",
    
    command: async ({ msg, index }, callback) => {
        await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.remove(index);
        });
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {
        // Retrieve index to be removed - if argument is not a number, return
        let index: string | number | undefined = args.pop();
        if(!index) return;
        index = parseInt(index);
        if(isNaN(index) || index < 1) return;
        
        await command({ msg, index: --index }, reactCallback(msg))
    },
    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default removeCommandMetadata;