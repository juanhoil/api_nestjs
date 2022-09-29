import { Document, Schema as SchemaMongose, Schema as SchemaGo, SchemaTypes } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from "src/modules/user/schema/user.schema";

@Schema({
    collection: 'paymentHistory',
    timestamps: true,
})
export class PaymentHistory extends Document {
    _id: string;

    @Prop({ type: String, lowercase: true })
    text: string;

    @Prop({ type: Number })
    cardNum: number;

    @Prop({ type: Number })
    coins: number;

    @Prop({ type: Number})
    amount: number;

    @Prop({ type: Date, default: Date.now })
    date: Date

    @Prop({ type: SchemaGo.Types.ObjectId, ref: User.name, required: false })
    user: User | string | SchemaGo.Types.ObjectId

    @Prop({ type: String })
    transactionId: string

    @Prop({ type: String })
    paymentTokenId: string

    @Prop({ type: String })
    paymentType: string

    @Prop({ type: Boolean, default: false })
    isActiveUnlimited: boolean

    @Prop({ type: String })
    subscriptionId: string

    @Prop({ type: String })
    paymentUniqueId: string
}

export type PaymentHistoryDocument = PaymentHistory & Document;

export const PaymentHistorySchema = SchemaFactory.createForClass(PaymentHistory);