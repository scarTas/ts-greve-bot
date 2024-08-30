import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, Message, TextBasedChannel, TextChannel } from "discord.js";
import { DynamicMessage } from "./dynamicMessage";
import { MusicPlayer } from "../musicPlayer";
import { ASong } from "../song";
import { YoutubeSong } from "../youtubeService";
import ClassLogger from "../../../utils/logger";
import { sleep } from "../../../utils/sleep";

const RESULTS_PER_PAGE: number = 10;

export class QueryMessage extends DynamicMessage {

    /* ==== STATIC PROPERTIES =============================================== */
    /** Map used to memorize music oplayer information relatively to servers. */
    public static cache: Map<string, QueryMessage> = new Map();
    /** Set used to lock cache entries to aviod concurrency issues. */
    public static locks: Set<string> = new Set();

    /* ==== STATIC METHODS ================================================== */
    /** To be used before musicPlayer instance retrival.
     *  Locks the musicPlayer instance in the lock map to avoid concurrency. */
    protected static lock = async function (groupId: string, reason?: string) {
        // This functionality has a lock on the entire cache group, to avoid
        // concurrency issues: this method may modify the entry.
        //! "Loop" must use an async method - read RedditService for more info.
        while (QueryMessage.locks.has(groupId)) await sleep(0);
        QueryMessage.locks.add(groupId);
        ClassLogger.debug(`${groupId} locked [${reason}]`);
    }

    /** To be used after finishing maniuplating the musicPlayer instance.
     *  Unlocks the musicPlayer instance in the lock map. */
    protected static unlock = function (groupId: string, reason?: string) {
        // Whatever happens, remove lock at all costs
        QueryMessage.locks.delete(groupId);
        ClassLogger.debug(`${groupId} unlocked [${reason}]`);
    }

    /** Wraps callback execution in try-finally block with musicPlayer locks. */
    public static async locking<O>(groupId: string, callback: () => O, reason?: string): Promise<O> {
        // Wait for the lock to free up and lock for this process
        await QueryMessage.lock(groupId, reason);
        try {
            return await callback();
        } finally {
            // Whatever happens, unlock instance after calback execution
            QueryMessage.unlock(groupId, reason);
        }
    }

    /** To be used to perform methods on a musicPlayer instance.
     *  QueryMessage instances can only retrieved and used with this method,
     *  which locks the instance used to avoid concurrency.
     *  After the callback function is completed, the lock is free'd. */
    public static async get(msg: Message | Interaction, callback: (message: QueryMessage) => any, query?: string): Promise<void> {
        // Retrieve server id + user id as cache lock policy.
        // If there is no guild, return; the message was probably sent in PMs.
        if (!msg.guild?.id || !msg.member?.user.id) return;
        const groupId: string | undefined = msg.guild.id + msg.member.user.id;

        // Check for textChannel - if none, return
        const textChannel: TextChannel | undefined = MusicPlayer.checkTextChannelPermissions(msg);
        if(!textChannel) return;

        // Retrieve musicPlayer and execute requested logic safely (with locks)
        QueryMessage.locking(groupId, async () => {
            // Retrieve message from cache (exit if not present)
            let queryMessage: QueryMessage | undefined = QueryMessage.cache.get(groupId);
            if (query) {
                if(queryMessage) await queryMessage.delete();

                queryMessage = new QueryMessage(textChannel, groupId, query);
                QueryMessage.cache.set(groupId, queryMessage);
            }

            if(!queryMessage) return;

            await callback(queryMessage);
        }, "QueryMessage::get");
    }

    /* ==== CONSTRUCTOR ===================================================== */
    constructor(textChannel: TextBasedChannel, groupId: string, query: string) {
        super(textChannel);
        this.groupId = groupId;
        this.query = query;
    }

    public groupId: string;
    public currentPage: number = 0;
    public queue: ASong[] = [];

    public query: string;
    public nextPage?: object = undefined;

    /** Generates the message string content containing the list of songs in the
     *  queue for at the specified page index.
     *  If the page number is invalid, it is normalized (if < 0, 0 is used;
     *  if > last possible page, last page is used).
     *  The displayed page index is saved in the queueMessage istance. */
    private async getContent(page: number): Promise<string> {
        let lastPage: number = Math.ceil(this.queue.length / RESULTS_PER_PAGE) - 1;

        // If provided page is negative (invalid), use 0 instead (first page)
        if(page < 0) {
            page = 0;
        }

        // If provided page is too high (first result number doesn't exist),
        // ensure the page is immediately the last one + 1 and retrieve new results
        if((page * RESULTS_PER_PAGE) + 1 > this.queue.length) {
            page = lastPage + 1;
            if(!this.queue.length) {
                page = 0;
            }

            const { items, nextPage } = await YoutubeSong.search(this.query, RESULTS_PER_PAGE, this.nextPage);
            this.queue.push(...items);
            if(!this.queue.length) return "```swift\n                             No results found.```";

            this.nextPage = nextPage;

            // After retrieving new songs, refresh lastPage
            lastPage = Math.ceil(this.queue.length / RESULTS_PER_PAGE) - 1;
        }


        // Update current displaying page
        this.currentPage = page;

        // Retrieve the first RESULT_PER_PAGE songs at the page index 
        const firstIndex = this.currentPage * RESULTS_PER_PAGE;
        const songs = this.queue.slice(firstIndex, firstIndex+RESULTS_PER_PAGE);


        // Generate header with queue summary
        const header = `\`\`\`swift\nResults for "${this.query}" (${this.queue.length} results)\n\n`;

        // For each song in the queue, extract queue position, title and length
        const body = songs.map((s: ASong, index: number) => {
            const songLength: string = s.lengthString || "???";
            return `${index + firstIndex + 1}) [${songLength}] ${s.title}`;
        }).join("\n");

        // Generate footer with page summary
        const footer = `\n\nPage ${this.currentPage + 1}/${lastPage + 1}            Choose a video typing "<n>"\`\`\``;

        return header + body + footer;
    }

    /** Generates the new message content for the queueMessage and creates the
     *  button interactions used by users to navigate the queue. */
    public async updateContent(page: number = this.currentPage): Promise<DynamicMessage | undefined> {
        const content = await this.getContent(page);
        
        // Generate embed reactions to be used as command shortcuts
        const component = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(`query-previous`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("877853994255527946")
                .setDisabled(this.currentPage === 0),

            new ButtonBuilder()
                .setCustomId(`query-next`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("877853994326851634")
                .setDisabled(this.queue.length === 0),

            new ButtonBuilder()
                .setCustomId(`query-delete`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("✖️")
        );

        return super.setContent({ content, components: [component] });
    }

    /** Updates the message content to display the previous queue page index. */
    public async previous(): Promise<DynamicMessage | undefined> {
        return await this.updateContent(this.currentPage - 1);
    }
    /** Updates the message content to display the next queue page index. */
    public async next(): Promise<DynamicMessage | undefined> {
        return await this.updateContent(this.currentPage + 1);
    }

    /** Retrieves the song at the provided index. If the index is out of bounds,
     *  undefined is returned. */
    public getSong(index: number): ASong | undefined {
        return this.queue[index];
    }

    /** Deletes the message and removes this instance from the cache. */
    public async destroy() {
        await this.delete();
        QueryMessage.cache.delete(this.groupId);
    }
}