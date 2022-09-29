import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Schema as SchemaMongose} from "mongoose";

enum CoinsUserType {
    IN = 'in',
    OUT = 'out'
}

@Schema()
export class CoinsUserSchema {

    @Prop({type: Number, required: true})
    coinsU: number

    @Prop({type: Number, default: 0})
    oldCoins: number
}

export const coinsSchema = SchemaFactory.createForClass(CoinsUserSchema);

