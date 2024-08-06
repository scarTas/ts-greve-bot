import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";
import { Message } from "discord.js";
import { MusicPlayer } from "../../services/music/musicPlayer";
import { LoopPolicy } from "../../services/music/musicQueue";

/** Define command metadata and handler methods for text and slash commands. */
const loopCommandMetadata: CommandMetadata<{ msg: Message, loopPolicy?: LoopPolicy }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Changes the loop setting to \"none\", \"song\", \"all\".",
    aliases: ["loop"], usage: "TODO",
    
    // Actual core command with business logic implementation
    command: async ({ msg, loopPolicy }, callback) => {
        MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.setLoopPolicy(loopPolicy);
        });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {

        // Parse input loop policy 
        let loopPolicy: string | LoopPolicy | undefined = args.pop();
        if(loopPolicy) {
            loopPolicy = loopPolicy.toUpperCase();
            if(loopPolicy === "NONE") loopPolicy = LoopPolicy.NONE;
            else if(loopPolicy === "SONG") loopPolicy = LoopPolicy.SONG;
            else if(loopPolicy === "ALL") loopPolicy = LoopPolicy.ALL;
            else return;
        }
        
        command({ msg, loopPolicy: loopPolicy as LoopPolicy | undefined }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default loopCommandMetadata;