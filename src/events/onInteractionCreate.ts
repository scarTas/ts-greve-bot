import { Interaction } from "discord.js";
import ClassLogger from "../utils/logger";
import { CommandMetadata } from "../types/types";
import { initializeContext, setCommandId } from "../utils/contextInitializer";
import { commandMetadatas } from "./onMessageCreate";

export default function (interaction: Interaction): void {
    // Before executing any logic, initialize context for verbose logging
    initializeContext({ userId: interaction.user.username, serverId: interaction.guildId }, () => onInteractionCreate(interaction));
}

/** Handle newly created message and reply if a command is called. */
async function onInteractionCreate(interaction: Interaction): Promise<void> {
    // If the interaction author is a bot, ignore
    if(interaction.user.bot) return;

    if(interaction.isButton()) {
        // Extract command name from interaction customId
        const commandName: string | undefined = interaction.customId.toLocaleLowerCase();

        // Search for the corresponding metadata and invoke handler method to
        // correctly prepare input parameters and handle callbacks
        const commandMetadata: CommandMetadata<any, any> | undefined = commandMetadatas[commandName];
        if(commandMetadata?.onButtonInteractionTransformer) {
            setCommandId(commandMetadata.aliases[0]);
            ClassLogger.info(commandName);
            return commandMetadata.onButtonInteractionTransformer(interaction, commandMetadata.command);
        } else {
            await interaction.deferUpdate();
        }
    }
}