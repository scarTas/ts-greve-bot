import { AttachmentBuilder, User } from "discord.js";
import { CommandMetadata } from "../../types/types";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import ClassLogger from "../../utils/logger";
import { overlap } from "../../services/jimpService";
import { fileRegex } from "./dripCommand";
import { getUserFromMessage } from "../../services/userService";

const baseImage: string = "./assets/images/lessgo.png";
const logger: ClassLogger = new ClassLogger("lessgo");

/** Define command metadata and handler methods for text and slash commands. */
const lessgoCommandMetadata: CommandMetadata<{ user?: User, file?: string }, { files: AttachmentBuilder[] }> = {
    // Command metadata for "help" command and general info about the command
    category: "Images", description: "LESSGOOOOOOOOO 🧏🏿‍♂️🧏🏿‍♂️🧏🏿‍♂️", aliases: ["lessgo"],
    usage: "`ham lessgo` // LESSGOOOOs yourself\
    \n`ham lessgo @Emre` // LESSGOOOOs the shit out of Emre\
    \n`ham lessgo emre` // Same",

    // Actual core command with business logic implementation
    command: ({ user, file }, callback) => {

        // Use input file or retrieve profile picture from input user
        // If no argument is defined, don't do anything
        const path: string | undefined = file ?? user?.displayAvatarURL({ extension: "png", size: 256 });
        if(!path) return;

        // Add provided image to drip base image and invoke callback on success
        overlap(baseImage, [
            { path, xPos: 300, yPos: 180, xRes: 350, yRes: 350, round: true },
            { path, xPos: 330, yPos: 75, xRes: 50, yRes: 50, round: true }
        ])
            .then(buffer => callback( { files: [ new AttachmentBuilder(buffer, { name: "overlap.png" }) ] } ))
            .catch(e => logger.warn(e) );
    },

    // Transformer that parses the text input before invoking the core command,
    // and handles the message reply with the provided output.
    onMessageCreateTransformer: (msg, _content, args, command) => {
        const arg = args[0];

        // If the first argument is a file path, directly use it
        if(fileRegex.test(arg)) {
            command({ file: arg }, getSimpleMessageCallback(msg))
        }

        // Try to retrieve the mentioned or written user from the first argument
        getUserFromMessage(msg, arg)
        // If the user is successfully retrieved (or it is the author itself),
        // proceed with the embed creation logic
        .then( user => {
            user && command({ user }, getSimpleMessageCallback(msg))
        })
    }

    // TODO: slash command handler
}
export default lessgoCommandMetadata;