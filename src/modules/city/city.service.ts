import { Injectable, Get } from '@nestjs/common';
import { Citys ,CitysDocument } from "./schema/city.schema";
import {InjectModel} from "@nestjs/mongoose";
import {ModelType} from "@typegoose/typegoose/lib/types";
import {ApiOperation, ApiQuery} from "@nestjs/swagger";
import {get, merge} from "lodash";
import {CrudQuery, ICrudQuery} from "nestjs-mongoose-crud/dist/crud-query.decorator";
import {PaginateKeys} from "nestjs-mongoose-crud/dist/crud.interface";
import {Crud, defaultPaginate} from "nestjs-mongoose-crud";

@Injectable()
export class CityService {
    crudOptions = {}
    constructor(@InjectModel(Citys.name) public model: ModelType<CitysDocument>) {
    }
}