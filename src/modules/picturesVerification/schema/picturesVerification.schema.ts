import { Document, Schema as SchemaMongose, Schema as SchemaGo, SchemaTypes } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    collection: 'pictureVerification',
    timestamps: true,
})
export class PictureVerification extends Document {

    @Prop({type: String})
    fileId: string;
    @Prop({type: String})
    name: string;
    @Prop({type: String})
    filePath: string;
    @Prop({type: String})
    url: string;
    @Prop({type: String})
    thumbnailUrl: string;

}

export type PictureVerificationDocument = PictureVerification & Document;

export const PictureVerificationSchema = SchemaFactory.createForClass(PictureVerification);