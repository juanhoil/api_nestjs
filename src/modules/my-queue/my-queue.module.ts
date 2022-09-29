import { forwardRef, Module } from '@nestjs/common';
import { MyQueueService } from "./my-queue.service";
import { MyQueueController } from './my-queue.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MyQueue, MyQueueSchema } from './schema/my-queue.schema';
//import { MyQueueResolver } from './my-queue.resolver';
import { BullModule } from "@nestjs/bull";
import { ChatModule } from '../chat/chat.module';
import { QueueProcessor } from './queue.processor';
import { UniqueActionModule } from '../uniqueaction/uniqueaction.module';
import { MessageModule } from '../message/message.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: MyQueue.name, schema: MyQueueSchema }]),
        forwardRef(() => ChatModule),
        BullModule.registerQueue({name: 'trigger'}),
        forwardRef(() => UniqueActionModule),
        forwardRef(() => MessageModule),
    ],
    providers: [MyQueueService, QueueProcessor],
    controllers: [MyQueueController],
    exports: [MyQueueService, QueueProcessor],
})
export class MyQueueModule {
}
