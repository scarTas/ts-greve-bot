import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { DynamicMessage } from "./dynamicMessage";
import { MusicPlayer } from "./musicPlayer";
import { secondsToString } from "../../utils/length";
import { ASong } from "./song";

const RESULTS_PER_PAGE: number = 10;

export class QueueMessage extends DynamicMessage {
    public currentPage: number = 0;

    private getLastPage(musicPlayer: MusicPlayer): number {
        return Math.floor(musicPlayer.queue.length / RESULTS_PER_PAGE);
    }

    private getContent(musicPlayer: MusicPlayer, page: number, lastPage: number): string {
        const queue = musicPlayer.queue;

        // If queue is empty, return default message
        if(!queue.length) return "```swift\n                             Nothing to see here.```";

        // If provided page is negative (invalid), use 0 instead (first page)
        if(page < 0) {
            this.currentPage = 0;
        }

        // If provided page is too high (first result number doesn't exist),
        // use last page instead
        if((page * RESULTS_PER_PAGE) + 1 > queue.length) {
            this.currentPage = lastPage;
        }

        // Generate header with queue summary
        const queueLength: string = secondsToString(queue.reduce((total, song) => total += song.lengthSeconds || 0, 0));
        const header = `\`\`\`swift\n${queue.length} enqueued songs - Total duration: ${queueLength}\n\n`;

        // Retrieve the first RESULT_PER_PAGE songs at the page position 
        const firstIndex = this.currentPage * RESULTS_PER_PAGE;
        const songs = queue.slice(firstIndex, firstIndex+RESULTS_PER_PAGE);

        // For each song in the queue, extract queue position, title and length
        const body = songs.map((s: ASong, index: number) => {
            const songLength: string = s.lengthSeconds ? secondsToString(s.lengthSeconds) : "???";
            return `${index + 1}) ${s.title}    ${songLength}`;
        }).join("\n");

        // Generate footer with page summary
        const footer = `\n\nPage ${this.currentPage + 1}/${lastPage + 1}                 ${
            this.currentPage === lastPage 
                ? `Nothing else to see here. `
                : `${queue.length - ((this.currentPage) * RESULTS_PER_PAGE + songs.length)
            } more songs... `}`
            + `\`\`\``;

        return header + body + footer;
    }

    updateContent(musicPlayer: MusicPlayer, page: number = this.currentPage): DynamicMessage | undefined {
        const lastPage = this.getLastPage(musicPlayer);

        const content = this.getContent(musicPlayer, page, lastPage);
        
        // Generate embed reactions to be used as command shortcuts
        const component = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`queue-first`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("877853994255527946")
                .setDisabled(this.currentPage === 0),

            new ButtonBuilder()
                .setCustomId(`queue-previous`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("877853994255527946")
                .setDisabled(this.currentPage === 0),

            new ButtonBuilder()
                .setCustomId(`queue-next`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("877853994326851634")
                .setDisabled(this.currentPage === lastPage),

            new ButtonBuilder()
                .setCustomId(`queue-last`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("877853994326851634")
                .setDisabled(this.currentPage === lastPage),

            new ButtonBuilder()
                .setCustomId(`queue-delete`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("✖️")
        );


        return super.setContent({ content, components: [component] });
    }
}