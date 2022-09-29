import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { Countries, CountriesSchema } from './schema/country.schema';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Countries.name, schema: CountriesSchema}]),
    ],
    controllers: [CountryController],
    providers: [CountryService],
    exports: [CountryService]
})
export class CountryModule {}