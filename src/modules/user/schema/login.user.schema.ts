import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class LoginUserSchema {
    @Prop()
    login_at: Date;

    @Prop()
    count: number;
}
export const loginUserSchema = SchemaFactory.createForClass(LoginUserSchema);