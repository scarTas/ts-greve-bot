import axios from "axios";
import ClassLogger from "../utils/logger";

/* ==== PROPERTIES ========================================================== */
const logger = new ClassLogger("WikiService");

/** Default query params to be used for all Wikipedia API calls. */
const defParams = {
    origin: "*",    // This is needed to avoid CORS issues
    action: "query",
    format: "json"
}

/** List of languages that are supported by the Wikipedia domains. */
export let availableLanguages: Set<string> | undefined = undefined;
// On startup, initialize availableLanguages Set
getLanguages()
    .then(languages => availableLanguages = new Set(languages))
    .catch(e => ClassLogger.error("Error initializing languages", e));

/* ==== METHODS ============================================================= */
/** Checks whether the provided language is supported by Wikipedia or not. */
export function isLanguageValid(language: string): boolean {
    return !!availableLanguages?.has( language );
}

/** Retrieves all the possible Wikipedia website language domains. */
export function getLanguages(): Promise<string[]> {
    // Prepare API call query params
    const params = { ...defParams, meta: "siteinfo", siprop: "interwikimap" }

    // Call Wikipedia siteinfo API to retrieve all possible websites
    return axios.get("https://en.wikipedia.org/w/api.php", { params })

    // The language prefixes have the "language" property:
    // Only take the elements with this property and retrieve prefix
    .then(r => (r.data.query.interwikimap as [any])
        .filter(e => e.language)
        .map(e => e.prefix)
    )
}

/** Returns the first {limit} Wikipedia
 *  articles that match the submitted query.
 *  If no limit is specified, only return the first result. */
export function searchArticleTitles(query: string, limit: number = 1, language: string = "en"): Promise<string[]> {
    // Prepare API call query params
    const params = { ...defParams, list: "search", srsearch: query, limit }

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
export function getArticleUri(title: string, language: string = "en"): string {
    if(!title) throw Error("No results found");

    // Replace title spaces with underscores and encode to URI
    const encodedTitle: string = encodeURIComponent(title.replace(/ /g, '_'));

    // Compose website with language prefix and encoded title
    return `https://${language}.wikipedia.org/wiki/${encodedTitle}`;
}