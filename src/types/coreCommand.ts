import { Message } from "discord.js";
import HaramLeotta from "..";

export type CoreCommandCallback<O> = (output: O) => void;

/** Define signature of core command method - common interface to be implemented
 *  without handling the "reply" itself: the command could be invoked both by
 *  a text message, slash command or interfaction. */
export type CoreCommand<I, O> = (
    self: HaramLeotta,
    input: I, callback: CoreCommandCallback<O>
) => void;

/** Defines the signature of the method used to handle the incoming text message
 *  to be parsed and to invoke the core command with the correct parameters. */
export type OnMessageCreateTransformer<I, O> = (self: HaramLeotta, msg: Message, content: string, args: string[], command: CoreCommand<I, O>) => void

// TODO
export type OnSlashCommandTransformer = (content: any) => void

// TODO
export type OnInteractionTransformer = (content: any) => void

/** Define metadata object value definition.
 *  Command metadata are mainly used for the "help" command. */
export type CommandMetadata<I, O>  = {
    description: string,
    category: "Information" | "Messages" | "Images" | "Internet" | "Music",
    aliases: string[],
    usage?: string,
    command: CoreCommand<I, O>,
    onMessageCreateTransformer?: OnMessageCreateTransformer<I, O>,
    onSlashCommandTransformer?: OnSlashCommandTransformer
    onInteractionTransformer?: OnInteractionTransformer
}