import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";

/** Define command metadata and handler methods for text and slash commands. */
const favouritesFirstCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "When the favourites list message is displayed, return to the first page",
    aliases: ["fav-first"],
    
    // This command can only be called by activating queueMessage interaction.
    hidden: true,

    // Actual core command with business logic implementation
    command: async ({ i }, callback) => {
        FavouritesMessage.get(i, async (favouritesMessage) => await favouritesMessage?.first().update())
            .then(() => callback());
    },

    // Transformer that parses the interaction before invoking the core command,
    // and handles the message reply with the provided output.
    onButtonInteractionTransformer: (interaction, command) => {
        command({ i: interaction }, () => interaction.deferUpdate())
    }
}
export default favouritesFirstCommandMetadata;