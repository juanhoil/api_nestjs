import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MyQueue, MyQueueDocument, MyQueueStatus, MyQueueType } from './schema/my-queue.schema';
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { ChatService } from '../chat/chat.service';
import { QueueTrigger } from 'src/interfaces/triggers.type';
import { QueenRedisE } from 'src/common/interfaces/redis.type';
import { UniqueActionService } from '../uniqueaction/uniqueaction.service';
import { notification } from 'src/common/service/notifications';
import { queueTime } from 'src/common/utils/date';

@Injectable()
export class MyQueueService {
    constructor(
        @InjectModel(MyQueue.name) public model: ModelType<MyQueueDocument, MyQueue>,
        @Inject(forwardRef(() => UniqueActionService))
        private uniqueActionService: UniqueActionService,
        @InjectQueue('trigger') private readonly trigger: Queue,
        @Inject(forwardRef(() => ChatService))
        private readonly chatService: ChatService
    ){}

    async testRediss() {
        const time = queueTime()
        this.addQueueTrigger({
            payload: {
                type: 'test'
            },
            type: 'test',
            details: time,
        }, 0)
    }

    async sendQueueCount(isForce?:boolean) {
        if(isForce){
            await notification.notificationService.sendQueueCount(isForce)
            return 1
        }
        await notification.notificationService.sendQueueCount(false)

        return true
    }
  
    async searchOrUpdate(params: any) {
        params.type = params.type.toLowerCase();

        if(params.type === MyQueueType.CHAT ){
            const findQueue = await this.model.findOne({ chat: params.chat })
            const chat = this.chatService.model.findOne({ _id: params.chat })
            if(findQueue){
                return findQueue
            }else{
                if (chat) {
                    const newQueue = await this.model.create(params)
                    if(params.status === MyQueueStatus.QUEUED){
                        //-----------axios
                        await this.sendQueueCount()
                    }
                    return newQueue.toJSON();
                }
            }
        }
        let filter:any
        if(params.type === MyQueueType.CONTENT ){
            filter = { content : params.content}
        }

        if(params.type === MyQueueType.VERIFICATION ){
            filter = { verification : params.verification}
        }

        let findQueue = await this.model.findOne(filter)
        if(findQueue){
            
            if(findQueue.status === MyQueueStatus.CLOSE){
                findQueue = await this.model.findOneAndUpdate(filter,{ $set: params },{ new: true })
            }
            return findQueue
        }else{
            const newQueue = await this.model.create(params)
            if(params.status === MyQueueStatus.QUEUED){
                //-----------axios
                await this.sendQueueCount()
            }
            return newQueue.toJSON(); 
        }

    }

    async addMyQueueChat(payload: any = {}, isForce:boolean) {
        //este es para el prosesamiento de triggers o crons
        const { chat: chatId = '' } = payload
        const findQueue = await this.model.findOne({ chat: chatId })
        const chat = await this.chatService.model.findById(chatId).populate("customer")

        if (!findQueue) {
            if (chat) {
                const newQueue = await this.model.create({
                    type: MyQueueType.CHAT,
                    status: MyQueueStatus.CLOSE,
                    date: new Date(),
                    chat: chatId
                })
                return newQueue.toJSON();
            }
        }
        let validation = false
        if (isForce) {
            validation = true
        } else {
            validation = findQueue.status === 'close'
        }
        
        if (findQueue && validation) {
            const { customer } = chat
            // @ts-ignore
            const { account_activated = true } = customer
            if (chat && account_activated) {
                // @ts-ignore
                await this.model.updateOne({ chat: chatId }, {
                    ...payload,
                    status: MyQueueStatus.QUEUED,
                    date: new Date()
                } as MyQueue, {
                    new: true
                })
                //-----------axios
                await this.sendQueueCount()
            }
        }
    }

    async addQueueTrigger<T>(data: QueueTrigger<T>, delay: number) {
        console.log('trigger add ', data.type)
        await this.trigger.add('queue_generic_dirty', data, {
            delay: delay
        });
    }

    async processTrigger(type: string, payload: any) {
        console.log("processTrigger", type)
        switch (type) {
            case QueenRedisE.BIRTHDAY:
                await this.processTriggerBirthDay(payload)
                break;
            case QueenRedisE.MONTH:
                await this.processTriggerMonth(payload)
                break;
            case QueenRedisE.WEEK:
                await this.processTriggerWeek(payload)
                break;
            case QueenRedisE.ONLINE:
                await this.processTriggerOnline(payload)
                break;
            case QueenRedisE.NEIGHBOR_CITY:
                await this.processTriggerNeighborsCity(payload)
                break;
            case QueenRedisE.LIKE_PIN_FAVORITES:
                await this.processTriggerLikePinFavorites(payload)
                break;
            case QueenRedisE.FIREME:
                await this.processTriggerSendFireMe(payload)
                break;
            case QueenRedisE.USE_VIEW_PROFILE:
                await this.processTriggerUserViewProfile(payload)
                break;
            case QueenRedisE.FOLLOW_UP_USER_NO_LOGIN:
                await this.processTriggerFUUNL(payload)
                break;
            case QueenRedisE.FOLLOW_UP:
                await this.processTriggerFollowUp(payload)
                break;
            case QueenRedisE.FORCE_FOLLOW_UP:
                await this.processTriggerForceFollowUp(payload)
                break;
            case QueenRedisE.FOLLOW_UP_120:
                await this.processTriggerFollowUp120(payload)
                break;
            case QueenRedisE.BRING_HIM_BACK:
                await this.processTriggerBringHimBack(payload)
                break;
            case QueenRedisE.FOLLOW_UP_5_HRS:
                await this.processTriggerFollowUp5HRS(payload)
                break;
            case QueenRedisE.FOLLOW_UP_1_5_DAY:
                await this.processTriggerFollowUp1_5day(payload)
                break;
            case QueenRedisE.FOLLOW_UP_WEEK:
                await this.processTriggerFollowUpWeek(payload)
                break;
            case QueenRedisE.UNLIMITED_COINS_24_HRS:
                await this.processTriggerPaymet24hrs(payload)
                break;
            case QueenRedisE.FOLLOW_UP_MESSAGE_UNLIMITED:
                await this.processTriggerMessageUnlimited(payload)
                break;
            case QueenRedisE.FOLLOW_UP_MONTH:
                await this.processTriggerFollowUpMonth(payload)
                break;
            default:
                console.log('trigger no encontrado')
        }
    }

    async processTriggerMessageUnlimited(payload:any){
        /*let queue = await this.model.findOneAndUpdate(
            { _id: payload.queueId },
            { stopped: false, status: MyQueueStatus.QUEUED },
            { new: true }
        )
        await this.chatService.model.findByIdAndUpdate(queue.chat, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP_MESSAGE_UNLIMITED,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FOLLOW_UP_MESSAGE_UNLIMITED,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.sendQueueCount()*/
    }
    async processTriggerPaymet24hrs(payload:any){
       
    }

    async processTriggerBirthDay(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.BIRTHDAY,
                color: 'orange',
                icon: "fas fa-birthday-cake",
                description: QueenRedisE.BIRTHDAY,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerMonth(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.MONTH,
                color: 'red-12',
                icon: "event_note",
                description: QueenRedisE.MONTH,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerWeek(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.WEEK,
                color: 'red-12',
                icon: "event_note",
                description: QueenRedisE.WEEK,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerOnline(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.ONLINE,
                color: 'orange',
                icon: "fas fa-check-double",
                description: QueenRedisE.ONLINE,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerNeighborsCity(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.NEIGHBOR_CITY,
                color: 'orange',
                icon: "far fa-building",
                description: QueenRedisE.NEIGHBOR_CITY,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerFUUNL(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP_USER_NO_LOGIN,
                color: 'blue',
                icon: "far fa-comments",
                description: "user no login two days",
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerLikePinFavorites(payload: any) {

        const action = this.uniqueActionService.model.findOne({
            customer: payload.customerId,
            virtual: payload.virtualId,
            type: payload.type,
            executed_trigger: false
        })
        if (action) {
            const { isNew, chat: isChat } = await this.chatService.createNewChat(payload.customerId, payload.virtualId, true);
            if (isNew && isChat) { //solo para generar una conversacion en otras palabras si es un nuevo chat

                const data = {
                    name: '',
                    color: '',
                    icon: "",
                    description: "",
                    virtual: payload.virtualId,
                    customer: payload.customerId,
                    executionTime: 23,
                    executed: false,
                    status: "pending",
                }
                if (payload.type === 'pin') {
                    data.name = QueenRedisE.LIKE_PIN_FAVORITES;
                    data.color = 'green';
                    data.icon = 'far fa-thumbs-up';
                    data.description = 'Customer sent PIN';

                }

                if (payload.type === 'like') {

                    data.name = QueenRedisE.LIKE_PIN_FAVORITES;
                    data.color = 'green';
                    data.icon = 'far fa-thumbs-up';
                    data.description = 'Customer sent Like';

                }
                if (payload.type === 'favorites') {

                    data.name = QueenRedisE.LIKE_PIN_FAVORITES;
                    data.color = 'green';
                    data.icon = "far fa-star";
                    data.description = 'Customer added you to Favorites';

                }

                if (data.name.length > 0) {
                    await this.chatService.model.findByIdAndUpdate(isChat._id, {
                        "busy.active": false,
                        "busy.ready": true,
                        "busy.userID": "",
                        stackStatus: "queued",
                        activeTrigger: data
                    } as any)
                    await this.addMyQueueChat({ chat: payload.chatId }, true)
                }

                // @ts-ignore
                //await this.uniqueActionService.model.findOneAndUpdate({ customer: payload.customerId, virtual: payload.virtualId, type: payload.type, executed_trigger: false }, { executed_trigger: true }, { new: true })
            }
        }
    }

    async processTriggerSendFireMe(payload: any) {

        /*const isChat = await this.chatService.findChatByCusAndVirt(payload.customer, payload.virtual._id);
        if (!isChat) {
            this.uniqueActionService.searchOrUpdate('likeme', payload.customer, payload.virtual._id)
            
            this.userService.model.findOneAndUpdate(
                { _id: payload.customer },
                {  $inc: { newLikeme: +1 } },
                { new: true }
            )
            /*this.chatService.sendNotificationFireMe({
                color: colorsNotificationEnum.GREEN,
                type: typeNotificationEnum.POSITIVE,
                isLoad: true,
                payload: {
                    customerId: payload.customer,
                    picture: payload.virtual.picture.thumbnailUrl,
                    message: "Fire Me",
                    name: payload.virtual.nick_name
                }
            })*
        }*/
    }

    async processTriggerUserViewProfile(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.USE_VIEW_PROFILE,
                color: 'green',
                icon: "far fa-id-badge",
                description: QueenRedisE.USE_VIEW_PROFILE,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerFollowUp(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FOLLOW_UP,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerForceFollowUp(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FORCE_FOLLOW_UP,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FORCE_FOLLOW_UP,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)

        await this.addMyQueueChat({ chat: payload.chatId }, true)
    }

    async processTriggerFollowUp120(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP_120,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FOLLOW_UP_120,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerBringHimBack(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.BRING_HIM_BACK,
                color: 'red-12',
                icon: "replay",
                description: QueenRedisE.BRING_HIM_BACK,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerFollowUp5HRS(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP_5_HRS,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FOLLOW_UP_5_HRS,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerFollowUp1_5day(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP_1_5_DAY,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FOLLOW_UP_1_5_DAY,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerFollowUpWeek(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP_WEEK,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FOLLOW_UP_WEEK,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

    async processTriggerFollowUpMonth(payload: any) {
        await this.chatService.model.findByIdAndUpdate(payload.chatId, {
            "busy.active": false,
            "busy.ready": true,
            "busy.userID": "",
            stackStatus: "queued",
            activeTrigger: {
                name: QueenRedisE.FOLLOW_UP_MONTH,
                color: 'blue',
                icon: "far fa-comments",
                description: QueenRedisE.FOLLOW_UP_MONTH,
                virtual: payload.virtualId,
                customer: payload.customerId,
                executionTime: 23,
                executed: false,
                status: "pending",
            }
        } as any)
        await this.addMyQueueChat({ chat: payload.chatId }, false)
    }

}
