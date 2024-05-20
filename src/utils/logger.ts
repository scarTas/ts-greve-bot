import { getContextInfo } from "./contextInitializer";


/* ==== ENUMS =============================================================== */
enum Color {
    RESET = "\x1b[0m",
    DIM = "\x1b[90m", BRIGHT = "\x1b[1m",
    RED = "\x1b[31m", YELLOW = "\x1b[33m", GREEN = "\x1b[32m",
    BLUE = "\x1b[36m", PURPLE = "\x1b[35m"
}
enum LogLevel { TRACE = 0, DEBUG = 1, INFO = 2, WARN = 3, ERROR = 4 }

function getEnvLogLevel(): LogLevel {
    if(process.env.LOG_LEVEL === "TRACE") return LogLevel.TRACE;
    if(process.env.LOG_LEVEL === "DEBUG") return LogLevel.DEBUG;
    if(process.env.LOG_LEVEL === "INFO") return LogLevel.INFO;
    if(process.env.LOG_LEVEL === "WARN") return LogLevel.WARN;
    if(process.env.LOG_LEVEL === "ERROR") return LogLevel.ERROR;
    return LogLevel.DEBUG;
}

/* ==== TYPE DEFINITION ===================================================== */
export default class ClassLogger {

    /* ==== CONSTRUCTOR ===================================================== */
    /** Sets the prefix for this logger instance. If only the clasName is
     *  provided, that will be used as prefix - if directory name is als
     *  provided, the prefix will also contain the package path. */
    constructor(className: string, dirname?: string, logLevel?: LogLevel) {
        this.prefix = dirname
        ? (dirname.split("/src/", 2)[1].replace(/\//g, '.').replace(/\.[tj]?s/, '') + ( className ? ('.'+className) : "" ))
        : className;
        this.level = logLevel ?? getEnvLogLevel();
    }

    /* ==== PROPERTIES ====================================================== */
    /** Get default logging level from environment - if none, INFO. */
    private level: LogLevel;
    /** Log prefix containing class name or package path. */
    private prefix: string;

    /* ==== STATIC METHODS ================================================== */
    /** Logger date options - format "20/05/2024, 22:06:31.531". */
    static dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric",
        fractionalSecondDigits: 3
    } as any;
    
    /** Prints coloured log level and timestamp, followed by the given string.
     *  Ex: "[INFO] 20/05/2024, 22:06:31.531 [//] Hello world!" */
    private static print = (s: string, level: string, color: Color): void => {
        const { requestId, commandId, userId } = getContextInfo();
        console.log(
            `\r[${color}${level}${Color.RESET}]${Color.BRIGHT} ${Color.DIM}${new Date().toLocaleTimeString("en-GB", ClassLogger.dateOptions)}${Color.RESET} [${commandId}/${userId}/${requestId}] ${s}`);
    }

    public static trace = (s: string) => ClassLogger.print(s, "TRACE", Color.PURPLE);
    public static debug = (s: string) => ClassLogger.print(s, "DEBUG", Color.BLUE);
    public static info = (s: string) => ClassLogger.print(s, "INFO", Color.GREEN);
    public static warn = (s: string) => ClassLogger.print(s, "WARN", Color.YELLOW);
    public static error = (s: string) => ClassLogger.print(s, "ERROR", Color.RED);
    
    /* ==== INSTANCE METHODS ================================================ */
    /** Prepares and formats prefix text. */
    private getPrefix = (): string => `[${Color.BRIGHT}${this.prefix}${Color.RESET}] `;

    public trace = (s: string) => { (this.level <= LogLevel.TRACE) && ClassLogger.trace(this.getPrefix() + s) };
    public debug = (s: string) => { (this.level <= LogLevel.DEBUG) && ClassLogger.debug(this.getPrefix() + s) };
    public info = (s: string) => { (this.level <= LogLevel.INFO) && ClassLogger.info(this.getPrefix() + s) };
    public warn = (s: string) => { (this.level <= LogLevel.WARN) && ClassLogger.warn(this.getPrefix() + s) };
    public error = (s: string) => { ClassLogger.error(this.getPrefix() + s) };
}