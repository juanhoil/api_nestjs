//import { Field, ObjectType, } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as SchemaMongose } from "mongoose";

//@ObjectType()
@Schema()
export class VerifiedGallery {

    //@Field()
    @Prop({ type: Boolean, default: false })
    acceptedByQa: boolean;

    //@Field()
    @Prop({ type: Boolean, default: false })
    verified: boolean;

    //@Field({ nullable: true })
    @Prop()
    verified_at: Date;

    //@Field({ nullable: true })
    @Prop({ type: String, enum: ["cs", "qa", "admin"] })
    type: string

    //@Field({ nullable: true })
    @Prop({ type: SchemaMongose.Types.ObjectId, ref: "user", default: null })
    by: string

    //@Field()
    @Prop({ type: String, enum: ["edited", "accepted", "declined"], default: "edited" })
    status: string
}

export const verifiedGallerySchema = SchemaFactory.createForClass(VerifiedGallery);
