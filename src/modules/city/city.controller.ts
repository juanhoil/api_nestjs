import { Controller, Get } from "@nestjs/common";
import { CityService } from './city.service';
import { Citys, CitysDocument } from "./schema/city.schema";
import { Crud, defaultPaginate } from "nestjs-mongoose-crud";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { get, merge } from "lodash";
import { CrudQuery, ICrudQuery } from "nestjs-mongoose-crud/dist/crud-query.decorator";
import { PaginateKeys } from "nestjs-mongoose-crud/dist/crud.interface";
import { Public } from "src/common/decorator/public.decorator";

@Controller('city')
export class CityController {

    crudOptions = {}
    model: ModelType<CitysDocument>;
    constructor(public service: CityService) {
        this.model = service.model
    }

    @Get()
    find(@CrudQuery("query") query: ICrudQuery = {}) {

        let {
            where = get(this.crudOptions, "routes.find.where", {}),
            limit = get(this.crudOptions, "routes.find.limit", 10),
            select = get(this.crudOptions, "routes.find.select", undefined),
            page = 1,
            skip = 0,
            populate = get(this.crudOptions, "routes.find.populate", undefined),
            sort = get(this.crudOptions, "routes.find.sort", undefined),
            collation = undefined
        } = query;

        if (skip < 1) {
            skip = (page - 1) * limit;
        }

        const paginateKeys: PaginateKeys | false = get(
            this.crudOptions,
            "routes.find.paginate",
            defaultPaginate
        );

        const find = async () => {
            const data = await this.model
                .find()
                .where(where)
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate(populate)
                .select(select)
                .collation(collation);
            if (paginateKeys !== false) {
                const total = await this.model.countDocuments(where);
                return {
                    [paginateKeys.total]: total,
                    [paginateKeys.data]: data,
                    [paginateKeys.lastPage]: Math.ceil(total / limit),
                    [paginateKeys.currentPage]: page
                };
            }
            return data;
        };
        return find();
    }


}