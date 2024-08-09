import HaramLeotta from "..";
import { connect } from "../data/mongoose";
import ClassLogger from "../utils/logger";
import { registerCommands } from "./onMessageCreate";


/** Event triggered when the bot has successfully logged in.
 *  Update bot activity and log some guild info. */
export const onReady = async () => {
    // Register commands
    await registerCommands();

    // Update bot activity status
    HaramLeotta.get().updatePresence();

    // Before finalizing deployment, connect to the database
    await connect();
    
    // Retrieve list of guilds the bot is in
    const guilds = HaramLeotta.get().guilds.cache;

    // Print guilds number and names
    ClassLogger.info(`Currently in ${guilds.size} servers`);
    //for(const [_, guild] of guilds) ClassLogger.trace(`- ${guild.name}`);

    ClassLogger.info(`========= Deployment completed =========`);
}