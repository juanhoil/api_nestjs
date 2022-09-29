import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
@Schema()
export class PictureUser {
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

export const pictureUserSchema = SchemaFactory.createForClass(PictureUser);

@Schema()
export class PictureProfileVerification {
    @Prop({type: String})
    fileId: string;
    @Prop({type: String})
    name: string;
    @Prop({type: String})
    filePath: string;
    @Prop({type: String})
    url: string;
    @Prop({type: String})
    imgCompareurl: string;
    @Prop({type: String})
    thumbnailUrl: string;
}

export const pictureProfileVerificationSchema = SchemaFactory.createForClass(PictureProfileVerification);
