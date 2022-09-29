import { Document, Schema as SchemaMongose, SchemaTypes } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Virtual } from '../../virtual/schema/virtual.schema';
import { User } from '../../user/schema/user.schema';
import { Chats } from "src/modules/chat/schema/chat.schema";
import { FlagMessage, flagMessage } from "./flags.message.schema";
import { TriggerMessage, triggerMessage } from "./trigger.message.schema";

const mediaSchema = new SchemaMongose({
    owner: String,
    fileId: String,
    name: String,
    filePath: String,
    url: String,
    thumbnailUrl: String
})

export interface IMedia {
    owner: string,
    fileId: string,
    name: string,
    filePath: string,
    url: string,
    thumbnailUrl: string
}

const readSchema = new SchemaMongose({
    read: { type: Boolean, default: false },
    read_date: Date
})

export interface IRead {
    read: boolean
    read_date: Date
}

const pausedSchema = new SchemaMongose({
    paused: String,
    date_send: { type: Date, default: new Date() },
    verify_paused: Boolean,
})

export interface IPaused {
    paused: string
    date_send: Date
    verify_paused: boolean
}

const delaySchema = new SchemaMongose({
    delay: String,
    date_send: { type: Date, default: new Date() },
    verify_delay: Boolean,
})

export interface IDelay {
    delay: string
    date_send: Date
    verify_delay: boolean
}

export interface IFlag {
    userId: string;
    reason: string;
    description: string;
    approved: boolean;
    validated: string;
    validatedByQa: string
}

@Schema({
    collection: 'messages',
    timestamps: true,
})
export class Messages extends Document {

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: Chats.name, required: true })
    chat: SchemaMongose.Types.ObjectId | string;

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name, required: true })
    customer: SchemaMongose.Types.ObjectId;

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: Virtual.name, required: true })
    virtual: SchemaMongose.Types.ObjectId;

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name, required: true })
    user: SchemaMongose.Types.ObjectId;

    @Prop({ type: String, required: false })
    message: string;

    @Prop({ type: Boolean })
    customer_write: boolean;

    @Prop({ type: Boolean, default: false })
    reported: boolean;

    @Prop({ type: [mediaSchema] })
    media: any;

    @Prop({ type: flagMessage })
    flags: FlagMessage

    @Prop({ type: readSchema })
    read: any;

    @Prop({ type: pausedSchema })
    paused: any;

    @Prop({ type: delaySchema })
    delay: any;

    @Prop({ type: Boolean })
    trigger_exists: any;

    @Prop({ type: Date, default: Date.now() })
    timestamp: Date;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: triggerMessage })
    trigger: TriggerMessage;

    @Prop({ type: String })
    to: string

    @Prop({ type: String })
    from: string
}


export type MessagesDocument = Messages & Document;

export const MessagesSchema = SchemaFactory.createForClass(Messages);
