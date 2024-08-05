import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";
import { Message } from "discord.js";
import { MusicPlayer } from "../../services/music/musicPlayer";

const logger: ClassLogger = new ClassLogger("back");

/** Define command metadata and handler methods for text and slash commands. */
const backCommandMetadata: CommandMetadata<{ msg: Message }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Plays the previous song in the queue.",
    aliases: ["back", "b"], usage: "TODO",
    
    // Actual core command with business logic implementation
    command: async ({ msg }, callback) => {
        MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.back();
        });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command({ msg }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default backCommandMetadata;