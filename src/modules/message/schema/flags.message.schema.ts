import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {string} from "@hapi/joi";
import {Schema as SchemaMongose} from "mongoose";
import { User } from "src/modules/user/schema/user.schema";

export enum FlagValidated {

    DECLINE = "decline",
    ACCEPT = "accept",
    PENDING = "pending"
}



@Schema({timestamps: true})
export class FlagMessage {

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name, required: true })
    userId: string | User

    @Prop({type: String})
    reason: string

    @Prop({type: String})
    description: string

    @Prop({type: Boolean})
    approved: boolean

    @Prop({type: Boolean, default: true})
    active: boolean

    @Prop({ type: String, enum: ["decline", "accept", "pending"], default: "pending"})
    validated:  FlagValidated

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: User.name })
    validatedByQa: string | User
}

export const flagMessage = SchemaFactory.createForClass(FlagMessage);