import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import { CommandMetadata } from "../types";

/** String tu be used to join the "clapped" elements. */
const clap = ' :clap_tone5: ';

const clapCommandMetadata: CommandMetadata<{ words: string[] }, { content: string }> = {
    category: "Messages", description: "Claps some text.", aliases: ["clap"],
    usage: "`ham clap coglione` // c :clap_tone5: o :clap_tone5: g :clap_tone5: l :clap_tone5: i :clap_tone5: o :clap_tone5: n :clap_tone5: e\
    \n`ham clap sei un coglione` // sei :clap_tone5: un :clap_tone5: coglione",
    
    command: ({ words }, callback) => {
        // If there is a single argument, join the single word characters
        if(words.length == 1) words = [...words[0]];
    
        // Join arguments with clapping emoji and call callback
        callback({ content: words.join(clap) });
    },

    onMessageCreateTransformer: (msg, _content, args, command) => {
        // If there are no arguments, don't call the callback and return
        if(!args.length)
            throw new Error("No text specified");

        command({ words: args }, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default clapCommandMetadata;