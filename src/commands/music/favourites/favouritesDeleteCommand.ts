import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import FavouritesMessage from "../../../classes/music/message/favouritesMessage";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const favouritesDeleteCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Deletes the displayed favourites list message.",
    aliases: ["fav-delete"],
    hidden: true,

    command: async ({ i }, callback) => {
        await FavouritesMessage.get(i, async (favouritesMessage) => await favouritesMessage?.delete());
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default favouritesDeleteCommandMetadata;