import { EmbedBuilder, User } from "discord.js";
import { CommandMetadata } from "../../types/types";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import ClassLogger from "../../utils/logger";
import HaramLeotta from "../..";
import { getUserFromMessage } from "../../services/userService";

const logger: ClassLogger = new ClassLogger("pic");

/** Define command metadata and handler methods for text and slash commands. */
const picCommandMetadata: CommandMetadata<{ user: User }, { embeds: EmbedBuilder[] }> = {
    // Command metadata for "help" command and general info about the command
    category: "Images", description: "Sends the pic of a user.", aliases: ["pic"],
    usage: "`ham pic` // Sends your propic\
    \n`ham pic @Emre` // Sends Emre's propic\
    \n`ham pic emre` // Same",

    // Actual core command with business logic implementation
    command: ({ user }, callback) => {
        const embed = new EmbedBuilder()
        .setColor(HaramLeotta.get().embedColor)
        .setAuthor({name: user.displayName, iconURL: user.avatarURL()! })
        .setImage(user.displayAvatarURL({ extension: "webp", forceStatic: true, size: 4096 }))
    
        // Join arguments with clapping emoji and call callback
        callback( { embeds: [ embed ] } );
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        // Try to retrieve the mentioned or written user from the first argument
        getUserFromMessage(msg, args[0])
        // If the user is successfully retrieved (or it is the author itself),
        // proceed with the embed creation logic
        .then( user => {
            user && command({ user }, getSimpleMessageCallback(msg))
        })
    }

    // TODO: slash command handler
}
export default picCommandMetadata;