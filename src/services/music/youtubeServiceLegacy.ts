import axios from "axios";
import { YoutubeSong } from "./youtubeService";

export const cookie = undefined; // TODO: remove

export const getYoutubeInitData = async (url: string): Promise<any> => {
    //axios.get(encodeURI(url) + '&sp=EgIQAQ%253D%253D').then(page => {
    // axios.get(url + '&sp=EgIQAQ%253D%253D').then(page => {
    const { data }: { data: string } = await axios.get(url, { headers: { cookie }});

    // Ricava JSON principale di YouTube
    const initData = JSON.parse(data.split('var ytInitialData =')[1].split("</script>")[0].slice(0, -1));

    // Ricava API key (se esiste)
    const innerTubeApiKey: string[] = data.split("innertubeApiKey");
    const apiToken: string | undefined = innerTubeApiKey.length > 0 ? innerTubeApiKey[1].trim().split(",")[0].split('"')[2] : undefined;

    // Ricava context (se esiste)
    const innerTubeContext: string[] = data.split('INNERTUBE_CONTEXT');
    const context: string = innerTubeContext.length > 0 ? JSON.parse(innerTubeContext[1].trim().slice(2, -2)) : null;

    return { initData, apiToken, context };
};

export async function getPlaylistSongs(id: string): Promise<YoutubeSong[]> {
    const endpoint = `https://www.youtube.com/playlist?list=${id}`;
    const { initData, apiToken, context } = await getYoutubeInitData(endpoint);

    const items: YoutubeSong[] = [];
    let continuation: any | undefined = undefined;
    do {
        let lastItem: any | undefined = undefined;
        
        // Retrieve first 100 playlist elements + continuation data
        if(continuation === undefined) {
            const contents = initData.contents.twoColumnBrowseResultsRenderer.tabs[0]
                .tabRenderer.content.sectionListRenderer.contents[0]
                .itemSectionRenderer.contents[0]
                .playlistVideoListRenderer.contents;
            lastItem = contents[contents.length - 1];

            // {"continuationItemRenderer":{"trigger":"CONTINUATION_TRIGGER_ON_ITEM_SHOWN","continuationEndpoint":{"clickTrackingParams":"CCQQ7zsYACITCOPC3-SGoogDFcJdegUduTYrDw==","commandMetadata":{"webCommandMetadata":{"sendPost":true,"apiUrl":"/youtubei/v1/browse"}},"continuationCommand":{"token":"4qmFsgKSAhIkVkxQTGhEWFYwaW5ueWFXM2luU0pRTjFyZ0ZKMU03STZGTUE2GsQBQ0FGNmpnRlFWRHBEUjFGcFJVUkNSMUpWUlRGU2FtYzFUMVJOTTFGclNURk5SRmx2UVZWcE5qaGZia2RmWDNsR1FURkJRbGRyVldsUk1teExWVlpTU0dGRlZsaFNiR3d6V1Zaak1XUlhWbGhTYkdoT1RXMTRNVlpVUW5kVmJGSnhVbTVzWVUxR2NFeFVWbFYzVFRGT1ZWZHJaRlZXVlZWNVVsZGtNMU5VVGs1VlNFcDZWVlpzVW1Fd01IcGthbEl6VWxOSpoCIlBMaERYVjBpbm55YVczaW5TSlFOMXJnRkoxTTdJNkZNQTY%3D","request":"CONTINUATION_REQUEST_TYPE_BROWSE"}}}}

            items.push( ...getResultsFromPlaylistContents(contents) );
        }
        
        // If continuation token is present, retrieve next (102+) elements
        else {
            const { data }: any = await axios.post(`https://www.youtube.com/youtubei/v1/browse?key=${apiToken}`,
                { context, continuation }, { headers: { "content-type": "application/json" } });
            if(data.onResponseReceivedActions) {
                const contents = data.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;
                lastItem = contents[contents.length - 1];

                items.push( ...getResultsFromPlaylistContents(contents) );
            }
        }

        // Last item should contain continuation token (100+ elements playlists)
        // If token is present, keep looping
        continuation = lastItem?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
    } while(continuation);

    return items;
    //return { items, metadata: initData.metadata };                          //Ritorno la lista di tutti i video e dati relativi alla playlist
};

export function getResultsFromPlaylistContents(contents: any): YoutubeSong[] {
    const results = [];
    for(const item of contents) {
        const videoRender = item.playlistVideoRenderer;
        if (videoRender?.videoId) {
            const thumb: string | undefined = videoRender.thumbnail?.thumbnails?.pop()?.url;

            const lengthString: string = videoRender.lengthText?.simpleText;
            const lengthSeconds: number = parseInt(videoRender.lengthSeconds);

            results.push(new YoutubeSong(videoRender.title.runs[0].text, videoRender.videoId,
                lengthSeconds, lengthString, thumb));
        }
    }
    return results;
}

/*
const getResultsFromContents = (contents, withPlaylist: boolean): any[] => {
    const results = [];
    for(const item of contents) {
        const videoRender = item.videoRenderer;
        const playListRender = item.playlistRenderer;

        // Se si tratta di un video, aggiungilo
        if (videoRender?.videoId)
            results.push({ id: videoRender.videoId, type: YT_RESULT_TYPES.VIDEO, thumbnail: videoRender.thumbnail, title: videoRender.title.runs[0].text, length: videoRender.lengthText });
        
        // Se si tratta di una playlist, aggiungila se il flag withPlaylist è true
        else if (withPlaylist && playListRender?.playlistId)
            results.push({ id: playListRender.playlistId, type: YT_RESULT_TYPES.PLAYLIST, thumbnail: playListRender.thumbnails, title: playListRender.title.simpleText, length: playListRender.videoCount });
    }
    return results;
}
*/