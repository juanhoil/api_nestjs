import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Preference, PreferenceSchema } from 'src/modules/preference/schema/preference.schema';
import { PictureProfileVerification, pictureProfileVerificationSchema, PictureUser, pictureUserSchema } from "src/modules/user/schema/picture.user.schema";
import { CoinsProfileUserSchema, coinsProfileUserSchema } from './coins-profile.user.schema';
import { coinsSchema, CoinsUserSchema } from './coins.user.schema';
import { customerSchema, CustomerUserSchema } from './customer.user.schema';
import { gallerySchema, GalleryUser } from './gallery.user.schema';
import { geolocation, Geolocation } from './geolocation.schema';
import { LoginUserSchema, loginUserSchema } from './login.user.schema';
import { triggerLapsesUserSchema, TriggerLapsesUserSchema } from './trigger-lapses.user.schema';

export enum RoleEnum {
    CUSTOMER = "customer",
    CS = "cs",
    QA = "qa",
    ADMIN = "admin"
}

export enum TypeEnum {
    CUSTOMER = "customer",
    EMPLOYE = "employee"
}
@Schema({
    collection: 'users',
    timestamps: true
})
export class User {
    _id: string

    @Prop({ type: String, required: true, unique: true })
    email: string;

    @Prop({ type: String, lowercase: true, required: true, unique: true, max: 15 })
    nick_name: string;

    @Prop({
        type: String,
        enum: ["customer", "cs", "qa", "admin"],
        default: "customer",
    })
    role: RoleEnum;

    @Prop({ type: String, required: true })
    password: string

    @Prop({ type: String, enum: ["customer", "employee"], default: "customer" })
    type: TypeEnum

    @Prop({ type: String, default: "" })
    token: string

    @Prop({ type: Boolean, default: false })
    online: boolean;

    @Prop({ type: Boolean, default: true })
    hasDailyCoins: boolean;//coins diarios 

    @Prop({ type: Boolean, default: true })
    isNewCustomer: boolean;//es nuevo registradotriggerUserViewProfileVirtual

    @Prop({ type: Boolean, default: false })
    haveUnlimitedPackage: boolean;//es nuevo

    @Prop({ type: Number, default: 0})
    countUnlimitedChat: number;

    @Prop({ type: Number, default: 0 })
    newLikeme: number;

    @Prop({ type: Number, default: 0 })
    modalWelcome: number;

    @Prop({ type: Boolean, default: true })
    openModalWelcome: boolean;

    @Prop({ type: String, default: "" })
    lastConnection: string

    @Prop({ type: String, default: "" })
    socketId: string

    @Prop({ type: Boolean, default: false })
    waitingForChat: boolean

    @Prop({ type: Boolean, default: true })
    account_activated: boolean

    @Prop({ type: Boolean, default: false })
    email_checked: boolean

    @Prop({ type: Boolean, default: false })
    onboarding_skipped: boolean

    @Prop({ type: Number, })
    total_earnings: number;

    @Prop({ type: Number })
    weight: number;

    @Prop({ type: Date, default: Date.now })
    timestamp: Date

    @Prop({ type: pictureUserSchema })
    picture: PictureUser;

    @Prop({ type: [pictureProfileVerificationSchema] })
    profile_verification: PictureProfileVerification[];

    @Prop({ type: triggerLapsesUserSchema })
    trigger_lapses: TriggerLapsesUserSchema

    @Prop({
        type: customerSchema, default: {
            verified: {
                verifiedAbout: false,
                verified: false,
                verifiedImg: false,
                verifiedImgGallery: false,
                statusAbout: 'accepted',
                statusImage: 'accepted',
                statusProfile: 'accepted',
                statusVerificationProfile: 'accepted',
            },
            country: 'italy'
        }
    })
    customer: CustomerUserSchema;

    @Prop({ type: coinsSchema })
    coins: CoinsUserSchema;

    @Prop({ type: Number })
    purchased_packages: Number

    @Prop({ type: [gallerySchema] })
    gallery: GalleryUser[]

    //@Prop({ type: [creditCard] })
    //creditCard: CreditCard[]

    @Prop({
        type: coinsProfileUserSchema, default: {
            cInteresting: false,
            cAboutme: false,
            cInfo: false,
            cProfilePicture: false,
            cEmailVerification: false,
            cGallery: false,
            cLocation: false,
            cVerificationProfile:false
        }
    })
    addcoins: CoinsProfileUserSchema

    @Prop({ type: [PreferenceSchema] })
    preferences: Preference[]

    //@Prop({ type: Array, default: [] })
    //resources: any[]

    //@Prop({ type: [lockedQueueUserSchema] })
    //lockedQueues: LockedQueueUserSchema[];

    @Prop({ type: loginUserSchema, default: { count : 0} })
    logins: LoginUserSchema;

    @Prop({ type: Array, default: [] })
    webPush: any;

    @Prop({ type: Object })
    tracking:any;

    @Prop({ type: geolocation, default: {
        ipPublic: [],
        lat: '',
        long: '',
    }})
    geolocation: Geolocation;
}

export type UserDocument = User & Document;

// @ts-ignore
export const UserSchema = SchemaFactory.createForClass(User);
