import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";
import { defaultMessageErrorHandler, reactCallback } from "../../../events/onMessageCreate";

const queueCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Shows the playlist currently playing",
    aliases: ["queue", "q"], usage: "TODO",
    
    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.queueMessage?.first(musicPlayer)?.resend();
        });
        //callback();
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
export default queueCommandMetadata;