import { AttachmentBuilder, User } from "discord.js";
import { CommandMetadata } from "../types";
import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import Images from "../../classes/image/images";
import UserRepository from "../../classes/user/UserRepository";

/** Regex to be used to detect if an argument is a file uri or not. */
export const fileRegex = /^https?:\/\/.*$/;
/** Base PNG with the dripping figure image. */
const baseImage: string = "./assets/images/drip.png";
/** Default name for the Discord attachment (final image). */
const imageName: string = "drip.png";

const dripCommandMetadata: CommandMetadata<{ user?: User, file?: string }, { files: AttachmentBuilder[] }> = {
    category: "Images", description: "HE REALLY BE DRIPPIN DOE", aliases: ["drip"],
    usage: "`ham drip` // Drips yourself\
    \n`ham drip @Emre` // Drips the shit out of Emre\
    \n`ham drip emre` // Same",

    command: async ({ user, file }, callback) => {
        // Use input file or retrieve profile picture from input user
        // If no argument is defined, don't do anything
        const path: string = file || user!.displayAvatarURL({ extension: "png", size: 256 });

        // Add provided image to drip base image and invoke callback on success
        await Images.overlap(baseImage, [{ path, xPos: 210, yPos: 80, xRes: 256, yRes: 256, round: true }])
            .then(buffer => callback( { files: [ new AttachmentBuilder(buffer, { name: imageName }) ] } ));
    },

    onMessageCreateTransformer: async (msg, _content, args, command): Promise<void> => {
        const arg: string | undefined = args.shift();

        // If the first argument is a file path, directly use it
        if(arg && fileRegex.test(arg))
            return await command({ file: arg }, defaultMessageCallback(msg));

        // Try to retrieve the mentioned or written user from the first argument
        const user: User | undefined = await UserRepository.getUserFromMessage(msg, arg);
        if(!user)
            throw new Error("User not found");

        // If the user is successfully retrieved (or it is the author itself),
        // proceed with the embed creation logic
        await command({ user }, defaultMessageCallback(msg));
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default dripCommandMetadata;