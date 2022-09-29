import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { CONFIG_SERVER_JWT } from 'src/config/config.constants';
import { VirtualModule } from '../virtual/virtual.module';
import { ChatModule } from '../chat/chat.module';
import { MyQueueModule } from '../my-queue/my-queue.module';
import { UserGalleryController } from './user.gallery.controller';
import { MessageModule } from '../message/message.module';
import { UniqueActionModule } from '../uniqueaction/uniqueaction.module';
import { AddCoinsService } from './addCoins.service';

@Module({
    imports:[
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => configService.get(CONFIG_SERVER_JWT),
            inject: [ConfigService],
        }),
        forwardRef(() => VirtualModule),
        forwardRef(() => ChatModule),
        forwardRef(() => MyQueueModule),
        forwardRef(() => MessageModule),
        forwardRef(() => UniqueActionModule),
    ],
    controllers: [UserController, UserGalleryController],
    providers: [
        UserService,
        AddCoinsService
    ],
    exports: [
        UserService
    ]
})
export class UserModule {}