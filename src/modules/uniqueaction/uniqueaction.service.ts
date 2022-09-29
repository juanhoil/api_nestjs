import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { QueenRedisE } from 'src/common/interfaces/redis.type';
import { queueTime } from 'src/common/utils/date';
import { randomIntFromInterval } from 'src/common/utils/random';
import { UniqueAction, UniqueActionDocument } from './schema/uniqueaction.schema';
import { MyQueueService } from '../my-queue/my-queue.service';

@Injectable()
export class UniqueActionService {

    constructor(
        @InjectModel(UniqueAction.name) public model: ModelType<UniqueActionDocument, UniqueAction>,
        @Inject(forwardRef(() => MyQueueService)) private queueService: MyQueueService
    ) {}

    async search(customerID, virtualID) {
        let params = {
            virtual: virtualID,
            customer: customerID,
        }
        let uniqueActions = await this.model.findOne(params, '_id type');

        if (uniqueActions) {
            return {
                message: 'exist one',
                error: false,
                exist: true,
            };
        } else {
            return {
                message: 'not exist one',
                error: false,
                exist: false,
            };
        }
    }

    async getAllByVirtual(where: any, select: any) {
        const find = async () => {
            const data = await this.model
                .find()
                .where(where)
                .select(select);
            let uniq: any = {}

            if (data) {
                for (const unic of data) {
                    uniq[unic.type] = true
                }
            }
            return uniq;
        };
        return find();
    }

    async searchOrUpdate(action, customerID, virtualID) {
        action = action.toLowerCase();
        let matchKey = /likeme|like|pin|favorites|dislike/;

        if (!matchKey.test(action)) {
            return {
                message: `Invalid action param. like, pin and favorites are the only one accepted`,
                error: true,
            }
        }

        let trygger = ['pin', 'like', 'favorites'];

        let params = {
            virtual: virtualID,
            customer: customerID,
            type: action
        }

        if (action == 'dislike' || action == 'like') {
            params.type = 'like'
            let uniqueActions = await this.model.findOne(params, '_id type');
            params.type = 'dislike'
            let uniqueActions2 = await this.model.findOne(params, '_id type');

            if (uniqueActions != null || uniqueActions2 != null) {

                let id = '';
                params.type = action

                if (uniqueActions2 != null) {
                    id = uniqueActions2._id
                } else {
                    id = uniqueActions._id
                }
                // @ts-ignore
                let updateAction = await this.model.findOneAndUpdate({ _id: id }, params, { new: true });
                return {
                    message: 'update action',
                    error: false,
                    data: updateAction,
                    action: 'update'
                };
            } else {
                params.type = action
                const saveAction = new this.model(params);
                let save = await saveAction.save();

                //this.automaticTriggerUniqueAction(save._id)

                return {
                    message: 'save action',
                    error: false,
                    data: save,
                    action: 'create'
                };
            }
        }

        let uniqueActions = await this.model.findOne(params, '_id type');

        if (uniqueActions) {
            let deleteAction = await this.model.findOneAndDelete({ _id: uniqueActions._id }, params);
            return {
                message: 'delete action',
                error: false,
                data: deleteAction,
                action: 'delete'
            };
        } else {

            const saveAction = new this.model(params);
            let save = await saveAction.save();

            this.automaticTriggerUniqueAction(save._id)

            return {
                message: 'save action',
                error: false,
                data: save,
                action: 'create'
            };
        }

    }

    async automaticTriggerUniqueAction(uniqueID) {
        let random = randomIntFromInterval(1,10)
        console.log(random, random == 1)
        if(random == 1){
            console.log('enviara un like')
            const unique = await this.model.findOne({_id: uniqueID});
            await this.triggerUniqueQueen({
                customer: unique.customer.toString(),
                virtual: unique.virtual.toString(),
                type: unique.type as "pin" | 'like' | 'favorites'
            })
        }
        
    }

    async triggerUniqueQueen(payload: {
        customer: string,
        virtual: string,
        type: "pin" | 'like' | 'favorites'
    }) {

        const time = queueTime()
        this.queueService.addQueueTrigger({
            payload: {
                virtualId: payload.virtual,
                customerId: payload.customer,
                type: payload.type
            },
            type: QueenRedisE.LIKE_PIN_FAVORITES,
            details: time,
        }, 60000)

    }

}