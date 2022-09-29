import {Document, Schema as SchemaMongose, SchemaTypes} from "mongoose";
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

export enum coinsType {
    NORMAL = 'Normal',
    BEST = 'Best Seller',
    OFFER = 'Offer',
    UNLIMITED = 'Unlimited'
}

@Schema({
    collection: 'coins',
    timestamps: true,
})
export class PackCoins extends Document {

    @Prop({type:String})
    title: string;

    @Prop({type: Number})
    noCoins: number;

    @Prop({type: Number})
    price: number;

    @Prop({type:String})
    name: string;

    @Prop({type:String})
    typeCard: string;

    @Prop({type:Number})
    position: number;

    @Prop({type:Boolean})
    isDefault: boolean;

    @Prop({type:Boolean})
    isActive: boolean;

}

export type PackCoinsDocument = PackCoins & Document;

export const PackCoinsSchema = SchemaFactory.createForClass(PackCoins);