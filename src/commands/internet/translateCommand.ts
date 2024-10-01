import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";
import GoogleTranslate from "../../classes/translate/GoogleTranslate";

const translateCommandMetadata: CommandMetadata<{ query: string, toLanguage: string, fromLanguage?: string }, { content: string }> = {
    category: "Internet", description: "Translates some text into another language.",
    aliases: ["translate", "tl"], usage: "`ham translate ciao it en` // Translates `ciao` from italian to english\
    \n`ham translate ciao en` // Translates `ciao` to english, recognizing source language",
    
    command: async ({ query, toLanguage, fromLanguage }, callback) => {
        // Retrieve translated text from Google
        const text: string = await GoogleTranslate.translate(query, toLanguage, fromLanguage);

        callback({ content: text });
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {
        // toLanguage is expected to be the last argument
        let toLanguage: string | undefined = args.pop();
        if(!toLanguage) {
            throw new Error("No target language specified");
        }

        // If last arg (before toLang) is a language, use it as source language
        let fromLanguage: string | undefined;
        if(GoogleTranslate.isLanguageValid(args[args.length-1])) {
            fromLanguage = args.pop();
        }
        
        // If there are arguments left, join the sentence and call che command
        if(!args.length) {
            throw new Error("No text specified");
        }

        await command({ query: args.join(" "), toLanguage, fromLanguage }, defaultMessageCallback(msg));
    },

    onMessageErrorHandler: defaultMessageErrorHandler,

    // TODO: slash command handler
}
export default translateCommandMetadata;