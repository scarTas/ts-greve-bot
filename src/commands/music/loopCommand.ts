import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { deferUpdateErrorHandler, deferUpdateResponseTransformer } from "../../events/onInteractionCreate";
import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";

const loopCommandMetadata: CommandMetadata<{ i: Message | Interaction, loopPolicy?: MusicPlayer.LoopPolicy }, void> = {
    category: "Music", description: "Changes the loop setting to \"none\", \"song\", \"all\".",
    aliases: ["loop"], usage: "TODO",
    
    command: async ({ i, loopPolicy }) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.setLoopPolicy(loopPolicy);
        })
    },

    onMessage: {
        requestTransformer: (msg, _content, args) => {
            // Parse input loop policy 
            let loopPolicy: string | MusicPlayer.LoopPolicy | undefined = args.pop();
            if(loopPolicy) {
                loopPolicy = loopPolicy.toUpperCase();
                if(loopPolicy === "NONE") loopPolicy = MusicPlayer.LoopPolicy.NONE;
                else if(loopPolicy === "SONG") loopPolicy = MusicPlayer.LoopPolicy.SONG;
                else if(loopPolicy === "ALL") loopPolicy = MusicPlayer.LoopPolicy.ALL;
                else throw new Error("Invalid loopPolicy");
            }
            
            return { i: msg, loopPolicy: loopPolicy as MusicPlayer.LoopPolicy | undefined };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    },

    onButton: {
        requestTransformer: (interaction) => {
            return { i: interaction };
        },
        responseTransformer: deferUpdateResponseTransformer,
        errorHandler: deferUpdateErrorHandler
    }

    // TODO: slash command handler
}
export default loopCommandMetadata;