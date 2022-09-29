import {Document, Schema as SchemaGo} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Preference} from "src/modules/preference/schema/preference.schema";
import { Note, NoteSchema } from "./note.v.schema";


export interface IVirtualPicture {
    fileId: string
    name: string
    filePath: string
    url: string
    thumbnailUrl: string
}

export interface IVirtualNote {
    about_me: string,
    my_story: [VirtualStoryNote]
}

interface VirtualStoryNote {
    title: string,
    name: string,
    value: string,
    focus: boolean
}

export interface IchatNotesVirtual extends Document {
    label: string;
    color: string;
    author: string;
    user: any ///IUser | string;
    createdAt: Date;
    updatedAt: Date;
    archived: boolean;
}

export interface IPublicPictures {
    fileId: string
    name: string
    filePath: string
    url: string
    thumbnailUrl: string
    uploadDate: Date
    isBlured: boolean
    isPrivate: boolean
}

export interface IVirtualProfile extends Document {
    nick_name: string;
    born_date: Date;
    looking_for: string;
    orientation: string;
    picture: IVirtualPicture;
    height: number;
    weight: number;
    hair_color: string;
    eye_color: string;
    body_art: string;
    ethnicity: string;
    living: string;
    drinking_habits: string;
    religion: string;
    education: string;
    children: number;
    smoking_habits: string;
    zodiac_sign: string;
    body_style: string;
    status: string;
    virtualNotes: Array<IVirtualNote>;
    chatNotesVirtual: Array<IchatNotesVirtual> | any[];
    chatNotes: string;
    timestamp: Date;
    preferences: Array<string>;
    account_activated: boolean;
    gender: string;
    country: string;
    region: string;
    city: string;
    province: string;
    age: number;
    myStory: any; // IMyStory;
    publicPictures: Array<IPublicPictures>;
    privatePictures: Array<IPrivatePictures>;
    online: boolean;
    isDisabled: boolean;
    // recordEarnings: Array<string>
}

export interface IPrivatePictures {
    fileId: string
    name: string
    filePath: string
    url: string
    thumbnailUrl: string
    uploadDate: Date
    isPrivate: boolean
}


const VirtualStorySchema = new SchemaGo({
    title: String,
    name: String,
    value: String,
    focus: Boolean
})

const virtualPictureSchema = new SchemaGo({
    fileId: String,
    name: String,
    filePath: String,
    url: String,
    thumbnailUrl: String
})

const virtualNoteSchema = new SchemaGo({
    about_me: {type: String, default: ''},
    my_story: {type: [VirtualStorySchema], default: []}
})

const chatNotesVirtualSchema = new SchemaGo(
    {
        label: String,
        color: String,
        author: String,
        user: {type: SchemaGo.Types.ObjectId, ref: "user"},
        createdAt: {type: Date, default: new Date()},
        updatedAt: {type: Date, default: null},
        archived: {type: Boolean, default: false},

    },
    {timestamps: true}
);


const publicPicturesSchema = new SchemaGo({
    fileId: String,
    name: String,
    filePath: String,
    url: String,
    thumbnailUrl: String,
    uploadDate: {type: Date, default: new Date()},
    isBlured: {type: Boolean, default: false},
    isPrivate: {type: Boolean, default: false}
})

const privatePicturesSchema = new SchemaGo({
    fileId: String,
    name: String,
    filePath: String,
    url: String,
    thumbnailUrl: String,
    uploadDate: {type: Date, default: new Date()},
    isPrivate: {type: Boolean, default: true}
})


export type VirtualDocument = Virtual & Document;

@Schema({
    collection: 'virtuals'
})
export class Virtual extends Document {

    @Prop({
        lowercase: true,
        required: true,
        unique: true
    })
    nick_name: string;

    @Prop({type: String, lowercase: true})
    about_me: string;

    @Prop({type: Date, required: true})
    born_date: string;

    @Prop({type: String, required: true})
    looking_for: string;

    @Prop({type: String, required: true})
    orientation: string;

    @Prop({type: virtualPictureSchema})
    picture: any

    @Prop({type: Number})
    height: number;

    @Prop({type: Number})
    weight: number;

    @Prop({type: String})
    hair_color: string;

    @Prop({type: String})
    eye_color: string;

    @Prop({type: String})
    body_art: string;

    @Prop({type: String})
    ethnicity: string;

    @Prop({type: String})
    living: string;

    @Prop({type: String})
    drinking_habits: string

    @Prop({type: String})
    religion: string

    @Prop({type: String})
    education: string

    @Prop({type: Number})
    children: number

    @Prop({type: String})
    smoking_habits: string

    @Prop({type: String})
    zodiac_sign: string

    @Prop({type: String})
    body_style: string

    @Prop({type: String})
    status: string

    @Prop({type: virtualNoteSchema})
    virtualNotes: any

    @Prop({type: [NoteSchema], default: []})
    chatNotes: Note[];

    @Prop({type: [publicPicturesSchema]})
    publicPictures: any

    @Prop({type: [privatePicturesSchema]})
    privatePictures: any

    @Prop({type: Date, default: Date.now()})
    timestamp: any

    @Prop({type: [{type: SchemaGo.Types.ObjectId, ref: Preference.name}]})
    preferences: string[] | Preference[]

    @Prop({type: Boolean, default: false})
    account_activated: any;

    @Prop({type: String})
    gender: string

    @Prop({type: String, lowercase: true, default: 'italy'})
    country: string;

    @Prop({type: String, lowercase: true})
    region: string;

    @Prop({type: String, lowercase: true})
    city: string;

    @Prop({type: String, lowercase: true})
    province: string;

    @Prop({type: Number})
    age: Number

    @Prop({type: Object, default: {}})
    myStory: any // { type: myStorySchema, default: {} },

    @Prop({type: Boolean, default: false})
    online: boolean

    @Prop({type: Number})
    total_earnings: number

    @Prop({ type: Boolean, default: false })
    verified: boolean;

    @Prop({type: Number})
    isDisabled: number
}

// @ts-ignore
export const VirtualSchema = SchemaFactory.createForClass(Virtual);