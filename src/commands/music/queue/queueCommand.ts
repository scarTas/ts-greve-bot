import { CommandMetadata } from "../../../types/types";
import { Interaction, Message } from "discord.js";
import { MusicPlayer } from "../../../services/music/musicPlayer";

/** Define command metadata and handler methods for text and slash commands. */
const queueCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Shows the playlist currently playing",
    aliases: ["queue", "q"], usage: "TODO",
    
    // Actual core command with business logic implementation
    command: async ({ i }, callback) => {
        MusicPlayer.get(i, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.queueMessage?.first(musicPlayer)?.resend();
        })
        .then(() => callback());
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command({ i: msg }, () => {})
    },

    // Transformer that parses the interaction before invoking the core command,
    // and handles the message reply with the provided output.
    onButtonInteractionTransformer: (interaction, command) => {
        command({ i: interaction }, () => interaction.deferUpdate())
    }

    // TODO: slash command handler
}
export default queueCommandMetadata;