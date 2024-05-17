import { GatewayIntentBits, Options, Client, ActivityType, CacheFactory, ColorResolvable } from 'discord.js';
import ClassLogger from "./utils/logger";
import { onReady } from './events/onReady';
import onMessageCreate from './events/onMessageCreate';

/* ==== TYPE DEFINITION ===================================================== */
/** Constant for all embeds sent, but not meaningful as bot instance propery. */
export const embedColor: ColorResolvable = Number.parseInt(process.env.EMBED_COLOR as string) ?? "Random";

/** Main class that rapresents the bot itself.
 *  On init, logs the bot into Discord and starts listening to the events */
export default class HaramLeotta extends Client {

    /* ==== STATIC PROPERTIES =============================================== */
    /** Define caching policies - do not cache anything that is not used. */
    private static readonly makeCache: CacheFactory = Options.cacheWithLimits({
        MessageManager: 25,
        GuildBanManager: 0,
        BaseGuildEmojiManager: 0,
        GuildEmojiManager: 0,
        GuildInviteManager: 0,
        GuildStickerManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        ApplicationCommandManager: 0,
        PresenceManager: 0,
        StageInstanceManager: 0
    });

    /** Define permissions needed for the bot to operate. */
    private static readonly intents: GatewayIntentBits[] = [
        // Messages
        GatewayIntentBits.MessageContent,

        // Direct messagesLogger
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,

        // Guild
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks
    ]

    /* ==== SINGLETON ======================================================= */
    /** Private constructor to ensure no une instance the bot again.
     *  Configuration is defined in the class itself and used directly. */
    private constructor() {
        super({ makeCache: HaramLeotta.makeCache, intents: HaramLeotta.intents });
        this.version = process.env.VERSION ?? "SNAPSHOT";
        this.embedColor = embedColor;
    }
    /** Singleton bot instance - initialized and retrieved with Self::get(). */
    private static instance: HaramLeotta;

    /** Method to be used to create / retrieve the singleton bot instance. */
    public static get() {
        if(!HaramLeotta.instance) HaramLeotta.instance = new HaramLeotta();
        return HaramLeotta.instance;
    }

    /* ==== INSTANCE PROPERTIES & METHODS =================================== */
    /** Instance logger with default prefix. */
    public logger = new ClassLogger("HaramLeotta");
    /** Current bot release version. */
    public version: string;
    /** Color to be used for all of the created embeds. */
    public embedColor: ColorResolvable;

    /** Define bot startup behaviour - login and start listening to events. */
    public init = () => {
        this.logger.info(`Deployment started on env [${process.env.NODE_ENV}] and version [${this.version}]`);

        // Bot login
        this.login(process.env.TOKEN);

        // On bot login event, execute only once     
        this.once("ready", onReady.bind(null, this));
        this.logger.info("Listening on event 'ready'");

        // On message created (sent), execute every time  
        this.on("messageCreate", onMessageCreate.bind(null, this));
        this.logger.info("Listening on event 'messageCreate'");
    }

    /** Update bot custom activity and yellow status (presence) on startup */
    public updatePresence() {
        this.user?.setPresence({
            activities: [{
                type: ActivityType.Watching,
                name: `you from the keyhole`
            }],
            status: 'idle'
        });
    }
}

/* ==== INIT ================================================================ */
// Initialize bot instance to log in and start listening to events
HaramLeotta.get().init();

/*
process.on("unhandledRejection", e => {
	logger.error(`Unhandled promise rejection: ${e}`);
});
*/