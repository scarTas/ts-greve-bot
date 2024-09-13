import mongoose, { ConnectOptions } from "mongoose";    // MongoDB Database connector
import { Logger } from "../classes/logging/Logger";

/** Mongoose connection uri - from env */
const host: string = process.env.MONGO_HOST!;
const port: string = process.env.MONGO_PORT!;
const database: string = process.env.MONGO_DB!;

/** Mongoose connection options */
const options: ConnectOptions = {
    // Limit connections
    maxPoolSize: 20
};
  
// Mongoose options
mongoose.set("strictQuery", true);

// Connect to MongoDB using Mongoose
export function connect(): Promise<void> {
    const uri = `mongodb://${host}:${port}/${database}`;
    return mongoose.connect(uri, options)
        .then(() => Logger.info(`Successfully connected to '${uri}'`))
        .catch((e) => Logger.error(`Error connecting to '${uri}': ${e}`));
}