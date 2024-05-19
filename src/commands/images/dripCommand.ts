import { AttachmentBuilder, User } from "discord.js";
import { CommandMetadata } from "../../types/types";
import { getSimpleMessageCallback } from "../../events/onMessageCreate";
import { getUserFromMessage } from "./picCommand";
import Jimp from "jimp";
import ClassLogger from "../../utils/logger";

export const fileRegex = /^https?:\/\/.*$/;
const baseImage: string = "./assets/images/drip.png";
const logger: ClassLogger = new ClassLogger("drip");

/** Define command metadata and handler methods for text and slash commands. */
export const dripCommandMetadata: CommandMetadata<{ user?: User, file?: string }, { files: AttachmentBuilder[] }> = {
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

interface OverlapOptions {
    /** Link of the image to be put over the base image */
    path: string;

    /** New image x position */
    xPos: number | undefined;
    /** New image y position */
    yPos: number | undefined;

    /** New image resolution */
    xRes: number | undefined;
    /** New image resolution */
    yRes: number | undefined;

    /** Round the image */
    round: boolean | undefined;
}

/** Overlaps different images, given a base image path and a set of options for
 *  each other image to be palced on top of it. */
export const overlap = async (baseImagePath: string, optionsArray: OverlapOptions[]) : Promise<Buffer> => {
    // Parse base image path
    const baseImage = await Jimp.read(baseImagePath);

    // For each image to be put on the base, apply the options
    for(let { path, xPos, yPos, xRes, yRes, round } of optionsArray) {
        // Parse input image
        const image = await Jimp.read(path);

        // Resize image to desired resolution (if specified)
        xRes = xRes || image.getWidth();
        yRes = yRes || image.getHeight();
        image.resize(xRes, yRes);

        // Circle the image (if specified)
        if(round) image.circle({ radius: xRes / 2, x: xRes / 2, y: yRes / 2 });

        // Apply image as an overlay to the base image
        baseImage.composite(image, xPos || 0, yPos || 0);
    }

    // Create buffer from finished image
    return await baseImage.getBufferAsync(baseImage.getMIME());

    // Return the Discord resolved image
    // return new AttachmentBuilder(buffer, {name: "overlap.png"});
    // return await DataResolver.resolveFile(buffer);
}

/*
const mask: string = "./assets/images/mask4.png";
async function roundCorners() {
    const maskImage = await Jimp.read(mask);
    for(const file of files2) {
        console.log(file);
        const baseImage = await Jimp.read(file);

        baseImage.mask(maskImage, 0, 0);

        // Convert the masked image to a buffer
        //return baseImage.getBufferAsync(Jimp.MIME_PNG);
        baseImage.write("fedeout/2/"+file.split("/").pop()!);
    }
}
*/