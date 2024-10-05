import { msgReactErrorHandler, msgReactResponseTransformer } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import { Message } from "discord.js";
import MusicPlayer from "../../classes/music/MusicPlayer";
import ASong from "../../classes/music/song/ASong";
import QueryMessage from "../../classes/music/message/queryMessage";

/** Dumb regex that checks if the string is an URL (not if it's a valid one). */
const uriRegex: RegExp = /https?:\/\/.*/;

const playCommandMetadata: CommandMetadata<{ msg: Message, uri?: string, query?: string }, void> = {
    category: "Music", description: "Plays a song in your voice channel, loading \
    the url (if supported) or searching on YouTube.\nCurrently, the supported \
    websites are Youtbe and Spotify (also, direct resources URLs such as MP3); \
    SoundCloud support is coming soon.",
    aliases: ["play", "p"], usage: "TODO",

    command: async ({ msg, uri, query }) => {

        // If user wants to play from URL, check for the website format first
        let songs: ASong[] | undefined = undefined;

        // Determine url type and retrieve song - if url is invalid, throw error
        if (uri) {
            songs = await MusicPlayer.getSong(uri);

            songs.forEach(s => s.requestor = msg.member?.id)

            // If the url is valid, add to MusicPlayer queue and play
            await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
                await musicPlayer.add(...songs!);
            });
        }

        // If input is a query, start youtube search
        //! If another queryMessage was present, it is removed
        else if(query) {
            await QueryMessage.get(msg, async (queryMessage) => {
                await queryMessage.updateContent();
                await queryMessage.send();
            }, query);
        }
    },

    onMessage: {
        requestTransformer: (msg, _content, args) => {
            if (!args.length)
                throw new Error("No song specified");
    
            // Check if the user typed a URL or a simple text query
            let uri = undefined, query = undefined;
            if (uriRegex.test(args[0])) uri = args[0];
            else query = args.join(" ");
    
            return { msg, uri, query };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default playCommandMetadata;