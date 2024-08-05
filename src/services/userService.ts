import { Message, User } from "discord.js";
import ClassLogger from "../utils/logger";

const logger = new ClassLogger("UserService");

/** Retrieves a user instance for a user mentioned in the message or a user
 *  which name matches with the first command argument. */
export const getUserFromMessage = async (msg: Message, username: string): Promise<User | undefined> => {
    // If there is no mentioned user, directly return the message author
    if (!username) return msg.author;

    // If there is a mention in the message, use it to retrieve the user
    if(msg.mentions?.users?.size)
        return msg.mentions.users.last();

    // If there is no mention, manually search for the user in the server with
    // a query - if the user exists, return it
    return msg.guild?.members.fetch({ query: username, limit: 1 })
        .then(member => member.first()?.user)
        .catch( e => { logger.warn(e); return undefined; } );
}