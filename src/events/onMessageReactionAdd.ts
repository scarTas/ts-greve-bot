import { MessageReaction, MessageReactionEventDetails, PartialMessageReaction, PartialUser, User } from "discord.js";
import Context from "../classes/logging/Context";
import translateCommandMetadata from "../commands/internet/translateCommand";
import Logger from "../classes/logging/Logger";
import { CommandMetadata, onMessageReactionAddData } from "../commands/types";

export default function (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, details: MessageReactionEventDetails): void {
    // Before executing any logic, initialize context for verbose logging
    Context.initialize({ userId: user.username || undefined, serverId: reaction.message.guildId || undefined },
        () => onMessageReactionAdd(reaction, user, details));
}

async function onMessageReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, details: MessageReactionEventDetails): Promise<void> {
    // If reaction author is a bot, ignore
    if(user.bot) return;

    // Directly call specific command logic and handle output, handling errors
    await executeCommand({ reaction, user, details }, translateCommandMetadata);
    // TODO: call GigginoCommandMetadata
}

async function executeCommand<I, O>(reactionData: onMessageReactionAddData, { aliases, command, onReaction }: CommandMetadata<I, O>) {
    Context.set("command-id", aliases[0]);
    try {
        const input = await onReaction!.requestTransformer(reactionData);
        const output = await command(input);
        onReaction!.responseTransformer(reactionData, output);
    } catch(e) {
        onReaction!.errorHandler(reactionData, e as Error);
    }
}

/** Empty error handler method used for commands executed via reaction.
 *  It only logs the error since there is no user message to use. */
export function emptyErrorHandler(_: any, e: Error) {
    Logger.error("Reaction execution error\n", e);
}