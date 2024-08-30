import { CommandMetadata } from "../../../types/types";
import { Interaction, Message } from "discord.js";
import { QueryMessage } from "../../../services/music/message/queryMessage";

/** Define command metadata and handler methods for text and slash commands. */
const queryDeleteCommandMetadata: CommandMetadata<{ i: Message | Interaction }, void> = {
    // Command metadata for "help" command and general info about the command
    category: "Music", description: "Deletes the displayed query message",
    aliases: ["query-delete"],
    
    // Actual core command with business logic implementation
    command: async ({ i }, callback) => {
        QueryMessage.get(i, async (queryMessage: QueryMessage) => {
            await queryMessage.destroy();
        })
        .then(() => callback());
    },

    // Transformer that parses the interaction before invoking the core command,
    // and handles the message reply with the provided output.
    onButtonInteractionTransformer: (interaction, command) => {
        command({ i: interaction }, () => interaction.deferUpdate())
    }

    //! onMessageCreateTransformer is not defined: this command can only be
    //!     called by activating the queueMessage button interaction.
}
export default queryDeleteCommandMetadata;