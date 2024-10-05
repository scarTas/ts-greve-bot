import { msgReactErrorHandler, msgReactResponseTransformer } from "../../../events/onMessageCreate";
import { Message } from "discord.js";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import YoutubeSong from "../../../classes/music/song/youtube/YoutubeSong";
import { CommandMetadata } from "../../types";
import YoutubeMixSong from "../../../classes/music/song/youtube/YoutubeMixSong";

const playMixCommandMetadata: CommandMetadata<{ msg: Message, uri: string }, void> = {
    category: "Music", description: "Plays a mix of a youtube video song in your \
    voice channel.", aliases: ["playmix", "pm"],
    usage: "`ham playmix https://www.youtube.com/watch?v=4dL1XSPC9FI` // Stars a mix starting from this Youtube video",

    command: async ({ msg, uri }) => {

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
    },

    onMessage: {
        requestTransformer: (msg, _content, args) => {
            if (!args.length) throw new Error("No song specified");
    
            return { msg, uri: args[0] };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default playMixCommandMetadata;