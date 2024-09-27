import { CommandMetadata } from "../../types";
import { Interaction, Message } from "discord.js";
import QueryMessage from "../../../classes/music/message/queryMessage";

/** Define command metadata and handler methods for text and slash commands. */
const queryNextCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "When the query message is displayed, go to the next page and load next results",
    aliases: ["query-next"],

    // This command can only be called by activating queueMessage interaction.
    hidden: false,

    // Actual core command with business logic implementation
    command: async ({ i }, callback) => {
        QueryMessage.get(i, async (queryMessage: QueryMessage) => {
            await queryMessage.next()
                ?.then(async m => await m?.update());
        })
        .then(() => callback());
    },

    // Transformer that parses the interaction before invoking the core command,
    // and handles the message reply with the provided output.
    onButtonInteractionTransformer: (interaction, command) => {
        command({ i: interaction }, () => interaction.deferUpdate())
    }
}
export default queryNextCommandMetadata;