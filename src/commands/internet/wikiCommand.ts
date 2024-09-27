import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import Wikipedia from "../../classes/wikipedia/Wikipedia";
import { CommandMetadata } from "../types";
import Logger from "../../classes/logging/Logger";

/** Define command metadata and handler methods for text and slash commands. */
const wikiCommandMetadata: CommandMetadata<{ query: string, language?: string }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Internet", description: "Sends the Wikipedia link (and embed) of a topic.",
    aliases: ["wiki"], usage: "`ham wiki clash of clans` // Searches for an english article about `Clash of Clans`\
    \n`ham wiki clash of clans it` // Searches for an italian article about `Clash of Clans`",
    
    // Actual core command with business logic implementation
    command: ({ query, language }, callback) => {
        // Search for the first article that matches the query and compose uri
        Wikipedia.searchArticleTitles(query, 5, language)
            .then(articles => Wikipedia.getArticleUri(articles[0], language))
            .then(uri => callback({ content: uri }))
            .catch(e => { Logger.error("Error retrieving article", e); callback({ content: "??" }) });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        let language = undefined;
        if(Wikipedia.isLanguageValid( args[args.length-1] )) {
            language = args.pop();
        }
        if(args.length) command({ query: args.join(" "), language }, getSimpleMessageCallback(msg))
    }

    // TODO: slash command handler
}
export default wikiCommandMetadata;