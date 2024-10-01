import axios from "axios";

export default class GoogleTranslate {

    /* ==== STATIC PROPERTIES =============================================== */
    private static readonly supportedLanguages = new Set([
        "af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca",
        "ceb", "zh-CN", "zh-TW", "co", "hr", "cs", "da", "nl", "en", "eo", "et",
        "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "iw",
        "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jv", "kn", "kk",
        "km", "rw", "ko", "ku", "ky", "lo", "la", "lv", "lt", "lb", "mk", "mg",
        "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "ny", "or", "ps",
        "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd",
        "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tl", "tg", "ta", "tt",
        "te", "th", "tr", "tk", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi",
        "yo", "zu"
    ]);

    /* ==== STATIC METHODS ================================================== */
    /** Checks whether the provided language is supported by Wikipedia or not. */
    public static isLanguageValid(language: string | undefined): boolean {
        return !!language && GoogleTranslate.supportedLanguages.has( language );
    }

    /** Translates a given text from a language to another.
     *  If no source language is specified, automatic recognition is used. */
    public static async translate(query: string, toLang: string, fromLang: string = "auto"): Promise<string> {
        // Assert the languages have a value and are supported
        if(!GoogleTranslate.isLanguageValid(toLang)) throw new Error(`Invalid target language "${toLang}"`);
        if(fromLang !== "auto" && !GoogleTranslate.isLanguageValid(fromLang)) throw new Error(`Invalid source language "${fromLang}"`);

        // Call Google translate endpoint with query language and target language
        const result = await axios.post(
            `https://translate.google.it/_/TranslateWebserverUi/data/batchexecute?rpcids=MkEWBc&client=gtx&f.sid=-7075841764636485169&bl=boq_translate-webserver_20210215.17_p0&hl=it&soc-app=1&soc-platform=1&soc-device=1&_reqid=1944506&rt=c`,
            `f.req=%5B%5B%5B%22MkEWBc%22%2C%22%5B%5B%5C%22${encodeURI(query)}%5C%22%2C%5C%22${fromLang}%5C%22%2C%5C%22${toLang}%5C%22%2Ctrue%5D%2C%5Bnull%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at=AD08yZm8SCo9gO2LTBwTCjgyWhJQ%3A1613560907885&`,
            { headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" }}
        )

        // Initialize output string to empty string
        let output: string = "";

        // Finds the text to output in the... whatever this is supposed to be
        (JSON.parse(JSON.parse(((result.data as string).substring(7).replace(/[0-9]{2,4}\n\[\[/g,`\n[[`)).split('\n\n')[0])[0][2])[1][0][0][5]).forEach((res: any) => output += res[0]+' ');
        return output;
    }
}