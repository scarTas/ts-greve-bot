import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";
import { Message } from "discord.js";
import { ISong } from "../../data/model/userModel";
import { MusicPlayer, getSong } from "../../services/music/musicPlayer";
import { ASong, SongType } from "../../services/music/song";

const logger: ClassLogger = new ClassLogger("skip");

/** Dumb regex that checks if the string is an URL (not if it's a valid one). */
const uriRegex: RegExp = /https?:\/\/.*/;

/** Define command metadata and handler methods for text and slash commands. */
export const skipCommandMetadata: CommandMetadata<{ msg: Message }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "skips the current song in the queue, \
    playing the next one (if any).",
    aliases: ["skip", "s"], usage: "TODO",
    
    // Actual core command with business logic implementation
    command: async ({ msg }, callback) => {
        MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            musicPlayer.skip();
        });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, _args, command) => {
        command({ msg }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}