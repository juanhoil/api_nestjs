import {Document, Schema as SchemaGo, Schema as SchemaMongose, SchemaTypes} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Virtual } from '../../virtual/schema/virtual.schema';
import { User } from '../../user/schema/user.schema';

export enum IniqueActionEnum {
    PIN = 'pin',
    LIKE = 'like',
    LIKEME = 'likeme',
    FAVORITES = 'favorites',
    DISLIKE = 'dislike',
    VIEW = 'view'
}

@Schema({
    collection: 'uniqueActions',
    timestamps: true
})
export class UniqueAction extends Document {

    @Prop({type: String, enum: ['pin','likeme', 'like', 'favorites', 'dislike', 'view']})
    type: IniqueActionEnum;

    @Prop({type: Boolean, default: false})
    virtual_is_locked: boolean;

    @Prop({type: Date, default: Date.now()})
    timestamp: Date;
    
    @Prop({type: Boolean, default: false})
    executed_trigger: boolean;

    @Prop({type: SchemaMongose.Types.ObjectId, ref: User.name, required: true})
    customer: User | string;

    @Prop({type: SchemaMongose.Types.ObjectId, ref: Virtual.name, required: true})
    virtual: any;
}

export type UniqueActionDocument = UniqueAction & Document;
// @ts-ignore
export const UniqueActionSchema = SchemaFactory.createForClass(UniqueAction);
