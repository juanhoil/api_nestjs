/*import { InjectPubSub } from "@nestjs-query/query-graphql";
import { PubSub } from "graphql-subscriptions";
import { CountChatModel } from "../../../common/schemas/chat/count.chat.model";
import { Args, Query, Resolver, Subscription } from "@nestjs/graphql";
import { NotificationsModel } from "../../../common/schemas/notifications/notifications.model";
import { NewMessagesNotifications } from "./schema/newMessage.model";
import { Inject, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { QglAuthGuard } from "src/modules/auth/guards/gql-auth.guard";
import { Public } from "src/common/decorator/public.decorator";

@Resolver()
@Public()
export class MessageResolver {
    constructor(@Inject('PUB_SUB') private pubSub: PubSub) {
    }

    @Subscription(() => NewMessagesNotifications, {
        filter: (payload: { newMessage: NewMessagesNotifications }, variables) => {
            return payload.newMessage.customerId === variables.id
        }
    })
    async newMessage(@Args('id') id: string) {
        return this.pubSub.asyncIterator<NewMessagesNotifications>('newMessage');
    }

    @Subscription(() => NewMessagesNotifications, {
        filter: (payload: { newMessageDirty: NewMessagesNotifications }, variables) => {
            return payload.newMessageDirty.customerId === variables.id
        }
    })
    async newMessageDirty(@Args('id') id: string) {
        return this.pubSub.asyncIterator<NewMessagesNotifications>('newMessageDirty');
    }

}*/