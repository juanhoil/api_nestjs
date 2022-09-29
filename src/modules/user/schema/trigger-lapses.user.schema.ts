import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

enum CoinsUserType {
    IN = 'in',
    OUT = 'out'
}
@Schema()
export class TriggerLapsesUserSchema {

    @Prop({type: Number, default: 12})
    trigger_online: number;

    @Prop({type: Date})
    last_triggerOnline_executed: Date

    @Prop({type: Number, default: 12})
    trigger_neighbors: number

    @Prop({type: Date})
    last_triggerNeighbors_executed: Date

    @Prop({type: Date})
    last_tiggerLike_executed: Date

    @Prop({type: Date})
    last_tiggerFire_executed: Date

    @Prop({type: Date})
    last_tiggerFavs_executed: Date

    @Prop({type: Date})
    last_tiggerView_executed: Date
}

export const triggerLapsesUserSchema = SchemaFactory.createForClass(TriggerLapsesUserSchema);

