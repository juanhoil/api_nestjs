import { Document, Schema as SchemaMongose, SchemaTypes } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from "src/modules/user/schema/user.schema";
import { Chats } from "src/modules/chat/schema/chat.schema";

class Delay extends Document {
    @Prop({ type: Boolean, default: false })
    active: boolean;

    @Prop({ type: Number, default: (new Date()).getTime() })
    time: Date
}

export const DelaySchema = SchemaFactory.createForClass(Delay);

export enum MyQueueType {
    CHAT = 'chat',
    CONTENT = 'content',
    VERIFICATION = 'verification'
}
export type QueueType = 'chat' | 'content' | 'verification'

export enum MyQueueStatus {
    CLOSE = 'close',
    QUEUED = 'queued',
    OPEN = 'open',
}

export type QueueStatus = 'close' | 'queued' | 'open' | 'assigned'
@Schema({
    collection: 'my_queue',
    timestamps: true,
})
export class MyQueue {
    // @Prop({ type: mongoose.Types.ObjectId })
    _id: string

    @Prop({ type: String, enum: ['chat', 'content', 'verification'] })
    type: MyQueueType;

    @Prop({ type: String, enum: ['close', 'queued', 'open'], default: 'close' })
    status: MyQueueStatus | QueueStatus;

    @Prop({ type: Date })
    date: Date

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name, required: false })
    user: string | User

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: Chats.name, required: false })
    chat: string | Chats

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name, required: false })
    content: string | User

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name, required: false })
    verification: string | User
    
    @Prop({ type: DelaySchema, default: { active: false } })
    delay: Delay;

    @Prop({ type: Boolean, default: false })
    stopped: boolean

}

export type MyQueueDocument = MyQueue & Document;
// @ts-ignore
export const MyQueueSchema = SchemaFactory.createForClass(MyQueue);
