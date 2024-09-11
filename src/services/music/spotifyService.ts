import axios from "axios";
import { ASong, SongType } from "./song";
import { YoutubeSong } from "./youtubeService";
import { Readable } from 'stream';
import ClassLogger from "../../utils/logger";

async function getSpotifyAccessToken() {
    // Retrieve Spotify HTML and extract authorization token
    const uri = "https://open.spotify.com";
    const html: string = (await axios.get(uri)).data as string;
    const accessToken: string | undefined = /{"accessToken":"([\w-]*)"/.exec(html)?.[1];
    ClassLogger.trace(`Retrieved Spotify accessToken: '${accessToken}'`);
    return accessToken;
}

export class SpotifySong extends ASong {
    static songRegex = /^https:\/\/open.spotify.com\/(?:intl-[\w]{0,3}\/)?track\/(.{22})(\?.*)?$/;
    static albumRegex = /^https:\/\/open.spotify.com\/(?:intl-[\w]{0,3}\/)?album\/(.{22})(\?.*)?$/;
    static playlistRegex = /^https:\/\/open.spotify.com\/(?:intl-[\w]{0,3}\/)?playlist\/(.{22})(\?.*)?$/;

    /** Parses an URL in order to check if it refers to a Spotify track.
     *  If it does, the track id is returned. */
    static getSongId(url: string): undefined | string {
        const result = SpotifySong.songRegex.exec(url);
        if(result && result.length > 1) return result[1];
    }

    /** Parses an URL in order to check if it refers to a Spotify album.
     *  If it does, the album id is returned. */
    static getAlbumId(url: string): undefined | string {
        const result = SpotifySong.albumRegex.exec(url);
        if(result && result.length > 1) return result[1];
    }

    /** Parses an URL in order to check if it refers to a Spotify playlist.
     *  If it does, the playlist id is returned. */
    static getPlaylistId(url: string): undefined | string {
        const result = SpotifySong.playlistRegex.exec(url);
        if(result && result.length > 1) return result[1];
    }

    /** Creates a song instance with the metadata retrieved from the Spotify
     *  APIs for the given song id. */
    static async getSongMetadata(id: string): Promise<SpotifySong> {
        ClassLogger.debug(`Retrieving Spotify song metadata for id: '${id}'`);

        // Retrieve song JSON metadata
        const response = await axios.get(`https://api-partner.spotify.com/pathfinder/v1/query`, { params:{
            "operationName": "getTrack",
            "variables": `{"uri":"spotify:track:${id}"}`,
            "extensions": "{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"ae85b52abb74d20a4c331d4143d4772c95f34757bfa8c625474b912b9055b5c0\"}}"
        }, headers: { "authorization": `Bearer ${await getSpotifyAccessToken()}` }})

        // Extract data from retrieved JSON
        const metadata: any = response.data.data.trackUnion;
        const lengthSeconds: number = Math.ceil(metadata.duration.totalMilliseconds / 1000);
        const name: string = metadata.name; // name + artists
        const artist: string = metadata.firstArtist.items.map((i: any) => i.profile.name).join(", ");
        const title: string = `${name} - ${artist}`;
        const thumbnail: string = metadata.albumOfTrack.coverArt.sources.pop().url;

        // Return Spotify song instance
        return new SpotifySong(title, `https://open.spotify.com/track/${id}`, lengthSeconds, thumbnail);
    }

    /** Returns a list of song instances with the metadata retrieved from the
     *  Spotify APIs for the given album id. */
    static async getAlbumMetadata(id: string): Promise<SpotifySong[]> {
        ClassLogger.debug(`Retrieving Spotify album metadata for id: '${id}'`);

        let offset = 0, limit = 500;
        let totalCount: number;
        const results: SpotifySong[] = [];

        do {
            // Retrieve album JSON metadata
            const response = await axios.get(`https://api-partner.spotify.com/pathfinder/v1/query`, { params:{
                "operationName": "getAlbum",
                "variables": `{"uri":"spotify:album:${id}","locale":"","offset":${offset},"limit":${limit}}`,
                "extensions": "{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"0b8f7f117d97694e0a2b3ce210ba17102f4a4ee7fcfbcd4caaac815b940ac5ef\"}}"
            }, headers: { "authorization": `Bearer ${await getSpotifyAccessToken()}` }})

            totalCount = response.data.data.albumUnion.tracksV2.totalCount;
            offset += limit;

            // Extract data from retrieved JSON
            const thumbnail = response.data.data.albumUnion.coverArt.sources.pop().url;
            const songs: any[] = response.data.data.albumUnion.tracksV2.items;
            
            results.push(...songs.map(({ track }) => {
                const lengthSeconds: number = Math.ceil(track.duration.totalMilliseconds / 1000);
                const name: string = track.name; // name + artists
                const artist: string = track.artists.items.map((i: any) => i.profile.name).join(", ");
                const title: string = `${name} - ${artist}`;
                const id: string = track.uri.split(":").pop();
        
                // Return Spotify song instance
                return new SpotifySong(title, `https://open.spotify.com/track/${id}`, lengthSeconds, thumbnail);
            }));

            // Keep retrieving until all the items are retrieved: Spotify query
            // has an item limit and the offset is increased in each iteration. 
        } while(totalCount > offset + limit);

        // Return accumulated results
        return results;
    }

    /** Returns a list of song instances with the metadata retrieved from the
     *  Spotify APIs for the given album id. */
    static async getPlaylistMetadata(id: string): Promise<SpotifySong[]> {
        ClassLogger.info(`Retrieving Spotify playlist metadata for id: '${id}'`);

        let offset = 0, limit = 500;
        let totalCount: number;
        const results: SpotifySong[] = [];

        do {
            ClassLogger.info(`id: ${id}   offset: ${offset}  limit: ${limit}`)

            // Retrieve album JSON metadata
            const response = await axios.get(`https://api-partner.spotify.com/pathfinder/v1/query`, { params:{
                "operationName": "fetchPlaylist",
                "variables": `{"uri":"spotify:playlist:${id}","offset":${offset},"limit":${limit}}`,
                "extensions": "{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"9086f110a0571ad24df2e16191f4efa31740df7bc11a2ee8b336f5d3a52e2bd8\"}}"
            }, headers: { "authorization": `Bearer ${await getSpotifyAccessToken()}` }})

            totalCount = response.data.data.playlistV2.content.totalCount;
            offset += limit;

            // Extract data from retrieved JSON
            const songs: SpotifySong[] = response.data.data.playlistV2.content.items.map(({ itemV2 }: any) => {
                // Only retrieve "real" (non local) tracks
                // TODO: handle podcasts?
                if(itemV2.__typename !== "TrackResponseWrapper") return null!;

                const track = itemV2.data;
                const lengthSeconds: number = Math.ceil(track.trackDuration.totalMilliseconds / 1000);
                const name: string = track.name; // name + artists
                const artist: string = track.artists.items.map((i: any) => i.profile.name).join(", ");
                const title: string = `${name} - ${artist}`;
                const thumbnail = track.albumOfTrack.coverArt.sources.pop().url;
                const id: string = track.uri.split(":").pop();
        
                // Return Spotify song instance
                return new SpotifySong(title, `https://open.spotify.com/track/${id}`, lengthSeconds, thumbnail);
            })
            // Filter skipped non real tracks (handled as nulls)
            .filter((i: SpotifySong | null) => i);

            results.push(...songs);

            // Keep retrieving until all the items are retrieved: Spotify query
            // has an item limit and the offset is increased in each iteration. 
        } while(totalCount > offset + limit);

        // Return accumulated results
        return results;
    }

    /** ==== CONSTRUCTOR ==================================================== */
    public constructor(title: string, uri: string, lengthSeconds: number, thumbnail?: string) {
        super(title, uri, SongType.SPOTIFY);
        this.thumbnail = thumbnail;
        this.lengthSeconds = lengthSeconds;
    }

    async getStream(): Promise<Readable> {
        // TODO: capire se possibile recuperare stream direttamente da Spotify

        const { items } = await YoutubeSong.search(this.title, 1);
        const youtubeSong = items[0];
        if(!youtubeSong) throw new Error("No Youtube result found.");

        return youtubeSong.getStream();
    }
}
/*
else if (spotifyPlaylistAlbum.test(url)) {                                                      // TODO: Populate url when the spotify song object gets played
    url = url.substring(8);
    const ind = url.indexOf("?");
    const spotifyPlaylistID = url.substring(url.lastIndexOf("/") + 1, ind >= 0 ? ind : url.length);

    const { addedSongs, playlistDuration, playlistTitle, playlistUrl, playlistThumbnail } = await this.getSpotifyPlaylistAlbumMetadata(spotifyPlaylistID, requestor, url.includes("album"));

    await this.addPlaylistLog(risp.channel, addedSongs, playlistTitle, playlistUrl, secondsToString(playlistDuration), requestor, oldLen, oldDurationSeconds, playlistThumbnail);
}*/

/*
export const getSpotifyPlaylistAlbumMetadata = async (query: string, requestor: string, album = false) => {
    let addedSongs: number = 0;                                                                                             //Canzoni aggiunte. Se 0, nessuna canzone trovata, query errata, ecc. Errore.
    let playlistDuration: number = 0;
    const { data }: { data: string } = await axios.get(`https://open.spotify.com/${album ? "album" : "playlist"}/${query}`,           //Richiedo info fingendomi browser, estraggo Bearer Auth Token da html
        { "headers": { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36" } });

    const { name, url } = JSON.parse(data.split(`<script type="application/ld+json">`)[1].split("</script>")[0]);   //JSON contenente dati della playlist
    const playlistTitle = name;                                                                                     //Titolo della playlist
    const playlistUrl = url;                                                                                        //URL della playlist
    const playlistThumbnail = data.split(`"og:image" content="`)[1].split(`"`)[0];                                  //Immagine di copertina della playlist
    const AUTHORIZATION = `Bearer ${data.split("accessToken\":\"")[1].split("\"")[0]}`;                             //TOKEN da utilizzare per le chiamate successive

    const results = [];
    let nextLink = `https://api.spotify.com/v1/${album ? "albums" : "playlists"}/${query}/tracks`;                  //Preparo primo URL per prendere le canzoni
    while (nextLink) {                                                                                              //Finchè il link esiste
        const responseData: any = (await axios.get(nextLink, {                                                           //Usa TOKEN x fingersi il browser
            "headers": {
                "authorization": AUTHORIZATION,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
            }
        })).data;                                                                                                   //E prende dati sulle canzoni

        addedSongs = responseData.total;
        nextLink = responseData.next;                                                                               //Link successivo x canzoni dopo (se più di 100)
        results.push(responseData.items);
    }

    return results;
}
*/