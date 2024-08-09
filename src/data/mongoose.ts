import mongoose, { ConnectOptions } from "mongoose";    // MongoDB Database connector
import ClassLogger from "../utils/logger";

/** Mongoose connection uri - from env */
const uri: string = process.env.MONGO_URI!;

/** Mongoose connection options */
const options: ConnectOptions = {
    // Limit connections
    maxPoolSize: 20
};
  
// Mongoose options
mongoose.set("strictQuery", true);

// Connect to MongoDB using Mongoose
export function connect(): Promise<void> {
    return mongoose.connect(uri, options)
        .then(() => ClassLogger.info(`Successfully connected to '${uri}'`))
        .catch((e) => ClassLogger.error(`Error connecting to '${uri}': ${e}`));
}