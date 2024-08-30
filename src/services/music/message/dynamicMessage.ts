import { Message, MessageCreateOptions, MessageEditOptions, MessagePayload, TextBasedChannel } from "discord.js";
import ClassLogger from "../../../utils/logger";

export class DynamicMessage {
    /** Text channel in which the message will be sent. */
    textChannel: TextBasedChannel;
    /** Sent message to be deleted or updated. */
    message?: Message;
    /** Content of the message. */
    content?: string | MessagePayload; // | MessageCreateOptions | MessageEditOptions;

    /* ==== CONSTRUCTOR ===================================================== */
    constructor(textChannel: TextBasedChannel){
        this.textChannel = textChannel;
    }

    /* ==== METHODS ========================================================= */
    /** Updates message content - used for any new message or update. */
    setContent(content: any): DynamicMessage {
        this.content = content;
        return this;
    }

    /** Sends new message with current content. */
    async send() {
        ClassLogger.trace("Entering DynamicMessage::send()");

        if(this.content) {
            this.message = await this.textChannel.send(this.content)
                .catch();
        }
    }

    /** Deletes current message (if possible). */
    async delete(): Promise<void> {
        ClassLogger.trace("Entering DynamicMessage::delete()");

        ClassLogger.trace(`Message: ${!!this.message} - Deletable: ${this.message?.deletable}`);

        if(this.message?.deletable) {
            await this.message.delete()
                .catch(e => ClassLogger.warn("delete(): ", e));

            // Remove message from memory, not useful anymore.
            // Also the "deletable" property is not updated; keeping the message
            // would result in a message.delete() on an invalid message.
            this.message = undefined;
        }
    }

    /** Deletes message (if possible) and sends new one with current content. */
    async resend() {
        ClassLogger.trace("Entering DynamicMessage::resend()");

        // If the last message in the channel is the current message, update without deleting
        let update: boolean = !!(
            this.message &&
            (await this.textChannel.messages.fetch({ limit: 1 })
                .catch(_ => undefined))
                ?.first()?.id === this.message.id
        );
        
        if(update) {
            await this.update();
        } else {
            await this.delete();
            await this.send();
        }
    }

    /** Updates current message (if possible) with current content.
     *  if not possible, the resend() method is called instead. */
    async update() {
        ClassLogger.trace("Entering DynamicMessage::update()");

        if(this.content) {
            if(this.message?.editable) {
                await this.message.edit(this.content)
                    .catch();
            } else {
                await this.resend();
            }
        }
    }

    /** Updates the text channel to be used and
     *  resends the message (if any) on the new one.  */
    async updateChannel(textChannel: TextBasedChannel) {
        ClassLogger.trace("Entering DynamicMessage::updateChannel()");

        if(this.textChannel.id !== textChannel.id) {
            this.textChannel = textChannel;
            if(this.message?.deletable) {
                await this.resend();
            }
        }
    }
}
