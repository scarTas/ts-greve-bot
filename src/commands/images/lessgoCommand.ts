import { AttachmentBuilder, User } from "discord.js";
import { CommandMetadata } from "../types";
import dripCommandMetadata from "./dripCommand";
import Images from "../../classes/image/images";
import { msgReactErrorHandler, msgReplyResponseTransformer } from "../../events/onMessageCreate";

/** Base PNG with the dripping figure image. */
const baseImage: string = "./assets/images/lessgo.png";

const lessgoCommandMetadata: CommandMetadata<{ user?: User, file?: string }, { files: AttachmentBuilder[] }> = {
    category: "Images", description: "LESSGOOOOOOOOO 🧏🏿‍♂️🧏🏿‍♂️🧏🏿‍♂️", aliases: ["lessgo"],
    usage: "`ham lessgo` // LESSGOOOOes yourself\
    \n`ham lessgo @Emre` // LESSGOOOOes the shit out of Emre\
    \n`ham lessgo emre` // Same",

    command: async ({ user, file }) => {
        // Use input file or retrieve profile picture from input user
        // If no argument is defined, don't do anything
        const path: string = file || user!.displayAvatarURL({ extension: "png", size: 256 });

        // Add provided image to drip base image and invoke callback on success
        const buffer = await Images.overlap(baseImage, [
            { path, xPos: 300, yPos: 180, xRes: 350, yRes: 350, round: true },
            { path, xPos: 330, yPos: 75, xRes: 50, yRes: 50, round: true }
        ]);
        return { files: [ new AttachmentBuilder(buffer, { name: "overlap.png" }) ] };
    },

    onMessage: {
        requestTransformer: dripCommandMetadata.onMessage!.requestTransformer,
        responseTransformer: msgReplyResponseTransformer,
        errorHandler: msgReactErrorHandler
    }

    // TODO: slash command handler
}
export default lessgoCommandMetadata;