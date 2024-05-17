import HaramLeotta from "..";
import { connect } from "../data/mongoose";

/** Event triggered when the bot has successfully logged in.
 *  Update bot activity and log some guild info. */
export const onReady = async (self: HaramLeotta) => {
    // Update bot activity status
    self.updatePresence();

    // Retrieve list of guilds the bot is in
    const guilds = self.guilds.cache;

    // Print guilds number and names
    self.logger.info(`Currently in ${guilds.size} servers`);
    //for(const [_, guild] of guilds) self.logger.debug(`- ${guild.name}`);

    // Before finalizing deployment, connect to the database
    await connect();
    self.logger.info(`========= Deployment completed =========`);
}