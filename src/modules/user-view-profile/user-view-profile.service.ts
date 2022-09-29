import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { UserViewProfile, UserViewProfileDocument } from "./schema/user-view-profile.schema";
import { Schema as SchemaGo } from "mongoose";
import { MyQueueService } from '../my-queue/my-queue.service';
import { ChatService } from '../chat/chat.service';
import { getRandomInterval, randomHour } from 'src/common/utils/random';
import { shuffle } from 'src/common/utils/shuffle';

interface AgregateGroupBy {
    "_id": {
        "customer": string
    },
    "count": number
}

@Injectable()
export class UserViewProfileService {
    constructor(@InjectModel(UserViewProfile.name) public model: ModelType<UserViewProfileDocument, UserViewProfile>,
        public queueService: MyQueueService,
        public chatServide: ChatService) {
    }

    async findByCusAndVirt(customerId: SchemaGo.Types.ObjectId | string, virtualId: SchemaGo.Types.ObjectId | string) {
        const queue = await this.model.findOne({
            virtual: virtualId,
            customer: customerId,
        });

        console.log('queue', queue)
        if (queue) {
            // @ts-ignore
            if (queue.isComplete && queue.isCandidate) {
                return {
                    status: 'find',
                    find: true
                }
            }
            // @ts-ignore
            queue.isCandidate = true;
            await this.model.updateOne({
                _id: queue._id
            }, queue)
            return {
                status: 'update',
                find: true
            }
        }
        return {
            status: 'undefined',
            find: false
        }

    }

    async setIsCandidate(queue: UserViewProfile) {
        await this.model.updateOne({
            _id: queue._id
        }, queue)
    }

    async triggerUserViewProfileVirtual() {
        const views = await this.model.aggregate<AgregateGroupBy>([
            {
                "$match": {
                    "isComplete": false,
                    "isCandidate": true
                }
            },
            { "$group": { _id: { source: "$source", customer: "$customer", virtual: "$virtual" }, count: { $sum: 1 } } }

        ])
        if (views.length > 0) {
            const dayNow = new Date();
            for (const view of views) {
                const percentage = getRandomInterval(40, 70, { toFixed: 0 })
                const queue = await this.model.find({
                    customer: view._id.customer,
                    isComplete: false,
                    isCandidate: true
                })
                if (queue.length > 0) {
                    let totalQueue = (queue.length / 100) * percentage
                    const totalchat = parseInt(totalQueue.toFixed(0))

                    /*for (let i = totalchat; i < queue.length; i++) {
                        console.log('i', i)
                        const isNotCandidate = queue[i]
                        isNotCandidate.isCandidate = false;
                        await this.service.setIsCandidate(isNotCandidate)
                    }*/
                    const list = Array.from(Array(totalchat).keys())
                    const chatsIndex = shuffle(list)
                    if (queue.length === 1 && chatsIndex.length === 0) {
                        chatsIndex.push(0)
                    }
                    console.log("totalQueue", queue.length)
                    console.log("totalQueueperc", totalchat)
                    console.log("chatsIndex", chatsIndex)

                    const time = `${dayNow.getHours()}:${dayNow.getMinutes()}`
                    let hour = dayNow.getHours() * 60 * 60 * 1000;
                    let minutes = dayNow.getMinutes() * 60 * 1000;
                    let timenow = hour + minutes
                    let getTime = dayNow.getTime()

                    for (const chatI of chatsIndex) {
                        const ramdom = randomHour({
                            hmin: dayNow.getHours(),
                            mmin: dayNow.getMinutes(),
                            isPm: true
                        })
                        const delay = ramdom.time - timenow
                        const exetime = getTime + delay
                        const hourhumna = new Date(exetime).toLocaleString()
                        const details = {
                            hourNow: time,
                            timeNow: timenow,
                            ramdomHour: ramdom.hour,
                            ramdomTime: ramdom.time,
                            delay: delay,
                            exeTime: exetime,
                            humanTime: hourhumna,
                        }
                        const virtual = queue[chatI].virtual;
                        const customer = queue[chatI].customer
                        const { isNew, chat } = await this.chatServide.createNewChat(customer, virtual, true)
                        await this.queueService.addQueueTrigger({
                            payload: {
                                chatId: chat._id,
                                virtualId: virtual,
                                customerId: customer
                            },
                            type: 'user_view_profile_virtual',
                            details: details
                        }, delay);
                    }
                }
            }
        }

        return views
    }

}
