import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { CommandMetadata } from "../../types/types";

/** String tu be used to join the "clapped" elements. */
const clap = ' :clap_tone5: ';

/** Define command metadata and handler methods for text and slash commands. */
export const clapCommandMetadata: CommandMetadata<{ words: string[] }, { content: string }> = {
    // Command metadata for "help" command and general info about the command
    category: "Messages", description: "Claps some text.", aliases: ["clap"],
    usage: "`ham clap coglione` // c :clap_tone5: o :clap_tone5: g :clap_tone5: l :clap_tone5: i :clap_tone5: o :clap_tone5: n :clap_tone5: e\
    \n`ham clap sei un coglione` // sei :clap_tone5: un :clap_tone5: coglione",
    
    // Actual core command with business logic implementation
    command: ({ words }, callback) => {
        // If there are no arguments, don't call the callback and return
        if(!words.length) return;
    
        // If there is a single argument, join the single word characters
        if(words.length == 1) words = [...words[0]];
    
        // Join arguments with clapping emoji and call callback
        callback({ content: words.join(clap) });
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) =>
        command({ words: args }, getSimpleMessageCallback(msg))

    // TODO: slash command handler
}