import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import UserRepository from "../../../classes/user/UserRepository";
import { getSimpleMessageCallback } from "../../../events/onMessageCreate";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";

/** Define command metadata and handler methods for text and slash commands. */
const favouritesAddCommandMetadata: CommandMetadata<{ i: Message | Interaction, userId: string, index: number }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Removes a song from the favourites.",
    aliases: ["favouritesremove", "favrm", "frm", "fr"],

    // Actual core command with business logic implementation
    command: async ({ i, userId, index }, callback) => {

        // Remove the song at the given index from the favourites for the user
        await UserRepository.deleteUserFavourite(userId, index);

        // If there is a favouriteMessage instance, update its content
        await FavouritesMessage.get(i, async (favouritesMessage) => {
            if(favouritesMessage) {
                await favouritesMessage.updateQueue();
                await favouritesMessage.updateContent().update();
            }
        });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        const userId = msg.member?.id;
        if(!userId) return;

        // Retrieve index to be removed - if argument is not a number, return
        let index: string | number | undefined = args.pop();
        if(!index) return;
        index = parseInt(index);
        if(isNaN(index) || index < 1) return;

        command({ i: msg, userId, index: --index }, getSimpleMessageCallback(msg))
    }
}
export default favouritesAddCommandMetadata;