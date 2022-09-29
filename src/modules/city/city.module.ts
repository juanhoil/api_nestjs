import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { Citys,CitysSchema } from './schema/city.schema';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Citys.name, schema: CitysSchema}]),
    ],
    controllers: [CityController],
    providers: [CityService]
})
export class CityModule {}