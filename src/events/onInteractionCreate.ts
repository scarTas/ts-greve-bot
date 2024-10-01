import { ButtonInteraction, CommandInteraction, Interaction } from "discord.js";
import { commandMetadataMap } from "../commands/registration";
import Context from "../classes/logging/Context";
import { CommandMetadata } from "../commands/types";
import Logger from "../classes/logging/Logger";

export default function (interaction: Interaction): void {
    // Before executing any logic, initialize context for verbose logging
    Context.initialize({ userId: interaction.user.username, serverId: interaction.guildId || undefined }, () => onInteractionCreate(interaction));
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
        const commandMetadata: CommandMetadata<any, any> | undefined = commandMetadataMap[commandName];
        if(commandMetadata?.onButtonInteractionTransformer) {
            Context.set("command-id", commandMetadata.aliases[0]);
            Logger.info(commandName);
            return await commandMetadata.onButtonInteractionTransformer(interaction, commandMetadata.command);
            // TODO: handle exceptions
        } else {
            await interaction.deferUpdate();
        }
    }
}

export function defaultButtonInteractionCallback(interaction: ButtonInteraction): () => void {
    return function callback(): void {
        interaction.deferUpdate();
    }
}