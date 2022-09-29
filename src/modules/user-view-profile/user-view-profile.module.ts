import { Module } from '@nestjs/common';
import { UserViewProfileController } from './user-view-profile.controller';
import { UserViewProfileService } from './user-view-profile.service';
import { MongooseModule } from "@nestjs/mongoose";
import { UserViewProfile, UserViewProfileSchema } from "./schema/user-view-profile.schema";
import { ChatModule } from '../chat/chat.module';
import { MyQueueModule } from '../my-queue/my-queue.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserViewProfile.name, schema: UserViewProfileSchema }]),
        MyQueueModule,
        ChatModule
    ],
    controllers: [UserViewProfileController],
    providers: [UserViewProfileService],
    exports: [UserViewProfileService],
})
export class UserViewProfileModule {
}
