import {Document, Schema as SchemaMongose, SchemaTypes} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Virtual} from "../../virtual/schema/virtual.schema";


enum TriggersStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    DISCARDED = 'discarded'
}

@Schema({
    collection: 'triggers_config',
    timestamps: true
})
export class Triggers extends Document {
    @Prop({type: String})
    name: string;

    @Prop({type: String, required: true})
    color: string;

    @Prop({type: String, required: true})
    icon: string

    @Prop({type: String, required: true})
    description: string

    @Prop({type: SchemaMongose.Types.ObjectId, ref: 'chat'})
    chat: any;

    @Prop({type: SchemaMongose.Types.ObjectId, ref: 'virtual'})
    virtual: any

    @Prop({type: SchemaMongose.Types.ObjectId, ref: 'user'})
    customer: any

    @Prop({type: Number})
    executionTime: number

    @Prop({type: Boolean, default: false})
    executed: boolean;

    @Prop({type: Number})
    executedTime: number

    @Prop({type: String, enum: ['pending', 'completed', 'discarded'], required: true, default: 'pending'})
    status: TriggersStatus
}

export type TriggersDocument = Triggers & Document;

export const TriggersSchema = SchemaFactory.createForClass(Triggers);