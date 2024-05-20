import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { getArticleUri, getLanguages, isLanguageValid, searchArticleTitles } from "../../services/wikiService";
import { CommandMetadata } from "../../types/types";
import ClassLogger from "../../utils/logger";

const logger: ClassLogger = new ClassLogger("wiki");

/** Define command metadata and handler methods for text and slash commands. */
export const wikiCommandMetadata: CommandMetadata<{ query: string, language?: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Internet", description: "Sends the Wikipedia link (and embed) of a topic.",
    aliases: ["wiki"], usage: "`ham wiki clash of clans` // Searches for an english article about `Clash of Clans`\
    \n`ham wiki clash of clans it` // Searches for an italian article about `Clash of Clans`",
    
    // Actual core command with business logic implementation
    command: ({ query, language }, callback) => {
        // Search for the first article that matches the query and compose uri
        searchArticleTitles(query, 5, language)
            .then(articles => getArticleUri(articles[0], language))
            .then(uri => callback({ content: uri }))
            .catch(e => logger.error(e));
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        let language = undefined;
        if(isLanguageValid( args[args.length-1] )) {
            language = args.pop();
        }
        if(args.length) command({ query: args.join(" "), language }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}