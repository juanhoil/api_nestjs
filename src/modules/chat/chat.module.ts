import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chats, ChatsSchema } from './schema/chat.schema';
import { MyQueueModule } from '../my-queue/my-queue.module';
import { ChatController } from './chat.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Chats.name, schema: ChatsSchema }]),
        forwardRef(() => MyQueueModule),
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule {}