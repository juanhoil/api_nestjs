import {Document, Schema as SchemaMongose, SchemaTypes} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema({
    collection: 'cities',
    timestamps: true,
})
export class Citys extends Document {

    @Prop({type: String, lowercase: true})
    city: string;

    @Prop({type: SchemaMongose.Types.ObjectId, ref: "region"})
    region: any;

    @Prop({type: Number})
    regionCode: number
}

export type CitysDocument = Citys & Document;

export const CitysSchema = SchemaFactory.createForClass(Citys);