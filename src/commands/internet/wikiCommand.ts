import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import Wikipedia from "../../classes/wikipedia/Wikipedia";
import { CommandMetadata } from "../types";

const wikiCommandMetadata: CommandMetadata<{ query: string, language?: string }, { content: string }> = {
    category: "Internet", description: "Sends the Wikipedia link (and embed) of a topic.",
    aliases: ["wiki"], usage: "`ham wiki clash of clans` // Searches for an english article about `Clash of Clans`\
    \n`ham wiki clash of clans it` // Searches for an italian article about `Clash of Clans`",
    
    command: async ({ query, language }, callback) => {
        // Search for the first article that matches the query and compose uri
        const articles = await Wikipedia.searchArticleTitles(query, 5, language);
        const uri = Wikipedia.getArticleUri(articles[0], language);

        callback({ content: uri });
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {
        let language = undefined;
        if(Wikipedia.isLanguageValid( args[args.length-1] )) {
            language = args.pop();
        }

        // If there are arguments left, join the sentence and call che command
        if(!args.length) {
            throw new Error("No text specified");
        }

        await command({ query: args.join(" "), language }, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler,
    
    // TODO: slash command handler
}
export default wikiCommandMetadata;