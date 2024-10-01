import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const favouritesFirstCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "When the favourites list message is displayed, return to the first page",
    aliases: ["fav-first"],
    hidden: true,

    command: async ({ i }, callback) => {
        await FavouritesMessage.get(i, async (favouritesMessage) => await favouritesMessage?.first().update());
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default favouritesFirstCommandMetadata;