import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { defaultButtonInteractionCallback } from "../../events/onInteractionCreate";
import { defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";

const pauseCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Pauses the song that is being played.",
    aliases: ["pause", "ps"], usage: "TODO",
    
    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.pause();
        })
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, _args, command) => {
        await command({ i: msg }, reactCallback(msg));
    },
    onMessageErrorHandler: defaultMessageErrorHandler,

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }

    // TODO: slash command handler
}
export default pauseCommandMetadata;