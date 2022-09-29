import { Module, forwardRef } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from './schema/message.schema';
import { MyQueueModule } from '../my-queue/my-queue.module';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Messages.name, schema: MessagesSchema }]),
        forwardRef(() => MyQueueModule),
        forwardRef(() => ChatModule),
        forwardRef(() => UserModule),
    ],
    controllers: [MessageController],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessageModule {
}