import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { defaultButtonInteractionCallback } from "../../events/onInteractionCreate";
import { defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";

const loopCommandMetadata: CommandMetadata<{ i: Message | Interaction, loopPolicy?: MusicPlayer.LoopPolicy }, void> = {
    category: "Music", description: "Changes the loop setting to \"none\", \"song\", \"all\".",
    aliases: ["loop"], usage: "TODO",
    
    command: async ({ i, loopPolicy }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.setLoopPolicy(loopPolicy);
        })
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {
        // Parse input loop policy 
        let loopPolicy: string | MusicPlayer.LoopPolicy | undefined = args.pop();
        if(loopPolicy) {
            loopPolicy = loopPolicy.toUpperCase();
            if(loopPolicy === "NONE") loopPolicy = MusicPlayer.LoopPolicy.NONE;
            else if(loopPolicy === "SONG") loopPolicy = MusicPlayer.LoopPolicy.SONG;
            else if(loopPolicy === "ALL") loopPolicy = MusicPlayer.LoopPolicy.ALL;
            else throw new Error("Invalid loopPolicy");
        }
        
        await command({ i: msg, loopPolicy: loopPolicy as MusicPlayer.LoopPolicy | undefined }, reactCallback(msg));
    },
    onMessageErrorHandler: defaultMessageErrorHandler,

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }

    // TODO: slash command handler
}
export default loopCommandMetadata;