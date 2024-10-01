import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import QueryMessage from "../../../classes/music/message/queryMessage";
import { defaultButtonInteractionCallback } from "../../../events/onInteractionCreate";

const queryDeleteCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    category: "Music", description: "Deletes the displayed query message",
    aliases: ["query-delete"],
    hidden: true,
    
    command: async ({ i }, callback) => {
        await QueryMessage.get(i, async (queryMessage: QueryMessage) => {
            await queryMessage.destroy();
        });
        callback();
    },

    onButtonInteractionTransformer: async (interaction, command) => {
        await command({ i: interaction }, defaultButtonInteractionCallback(interaction));
    }
}
export default queryDeleteCommandMetadata;