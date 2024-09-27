import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";

/** Define command metadata and handler methods for text and slash commands. */
const removeCommandMetadata: CommandMetadata<{ msg: Message, index: number }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Plays the previous song in the queue.",
    aliases: ["remove", "rm"], usage: "TODO",
    
    // Actual core command with business logic implementation
    command: async ({ msg, index }, callback) => {
        MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.remove(index);
        });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        
        // Retrieve index to be removed - if argument is not a number, return
        let index: string | number | undefined = args.pop();
        if(!index) return;
        index = parseInt(index);
        if(isNaN(index) || index < 1) return;
        
        command({ msg, index: --index }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default removeCommandMetadata;