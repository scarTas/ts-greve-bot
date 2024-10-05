import { msgReactErrorHandler, msgReactResponseTransformer, msgReplyResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import Logger from "../../classes/logging/Logger";

const volumeCommandMetadata: CommandMetadata<{ msg: Message, volume: number }, void> = {
    category: "Music", description: "Changes the volume of the music.",
    aliases: ["volume", "v"], usage: "`ham volume 0.5` // Lower the songs volume\n\
    `ham volume 10000` // Destroys your ears",
    
    command: async ({ msg, volume }) => {
        await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.setVolume(volume);
        });
    },

    onMessage: {
        requestTransformer: (msg, _content, args) => {

            // Retrieve index to be removed - if argument is not a number, return
            let volume: string | number | undefined = args.shift();
            if(!volume)
                throw new Error("No volume specified");
    
            volume = parseFloat(volume.replace(',', '.'));
            if(isNaN(volume) || volume < 0)
                throw new Error("Invalid volume specified");
    
            Logger.debug("New volume: "+volume);
    
            return { msg, volume };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default volumeCommandMetadata;