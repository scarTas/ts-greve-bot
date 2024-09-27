import Logger from "../logging/Logger";
import IUserModel from "../../data/interfaces/IUserModel";
import UserModel from "../../data/model/UserModel";
import { Message, User } from "discord.js";

export default class UserRepository {

    /* ==== PUBLIC STATIC METHODS =========================================== */
    /** Given Discord user id, retrieve its prefix from database (if exists).
     *  If no user o saved prefix is found, return undefined. */
    public static async getUserPrefix(id: string): Promise<string | undefined> {
        try {
            const user = await UserRepository.getUser(id);
            return user?.prefix;
        } catch (e) {
            Logger.error("Error during query", e as Error);
        }
    }

    /** Given Discord user id and new prefix, update user's prefix in database */
    public static async updateUserPrefix(id: string, prefix: string): Promise<void> {
        try {
            // Retrieve user from database - if it doesn't exist, create it
            let user: IUserModel = await UserRepository.getUser(id) ?? new UserModel({ _id: id });
            // Update user prefix to new one
            user.prefix = prefix;
            // Save model to database
            await user.save();
            Logger.debug("Prefix updated");
        } catch(e) {
            Logger.error("Error during query", e as Error);
        }
    }

    /** Retrieves a user instance for a user mentioned in the message or a user
     *  which name matches with the first command argument.
     *! NOT A MONGODB METHOD, BUT A USER-RELATED METHOD NONETHELESS. */
    public static getUserFromMessage = async (msg: Message, username: string): Promise<User | undefined> => {
        // If there is no mentioned user, directly return the message author
        if (!username) return msg.author;

        // If there is a mention in the message, use it to retrieve the user
        if(msg.mentions?.users?.size)
            return msg.mentions.users.last();

        // If there is no mention, manually search for the user in the server with
        // a query - if the user exists, return it
        return msg.guild?.members.fetch({ query: username, limit: 1 })
            .then(member => member.first()?.user)
            .catch( e => { Logger.error("Error retrieving user", e); return undefined; } );
    }

    /* ==== PRIVATE STATIC METHODS ========================================== */
    /** Retrieve user from database, if any. */
    private static getUser(id: string): Promise<IUserModel | null> {
        return UserModel.findById(id);
    }
}