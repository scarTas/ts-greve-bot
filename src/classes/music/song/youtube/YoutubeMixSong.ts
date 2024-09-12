import axios from "axios";
import { YoutubeSong } from "../../../../services/music/youtubeService";
import { stringToSeconds } from "../../../../utils/length";
import { ASong, SongType } from "../ASong";
import { Logger } from "../../../logging/Logger";
import { Readable } from 'stream';

export class YoutubeMixSong extends ASong {
  
    static async getYoutubeMixIds(videoId: string): Promise<YoutubeMixSong> {
        const { data }: { data: string } = await axios.get(`https://www.youtube.com/watch?v=${videoId}&list=RD${videoId}`/*, { headers: { cookie }}*/)
    
        const json = JSON.parse(data.split('var ytInitialData =')[1].split("</script>")[0].slice(0, -1));

        const trackings: any[] = json.responseContext.serviceTrackingParams;
        const trackingParams: any[] = trackings.filter(t => t.service === "GFEEDBACK")[0].params;
        const visitorData: string = trackingParams.filter(t => t.key === "visitor_data")[0].value;
    
        const items: any[] = json.contents.twoColumnWatchNextResults.playlist.playlist.contents;
    
        const queue: YoutubeSong[] = items.map(({ playlistPanelVideoRenderer: item }) => {
            const lengthString = item.lengthText.simpleText;
            const thumbnail = item.thumbnail.thumbnails.pop().url;
    
            return new YoutubeSong(item.title.simpleText, item.videoId,
                    stringToSeconds(lengthString), lengthString, thumbnail);
        });

        return new YoutubeMixSong(videoId, visitorData, queue);
    }

    async getNextMixVideos() {
        const { data }: { data: any } = await axios.post(`https://www.youtube.com/youtubei/v1/next?prettyPrint=false`,
        {
            "context": {
                "client": {
                    "visitorData": this.visitorData,
                    "clientName": "WEB",
                    "clientVersion": "2.20240910.03.00",
                }
            },
            "videoId": this.lastVideoId,
            "playlistId": `RD${this.id}`
        }/*,
        { headers: { cookie }}*/);
    
        const items: any[] = data.contents.twoColumnWatchNextResults.playlist.playlist.contents;
    
        const queue: YoutubeSong[] = items.map(({ playlistPanelVideoRenderer: item }) => {
            const lengthString = item.lengthText.simpleText;
            const thumbnail = item.thumbnail.thumbnails.pop().url;
    
            return new YoutubeSong(item.title.simpleText, item.videoId,
                    stringToSeconds(lengthString), lengthString, thumbnail);
        });
        Logger.debug(`Retrieved ${queue.length} new mix items: ${queue.map(i => i.id)}`);

        // Only add to the queue the elements 
        // Not found => -1, +1 is 0, which is OK
        const startIndex = queue.findIndex(i => i.id === this.lastVideoId) + 1;
        const filteredQueue = queue.slice(startIndex);

        Logger.debug(`Adding to queue ${filteredQueue.length} new mix items: ${filteredQueue.map(i => i.id)}`);
        this.queue.push(...filteredQueue);
    }

    queue: YoutubeSong[] = [];
    //playedIds?: Set<string> | undefined;
    visitorData: string | undefined;
    lastVideoId: string | undefined;

    public constructor(id: string, visitorData: string, queue: YoutubeSong[]) {
        super(SongType.YOUTUBE_MIX, id, "MIX", `https://www.youtube.com/watch?v=${id}&list=RD${id}`);
        this.visitorData = visitorData;
        this.queue = queue;

        // Update metadata with current song's
        this.updateMetadata();
    }

    private updateMetadata() {
        const song = this.queue[0];
        this.title = `MIX - ${song.title}`;
        this.uri = `https://www.youtube.com/watch?v=${song.id}&list=RD${this.id}`;
        this.lengthSeconds = song.lengthSeconds;
        this.lengthString = song.lengthString;
        this.thumbnail = song.thumbnail
    }

    async skip(): Promise<boolean> {
        // Remove first element in the queue
        this.lastVideoId = this.queue.shift()?.id;

        //! Per simulare queue completamente svuotata
        //!this.lastVideoId = this.queue.pop()?.id;
        //!this.queue = [];

        // If there are no more elements, retrieve new elements
        if(!this.queue.length) {
            // TODO: retrieve new mix songs and skip already played ids
            await this.getNextMixVideos();
        }

        // Update metadata with current song's
        this.updateMetadata();

        // Mixs are infinite, return true since there is always something to play
        return true;
    }

    // Return the stream of the current first inner song
    getStream(): Readable { return this.queue[0].getStream(); }
}