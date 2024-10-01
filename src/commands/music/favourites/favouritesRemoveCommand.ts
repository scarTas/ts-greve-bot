import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import UserRepository from "../../../classes/user/UserRepository";
import { defaultMessageErrorHandler, reactCallback } from "../../../events/onMessageCreate";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";

const favouritesRemoveCommandMetadata: CommandMetadata<{ i: Message | Interaction, userId: string, index: number }, void> = {
    category: "Music", description: "Removes a song from the favourites.",
    aliases: ["favouritesremove", "favrm", "frm", "fr"],

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
        callback();
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {
        const userId = msg.member?.id;
        if(!userId)
            throw new Error("No userId found");

        // Retrieve index to be removed - if argument is not a number, return
        let index: string | number | undefined = args.pop();
        if(!index)
            throw new Error("No index provided");
        index = parseInt(index);
        if(isNaN(index) || index < 1)
            throw new Error("Invalid index");

        await command({ i: msg, userId, index: --index }, reactCallback(msg));
    },
    onMessageErrorHandler: defaultMessageErrorHandler,
}
export default favouritesRemoveCommandMetadata;