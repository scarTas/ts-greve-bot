import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { isLanguageValid, translate } from "../../services/translateService";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";

const logger: ClassLogger = new ClassLogger("translate");

/** Define command metadata and handler methods for text and slash commands. */
export const translateCommandMetadata: CommandMetadata<{ query: string, toLanguage?: string, fromLanguage?: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Internet", description: "Translates some text in another language.",
    aliases: ["translate", "tl"], usage: "`ham translate praticamente it en` // Translates `praticamente` from italian to `english`\
    \n`ham translate praticamente en` // Translates `praticamente` to english, recognizing the source language",
    
    // Actual core command with business logic implementation
    command: ({ query, toLanguage, fromLanguage }, callback) => {
        if(!isLanguageValid(toLanguage)) return;

        // Search for the first article that matches the query and compose uri
        translate(query, toLanguage!, fromLanguage)
            ?.then(text => text && callback({ content: text }))
            .catch(e => logger.error(e));
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        // toLanguage is expected to be the last argument
        let toLanguage: string | undefined = args.pop();
        let fromLanguage: string | undefined;
        // If the language is not valid, do nothing
        if(!isLanguageValid(toLanguage)) return;
        // If last arg (before toLang) is a language, use it as source language
        if(isLanguageValid(args[args.length-1])) {
            fromLanguage = args.pop();
        }
        // If there are arguments left, join the sentence and call che command
        if(args.length) command({ query: args.join(" "), toLanguage, fromLanguage }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}