/*import { Field, ID, ObjectType, InputType } from "@nestjs/graphql";
import { ClassType } from "type-graphql";
import { IDField } from "@nestjs-query/query-graphql";
import { TriggerMessage } from "../../../../common/schemas/message/trigger.message";
import { MediaMessage } from "src/common/schemas/message/media.message";
@ObjectType()
export class MessagesModel {

    @IDField(() => ID)
    _id: string;

    @Field({ nullable: true })
    chat: string;

    @Field()
    customer: string

    @Field()
    virtual: string

    @Field()
    user: string

    @Field({ nullable: true })
    message: string;

    @Field()
    customer_write: boolean;

    @Field()
    reported: boolean;

    @Field(() => [MediaMessage],{ nullable: true })
    media: Array<MediaMessage>;

    //@Prop({ type: flagMessage })
    @Field()
    flags: string // FlagMessage

    // @Prop({ type: readSchema })
    @Field()
    read: string;

    //@Prop({ type: pausedSchema })
    @Field()
    paused: string;

    // @Prop({ type: delaySchema })
    @Field()
    delay: string;

    //@Prop({ type: Boolean })
    @Field()
    trigger_exists: string;

    // @Prop({ type: Date, default: Date.now() })
    @Field()
    timestamp: Date;

    @Field()
    createdAt: Date;

    // @Prop({ type: triggerMessage })
    @Field(of => TriggerMessage,{ nullable: true })
    trigger: TriggerMessage // TriggerMessage;

    @Field()
    to: string

    @Field()
    from: string

}*/