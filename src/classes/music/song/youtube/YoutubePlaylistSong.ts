import { ASong, SongType } from "../ASong";

export class YoutubePlaylistSong extends ASong {

    /* ==== CONSTRUCTOR ===================================================== */
    /** Initialize required data, add playlist URI and custom length, which is
     *  not a timestamp but is the size of the Playlist in items. */
    public constructor(title: string, id: string, size: number) {
        super(SongType.YOUTUBE_PLAYLIST, id, title, `https://www.youtube.com/playlist?list=${id}`);
        this.lengthString = `Playlist ${size}`;
    }

    //! getStream is not implemented! This song type is not meant to be played.

    /* ==== STATIC PROEPRTIES =============================================== */
    /** Regex that matches a valid Youtube playlist uri and extract its id. */
    private static regex: RegExp = /youtu(?:\.be|be(?:-nocookie)?\.com)\/playlist\?list=([0-9a-zA-Z_-]{18,41})$/;

    /** Validates a Youtube URI, returning the playlist id if the URI is valid. */
    public static getPlaylistId = function(url: string): undefined | string {
        const result = YoutubePlaylistSong.regex.exec(url);
        if(result && result.length > 1) return result[1];
    }


    /* DEPRECATED: YouTubeSearchApi cannot retrieve 100+ songs from playlists.
    public static async getPlaylistSongs(id: string): Promise<YoutubeSong[]> {
        let { items } = await YouTubeSearchApi.GetPlaylistData(id);
        return items.map(({ id, title, length, thumbnail }: any) => {
            const thumb: string | undefined = thumbnail?.thumbnails?.pop()?.url;
            const lengthString: string = length?.simpleText;
            const lengthSeconds: number = (lengthString && lengthString.includes(':')) ? stringToSeconds(lengthString) : 0;
            return new YoutubeSong(title, id, lengthSeconds, lengthString, thumb);
        });
    }*/
}