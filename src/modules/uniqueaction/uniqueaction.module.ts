import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UniqueActionController} from './uniqueaction.controller';
import {UniqueActionService} from './uniqueaction.service';
import {UniqueAction, UniqueActionSchema} from './schema/uniqueaction.schema';
import { MyQueueModule } from '../my-queue/my-queue.module';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: UniqueAction.name, schema: UniqueActionSchema }]),
        forwardRef(() => MyQueueModule),
    ],
    controllers: [UniqueActionController],
    providers: [UniqueActionService],
    exports: [UniqueActionService]
})
export class UniqueActionModule { }