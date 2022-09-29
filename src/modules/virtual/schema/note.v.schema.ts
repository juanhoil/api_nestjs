import {Document, Schema as SchemaGo} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';


@Schema({
    timestamps: true
})
export class Note extends Document {

    @Prop({type: String})
    text: string

    @Prop({type: String})
    importance: string

    @Prop({type: Boolean, default: false})
    archive: boolean;

    @Prop({type: String, default: 'white'})
    color: string

    @Prop({type: SchemaGo.Types.ObjectId, ref: "user", required: true})
    autor: string | any
}

export type NoteDocument = Note & Document;

export const NoteSchema = SchemaFactory.createForClass(Note);