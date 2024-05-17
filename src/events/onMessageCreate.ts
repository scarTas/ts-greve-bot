import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import HaramLeotta from "..";
import ClassLogger from "../utils/logger";
import { CommandMetadata } from "../types/coreCommand";
import { changelogsCommandMetadata } from "../commands/information/changelogsCommand";
import { clapCommandMetadata } from "../commands/messages/clapCommand";
import { coinflipCommandMetadata } from "../commands/messages/coinflipCommand";
import { infoCommandMetadata } from "../commands/information/infoCommand";
import { inviteCommandMetadata } from "../commands/information/inviteCommand";
import { paccoCommandMetadata } from "../commands/messages/paccoCommand";
import { echoCommandMetadata } from "../commands/messages/echoCommand";
import { susCommandMetadata } from "../commands/messages/susCommand";
import { pingCommandMetadata } from "../commands/information/pingCommand";
import { picCommandMetadata } from "../commands/images/picCommand";
import { helpCommandMetadata } from "../commands/information/helpCommand";
import { dripCommandMetadata } from "../commands/images/dripCommand";
import { lessgoCommandMetadata } from "../commands/images/lessgoCommand";
import { initializeContext, setCommandId } from "../utils/contextInitializer";
import { getUserPrefix } from "../services/userService";
import { prefixCommandMetadata } from "../commands/messages/prefixCommand";

const logger = new ClassLogger("onMessageCreate");
const DEFAULT_PREFIX: string = process.env.PREFIX ?? "ham";

export default function (self: HaramLeotta, msg: Message): void {
    // Before executing any logic, initialize context for verbose logging
    initializeContext({ userId: msg.author.username }, () => onMessageCreate(self, msg));
}

/** Handle newly created message and reply if a command is called. */
async function onMessageCreate(self: HaramLeotta, msg: Message): Promise<void> {
    // If the message author is a bot, ignore
    if(msg.author.bot) return;

    // TODO: handle youtube selection
    // Check if the user is choosing a track from the YoutubeNavigator
    //if(checkYoutube(msg)?.catch(e => logger.error("YoutubeNavigator selection error: " + e))) return;   

    // Normalize message content
    const lowerCaseContent: string = msg.content.toLowerCase();

    // If the user has a custom prefix set, retrieve it - always use the default
    const prefix: string = (await getUserPrefix(msg.author.id))?.concat("|"+DEFAULT_PREFIX) ?? DEFAULT_PREFIX;
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
            return getSimpleMessageCallback(msg)({ content: "Cazzo vuoi?" });

        // Remove command name and space from message content before passing it
        content = content.replace( new RegExp(`^(${commandName})\\s?`, "i"), "");

        // Search for the corresponding metadata and invoke handler method to
        // correctly prepare input parameters and handle callbacks
        const commandMetadata: CommandMetadata<any, any> | undefined = commandMetadatas[commandName];
        if(commandMetadata?.onMessageCreateTransformer) {
            setCommandId(commandName);
            self.logger.debug(msg.content);
            return commandMetadata.onMessageCreateTransformer(self, msg, content, args, commandMetadata.command);
        }
        
    }
    
    // If message is not a command, start searching for insults or funny replies
    else {
        const reply: string | undefined = getInsult(lowerCaseContent);
        if(reply) getSimpleMessageCallback(msg)({ content: reply });
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
export function getSimpleMessageCallback(msg: Message): (reply: { content?: string, embeds?: EmbedBuilder[], files?: AttachmentBuilder[] }) => void {
    return function callback(reply: { content?: string, embeds?: EmbedBuilder[] }): void {
        msg.reply(reply).catch(e => logger.error("Message reply error: " + e));
    }
}

/** Define command-name / metadata map.
 *  The map is used when events such as message creation, slash or interactions
 *  are triggered. These events call the handler methods to parse the input data
 *  and feed them to the actual co command. */
export const commandMetadatas: { [k: string]: CommandMetadata<any, any> } = {};

for (const commandMetadata of [
    pingCommandMetadata, inviteCommandMetadata, infoCommandMetadata,
    changelogsCommandMetadata, helpCommandMetadata, clapCommandMetadata,
    echoCommandMetadata,  paccoCommandMetadata, susCommandMetadata,
    coinflipCommandMetadata, picCommandMetadata, dripCommandMetadata,
    lessgoCommandMetadata, prefixCommandMetadata
]) {
    for(const alias of commandMetadata.aliases) {
        commandMetadatas[alias] = commandMetadata;
    }
}

    /*
    wiki: { category: "Internet", description: "Sends the Wikipedia link (and embed) of a topic.  },
    translate: { category: "Internet", description: "Translates some text in another language.", aliases: ["tl" },
    giggino: { category: "Internet", description: "Translates some text in napoletano.  },
    reddit: { category: "Internet", description :"Sends a post in hot from a given subreddit, if exists.", aliases: ["r", "r/" },

    play: { category: "Music", description: "Plays a song in your voice channel, loading the url or searching on YouTube.", aliases: ["p" },
    playmix: { category: "Music", description: "Plays a mix from a Youtube video url.", aliases: ["p" },
    skip: { category: "Music", description: "Skips the currently playing song.", aliases: ["s" },
    skipmix: { category: "Music", description: "Skips the currently playing mix.", aliases: ["sm" },
    back: { category: "Music", description: "Goes back to the recently played songs.", aliases: ["b" },
    remove: { category: "Music", description: "Removes songs from a particular index.", aliases: ["rm" },
    pause: { category: "Music", description: "Pauses the currently playing song.", aliases: ["ps" },
    resume: { category: "Music", description: "Resumes the currently paused song.", aliases: ["rs" },
    clear: { category: "Music", description: "Cleares the music queue and kicks the bot from the voice channel.  },
    leave: { category: "Music", description: "Kicks the bot out from the voice channel, but doesn't clear the current queue and other informations.", aliases: ["l" },
    join: { category: "Music", description: "The bot will join your voice channel. If there's something in the queue, it will play.", aliases: ["j" },
    loop: { category: "Music", description: "Changes the state of the loop of the music queue netween none, loop-song and loop-queue.", aliases: ["lp" },
    shuffle: { category: "Music", description: "Shuffles the songs in the queue.", aliases: ["sh" },
    bind: { category: "Music", description: "Binds the music bot to the current channel.  },
    nowplaying: { category: "Music", description: "Shows informations about the current song.", aliases: ["np" },
    queue: { category: "Music", description: "Shows informations about all the songs in the current queue.", aliases: ["q" },
    volume: { category: "Music", description: "Changes the volume of the music. Default: 1.", aliases: ["v" },
    favourites: { category: "Music", description: "Allows operations concerning the favourite music playlist, such as add songs or show the list.", aliases: ["f", "favs"] }
    */