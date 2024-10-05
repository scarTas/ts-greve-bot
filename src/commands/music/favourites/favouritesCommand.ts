import { msgReactErrorHandler, msgReactResponseTransformer } from "../../../events/onMessageCreate";
import { CommandMetadata } from "../../types";
import { Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";

const favouritesCommandMetadata: CommandMetadata<{ msg: Message }, void> = {
    category: "Music", description: "Shows all the songs added to your favourites.",
    aliases: ["favourites", "fav", "f"], usage: "`ham favourites` // Shows your favourite songs",

    command: async ({ msg }) => {
        // Force message creation (hence the "!")
        await FavouritesMessage.get(msg, async (favouritesMessage) =>
            await favouritesMessage!
                .updateContent()
                .send()
        , true);
    },

    onMessage: {
        requestTransformer: (msg, _content, _args) => {
            return { msg };
        },
        responseTransformer: msgReactResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default favouritesCommandMetadata;