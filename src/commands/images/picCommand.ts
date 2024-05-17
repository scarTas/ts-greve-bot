import { EmbedBuilder, Message, User } from "discord.js";
import { CommandMetadata } from "../../types/coreCommand";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import ClassLogger from "../../utils/logger";

const logger: ClassLogger = new ClassLogger("pic");

/** Define command metadata and handler methods for text and slash commands. */
export const picCommandMetadata: CommandMetadata<{ user: User }, { embeds: EmbedBuilder[] }> = {
    // Command metadata for "help" command and general info about the command
    category: "Images", description: "Sends the pic of a user.", aliases: ["pic"],
    usage: "`ham pic` // Sends your propic\
    \n`ham pic @Emre` // Sends Emre's propic\
    \n`ham pic emre` // Same",

    // Actual core command with business logic implementation
    command: (self, { user }, callback) => {
        const embed = new EmbedBuilder()
        .setColor(self.embedColor)
        .setAuthor({name: user.displayName, iconURL: user.avatarURL()! })
        .setImage(user.displayAvatarURL({ extension: "webp", forceStatic: true, size: 4096 }))
    
        // Join arguments with clapping emoji and call callback
        callback( { embeds: [ embed ] } );
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (self, msg, _content, args, command) => {
        // Try to retrieve the mentioned or written user from the first argument
        getUserFromMessage(msg, args[0])
        // If the user is successfully retrieved (or it is the author itself),
        // proceed with the embed creation logic
        .then( user => {
            user && command(self, { user }, getSimpleMessageCallback(msg))
        })
    }

    // TODO: slash command handler
}

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