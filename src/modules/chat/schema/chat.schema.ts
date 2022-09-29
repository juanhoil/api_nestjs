import { Document, Schema as SchemaMongose, SchemaTypes } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TriggersSchema } from "../../triggers/schema/triggers.schema";
import { User } from "../../user/schema/user.schema";
import { Virtual } from "../../virtual/schema/virtual.schema";
import { QueenRedisE } from "src/common/interfaces/redis.type";

const noteSchema = new SchemaMongose({
    date: { type: Date, default: new Date()},
    text: String,
    for: String,
    importance: String,
    archive: { type: Boolean, default: false },
    author: { type: String, default: "", required: true },
    IdAutor: { type: SchemaMongose.Types.ObjectId, ref: "user", required: true },
});

const busySchema = new SchemaMongose({
    active: { type: Boolean, default: false },
    userID: { type: String, default: '' },
    ready: { type: Boolean, default: false },
});

const customerNoteSchema = new SchemaMongose({
    title: String,
    name: String,
    value: String
});

const mediaSchema = new SchemaMongose({
    owner: String,
    fileId: String,
    name: String,
    filePath: String,
    url: String,
    thumbnailUrl: String,
    sentDate: { type: Number, default: new Date().getTime() }
});

const flagSchema = new SchemaMongose({
    text: String,
    baned: String,
    notifi: String
});

const pauseSchema = new SchemaMongose({
    paused: Boolean,
    time: { type: Number, default: (new Date()).getTime() },
});

const delaySchema = new SchemaMongose({
    delays: Boolean,
    time: { type: Number, default: (new Date()).getTime() },
});

class Delay extends Document {
    @Prop({ type: Boolean, default: false })
    delays: boolean;

    @Prop({ type: Number, default: (new Date()).getTime() })
    time: Date
}

class UnlimitedPackage extends Document {
    @Prop({ type: Number, default:0})
    countMessageUnlimited: number;

    @Prop({ type: Number})
    endMessageUnlimited: number;

    @Prop({ type: Boolean, default:false })
    openQueue: boolean

    @Prop({ type: Number, default:0 })
    numberChatOpen: number;
    
}

export const DelaySchema = SchemaFactory.createForClass(Delay);

@Schema({
    collection: 'chats',
    timestamps: true
})
export class Chats extends Document {

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name, required: true })
    customer: User | string;

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: Virtual.name, required: true })
    virtual: any;

    @Prop({ type: Number, default: (new Date()).getTime() })
    last_message_date: number;

    @Prop({ type: String })
    message: string;

    @Prop({ type: String, default: '' }) //ultimo mensaje de
    from: string;

    @Prop({ type: Number, default: 0})
    countMessage: number;

    @Prop({ type: Number, default: 0})
    countMessageIn: number;

    @Prop({ type: Number, default: 0})
    countMessageOut: number;

    @Prop({ type: Boolean, default: false })
    firstMessage: boolean

    @Prop({ type: Boolean, default: false })
    readMessage: boolean;

    @Prop({ type: String, enum: ['',QueenRedisE.FOLLOW_UP_5_HRS, QueenRedisE.FOLLOW_UP_1_5_DAY, QueenRedisE.FOLLOW_UP_WEEK, QueenRedisE.FOLLOW_UP_MONTH], default: '' }) 
    folloUpFlag: string;

    /**
     * @deprecated  version 2.0 funcionaba para que entre en la queue
    */ 
    @Prop({ type: String, enum: ['close', 'queued', 'open'], default: 'close' }) 
    stackStatus: string;

    @Prop({ type: busySchema, default: { active: false, userID: undefined } })
    busy: any;

    @Prop({ type: UnlimitedPackage, default: { numberChatOpen: 0, openQueue: true, countMessageUnlimited: 0 } })
    unlimitedPackage: any;

    @Prop({ type: Date, default: (new Date()).toISOString() })
    timestamp: Date;
}

export type ChatsDocument = Chats & Document;
// @ts-ignore
export const ChatsSchema = SchemaFactory.createForClass(Chats);