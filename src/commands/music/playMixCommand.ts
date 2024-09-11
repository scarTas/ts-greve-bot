import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";
import { Message } from "discord.js";
import { MusicPlayer } from "../../services/music/musicPlayer";
import { YoutubeMixSong, YoutubeSong } from "../../services/music/youtubeService";

/** Define command metadata and handler methods for text and slash commands. */
const playMixCommandMetadata: CommandMetadata<{ msg: Message, uri: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Plays a mix of a youtube video song in your \
    voice channel.",
    aliases: ["playmix", "pm"], usage: "TODO",

    // Actual core command with business logic implementation
    command: async ({ msg, uri }, callback) => {

        // Check if the Youtube Video is valid
        const videoId = YoutubeSong.getVideoId(uri);

        if(videoId) {
            const song: YoutubeMixSong = await YoutubeMixSong.getYoutubeMixIds(videoId);
            song.requestor = msg.member?.id;

            // If the mix is valid, add to MusicPlayer queue and play
            MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
                await musicPlayer.add(song);
            });
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        if (!args.length) return;

        command({ msg, uri: args[0] }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default playMixCommandMetadata;