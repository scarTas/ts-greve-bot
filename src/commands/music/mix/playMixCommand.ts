import { defaultMessageErrorHandler, reactCallback } from "../../../events/onMessageCreate";
import { Message } from "discord.js";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import YoutubeSong from "../../../classes/music/song/youtube/YoutubeSong";
import { CommandMetadata } from "../../types";
import YoutubeMixSong from "../../../classes/music/song/youtube/YoutubeMixSong";

const playMixCommandMetadata: CommandMetadata<{ msg: Message, uri: string }, void> = {
    category: "Music", description: "Plays a mix of a youtube video song in your \
    voice channel.",
    aliases: ["playmix", "pm"], usage: "TODO",

    command: async ({ msg, uri }, callback) => {

        // Check if the Youtube Video is valid
        const videoId = YoutubeSong.getVideoId(uri);

        if(!videoId)
            throw new Error("Invalid uri");

        const song: YoutubeMixSong = await YoutubeMixSong.fromId(videoId);
        song.requestor = msg.member?.id;

        // If the mix is valid, add to MusicPlayer queue and play
        await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
            await musicPlayer.add(song);
        });
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {
        if (!args.length)
            throw new Error("No song specified");

        await command({ msg, uri: args[0] }, reactCallback(msg));
    },
    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default playMixCommandMetadata;