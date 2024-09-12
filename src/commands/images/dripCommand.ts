import { AttachmentBuilder, User } from "discord.js";
import { CommandMetadata } from "../types";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { overlap } from "../../classes/image/jimp";
import { getUserFromMessage } from "../../classes/user/userService";
import { Logger } from "../../classes/logging/Logger";

export const fileRegex = /^https?:\/\/.*$/;
const baseImage: string = "./assets/images/drip.png";

/** Define command metadata and handler methods for text and slash commands. */
const dripCommandMetadata: CommandMetadata<{ user?: User, file?: string }, { files: AttachmentBuilder[] }> = {
    // Command metadata for "help" command and general info about the command
    category: "Images", description: "HE REALLY BE DRIPPIN DOE", aliases: ["drip"],
    usage: "`ham drip` // Drips yourself\
    \n`ham drip @Emre` // Drips the shit out of Emre\
    \n`ham drip emre` // Same",

    // Actual core command with business logic implementation
    command: ({ user, file }, callback) => {

        // Use input file or retrieve profile picture from input user
        // If no argument is defined, don't do anything
        const path: string | undefined = file ?? user?.displayAvatarURL({ extension: "png", size: 256 });
        if(!path) return;

        // Add provided image to drip base image and invoke callback on success
        overlap(baseImage, [{ path, xPos: 210, yPos: 80, xRes: 256, yRes: 256, round: true }])
            .then(buffer => callback( { files: [ new AttachmentBuilder(buffer, { name: "overlap.png" }) ] } ))
            .catch(e => Logger.warn("Error overlapping images", e) );
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
export default dripCommandMetadata;