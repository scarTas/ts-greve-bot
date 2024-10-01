import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";
import { defaultButtonInteractionCallback } from "../../events/onInteractionCreate";

const unpauseCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Unpauses the playing song.",
    aliases: ["unpause", "ups"], usage: "TODO",
    
    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.unpause();
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
export default unpauseCommandMetadata;