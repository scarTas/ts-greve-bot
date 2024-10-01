import { EmbedBuilder } from "discord.js";
import { CommandMetadata } from "../types";
import { defaultMessageCallback, defaultMessageErrorHandler } from "../../events/onMessageCreate";
import HaramLeotta from "../..";
import { commandMetadataMap, commandMetadatas } from "../registration";

const helpCommandMetadata: CommandMetadata<{ command: string }, { embeds: EmbedBuilder[] }> = {
    category: "Information", description: "Shows the list of available commands and their usage.",
    aliases: ["help"],
    usage: "`ham help` // Displays complete command list\
    \n`ham help drip` // Displays info and usage of `drip` command",
    
    command: ({ command }, callback) => {
        const embed = new EmbedBuilder()
            .setColor(HaramLeotta.get().embedColor);
    
        // If the command arguments has been passed and it is an actual command,
        // create embed for the specific requested command and add more information
        const commandMetadata = command ? commandMetadataMap[command] : undefined;
        if(commandMetadata) {
            embed.setTitle(`Command '${command}' help`)
                .addFields([
                    { name: "Category", value: commandMetadata.category },
                    { name: "Description", value: commandMetadata.description }
                ]);

            if(commandMetadata.aliases.length > 1) {
                embed.addFields([{ name: "Aliases", value: `\`${commandMetadata.aliases.join(`\`, \``)}\`` }])
            }

            if(commandMetadata.usage) {
                embed.addFields([{ name: "Usage", value: commandMetadata.usage }])
            }
        }
        
        // If there is no command alias in input, list all the possible commands
        else {
            // Categorize currently available commands into arrays
            const categories: { [k: string]: string[] } = {};
            for(const {aliases, category, hidden} of commandMetadatas) {
                const name = aliases[0];

                // If the command wasn't made to be called, don't display it (ex: message interaction arrows)
                if(hidden) continue;
                if(categories[category])    categories[category].push(name);
                else                        categories[category] = [name];
            }
            
            // Compose embed with available commands
            embed.setTitle("Available Commands")
                .addFields(
                    Object.entries(categories)
                    .map( ([name, value]) => { return { name, value: `\`${value.join(`\`, \``)}\``} } )
                );
        }
    
        // Join arguments with clapping emoji and call callback
        callback( { embeds: [ embed ] } );
    },

    onMessageCreateTransformer: (msg, _content, args, command) => {
        command({ command: args[0] }, defaultMessageCallback(msg))
    },

    onMessageErrorHandler: defaultMessageErrorHandler

    // TODO: slash command handler
}
export default helpCommandMetadata;