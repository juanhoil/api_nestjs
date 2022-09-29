import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

enum CoinsUserType {
    IN = 'in',
    OUT = 'out'
}

@Schema({
    timestamps: true
})
export class TriggerMessage {

    @Prop({ type: String })
    name: string;

    @Prop({ type: Date, default: Date.now() })
    executedOut: Date;

    @Prop({ type: Date, default: Date.now() })
    executedIn: Date;


    @Prop({ type: String })
    in: string;


    @Prop({ type: String })
    out: string;
}

export const triggerMessage = SchemaFactory.createForClass(TriggerMessage);