import { REST, Routes, SlashCommandBuilder } from "discord.js";
import Logger from "./classes/logging/Logger";

/* ==== METHODS ============================================================= */
/** Secret token of the bot / application */
const token: string | undefined = process.env.TOKEN;
/** UserId of the bot / application */
const appId: string | undefined = process.env.APPID;

export async function registerSlashCommands(deleteGlobally: boolean, registerGlobally: boolean, guildId: string | undefined = undefined) {
    if(!token) throw new Error("No token found");
    if(!appId) throw new Error("No appId found");
    Logger.info(`Registering commands for appId ${appId}`);

    // Discord REST instance for easy REST API calls
    const rest: REST = new REST().setToken(token);
    // Path to be called in order to retrieve, delete and register commands
    const route = Routes.applicationCommands(appId);

    // Delete all the previously registered commands
    if (deleteGlobally) {
        // Retrieve all commands already registered for the app
        Logger.info(`GET ${route}`);
        const commands: any = await rest.get(route);

        // Start deletion for all the commands and await
        await Promise.all(
            commands.map((command: any) => {
                Logger.info(`DELETE ${route}/${command.id}`);
                return rest.delete(`${route}/${command.id}`)
            })
        );
        Logger.info(`Successfully deleted ${commands.length} application {/} commands globally.`);
    }

    if(registerGlobally) {
        // Register all the commands globally
        Logger.info(`PUT ${route}`);
        const commands: any = await rest.put(route, { body: slashCommands });
        Logger.info(`Successfully reloaded ${commands.length} application {/} commands globally.`);
    }

    if(guildId) {
        // Retrieve guild registration route and register only there
        const guildRoute = Routes.applicationGuildCommands(appId, guildId);
        Logger.info(`PUT ${guildRoute}`);
        const commands: any = await rest.put(guildRoute, { body: slashCommands });
        Logger.info(`Successfully reloaded ${commands.length} application {/} commands for guild ${guildId}.`);

    }
}

/* ==== COMMAND BUILDERS ==================================================== */
export const slashCommands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Fairly useless... Use it to check if the bot is online")
        .toJSON(),

        /*
    new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Change the name displayed to other strangers!")
        .addStringOption(option => option
            .setName("name")
            .setDescription("The new nickname you want to set.")
            .setRequired(true)
            .setMaxLength(32)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Check out more informations about the commands!")
        .addStringOption(option => option
            .setName("command")
            .setDescription("The command you want to know more about.")
            .setRequired(false)
            .addChoices(
                { name: "/search", value: "search" },
                { name: "/skip", value: "skip" },
                { name: "/stop", value: "stop" },
                { name: "/language", value: "language" },
                { name: "/nickname", value: "nickname" },
                { name: "/help", value: "help" },
                { name: "/ping", value: "ping" }
            )
        )
        .toJSON()*/
];

(async () => {
    Logger.info("Starting slash command registration script...");
    await registerSlashCommands(false, false, "863192103248592946");
    process.exit(0);
})();