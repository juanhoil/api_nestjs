import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueActionModule } from '../uniqueaction/uniqueaction.module';
import { Virtual, VirtualSchema } from './schema/virtual.schema';
import { VirtualController } from './virtual.controller';
import { VirtualService } from './virtual.service';


@Module({
    imports:[
        MongooseModule.forFeature([{ name: Virtual.name, schema: VirtualSchema }]),
        forwardRef(() => UniqueActionModule),
    ],
    controllers: [VirtualController],
    providers: [
        VirtualService
    ],
    exports: [VirtualService]
})
export class VirtualModule {}