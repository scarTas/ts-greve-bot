import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";
import { Message, TextChannel } from "discord.js";
import { MusicPlayer, getSong } from "../../services/music/musicPlayer";
import { ASong } from "../../services/music/song";
import { YoutubeSong } from "../../services/music/youtubeService";
import { QueryMessage } from "../../services/music/message/queryMessage";
import { getYoutubeInitData } from "../../services/music/youtubeServiceLegacy";

/** Dumb regex that checks if the string is an URL (not if it's a valid one). */
const uriRegex: RegExp = /https?:\/\/.*/;

/** Define command metadata and handler methods for text and slash commands. */
const playCommandMetadata: CommandMetadata<{ msg: Message, uri?: string, query?: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Plays a song in your voice channel, loading \
    the url (if supported) or searching on YouTube.\nCurrently, the supported \
    websites are Youtbe and Spotify (also, direct resources URLs such as MP3); \
    SoundCloud support is coming soon.",
    aliases: ["play", "p"], usage: "TODO",

    // Actual core command with business logic implementation
    command: async ({ msg, uri, query }, callback) => {

        // If user wants to play from URL, check for the website format first
        let songs: ASong[] | undefined = undefined;

        // Determine url type and retrieve song - if url is invalid, throw error
        if (uri) {
            songs = await getSong(uri);
            // TODO: define error message
            if (songs === undefined) return;

            songs.forEach(s => s.requestor = msg.member?.id)

            // If the url is valid, add to MusicPlayer queue and play
            MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
                await musicPlayer.add(...songs!);
            });
        }

        // If input is a query, start youtube search
        //! If another queryMessage was present, it is removed
        else if(query) {
            QueryMessage.get(msg, queryMessage => {
                queryMessage
                    .updateContent()
                    .then(m => m?.send());
            }, query);
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        if (!args.length) return;

        // Check if the user typed a URL or a simple text query
        let uri = undefined, query = undefined;
        if (uriRegex.test(args[0])) uri = args[0];
        else query = args.join(" ");

        command({ msg, uri, query }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default playCommandMetadata;