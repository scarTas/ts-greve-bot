import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import Logger from "../../classes/logging/Logger";
import GoogleTranslate from "../../classes/translate/GoogleTranslate";

/** Define command metadata and handler methods for text and slash commands. */
const translateCommandMetadata: CommandMetadata<{ query: string, toLanguage?: string, fromLanguage?: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Internet", description: "Translates some text in another language.",
    aliases: ["translate", "tl"], usage: "`ham translate ciao it en` // Translates `ciao` from italian to english\
    \n`ham translate ciao en` // Translates `ciao` to english, recognizing source language",
    
    // Actual core command with business logic implementation
    command: ({ query, toLanguage, fromLanguage }, callback) => {
        if(!GoogleTranslate.isLanguageValid(toLanguage)) return;

        // Search for the first article that matches the query and compose uri
        GoogleTranslate.translate(query, toLanguage!, fromLanguage)
            ?.then(text => text && callback({ content: text }))
            .catch(e => Logger.error("Error during translation", e));
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        // toLanguage is expected to be the last argument
        let toLanguage: string | undefined = args.pop();
        let fromLanguage: string | undefined;
        // If the language is not valid, do nothing
        if(!GoogleTranslate.isLanguageValid(toLanguage)) return;
        // If last arg (before toLang) is a language, use it as source language
        if(GoogleTranslate.isLanguageValid(args[args.length-1])) {
            fromLanguage = args.pop();
        }
        // If there are arguments left, join the sentence and call che command
        if(args.length) command({ query: args.join(" "), toLanguage, fromLanguage }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default translateCommandMetadata;