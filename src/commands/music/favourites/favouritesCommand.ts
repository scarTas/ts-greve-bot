import { getSimpleMessageCallback } from "../../../events/onMessageCreate";
import { CommandMetadata } from "../../types";
import { Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";

/** Define command metadata and handler methods for text and slash commands. */
const favouritesCommandMetadata: CommandMetadata<{ msg: Message }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Shows all the songs added to your favourites.",
    aliases: ["favourites", "fav", "f"], usage: "`ham favourites` // Shows your favourite songs",

    // Actual core command with business logic implementation
    command: async ({ msg }, callback) => {
        // Force message creation (hence the "!")
        FavouritesMessage.get(msg, async (favouritesMessage) =>
            await favouritesMessage!
                .updateContent()
                .send()
        , true);
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        command({ msg }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default favouritesCommandMetadata;