import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { defaultMessageErrorHandler, reactCallback } from "../../events/onMessageCreate";
import { defaultButtonInteractionCallback } from "../../events/onInteractionCreate";

const skipCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "skips the current song in the queue, \
    playing the next one (if any).",
    aliases: ["skip", "s"], usage: "TODO",
    
    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.skip();
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
export default skipCommandMetadata;