import {Document, Schema as SchemaMongose, SchemaTypes} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema({
    collection: 'countries',
    timestamps: true,
})
export class Countries extends Document {

    @Prop({type: String, lowercase: true})
    country: string;
    
}

export type CountriesDocument = Countries & Document;

export const CountriesSchema = SchemaFactory.createForClass(Countries);