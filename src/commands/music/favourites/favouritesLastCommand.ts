import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const favouritesLastCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "When the favourites list message is displayed, go to the last page",
    aliases: ["fav-last"],
    hidden: true,

    command: async ({ i }, callback) => {
        await FavouritesMessage.get(i, async (favouritesMessage) => await favouritesMessage?.last().update());
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default favouritesLastCommandMetadata;