import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
//import { Field, ObjectType } from "@nestjs/graphql";
import { VerifiedGallery, verifiedGallerySchema } from "./VerifiedGallerySchema";


//@ObjectType()
@Schema()
export class GalleryUser {
    //@Field()
    _id: string

    //@Field(of => VerifiedGallery)
    @Prop({
        type: verifiedGallerySchema, default: {
            acceptedByQa: false,
            verified: false,
            status: 'edited'
        }
    })
    verified: VerifiedGallery

    //@Field({ nullable: true })
    @Prop({ type: Date, default: new Date() })
    uploadDate: Date

    //@Field({ nullable: true })
    @Prop({ type: Boolean, default: false })
    publicImg: boolean;

    //@Field({ nullable: true })
    @Prop({ type: Boolean, default: false })
    image_verified: boolean

    //@Field({ nullable: true })
    @Prop({ type: Boolean, default: false })
    image_verified_Qa: boolean

    //@Field({ nullable: true })
    @Prop({ type: Date })
    update_At: Date

    //@Field({ nullable: true })
    @Prop({ type: String })
    fileId: string

    //@Field({ nullable: true })
    @Prop({ type: String })
    name: string

    //@Field({ nullable: true })
    @Prop({ type: String })
    filePath: string

    //@Field({ nullable: true })
    @Prop({ type: String })
    url: string

    //@Field({ nullable: true })
    @Prop({ type: String })
    thumbnailUrl: string
}

export const gallerySchema = SchemaFactory.createForClass(GalleryUser);

