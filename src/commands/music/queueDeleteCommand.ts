import { CommandMetadata } from "../../types/types";
import { Interaction, Message } from "discord.js";
import { MusicPlayer } from "../../services/music/musicPlayer";

/** Define command metadata and handler methods for text and slash commands. */
const queueDeleteCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Deletes the displayed queue message",
    aliases: ["queue-delete"],
    
    // Actual core command with business logic implementation
    command: async ({ i }, callback) => {
        MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.queueMessage?.delete();
        })
        .then(() => callback());
    },

    // Transformer that parses the interaction before invoking the core command,
    // and handles the message reply with the provided output.
    onButtonInteractionTransformer: (interaction, command) => {
        command({ i: interaction }, () => interaction.deferUpdate())
    }

    // TODO: slash command handler
}
export default queueDeleteCommandMetadata;