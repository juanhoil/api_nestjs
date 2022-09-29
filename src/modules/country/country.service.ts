import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { Countries, CountriesDocument, CountriesSchema } from './schema/country.schema';
import {InjectModel} from "@nestjs/mongoose";
import {ModelType} from "@typegoose/typegoose/lib/types";

@Injectable()
export class CountryService {

    public constructor( @InjectModel(Countries.name)
        public model: ModelType<CountriesDocument,Countries>) {
    }


}