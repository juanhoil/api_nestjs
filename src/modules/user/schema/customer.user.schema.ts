import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as SchemaGo, Schema as SchemaMongose } from "mongoose";
import { Preference } from "src/modules/preference/schema/preference.schema";

@Schema()
export class VerifiedCustomerSchema {

    @Prop({ type: Boolean, default: false })
    verified: boolean;

    @Prop({ type: Boolean, default: false })
    verifiedAbout: boolean;

    @Prop({ type: Boolean, default: false })
    verifiedImg: boolean;
   
    @Prop({ type: Boolean, default: false })
    verifiedImgGallery: boolean

    @Prop()
    vAboutAt: Date;

    @Prop()
    verified_at: Date;

    @Prop({ type: String, enum: ["cs", "qa", "admin"] })
    type: string

    @Prop({ type: String, enum: ["edited", "accepted", "declined"], default: 'accepted' })
    statusProfile: string

    @Prop({ type: String, enum: ["edited", "accepted", "declined"], default: 'accepted' })
    statusAbout: string

    @Prop({ type: String, enum: ["edited", "accepted", "declined"], default: 'accepted' })
    statusImage: string

    @Prop({ type: String, enum: ["edited", "accepted", "declined"], default: 'accepted' })
    statusVerificationProfile: string

    @Prop({ type: SchemaMongose.Types.ObjectId, ref: "user", default: null })
    by: string | any
}

export const verifiedCustomerSchema = SchemaFactory.createForClass(VerifiedCustomerSchema);

@Schema()
export class CustomerUserSchema {

    @Prop({ type: String, lowercase: true })
    first_name: string;

    @Prop({ type: String, lowercase: true })
    last_name: string

    @Prop({ type: Date })
    born_date: Date

    @Prop({ type: String, lowercase: true, default: 'italy' })
    country: string

    @Prop({ type: String, lowercase: true })
    region: string

    @Prop({ type: String, lowercase: true })
    city: string

    @Prop({ type: String, lowercase: true })
    province: string

    @Prop({ type: Number, required: false })
    age: number

    @Prop({ type: String })
    i_am: string

    @Prop({ type: String, max: 400 })
    about_me: string

    @Prop({ type: String })
    looking_for: string

    @Prop({ type: String })
    orientation: string

    @Prop({ type: String })
    in_search: string

    @Prop({ type: Number })
    height: number

    @Prop({ type: Number })
    tinder_page: number

    @Prop({ type: Number })
    weight: number

    @Prop({ type: String, lowercase: true })
    hair_color: string

    @Prop({ type: String, lowercase: true })
    eye_color: string

    @Prop({ type: String, lowercase: true })
    body_art: string

    @Prop({ type: String, lowercase: true })
    ethnicity: string

    @Prop({ type: String, lowercase: true })
    living: string

    @Prop({ type: String })
    drinking_habits: string

    @Prop({ type: String, lowercase: true })
    religion: string

    @Prop({ type: String, lowercase: true })
    education: string

    @Prop({ type: Number })
    childrens: number

    @Prop({ type: String })
    smoking_habits: string

    @Prop({ type: String, lowercase: true })
    zodiac_sign: string

    @Prop({ type: String, lowercase: true })
    body_style: string

    @Prop({ type: String, lowercase: true })
    status: string

    @Prop({
        type: verifiedCustomerSchema, default: {
            verifiedAbout: false,
            verified: false,
            verifiedImg: false,
            verifiedImgGallery: false,
        }
    })
    verified: VerifiedCustomerSchema

    @Prop({ type: Boolean, default: false })
    terms_and_conditions: boolean;
}

export const customerSchema = SchemaFactory.createForClass(CustomerUserSchema);