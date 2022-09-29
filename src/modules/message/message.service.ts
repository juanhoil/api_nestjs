import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Messages, MessagesDocument } from "./schema/message.schema";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { UserService } from '../user/user.service';
import { ChatService } from '../chat/chat.service';
import { randomIntFromInterval } from 'src/common/utils/random';

@Injectable()
export class MessageService {

    constructor(
        @InjectModel(Messages.name)
        public model: ModelType<MessagesDocument, Messages>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChatService))
        private readonly chatService: ChatService,

    ) {}

    async deleteBytime(){
        try {
            const startDate = new Date()
            startDate.setHours(startDate.getHours() -12 )
            //const result: any = await this.model.find({"createdAt" :{ "$gte" : startDate }}).select(['message','chat'])

            const result: any = await this.model.aggregate([
                {
                    $match: { "createdAt": { "$gte": startDate} }, //, $lte: endDate 
                },
                {
                    $group: {
                        _id: {
                            message: "$message",
                        },
                        chats: {
                            $push: {
                                _id: "$_id",
                                chat: "$chat",
                                message: "$message"

                            }
                        },
                        count: { $sum: 1 },
                    }
                },
                { $sort: { countMessage: 1 } },
                //{ $limit : 100 }
            ])

            let filter: any = []
            for (const item of result) {
                if(item.count > 1){
                    filter.push(item.chats)
                }
            }

            for (const item of filter) {
                for (let i = 0; i < item.length-1;  i++) {
                    await this.model.findOneAndDelete({ _id: item[i]._id });
                }
            }

            return filter
        }catch(e){

        }
    }

    //init
    async countUnlimitedChat(chatID, customerID){
        console.log('chatID: ', chatID, ' customerID: ', customerID)
        let customer = await this.userService.model.findById(customerID).select(['haveUnlimitedPackage', 'countUnlimitedChat'])
        console.log('customer.haveUnlimitedPackage',customer.haveUnlimitedPackage)
        if(customer.haveUnlimitedPackage){
            let chat = await this.chatService.model.findById(chatID).select(['unlimitedPackage'])
            console.log('chat.unlimitedPackage.numberChatOpen',chat.unlimitedPackage.numberChatOpen)
            if(chat.unlimitedPackage.numberChatOpen == 0){
                console.log('entro al proceso')
                let countChat = customer.countUnlimitedChat + 1
                let endMessages = randomIntFromInterval(41, 50)
                console.log('numero de chat: ',countChat)
                console.log('numero endMessages : ',endMessages)
                chat = await this.chatService.model.findByIdAndUpdate(
                    chatID,
                    {$set: {
                            'unlimitedPackage.numberChatOpen': countChat,
                            'unlimitedPackage.endMessageUnlimited': endMessages,
                        }
                    },
                    { new: true })
                    .select(['unlimitedPackage'])
                
                customer = await this.userService.model.findByIdAndUpdate(customerID,
                    { $set:{countUnlimitedChat: countChat} },
                    { new: true })
                    .select(['haveUnlimitedPackage', 'countUnlimitedChat'])

                return await this.openQueueUnlimitedPack(chat)
            }
            return 'ok'
        }
        console.log('ok')
        return 'ok'
    }
    async openQueueUnlimitedPack (chat:any) {
        
        let countChat = chat.unlimitedPackage.numberChatOpen// ejemplo = 6
        let ramdom = randomIntFromInterval(1, 10)
        //las primeras 10 tendran un 80% de entrar a la queue
        console.log('porcentaje: ',ramdom)
        console.log('porcentaje: 10',countChat <= 10 && ramdom >= 9)
        
        if(countChat <= 10 && ramdom >= 9){
            //no entrara 
            console.log('10 mala suerte no entrara a la queue')
            await this.chatService.model.findByIdAndUpdate(chat._id, {'unlimitedPackage.openQueue': false}, { new: true })
            return 'ok'
        }
        //desde 11 hasta el 20 tendran un 20% de entrar a la queue
        console.log('porcentaje: 20',' en rango? ',countChat > 10 && countChat <= 20,' probable? ', countChat > 10 && countChat <= 20 && ramdom >= 3)
        if(countChat > 10 && countChat <= 20 && ramdom >= 3){
            console.log('20 mala suerte no entrara a la queue')
            await this.chatService.model.findByIdAndUpdate(chat._id, {'unlimitedPackage.openQueue': false}, { new: true })
            return 'ok'
        }
        //desde 21 tendran un 10% de entrar a la queue
        console.log('porcentaje: 20',' en rango? ',countChat > 20,' probable? ',countChat > 20 && ramdom >= 2)
        if(countChat > 20 && ramdom >= 2){
            console.log('21 mala suerte no entrara a la queue')
            await this.chatService.model.findByIdAndUpdate(chat._id, {'unlimitedPackage.openQueue': false}, { new: true })
            return 'ok'
        }
        console.log('entro en queue')
        return 'ok'
    }

}


