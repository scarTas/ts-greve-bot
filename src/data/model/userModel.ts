import mongoose, { Document } from "mongoose";

export interface ISong {
    // Core data
    title: string;
    uri: string;
    type: number;
    // isLiveContent?: boolean;

    // Youtube mixes utils
    mixId?: string;
    mixPlayedMap?: Set<string>;
    mixQueue?: string[];    // video ids

    // To be displayed data
    thumbnail?: string;
    requestor?: string;
    lengthSeconds?: number;
    lengthString?: string;
    begin?: number;
}

/** Extend document to let TypeScript see IUserModel as a child of UserModel */
export interface IUserModel extends Document {
	_id: string;
    prefix?: string;
    favourites: ISong[];
}

/** Model to be used to read, save and update User metadata to Mongo database */
export const UserModel = mongoose.model<IUserModel>("User", new mongoose.Schema<IUserModel>({
    /** User identifier - populated with Discord user id */
    _id: { type: String, required: true },
    /** Custom text command prefix - if null, default is used */
    prefix: String,
    /** List of songs the user added to his favourites playlist */
    favourites: [ new mongoose.Schema<ISong>({
        /** Song title */
        title: { type: String, required: true },
        /** Song uri or idenfitier to be interpreted with the type */
        uri: { type: String, required: true },
        /** Song type - used to parse the uri field */
        type: Number,
        /** Song saved thumbnail uri - not required */
        thumbnail: String,
        /** Song length in seconds to be displayed - not required */
        lengthSeconds: Number,
        /** Song length string to be displayed - not required */
        lengthString: String
    }) ]
}));