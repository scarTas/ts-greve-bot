import axios from "axios";
import Logger from "../logging/Logger";

export default class Wikipedia {

    /* ==== PROPERTIES ====================================================== */
    /** Default query params to be used for all Wikipedia API calls. */
    private static defParams = {
        origin: "*",        // Needed to avoid CORS issues
        action: "query",
        format: "json"
    }

    /** List of languages that are supported by the Wikipedia domains. */
    public static availableLanguages: Set<string> | undefined = undefined;

    /* ==== PUBLIC METHODS ================================================== */
    /** Initializes availableLanguages static property. */
    public static intialize() {
        // On startup, initialize availableLanguages Set
        Wikipedia.getLanguages()
            .then(languages => Wikipedia.availableLanguages = new Set(languages))
            .catch(e => Logger.error("Error initializing languages: ", e));
    }

    /** Checks whether the provided language is supported by Wikipedia or not. */
    public static isLanguageValid(language: string): boolean {
        return !!Wikipedia.availableLanguages?.has( language );
    }

    /** Returns the first {limit} Wikipedia
     *  articles that match the submitted query.
     *  If no limit is specified, only return the first result. */
    public static searchArticleTitles(query: string, limit: number = 1, language: string = "en"): Promise<string[]> {
        // Prepare API call query params
        const params = { ...Wikipedia.defParams, list: "search", srsearch: query, limit }

        // Call Wikipedia search API to retrieve results from given query
        return axios.get(`https://${language}.wikipedia.org/w/api.php`, { params })

        // Loop through all the results and only extract the title of each article
        .then(r => (r.data.query.search as [any])
            .filter(e => !e.snippet?.includes(" may refer to: ") )
            .map(e => e.title)
        );
    }

    /** Composes the final Wikipedia article URI from the title and the language.
     *  If no language is specified, english is used. */
    public static getArticleUri(title: string, language: string = "en"): string {
        if(!title) throw Error("No results found");

        // Replace title spaces with underscores and encode to URI
        const encodedTitle: string = encodeURIComponent(title.replace(/ /g, '_'));

        // Compose website with language prefix and encoded title
        return `https://${language}.wikipedia.org/wiki/${encodedTitle}`;
    }

    /* ==== PRIVATE METHODS ================================================= */
    /** Retrieves all the possible Wikipedia website language domains. */
    private static getLanguages(): Promise<string[]> {
        // Prepare API call query params
        const params = { ...Wikipedia.defParams, meta: "siteinfo", siprop: "interwikimap" }

        // Call Wikipedia siteinfo API to retrieve all possible websites
        return axios.get("https://en.wikipedia.org/w/api.php", { params })

        // The language prefixes have the "language" property:
        // Only take the elements with this property and retrieve prefix
        .then(r => (r.data.query.interwikimap as [any])
            .filter(e => e.language)
            .map(e => e.prefix)
        )
    }
}