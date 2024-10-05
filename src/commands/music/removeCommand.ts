import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";

const removeCommandMetadata: CommandMetadata<{ msg: Message, index: number }, void> = {
    category: "Music", description: "Plays the previous song in the queue.",
    aliases: ["remove", "rm"], usage: "`ham remove 2` // Removes the second song from the queue",
    
    command: async ({ msg, index }) => {
        await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.remove(index);
        });
    },

    onMessage: {
        requestTransformer: (msg, _content, args) => {
            // Retrieve index to be removed - if argument is not a number, return
            let index: string | number | undefined = args.pop();
            if(!index) throw new Error("No index provided");
            index = parseInt(index);
            if(isNaN(index) || index < 1) throw new Error("Invalid index");
            
            return { msg, index: --index };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default removeCommandMetadata;