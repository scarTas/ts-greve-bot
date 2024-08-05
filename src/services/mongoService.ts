import { Message, User } from "discord.js";
import { UserModel, IUserModel } from "../data/model/userModel";
import { mongooseLogger } from "../data/mongoose";

/** Retrieve user from database, if any. */
function getUser(id: string): Promise<IUserModel | null> {
    return UserModel.findById(id);
}

/** Given Discord user id, retrieve its prefix from database (if exists).
 *  If no user o saved prefix is found, return undefined. */
export async function getUserPrefix(id: string): Promise<string | undefined> {
    try {
        const user = await getUser(id);
        return user?.prefix;
    } catch (e) {
        mongooseLogger.error(`Error during query: ${e}`);
    }
}

/** Given Discord user id and new prefix, update user's prefix in database */
export async function updateUserPrefix(id: string, prefix: string): Promise<void> {
    try {
        // Retrieve user from database - if it doesn't exist, create it
        let user: IUserModel = await getUser(id) ?? new UserModel({ _id: id });
        // Update user prefix to new one
        user.prefix = prefix;
        // Save model to database
        await user.save();
        mongooseLogger.debug("Prefix updated");
    } catch(e) {
        mongooseLogger.error(`Error during query: ${e}`);
    }
}