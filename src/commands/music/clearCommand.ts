import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";
import { defaultButtonInteractionCallback } from "../../events/onInteractionCreate";

const clearCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Stops playing and disconnects the bot.",
    aliases: ["clear", "stop"], usage: "TODO",
    
    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.destroy();
        });
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
export default clearCommandMetadata;