import { AnySelectMenuInteraction, ButtonInteraction, Interaction } from "discord.js";
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

    const isButton = interaction.isButton();
    const isSelect = interaction.isStringSelectMenu();

    // Only supports button and selectMenu interactions for now
    if(isButton || isSelect) {
        // Extract command name from interaction customId
        const commandName: string | undefined = interaction.customId.toLocaleLowerCase();

        // Search for the corresponding metadata and invoke handler method to
        // correctly prepare input parameters and handle callbacks
        const commandMetadata: CommandMetadata<any, any> | undefined = commandMetadataMap[commandName];
        if(!commandMetadata) return;
        
        // If command cannot be triggered with text messages, return
        const { aliases, command, onButton, onSelect } = commandMetadata;

        // Add command name to context and log full message
        Context.set("command-id", aliases[0]);

        // Handle button interactions
        if(isButton) {
            if(!onButton) return;
            Logger.info("Button clicked");

            try {
                const input = await onButton.requestTransformer(interaction);
                const output = await command(input);
                await onButton.responseTransformer(interaction, output);
            } catch(e) {
                await onButton.errorHandler(interaction, e as Error);
            }
        }

        // Handle selectMenu interactions
        if(isSelect) {
            if(!onSelect) return;
            Logger.info(`Selected ${JSON.stringify(interaction.values)}`);
            
            try {
                const input = await onSelect.requestTransformer(interaction);
                const output = await command(input);
                await onSelect.responseTransformer(interaction, output);
            } catch(e) {
                await onSelect.errorHandler(interaction, e as Error);
            }
        }
    }
}

export function deferUpdateResponseTransformer(interaction: ButtonInteraction | AnySelectMenuInteraction, _: any) {
    return interaction.deferUpdate()
        .catch(e => Logger.error("deferUpdateResponseTransformer error", e));
}

/** Default error handler method to be used for commands that can be executed
 *  via the onMessageCreateTransformer.
 *  It reacts to the original user message with an emoji. */
export function deferUpdateErrorHandler(interaction: ButtonInteraction | AnySelectMenuInteraction, e: Error) {
    Logger.error("Button interaction execution error\n", e)
    return interaction.deferUpdate()
        .catch(e => Logger.error("deferUpdateErrorHandler error", e));
}