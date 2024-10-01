import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import QueryMessage from "../../../classes/music/message/queryMessage";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const queryPreviousCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "When the query message is displayed, go to the previous page",
    aliases: ["query-previous"],
    hidden: true,

    command: async ({ i }, callback) => {
        await QueryMessage.get(i, async (queryMessage: QueryMessage) => {
            await queryMessage.previous();
            await queryMessage.update();
        });
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default queryPreviousCommandMetadata;