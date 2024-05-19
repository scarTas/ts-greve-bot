import mongoose, { ConnectOptions } from "mongoose";    // MongoDB Database connector
import ClassLogger from "../utils/logger";

export const mongooseLogger = new ClassLogger("Mongoose");

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
        .then(() => mongooseLogger.info(`Successfully connected to '${uri}'`))
        .catch((e) => mongooseLogger.error(`Error connecting to '${uri}': ${e}`));
}