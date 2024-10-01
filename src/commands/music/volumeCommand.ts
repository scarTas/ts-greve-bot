import { defaultMessageCallback, defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import Logger from "../../classes/logging/Logger";

const volumeCommandMetadata: CommandMetadata<{ msg: Message, volume: number }, void> = {
    category: "Music", description: "Changes the volume of the music.",
    aliases: ["volume", "v"], usage: "TODO",
    
    command: async ({ msg, volume }, callback) => {
        await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.setVolume(volume);
        });
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {

        // Retrieve index to be removed - if argument is not a number, return
        let volume: string | number | undefined = args.shift();
        if(!volume)
            throw new Error("No volume specified");

        volume = parseFloat(volume.replace(',', '.'));
        if(isNaN(volume) || volume < 0)
            throw new Error("Invalid volume specified");

        Logger.debug("New volume: "+volume);

        await command({ msg, volume }, reactCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default volumeCommandMetadata;