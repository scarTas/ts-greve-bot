import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

/* ==== PROPERTIES ========================================================== */
const asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();

type ContextInfo = {
    requestId: string,
    commandId: string,
    userId: string
}

/* ==== METHODS ============================================================= */
/** Middleware to attach a unique request-id to each request.
*   Used to maintain request-specific data across asynchronous operations. */
export function initializeContext({ commandId, userId }: { commandId?: string, userId?: string }, callback: () => any): void {
    asyncLocalStorage.run(new Map(), () => {
        const store = asyncLocalStorage.getStore();
        if(store) {
            store.set("request-id", uuidv4());
            if(commandId) store.set("command-id", commandId);
            if(userId) store.set("user-id", userId);
        }
        callback();
    });
};

export function setCommandId(commandId: string): void {
    asyncLocalStorage.getStore()?.set("command-id", commandId);
};

export function setUserId(userId: string): void {
    asyncLocalStorage.getStore()?.set("user-id", userId);
};

/** Method called to retrieve the information saved in the asyncLocalStorage.
 *  If the properties have not been initialized, return defualt values. */
export function getContextInfo(): ContextInfo {
    const store: Map<string, string> | undefined = asyncLocalStorage.getStore();
    return {
        requestId: store?.get("request-id") ?? "",
        commandId: store?.get("command-id") ?? "",
        userId: store?.get("user-id") ?? ""
    }
}