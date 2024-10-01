import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const queueNextCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "When the queue message is displayed, go to the next page",
    aliases: ["queue-next"],
    
    hidden: true,

    command: async ({ i }, callback) => {
        await MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.queueMessage?.next(musicPlayer)?.update();
        });
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default queueNextCommandMetadata;