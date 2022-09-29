import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import { PackCoinsController } from './packCoins.controller';
import { PackCoinsService } from './packCoins.service';
import { PackCoins, PackCoinsSchema } from './schema/packCoins.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{name: PackCoins.name, schema: PackCoinsSchema}]),
    ],
    controllers: [PackCoinsController],
    providers: [PackCoinsService],
    exports: [PackCoinsService]
})
export class PackCoinsModule {}