import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const favouritesPreviousCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "When the favourites list message is displayed, go to the next page",
    aliases: ["fav-previous"],
    hidden: true,

    command: async ({ i }, callback) => {
        await FavouritesMessage.get(i, async (favouritesMessage) => await favouritesMessage?.previous().update());
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default favouritesPreviousCommandMetadata;