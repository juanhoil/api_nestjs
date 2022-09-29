import {Document, Schema as SchemaGo} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { User } from "src/modules/user/schema/user.schema";
import { Virtual } from "src/modules/virtual/schema/virtual.schema";

@Schema({
    collection: 'list_user_view_profile',
    timestamps: true
})
export class UserViewProfile extends Document {

    @Prop({type: SchemaGo.Types.ObjectId, ref: User.name, required: true})
    customer: SchemaGo.Types.ObjectId | string

    @Prop({type: SchemaGo.Types.ObjectId, ref: Virtual.name, required: true})
    virtual: SchemaGo.Types.ObjectId | string

    @Prop({type: Date, default: Date.now()})
    viewDate: Date

    @Prop({type: Boolean, default: true})
    isCandidate: boolean

    @Prop({type: Boolean, default: false})
    isComplete: boolean

}

export type UserViewProfileDocument = UserViewProfile & Document;

// @ts-ignore
export const UserViewProfileSchema = SchemaFactory.createForClass(UserViewProfile);
