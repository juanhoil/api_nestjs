import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as SchemaMongose } from "mongoose";

export const DefaultValueCoins = {
    cInteresting : {coins: 40, label: 'Add 5 interests'},
    cAboutme : {coins: 40, label: 'Upload info about yourself'},
    cLocation : {coins: 40, label: 'Upload info location'},
    cVerificationProfile : {coins: 100, label: 'Verify your profile'},
    cInfo : {coins: 40, label: 'Personal Information'},
    cProfilePicture : {coins: 60, label: 'Upload your profile picture'},
    cEmailVerification : {coins: 100, label: 'Add 5 photos'},
    cGallery : {coins: 50, label: 'Add 5 photos'},
    hasDailyCoins : {coins: 10, label: 'Login in every day'},
    isNewCustomer : {coins: 100, label:  'Create account'},
}

export enum DefaultTypeCoins {
    cInteresting = 'cInteresting',
    cAboutme = 'cAboutme',
    cLocation = 'cLocation',
    cVerificationProfile = 'cVerificationProfile',
    cInfo = 'cInfo',
    cProfilePicture = 'cProfilePicture',
    cEmailVerification = 'cEmailVerification',
    cGallery = 'cGallery',
    hasDailyCoins = 'hasDailyCoins',
    isNewCustomer = 'isNewCustomer'
}

@Schema()
export class CoinsProfileUserSchema {

    @Prop({ type: Boolean, default: false })
    cInteresting: boolean

    @Prop({ type: Boolean, default: false })
    cAboutme: boolean

    @Prop({ type: Boolean, default: false })
    cLocation: boolean

    @Prop({ type: Boolean, default: false })
    cVerificationProfile: boolean

    @Prop({ type: Boolean, default: false })
    cInfo: boolean

    @Prop({ type: Boolean, default: false })
    cProfilePicture: boolean

    @Prop({ type: Boolean, default: false })
    cEmailVerification: boolean

    @Prop({ type: Boolean, default: false })
    cGallery: boolean;
}

export const coinsProfileUserSchema = SchemaFactory.createForClass(CoinsProfileUserSchema);

