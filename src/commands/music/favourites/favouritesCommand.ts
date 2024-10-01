import { defaultMessageCallback, defaultMessageErrorHandler } from "../../../events/onMessageCreate";
import { CommandMetadata } from "../../types";
import { Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";

const favouritesCommandMetadata: CommandMetadata<{ msg: Message }, { content: string }> = {
    category: "Music", description: "Shows all the songs added to your favourites.",
    aliases: ["favourites", "fav", "f"], usage: "`ham favourites` // Shows your favourite songs",

    command: async ({ msg }, callback) => {
        // Force message creation (hence the "!")
        await FavouritesMessage.get(msg, async (favouritesMessage) =>
            await favouritesMessage!
                .updateContent()
                .send()
        , true);
    },

    onMessageCreateTransformer: async (msg, _content, _args, command) => {
        await command({ msg }, defaultMessageCallback(msg))
    },
    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default favouritesCommandMetadata;