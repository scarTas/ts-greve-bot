import { GuildMember, Interaction, Message, PermissionsBitField, VoiceBasedChannel } from "discord.js";
import { LoopPolicy, MusicQueue } from "./musicQueue";
import { AudioPlayer, AudioPlayerError, AudioPlayerPlayingState, AudioPlayerState, AudioPlayerStatus, AudioResource, StreamType, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from "@discordjs/voice";
import ClassLogger from "../../utils/logger";
import { Readable } from 'stream';
import { sleep } from "../../utils/sleep";
import { ASong } from "./song";
import { YoutubeSong } from "./youtubeService";


export class MusicPlayer extends MusicQueue {

    /* ==== STATIC PROPERTIES =============================================== */
    protected static logger = new ClassLogger("MusicPlayer");

    /** Map used to memorize music oplayer information relatively to servers. */
    public static cache: Map<string, MusicPlayer> = new Map();
    /** Set used to lock cache entries to aviod concurrency issues. */
    public static locks: Set<string> = new Set();

    /* ==== STATIC METHODS ================================================== */
    /** To be used before musicPlayer instance retrival.
     *  Locks the musicPlayer instance in the lock map to avoid concurrency. */
    protected static lock = async function (groupId: string, reason?: string) {
        // This functionality has a lock on the entire cache group, to avoid
        // concurrency issues: this method may modify the entry.
        //! "Loop" must use an async method - read RedditService for more info.
        while (MusicPlayer.locks.has(groupId)) await sleep(0);
        MusicPlayer.locks.add(groupId);
        MusicPlayer.logger.debug(`${groupId} locked [${reason}]`);
    }

    /** To be used after finishing maniuplating the musicPlayer instance.
     *  Unlocks the musicPlayer instance in the lock map. */
    protected static unlock = function (groupId: string, reason?: string) {
        // Whatever happens, remove lock at all costs
        MusicPlayer.locks.delete(groupId);
        MusicPlayer.logger.debug(`${groupId} unlocked [${reason}]`);
    }

    /** Wraps callback execution in try-finally block with musicPlayer locks. */
    public static async locking<O>(groupId: string, callback: () => O, reason?: string): Promise<O> {
        // Wait for the lock to free up and lock for this process
        await MusicPlayer.lock(groupId, reason);
        try {
            return callback();
        } finally {
            // Whatever happens, unlock instance after calback execution
            MusicPlayer.unlock(groupId, reason);
        }
    }

    /** Checks whether the user that sent the message / interaction has actually
     *  joined a voice channel in which the bot has permissions. If it has, the
     *  voiceChannel instance is returned. */
    protected static async checkVoicePresence (i: Message | Interaction): Promise<VoiceBasedChannel | undefined> {
        let member: GuildMember | undefined;

        // If user is cached, retrieve it directly from the message/interaction
        if (i.member instanceof GuildMember) {
            member = i.member;
        }

        // If it's not, fetch it
        else {
            member = await i.guild?.members.fetch(i.member?.user.id as string)
                .catch(_ => undefined);
        }

        // Check if the member is found and has a voice channel
        const channel: VoiceBasedChannel | undefined | null = member?.voice.channel;

        // If member not found or has no voice channel, return
        if (!channel) return;

        // Retrieve voice channel permissions for "me" (bot user)
        const me = channel.guild.members.me;
        if (!me) return;
        const permissions = channel.permissionsFor(me);

        // Check if bot can join and speak in the voice channel
        if (!permissions.has(PermissionsBitField.Flags.Connect)) return;
        if (!permissions.has(PermissionsBitField.Flags.Speak)) return;
        return channel;
    }

    /** To be used to perform methods on a musicPlayer instance.
     *  MusicPlayer instances can only retrieved and used with this method,
     *  which locks the instance used to avoid concurrency.
     *  After the callback function is completed, the lock is free'd. */
    public static async get(msg: Message | Interaction, callback: (player: MusicPlayer) => any): Promise<void> {
        // Retrieve server id as cache lock policy.
        // If there is no guild, return; the message was probably sent in PMs.
        const groupId: string | undefined = msg.guild?.id;
        if (!groupId) return;

        // Check if user is in a voice channel in which the bot has permissions
        const voiceChannel: VoiceBasedChannel | undefined = await MusicPlayer.checkVoicePresence(msg);
        if (!voiceChannel) return;

        // Retrieve musicPlayer and execute requested logic safely (with locks)
        MusicPlayer.locking(groupId, async () => {
            // Retrieve player from cache (create instance if it not present)
            let musicPlayer: MusicPlayer | undefined = MusicPlayer.cache.get(groupId);
            if (!musicPlayer) {
                musicPlayer = new MusicPlayer(voiceChannel, groupId);
                MusicPlayer.cache.set(groupId, musicPlayer);
            }

            // If player had a voice channel, check if it's the same as user's
            if (musicPlayer.voiceChannel.id !== voiceChannel.id) return;

            //return player;
            await callback(musicPlayer);
        }, "MusicPlayer::get");

        /*
        // Wait for the lock to free up and lock for this process
        await MusicPlayer.lock(groupId);

        try {
            // Retrieve player from cache (create instance if it not present)
            let musicPlayer: MusicPlayer | undefined = MusicPlayer.cache.get(groupId);
            if (!musicPlayer) {
                musicPlayer = new MusicPlayer(voiceChannel, groupId);
                MusicPlayer.cache.set(groupId, musicPlayer);
            }

            // If player had a voice channel, check if it's the same as user's
            if (musicPlayer.voiceChannel.id !== voiceChannel.id) return;

            //return player;

            await callback(musicPlayer);
        } finally {
            MusicPlayer.unlock(groupId);
        }
        */
    }

    /* ==== CONSTRUCTOR ===================================================== */
    /** MusicPlayer instances can only be created from the get() method in case
     *  the provided groupId is not present in the musicPlayer list. */
    protected constructor(voiceChannel: VoiceBasedChannel, groupId: string) {
        super(5, LoopPolicy.NONE);
        this.voiceChannel = voiceChannel;
        this.groupId = groupId;

        // Initialize inner player and subscribe to meaningful events
        this.player = createAudioPlayer();

        // Override previous implementation adding the "manual" parameter;
        // used to tell apart "resourced finished" from "resourced stopped".
        this.player.stop = function (force = false, manual: boolean = false) {
            if (this.state.status === "idle" /* Idle */)
                return false;
              if (force || this.state.resource.silencePaddingFrames === 0) {
                this.state = {
                  status: "idle", manual
                } as any;
              } else if (this.state.resource.silenceRemaining === -1) {
                this.state.resource.silenceRemaining = this.state.resource.silencePaddingFrames;
              }
              return true;
        };

        // If errors occur during reproduction, skip broken resource
        this.player.on("error", (error: AudioPlayerError) => {
            MusicPlayer.logger.error("player.error: ", error);
            MusicPlayer.locking(this.groupId, () => this.skip(), "player error -> this.skip");
        });

        // If state transitions from Playing to Idle, a resources stopped
        // playing - that could be due to it finishing or due to manual stop.
        // If the resource finished playing, skip to the next song.
        // If the resource has been manually stopped, do nothing.
        this.player.on("stateChange", (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            MusicPlayer.logger.trace(`player.stateChange: ${oldState.status} -> ${newState.status}`);

            if (
                oldState.status === AudioPlayerStatus.Playing
                && newState.status === AudioPlayerStatus.Idle
                && !(newState as any).manual
            ) {
                MusicPlayer.locking(this.groupId, () => this.skip(), "player stateChange -> finished");
            }
        });
    }

    /* ==== PROPERTIES ====================================================== */
    /** Voice channel in which the bot is connected to play the music.
     *  Cannot be undefined. */
    public voiceChannel: VoiceBasedChannel;
    /** Key used for locking logic. Events can start self-locking processes. */
    public groupId: string;
    /** Manages the resources being played on the connection, and contains
     *  informations about the current state of the playing resource. */
    public player: AudioPlayer;
    /** Resource audio volume. Initialized at 1. */
    public volume: number = 1;

    /** Actual connection to the voice channel. */
    public connection: VoiceConnection | undefined = undefined;
    /** Current playing song object; contains actual data stream with audio
     *  playing and metadata and other settings (volume, duration, ...). */
    public resource: AudioResource | undefined = undefined;

    /* ==== METHODS ========================================================= */
    /** Connect the bot to the selected voice channel, if the connection hasn't
     *  been established already or it has been terminated. */
    public connect() {
        // If the connection already exists, check its current state
        if (this.connection) {
            // If connection is valid (not disconnected or destroyed), return
            if (
                this.connection?.state.status !== VoiceConnectionStatus.Destroyed &&
                this.connection?.state.status !== VoiceConnectionStatus.Disconnected
            ) return;

            // If connection is invalid, destroy before reconnecting
            this.disconnect();
        }

        // Instance new voice channel connection
        this.connection = joinVoiceChannel({
            channelId: this.voiceChannel.id, guildId: this.voiceChannel.guildId,
            adapterCreator: (this.voiceChannel.guild.voiceAdapterCreator)
        });

        this.connection.on("stateChange", async (_, newState) => {
            MusicPlayer.logger.trace("Connection state changed to " + newState.status);

            // Someone moved or disconnected the bot - destroy connection
            if (
                newState.status === VoiceConnectionStatus.Destroyed ||
                newState.status === VoiceConnectionStatus.Disconnected
            ) this.disconnect();
        });

        this.connection.on("error", e => {
            MusicPlayer.logger.error("Connection error: ", e);
            // TODO: define error behaviour
            this.disconnect();
        });

        // Apply player to the connection
        this.connection.subscribe(this.player);
    }

    /** Disconnect the bot from the voice channel, terminating and removing
     *  the connection (if any). */
    public disconnect() {
        if (!this.connection) return;
        MusicPlayer.logger.trace("Manually destroying connection");

        // Destroy connection to prevent memory leaks
        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) this.connection.destroy();
        this.connection = undefined;
    }

    /** Returns true if the song is a valid resource and has been started
     *  playing. */
    public play(): boolean {
        const song: ASong | undefined = super.getCurrent();
        if (!song) return false;

        // TODO: transform special types (e.g. Spotify to Youtube)
        const stream: Readable = song.getStream();

        // Create audio resource with retrieved stream
        this.resource = createAudioResource(stream, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });

        this.connect();

        // Update resource volume
        this.setVolume();
        // Bind resource to player
        this.player.play(this.resource);

        // Apply player to connection?

        return true;
    }

    public stop() {
        // Assert player is unpaused first
        this.unpause();

        this.player.stop(true, true);
    }

    /** Updates the volume to be used for the resources to be played.
     *  It can be called without parameters to update the volume of the current
     *  resource, since it has to be set each time a new one is cerated. */
    public setVolume = (volume: number = this.volume) => {
        // Update volume property
        this.volume = volume;
        // If a resource is present, update its volume
        this.resource?.volume?.setVolume(this.volume);
    }

    /** Pauses the current playing resource. */
    public pause = () => {
        this.player.pause();
    }

    /** Resumes the current paused resource. */
    public unpause = () => {
        this.player.unpause();
    }
}

export const getSong = async function (uri: string): Promise<ASong | undefined> {
    // Check for Youtube first
    let youtubeVideoId: string | undefined = YoutubeSong.getVideoId(uri);
    if (youtubeVideoId) return await YoutubeSong.getVideoInfo(youtubeVideoId);

    // TODO: Spotify
    // TODO: SoundCloud
    // TODO: YewTube (Youtube mature content that needs authentication)

    // Url is not supported, return
    return undefined;
}