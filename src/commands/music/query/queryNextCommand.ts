import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import QueryMessage from "../../../classes/music/message/queryMessage";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const queryNextCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "When the query message is displayed, go to the next page and load next results",
    aliases: ["query-next"],
    hidden: true,

    command: async ({ i }, callback) => {
        await QueryMessage.get(i, async (queryMessage: QueryMessage) => {
            await queryMessage.next();
            await queryMessage.update();
        });
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default queryNextCommandMetadata;