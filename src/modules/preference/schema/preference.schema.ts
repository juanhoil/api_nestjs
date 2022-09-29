import {Document, Schema as SchemaGo, Schema as SchemaMongose, SchemaTypes} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

enum TriggersStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    DISCARDED = 'discarded'
}

@Schema({
    collection: 'preferences',
    timestamps: true
})
export class Preference extends Document {

    @Prop({type: String})
    name: string;

    @Prop({type: Boolean, default: false})
    active: boolean;
}

export type PreferenceDocument = Preference & Document;

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
