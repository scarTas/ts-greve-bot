import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { deferUpdateErrorHandler, deferUpdateResponseTransformer, ephemeralReplyErrorHandler, noReplyResponseTransformer } from "../../events/onInteractionCreate";
import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";

const pauseCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Pauses the song that is being played.",
    aliases: ["pause", "ps"], usage: "`ham pause`\n`ham ps`",
    
    command: async ({ i }) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.pause();
        })
    },

    onMessage: {
        requestTransformer: (msg, _content, _args) => {
            return { i: msg };
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
    },

    onSlash: {
        requestTransformer: (interaction) => {
            return { i: interaction };
        },
        responseTransformer: noReplyResponseTransformer,
        errorHandler: ephemeralReplyErrorHandler
    }
}
export default pauseCommandMetadata;