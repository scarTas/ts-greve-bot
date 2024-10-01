import { CommandMetadata } from "../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import { defaultMessageErrorHandler } from "../../events/onMessageCreate";

const backCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Plays the previous song in the queue.",
    aliases: ["back", "b"], usage: "TODO",
    
    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.back();
        });
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, _args, command) => {
        await command({ i: msg }, () => {})
    },
    onMessageErrorHandler: defaultMessageErrorHandler,
    
    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, () => interaction.deferUpdate())
    }

    // TODO: slash command handler
}
export default backCommandMetadata;