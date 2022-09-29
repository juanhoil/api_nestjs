import {Controller, Get, Post, Put, Body, Res, Param, Bind, Delete, HttpStatus} from '@nestjs/common';
import { CountryService } from './country.service';
import { Countries, CountriesDocument } from './schema/country.schema';
import {ModelType} from "@typegoose/typegoose/lib/types";
import {Crud, defaultPaginate} from "nestjs-mongoose-crud";
import {ApiOperation, ApiQuery} from "@nestjs/swagger";
import {CrudQuery, ICrudQuery} from "nestjs-mongoose-crud/dist/crud-query.decorator";
import {PaginateKeys} from "nestjs-mongoose-crud/dist/crud.interface";
import {get, merge} from "lodash";

@Crud({
    model: Countries
})
@Controller('country')
export class CountryController {

    crudOptions = {}
    model: ModelType<CountriesDocument>;

    constructor(public service: CountryService) {
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
                .select(select)
                .populate(populate)
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