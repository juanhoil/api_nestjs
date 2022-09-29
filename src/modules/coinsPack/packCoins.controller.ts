import { Controller, Get } from "@nestjs/common";
import { Crud, defaultPaginate } from "nestjs-mongoose-crud";

import { PackCoins, PackCoinsDocument } from "./schema/packCoins.schema";
import { PackCoinsService } from "./packCoins.service";
import { ModelType } from "@typegoose/typegoose/lib/types";

@Controller('coins')
export class PackCoinsController {

    crudOptions = {}
    model: ModelType<PackCoinsDocument>;
    constructor(public service: PackCoinsService) {
        this.model = service.model
    }

    @Get()
    async find(){
        let result = await this.model.find({ isActive :true})
        return {
            "total": 6,
            "data": result,
            "lastPage": 1,
            "page": 1
        }
    }
}