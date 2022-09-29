import { Injectable, Get } from '@nestjs/common';

import {InjectModel} from "@nestjs/mongoose";
import {ModelType} from "@typegoose/typegoose/lib/types";
import { PackCoins, PackCoinsDocument } from './schema/packCoins.schema';

@Injectable()
export class PackCoinsService {
    crudOptions = {}
    constructor(@InjectModel(PackCoins.name) public model: ModelType<PackCoinsDocument>) {
    }

  
}