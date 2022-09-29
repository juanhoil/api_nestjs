import { Injectable, forwardRef, Request, BadGatewayException, Inject, NotFoundException } from '@nestjs/common';
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "@nestjs/mongoose";
import { RoleEnum, TypeEnum, User, UserDocument } from './schema/user.schema';
import { CreateUserCustomerDto } from './dto/CreateUserCustomer.dto';
import { PictureUser } from './schema/picture.user.schema';
import { CustomerUserSchema } from './schema/customer.user.schema';
import { compareSync, genSalt, hash } from "bcrypt";
import * as moment from 'moment';
import { VirtualService } from '../virtual/virtual.service';
import { ChatService } from '../chat/chat.service';
import { randomHour } from 'src/common/utils/random';
import { QueenRedisE } from 'src/common/interfaces/redis.type';
import { MyQueueService } from '../my-queue/my-queue.service';
import { TimeTrigger } from 'src/interfaces/triggers.type';
import { MessageService } from '../message/message.service';
import { UniqueActionService } from '../uniqueaction/uniqueaction.service';

@Injectable()
export class UserService {

    public constructor(
        @InjectModel(User.name) public model: ModelType<UserDocument, User>,
        @Inject(forwardRef(() => VirtualService))
        private virtualService: VirtualService,
        @Inject(forwardRef(() => ChatService))
        public chatService: ChatService,
        @Inject(forwardRef(() => MyQueueService))
        public queueService: MyQueueService,
        @Inject(forwardRef(() => MessageService))
        public messageService: MessageService,
        @Inject(forwardRef(() => UniqueActionService))
        public uniqueActionService: UniqueActionService,
    ) {}

    async deleteAllUser(userID:string){
    
        await this.messageService.model.deleteMany( { customer : userID } );
        await this.uniqueActionService.model.deleteMany( { customer : userID } );
        await this.queueService.model.findOneAndRemove({ content: userID })
        await this.queueService.model.findOneAndRemove({ verification: userID })

        let chats = await this.chatService.model.find({ customer: userID })
        for(let chat of chats){
            await this.queueService.model.findOneAndRemove({ chat: chat._id })
        }
        await this.chatService.model.deleteMany( { customer : userID } );
        await this.model.findOneAndRemove({ _id: userID })
    
        return { status: 'ACCOUNT_DELETED', message: 'Conta deletada com sucesso!'}
    }

    async checkIfExistByEmail(email: string): Promise<boolean> {
        const user = await this.model.findOne({email})
        if(!user) {
            return false
        }
        return true;
    }

    async checkIfExistByUsername(nick_name: string): Promise<boolean> {
        const user = await this.model.findOne({nick_name})
        if(!user) {
            return false
        }
        return true;
    }

    async getOneById(id: string): Promise<User> {
        return (
            (await this.model.findOne({ _id: id }).catch((err) => {
                throw new BadGatewayException('Something happened', err);
            })) || null
        );
    }

    async getByUser(data: { nick_name?: string; email?: string }): Promise<User> {
        if (data.email) {
            return this.model.findOne({ email: data.email }).catch((err) => {
                throw new BadGatewayException('Something happened', err);
            });
        }
        return this.model.findOne({ nick_name: data.nick_name }).catch((err) => {
            throw new BadGatewayException('Something happened', err);
        });
    }

    async createCustomer(dto: CreateUserCustomerDto): Promise<{
        id: string,
        role: RoleEnum,
        type: TypeEnum,
        account_activated: boolean,
        email_checked: boolean,
        picture: PictureUser,
        nick_name: string,
        email: string,
    }> {
        const convertAge = moment(dto.born_date, "DD/MM/YYYY").toDate();
        const timeDiff = Math.abs(Date.now() - convertAge.getTime());
        let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
        let salt = await genSalt(10);
        const passwordHash = await hash(dto.password, salt);
        let userData: User = {
            account_activated: dto.i_am.toLowerCase().trim() === 'uomo',
            email: dto.email,
            password: passwordHash,
            nick_name: dto.nick_name,
            customer: {
                i_am: dto.i_am,
                in_search: dto.looking_for,
                born_date: convertAge,
                country: dto.country,
                city: dto.city,
                terms_and_conditions: dto.terms_and_conditions,
                age: age
            } as unknown as CustomerUserSchema,
            coins: {
                coinsU: 0,
            }
            
        } as User
        if(dto.tracking){
            let jsonTracking = JSON.parse(dto.tracking)
            if(Object.keys(jsonTracking).length !== 0){
                userData['tracking'] = jsonTracking
            }
        }
        const user = new this.model(userData);
        await user.save();

        //this.completeOneItemOfListCons(user._id.toString()) //este sera un servico al api de talkb

        return {
            id: user._id,
            role: user.role,
            type: user.type,
            account_activated: user.account_activated,
            email_checked: user.email_checked,
            picture: user.picture,
            nick_name: user.nick_name,
            email: user.email,
        }
    }

    async triggerOnlineAndNeighbors(trigger: string, user: User) {
        let min = 1; //numero min de virtuales a obtener
        let max = trigger === 'online' ? 2 : 2; //numero max virtuales
        let noMax = Math.floor(Math.random() * (max - min + 1)) + min;
        let resultVirtuals = []
        let virtuals;
        if (user) {
            //busca usuarios cercanos a tu provincia o ciudad
            let whereVirtual: any
            let sampleVirtual: number
            if (trigger === "online") {
                whereVirtual =  { city: user.customer.city }
                sampleVirtual = noMax
            }
            //si no hay virtuales cercanas obten (4virtuales:trigger online | 3virtuales:trigger neighbors) ramdon diferentes a la ciudad del customer
            if (trigger === "neighbor_city") {
                whereVirtual =  { city: { $ne: "user.customer.city" } }
                sampleVirtual = max
            }
            //get ramdom virtual
            resultVirtuals = await this.virtualService.model.aggregate([
                {
                    $match: whereVirtual
                },
                { $skip: 0 },
                {
                    $sample: {
                        size: sampleVirtual
                    }
                },
                /*{
                    $project: { nick_name:1, _id:1}
                },*/
            ]);
            // todo 
            //revisa que no existan virtuales repetidas
            let uniques = {};
            virtuals = resultVirtuals.filter((virtual) => uniques[String(virtual._id)] ? false : (uniques[String(virtual._id)] = true));

            for (const virtual of virtuals) {
                // si tiene chat no entra
                const { isNew, chat } = await this.chatService.createNewChat(user._id, virtual._id, true)
                if (isNew) {
                    const dayNow = new Date();
                    const time = `${dayNow.getHours()}:${dayNow.getMinutes()}`
                    let hour = dayNow.getHours() * 60 * 60 * 1000;
                    let minutes = dayNow.getMinutes() * 60 * 1000;
                    let timenow = hour + minutes
                    let getTime = dayNow.getTime()

                    const ramdom = randomHour({
                        hmin: dayNow.getHours(),
                        mmin: dayNow.getMinutes(),
                        hmax: dayNow.getHours(),
                        mmax: dayNow.getMinutes() + 10,
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

                    const redisName = trigger === QueenRedisE.ONLINE ? QueenRedisE.ONLINE : QueenRedisE.NEIGHBOR_CITY

                    await this.queueService.addQueueTrigger({
                        payload: {
                            chatId: chat._id,
                            virtualId: chat.virtual._id,
                            // @ts-ignore
                            customerId: chat.customer._id
                        },
                        type: redisName,
                        details,
                    }, delay);
                }
            }
        }
    }

    async completeOneItemOfListCons(userID: string) {
        let listChat = await this.chatService.model.find({customer:userID}).select(['virtual', 'firstMessage', 'customer'])
        let idsVirtual = []
        if(listChat.length>0){
            for(const virtual of listChat){
                idsVirtual.push(virtual.virtual.toString())
            }
        }
        
        const virtuals = await this.virtualService.model.aggregate([
            {
                $match: { _id : { $nin : idsVirtual } }
            },
            { $skip: 0 },
            {
                $sample: {
                    size: 2
                }
            },
            {
                $project: { nick_name:1, _id:1}
            },
        ]);
        
        const rndInt = Math.round(Math.random());//Math.floor(Math.random() * 2) + 1
        const dayNow = new Date();

        const time = `${dayNow.getHours()}:${dayNow.getMinutes()}`
        let hour = dayNow.getHours() * 60 * 60 * 1000;
        let minutes = dayNow.getMinutes() * 60 * 1000;
        let timenow = hour + minutes
        let getTime = dayNow.getTime()

        for (let i = 0; i < rndInt; i++) {
            let ior2minutes = Math.floor(Math.random() * 2) + 1
            const dayNow2 = new Date();
            
            let setMinutes = dayNow.getMinutes() + ior2minutes
            dayNow2.setMinutes(setMinutes);

            let hour2 = dayNow2.getHours() * 60 * 60 * 1000;
            let minutes2 = dayNow2.getMinutes() * 60 * 1000;
            let timenow2 = hour2 + minutes2

            const rTime = `${dayNow2.getHours()}:${dayNow2.getMinutes()}`

            const delay = timenow2 - timenow 
            const exetime = getTime + delay
            const hourhumna = new Date(exetime).toLocaleString()
            const details: TimeTrigger = {
                hourNow: time,
                timeNow: timenow,
                ramdomHour: rTime,
                ramdomTime: timenow2,
                delay: delay,
                exeTime: exetime,
                humanTime: hourhumna,
            }
            
            const { isNew, chat } = await this.chatService.createNewChat(userID, virtuals[i]._id.toString(), true)

            await this.queueService.addQueueTrigger({
                payload: {
                    chatId: chat._id,
                    virtualId: chat.virtual._id,
                    // @ts-ignore
                    customerId: chat.customer._id
                },
                type: QueenRedisE.FOLLOW_UP,
                details: details
            }, delay);
        }
    }

    async subtractCoins(customer: any,substrac: number){

        const cus = await this.model.findById(customer).select(['coins'])

        let totalCoins: number = 0
        totalCoins = cus.coins.coinsU <= substrac ? 0 :  cus.coins.coinsU - substrac

        let result = await this.model.findByIdAndUpdate(
            customer, 
            { $set: { "coins.coinsU": totalCoins } },
            { new: true })

        return { _id: result._id, coins: result.coins }
    }

    async addCountLogin(userId: string) {
        const user = await this.model.findOne({ _id: userId });
        if (!user) throw new NotFoundException('User not found');
        const response = await this.model.findOneAndUpdate({ _id: user._id }, { $set: { logins: { login_at: new Date(), count: user.logins.count + 1 } } },{ new: true})
        //await sendinble.sendinbleService.updateContact(response.email,{ LAST_ONLINE : new Date() })
        if (!response) throw new Error('Cannot update login_at');
        return {
            message: 'User updated successfully'
        }
    }

    async updateCoins( payload: { userID: any, coins:number } ){
        const user = await this.model.findOne({ _id: payload.userID });

        let result: any
        if(user.haveUnlimitedPackage){
            result = await this.model.findOneAndUpdate(
                { _id: user._id },
                { $inc: { "coins.oldCoins": +payload.coins } },
                { new: true }
            );
        }else{
            result = await this.model.findOneAndUpdate(
                { _id: user._id },
                { $inc: { "coins.coinsU": +payload.coins } },
                { new: true }
            );
        }

        return {
            statusCode: 200,
            message: "updated successfully",
            coins: result.coins
        }
    }
}