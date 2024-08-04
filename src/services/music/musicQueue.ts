import { ASong } from "./song";

/* ==== TYPE DEFINITION ===================================================== */
export enum LoopPolicy { NONE, SONG, ALL }

export abstract class MusicQueue {

    /* ==== CONSTRUCTOR ===================================================== */
    constructor(cacheSize: number = 5, loopPolicy: LoopPolicy = LoopPolicy.NONE) {
        this.cacheSize = cacheSize;
        this.loopPolicy = loopPolicy;
    }

    /* ==== PROPERTIES ====================================================== */
    /** Songs currently in queue. */
    public queue: ASong[] = [];
    /** Cache of songs that have already been played.
     *  Used for commands that rewind the playlist to play skipped songs.
     *  The cache has a maximum size defined by property `this.cacheSize`. */
    private cache: ASong[] = [];
    /** Max size of played songs cache. Provided as a constructor parameter. */
    private cacheSize: number;
    /** Changes the `skip()` command behaviour.
     *  "NONE": `skip()` effectively removes the current song.
     *  "SONG": `skip()` has no effect on queue - current song is played again.
     *  "ALL": `skip()` puts current song at the top of the queue. */
    private loopPolicy: LoopPolicy;

    /* ==== ABSTRACT METHODS ================================================ */
    public abstract play(): boolean;
    public abstract stop(): void;

    /* ==== PRIVATE METHODS ================================================= */
    /** Adds a song at last position of the cached songs.
     *  If maximum cache size is 0, nothing is cached.
     *  If maximum cache size is not 0 but has been reached, the oldest entry
     *  is removed from the cache and the new one is pushed. */
    private addToCache(song: ASong) {
        // Cache size == 0: do nothing
        if(!this.cacheSize) return;

        // If cache size has reached maximum, evict oldest entry before pushing
        if(this.cache.length == this.cacheSize) { this.cache.shift(); }
        
        // Save song to cache
        this.cache.push(song);
    }

    /* ==== METHODS ========================================================= */
    /** Add a new song to the queue. */
    public add(song: ASong) {
        this.queue.push(song);

        // If queue was empty, play new song
        // TODO: ok?
        if(this.queue.length == 1) {
            this.play();
        }
    }

    /** Remove first queue element (currently playing song).
     *  The command behaviour changes based on the loop policy.
     *  "NONE": effectively removes and caches the current song (if any).
     *  "SONG": has no effect on queue - current song is played again.
     *  "ALL": puts current song at the top of the queue. */
    public skip() {
        if(this.loopPolicy === LoopPolicy.NONE) {
            const song = this.queue.shift();
            if(song) this.addToCache(song);
        }
        
        else if(this.loopPolicy === LoopPolicy.ALL) {
            const song = this.queue.shift();
            if(song) this.add(song);
        } 
        // If LoopPolicy.SONG, queue is not to be modified, play current song

        // After updating queue, stop current song and play new one
        // TODO: ok?
        this.stop();
        this.play();
    }

    /** Remove last cache element (latest played song).
     *  If the cache wasn't empty, save song to played songs cache. */
    public back() {
        const song = this.cache.pop();
        if(song) this.queue.unshift(song);
        
        // After updating queue, stop current song and play new one
        // TODO: ok?
        this.stop();
        this.play();
    }

    /** Remove an element from the current queue, without caching the removed
     *  song. If the removed song was currently playing, the new current song
     *  must be played. */
    public remove(index: number) {
        this.queue.splice(index, 1);

        // If the removed song is at position 0, it means it is being played.
        // Stop it and play the new one in queue (if any).
        // TODO: ok?
        if(index == 0) {
            this.stop();
            this.play();
        }
    }

    //! `clear()` not implemented: delete this object entry (and stop playing?)

    // TODO: is `pause()` to be implemented here?
    // TODO: is `resume()` to be implemented here?

    /** Updates the current loop policy for this player. */
    public setLoopPolicy(loopPolicy: LoopPolicy) {
        this.loopPolicy = loopPolicy;
    }

    /** Randomly changes the position of all the songs in the queue, except
     *  for the currently playing one. */
    public shuffle() {
        for (let i = 1; i < this.queue.length; i++) {
            const j = Math.floor(Math.random() * (this.queue.length - 1)) + 1;
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
    }

    /** Retrieves the currently playing song. */
    public getCurrent(): ASong | undefined {
        return this.queue.at(0);
    }
}