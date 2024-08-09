import { Message, MessageCreateOptions, MessageEditOptions, MessagePayload, TextBasedChannel } from "discord.js";

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
    async setContent(content: any): Promise<DynamicMessage> {
        this.content = content;
        return this;
    }

    /** Sends new message with current content. */
    async send() {
        if(this.content) {
            this.message = await this.textChannel.send(this.content)
                .catch();
        }
    }

    /** Deletes current message (if possible). */
    async delete() {
        if(this.message?.deletable) {
            await this.message.delete()
                .catch();
        }
    }

    /** Deletes message (if possible) and sends new one with current content. */
    async resend() {
        await this.delete();
        await this.send();
    }

    /** Updates current message (if possible) with current content.
     *  if not possible, the resend() method is called instead. */
    async update() {
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
        if(this.textChannel.id !== textChannel.id) {
            this.textChannel = textChannel;
            if(this.message?.deletable) {
                this.resend();
            }
        }
    }
}
