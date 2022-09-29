import { Injectable, UnauthorizedException, Request, forwardRef, Inject } from '@nestjs/common';
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "@nestjs/mongoose";
import { ChatsDocument, Chats } from './schema/chat.schema';
import { MyQueueService } from '../my-queue/my-queue.service';
import { MyQueueStatus, MyQueueType } from '../my-queue/schema/my-queue.schema';
import { notification } from 'src/common/service/notifications';

@Injectable()
export class ChatService {

    public constructor(
        @InjectModel(Chats.name) public model: ModelType<ChatsDocument, Chats>,
        @Inject(forwardRef(() => MyQueueService))
        public queueService: MyQueueService,
    ) {
    }

    async testNotificationS (idCustomer: string) {
        return await notification.notificationService.testNotification(idCustomer)
    }

    async createNewChat(customer, virtual, isFirt: boolean) {
        let chat = await this.model.findOne({ customer, virtual })
            .populate('customer')
            .populate('virtual');

        if (chat) {
            return {
                chat,
                isNew: false
            }
        }

        const model = new this.model({
            customer,
            virtual,
            firstMessage: isFirt,
            timestamp: new Date()
        })
        await model.save()
        chat = await this.model.findOne({ customer, virtual }).populate('customer').populate('virtual');

        let payload = {
            type: MyQueueType.CHAT,
            status: MyQueueStatus.CLOSE,
            date: new Date(),
            chat: chat._id.toString()
        };
        this.queueService.searchOrUpdate(payload)

        return {
            chat,
            isNew: true
        }
    }



}