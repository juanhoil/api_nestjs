import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Geolocation {

    @Prop({type: Array, default: []})
    ipPublic: string

    @Prop({type: String})
    lat: string

    @Prop({type: String})
    long: string


}

export const geolocation = SchemaFactory.createForClass(Geolocation);