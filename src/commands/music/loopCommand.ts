import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import { MusicPlayer } from "../../classes/music/MusicPlayer";
import { LoopPolicy } from "../../classes/music/MusicQueue";

/** Define command metadata and handler methods for text and slash commands. */
const loopCommandMetadata: CommandMetadata<{ i: Message | Interaction, loopPolicy?: LoopPolicy }, void> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Changes the loop setting to \"none\", \"song\", \"all\".",
    aliases: ["loop"], usage: "TODO",
    
    // Actual core command with business logic implementation
    command: async ({ i, loopPolicy }, callback) => {
        MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.setLoopPolicy(loopPolicy);
        })
        .then(() => callback());
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
        
        command({ i: msg, loopPolicy: loopPolicy as LoopPolicy | undefined }, () => {})
    },

    // Transformer that parses the interaction before invoking the core command,
    // and handles the message reply with the provided output.
    onButtonInteractionTransformer: (interaction, command) => {
        command({ i: interaction }, () => interaction.deferUpdate())
    }

    // TODO: slash command handler
}
export default loopCommandMetadata;