import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import QueryMessage from "../classes/music/message/queryMessage";
import ASong from "../classes/music/song/ASong";
import MusicPlayer from "../classes/music/MusicPlayer";
import Context from "../classes/logging/Context";
import { CommandMetadata } from "../commands/types";
import Logger from "../classes/logging/Logger";
import YoutubePlaylistSong from "../classes/music/song/youtube/YoutubePlaylistSong";
import UserRepository from "../classes/user/UserRepository";
import { commandMetadataMap } from "../commands/registration";

/** Default prefix that can be used by users to activate text commands.
 *  If default prefix is not defined in the environment, use "ham". */
const DEFAULT_PREFIX: string = process.env.PREFIX ?? "ham";

/** Before exporting, wrap event logic in context init for versbose logging. */
export default function (msg: Message): void {
    Context.initialize({ userId: msg.author.username, serverId: msg.guildId || undefined }, () => onMessageCreate(msg));
}

/** Handle newly created message and reply if a command is called. */
async function onMessageCreate(msg: Message): Promise<void> {
    // If the message author is a bot, ignore
    if(msg.author.bot) return;

    // Normalize message content for better parsing
    const lowerCaseContent: string = msg.content.toLowerCase();

    // Youtube Query: if the message content is a number and there is a pending
    // queryMessage, try to play the song on the musicPlayer
    const index: number = parseInt(lowerCaseContent);
    if(!isNaN(index) && index > 0) {

        // Try to retrieve current queryMessage (if any) with Youtube results.
        //If there is no queryMessage, the callback is not called.
        QueryMessage.get(msg, async (queryMessage: QueryMessage) => {

            // Retrieve song at the selected index
            const song: ASong | undefined = queryMessage.getSong(index - 1);

            // If index is invalid, do nothing
            if(!song) return;

            // If the queried song is a playlist, convert it to song array
            const songs: ASong[] = song.type === ASong.SongType.YOUTUBE_PLAYLIST
                ? await YoutubePlaylistSong.getSongs(song.id)
                : [song];

            // Add user's id to song(s) metadata
            songs.forEach(s => s.requestor = msg.member?.id)

            // Retrieve current instance of musicPlayer (or create it and
            // add song(s) to the queue 
            await MusicPlayer.get(msg, async (musicPlayer: MusicPlayer) => {
                await musicPlayer.add(...songs);
            });

            // Delete queryMessage after adding the song to the player
            await queryMessage.destroy();
        });
    }

    // If the user has a custom prefix set, retrieve it - always use the default
    const customPrefix = await UserRepository.getUserPrefix(msg.author.id);
    let prefix = DEFAULT_PREFIX;

    // Compose regex to be used to detect and replace prefix from the message.
    // Put longer prefix first so that, if the custom prefix starts with the
    // default prefix (or vice versa) the prefix is not only partially removed.
    // Ex: custom prefix is H, default is HAM - the cleaned content of the
    //  message "HAM CLAP" would be a "AM CLAP" instead of "CLAP": HAM starts
    //  with H, and only H would be removed if the regex was "H|HAM".
    if(customPrefix) {
        if(customPrefix.length > DEFAULT_PREFIX.length) {
            prefix = customPrefix.concat("|"+prefix);
        } else {
            prefix = prefix.concat("|"+customPrefix);
        }
    }
    const prefixRegex = new RegExp(`^(${prefix})`);

    // If message starts with user's or default prefix, parse and execute the command
    if(prefixRegex.test( lowerCaseContent )) {
        // Remove prefix (and optional following space) from message start
        // and get all the words as command and arguments
        const regex = new RegExp(`^(${prefix})\\s?`, "i");
        let content = msg.content.replace(regex, "");
        const args = content.split(/[\n ]+/);

        // Extract command name from first argument
        // If there is no command, send default message
        const commandName: string | undefined = args.shift()?.toLocaleLowerCase();
        if(!commandName) 
            return defaultMessageCallback(msg)({ content: "Cazzo vuoi?" });

        // Remove command name and space from message content before passing it
        content = content.replace( new RegExp(`^(${commandName})\\s?`, "i"), "");

        // Search for the corresponding metadata and invoke handler method to
        // correctly prepare input parameters and handle exceptions & callbacks
        const commandMetadata: CommandMetadata<any, any> | undefined = commandMetadataMap[commandName];
        if(commandMetadata?.onMessageCreateTransformer) {
            Context.set("command-id", commandMetadata.aliases[0]);
            Logger.info(msg.content);
            try {
                return await commandMetadata.onMessageCreateTransformer(msg, content, args, commandMetadata.command);
            } catch(e) {
                return await commandMetadata.onMessageErrorHandler!(msg, e as Error);
            }
        }
    }
    
    // If message is not a command, start searching for insults or funny replies
    else {
        const reply: string | undefined = getInsult(lowerCaseContent);
        if(reply) defaultMessageCallback(msg)({ content: reply });
    }
}

/** Given message content, retrieve the insult to be replied with. */
function getInsult(content: string): string | undefined {
    // Check replies for the whole message first
    switch(content) {
        case "chi?": case "cosa?":  return "stocazzo"
        case "bot di merda":        return "Ma tu sei una merda";
        case "baba":                return "boey";
        case "good bot":            return ": )";
        case "bad bot":             return ": (";
        case "per il meme":         return "<@192312520567029760>";
    }
    
    // For each word in the message, check if there is a reply to be returned
    content.split(/[\n ]+/).some(word => {
        switch(word){
            case "grazie":              return "grazie al cazzo";
            case "coglione":            return "Ma coglione a chi, figlio di puttana?";
            case "bot":                 return "Cazzo vuoi?";
            case "suca":                return "melo";
            case "lol":                 return "Cazzo ridi che domani muori";
            case "beasty": case "bisty":
            case "bisti":               return "per il meme";
            case "zitto": case "taci":
            case "stai zitto":
            case "muto": case "mutati": return "audio";
        }
    });

    // No reply found - return nothing
}

/** The callback function is generic and only takes the command response
 *  as parameter - in order to use the message, bring it into the callback
 *  method scope creating the function when needed. */
export function defaultMessageCallback(msg: Message): (reply: { content?: string, embeds?: EmbedBuilder[], files?: AttachmentBuilder[] }) => void {
    return function callback(reply: { content?: string, embeds?: EmbedBuilder[] }): void {
        msg.reply(reply)
            .catch(e => Logger.error("defaultMessageCallback error", e));
    }
}

/** Similar to defaultMessageCallback, but only reacts with an emoji when the
 *  command has been correctly executed. */
export function reactCallback(msg: Message): () => void {
    return function callback(): void {
        msg.react("🤝")
            .catch(e => Logger.error("reactCallback error", e));
    }
}

/** Default error handler method to be used for commands that can be executed
 *  via the onMessageCreateTransformer.
 *  It reacts to the original user message with an emoji. */
export function defaultMessageErrorHandler(msg: Message, e: Error): void {
    Logger.error("Text command execution error\n", e)
    msg.react("902680070018175016") //  Old emoji: "❌"
        .catch(e => Logger.error("defaultMessageErrorHandler error", e));
}