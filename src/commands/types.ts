import { ButtonInteraction, CommandInteraction, Message } from "discord.js";

/** Define metadata object value definition.
 *  Command metadata are mainly used by the "help" command. */
export type CommandMetadata<I, O>  = {
    /** Command logic description, used by the "help" command. */
    description: string,
    /** Command category description, used by the "help" command. */
    category: "Information" | "Messages" | "Images" | "Internet" | "Music",
    /** Keywords users can use to invoke the command.
     *  Also displayed by the "help" command. */
    aliases: string[],
    /** Command usage descripton, used by the "help" command. */
    usage?: string,
    /** Flag that indicates if the command is for internal use only (e.g.
     *  button command interactions for dynamic messages, not directly
     *  callable from users with text or slash commands). */
    hidden?: boolean,

    /** Actual command "business logic", with bare minimum inputs: it could be
     *  invoked either by text messages or interactions - trasnformers functions
     *  parse the normalized inputs for the command.
     *  This command may call the callback function when finished. */
    command: CoreCommand<I, O>,

    /** Method used to handle the incoming text message, parse it and invoke the
     *  core command with the correct parameters. */
    onMessageCreateTransformer?: OnMessageCreateTransformer<I, O>,
    /** Method used to handle exceptions during the execution of a command that
     *  has been invoked with the onMessageCreateTransformer method. */
    onMessageErrorHandler?: OnMessageErrorHandler,

    onButtonInteractionTransformer?: OnButtonInteractionTransformer<I, O>,

    onSlashCommandTransformer?: OnSlashCommandTransformer<I, O>,
}

export type CoreCommandCallback<O> = (output: O) => void;
export type CoreCommand<I, O> = (input: I, callback: CoreCommandCallback<O>) => Promise<void> | void;
export type OnMessageCreateTransformer<I, O> = (msg: Message, content: string, args: string[], command: CoreCommand<I, O>) => Promise<void> | void
export type OnMessageErrorHandler = (msg: Message, e: Error) => Promise<void> | void
export type OnButtonInteractionTransformer<I, O> = (interaction: ButtonInteraction, command: CoreCommand<I, O>) => Promise<void> | void

// TODO
export type OnSlashCommandTransformer<I, O> = (interaction: CommandInteraction, command: CoreCommand<I, O>) => Promise<void> | void