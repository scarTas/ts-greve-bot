import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";
import { Message } from "discord.js";
import { MusicPlayer } from "../../services/music/musicPlayer";

/** Define command metadata and handler methods for text and slash commands. */
const volumeCommandMetadata: CommandMetadata<{ msg: Message, volume: number }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Changes the volume of the music.",
    aliases: ["volume", "v"], usage: "TODO",
    
    // Actual core command with business logic implementation
    command: async ({ msg, volume }, callback) => {
        MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.setVolume(volume);
        });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {

        // Retrieve index to be removed - if argument is not a number, return
        let volume: string | number | undefined = args.pop();
        if(!volume) return;
        volume = parseFloat(volume.replace(',', '.'));
        if(isNaN(volume) || volume < 0) return;
        ClassLogger.debug("New volume: "+volume);

        command({ msg, volume }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default volumeCommandMetadata;