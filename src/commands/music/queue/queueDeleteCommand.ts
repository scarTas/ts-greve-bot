import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const queueDeleteCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Deletes the displayed queue message",
    aliases: ["queue-delete"],
    
    hidden: true,

    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.queueMessage?.delete();
        })
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default queueDeleteCommandMetadata;