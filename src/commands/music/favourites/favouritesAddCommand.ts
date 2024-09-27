import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import UserRepository from "../../../classes/user/UserRepository";
import ASong from "../../../classes/music/song/ASong";
import YoutubeSong from "../../../classes/music/song/youtube/YoutubeSong";
import YoutubeMixSong from "../../../classes/music/song/youtube/YoutubeMixSong";
import YoutubePlaylistSong from "../../../classes/music/song/youtube/YoutubePlaylistSong";
import SpotifySong from "../../../classes/music/song/spotify/SpotifySong";
import { getSimpleMessageCallback } from "../../../events/onMessageCreate";

/** Define command metadata and handler methods for text and slash commands. */
const favouritesAddCommandMetadata: CommandMetadata<{ i: Message | Interaction, userId: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Adds the current playing song to the favourites.",
    aliases: ["favouritesadd", "favadd", "fa"],

    // Actual core command with business logic implementation
    command: async ({ i, userId }, callback) => {
        let song: SpotifySong | YoutubeSong | YoutubeMixSong | YoutubePlaylistSong | undefined;
        await MusicPlayer.get(i, musicPlayer => {
            // Retrieve currently playing song (if any)
            song = musicPlayer.getCurrent();
        })

        if(song) {
            // If the current song is a Mix, retrieve the actual inner song
            if(song instanceof YoutubeMixSong) song = song.getCurrent();

            //! MusicPlayer queue should not contain Playlist song instance
            if(song instanceof YoutubePlaylistSong) return;
            
            // Add the SpotifySong | YoutubeSong to the favourites for the user
            await UserRepository.addUserFavourite(userId, song);

            // If there is a favouriteMessage instance, update its content
            await FavouritesMessage.get(i, async (favouritesMessage) => {
                if(favouritesMessage) {
                    await favouritesMessage.updateQueue();
                    await favouritesMessage.updateContent().update();
                }
            });
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        const userId = msg.member?.id;
        if(!userId) return;
        command({ i: msg, userId }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default favouritesAddCommandMetadata;