import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";
import MusicPlayer from "../../../classes/music/MusicPlayer";
import UserRepository from "../../../classes/user/UserRepository";
import ASong from "../../../classes/music/song/ASong";
import { getSimpleMessageCallback } from "../../../events/onMessageCreate";

/** Define command metadata and handler methods for text and slash commands. */
const favouritesPlayCommandMetadata: CommandMetadata<{ i: Message | Interaction, userId: string, index: number | undefined }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Plays the selected song from the favourites.",
    aliases: ["favouritesplay", "favplay", "fp"],

    // Actual core command with business logic implementation
    command: async ({ i, userId, index }, callback) => {
        if(index) {
            let song: ASong | undefined;

            // If there is a FavouritesMessage instance, retrieve the fav from there
            await FavouritesMessage.get(i, async (favouritesMessage) => {
                song = favouritesMessage?.queue[index];
            });

            // If not, retrieve it from the database
            if(!song) song = await UserRepository.getUserFavourite(userId, index);

            // If the index is too high or the user has no favourite songs, return
            if(!song) return;

            // Add the retrieved song to the queue
            song.requestor = userId;
            await MusicPlayer.get(i, async (musicPlayer) => {
                await musicPlayer.add(song as ASong);
            });
        } else {
            const songs = await UserRepository.getUserFavourites(userId);
            if(songs) {
                songs.forEach(s => s.requestor = userId);
                await MusicPlayer.get(i, async (musicPlayer) => {
                    await musicPlayer.add(...songs);
                });
            }
        }
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        const userId = msg.member?.id;
        if(!userId) return;

        // Retrieve index to be removed - if argument is not a number, return
        let index: string | number | undefined = args.pop();
        if(index !== undefined) {
            index = parseInt(index);
            if(isNaN(index) || index < 1) return;
            index = --index;
        }

        command({ i: msg, userId, index }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default favouritesPlayCommandMetadata;