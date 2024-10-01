import { EmbedBuilder, User } from "discord.js";
import { CommandMetadata } from "../types";
import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import HaramLeotta from "../..";
import UserRepository from "../../classes/user/UserRepository";

const picCommandMetadata: CommandMetadata<{ user: User }, { embeds: EmbedBuilder[] }> = {
    category: "Images", description: "Sends the pic of a user.", aliases: ["pic"],
    usage: "`ham pic` // Sends your propic\
    \n`ham pic @Emre` // Sends Emre's propic\
    \n`ham pic emre` // Same",

    command: ({ user }, callback) => {
        const embed = new EmbedBuilder()
            .setColor(HaramLeotta.get().embedColor)
            .setAuthor({name: user.displayName, iconURL: user.avatarURL()! })
            .setImage(user.displayAvatarURL({ extension: "webp", forceStatic: true, size: 4096 }))
    
        callback( { embeds: [ embed ] } );
    },

    onMessageCreateTransformer: async (msg, _content, args, command) => {
        const arg: string | undefined = args.shift();
        
        // Try to retrieve the mentioned or written user from the first argument
        const user = await UserRepository.getUserFromMessage(msg, arg);
        if(!user)
            throw new Error("User not found");

        // If the user is successfully retrieved (or it is the author itself),
        // proceed with the embed creation logic
        command({ user }, defaultMessageCallback(msg));
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default picCommandMetadata;