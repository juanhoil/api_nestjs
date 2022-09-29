import { Bind, Body, Controller, Get, HttpStatus, InternalServerErrorException, Param, Post, Res } from "@nestjs/common";
import { UniqueActionService } from './uniqueaction.service';
import { UniqueAction } from './schema/uniqueaction.schema';
import { Crud, defaultPaginate } from "nestjs-mongoose-crud";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { get } from 'lodash';
import { ObjectId } from 'mongodb';
import {
    CrudQuery,
    ICrudQuery
} from 'nestjs-mongoose-crud/dist/crud-query.decorator';
import { PaginateKeys } from 'nestjs-mongoose-crud/dist/crud.interface';

@Controller('/unique-action')
export class UniqueActionController {
    crudOptions = {};
    public constructor(public service: UniqueActionService) {
    }

    @Post('new')
    @ApiOperation({ summary: "save or update one action", operationId: "list" })
    @ApiQuery({ name: "action", type: Object, required: true, description: "type action" },)
    async createOrUpdte(@Body() action: { type, customerID, virtualID }) {

        const { type, customerID, virtualID } = action
        let result = await this.service.searchOrUpdate(type, customerID, virtualID);
        if (!result) {
            throw new InternalServerErrorException('Error trying to update');
        }
        return 'All ok'
    }

    @Get('virtual')
    findAnd(@CrudQuery("query") query: ICrudQuery = {}) {
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
            const data = await this.service.model
                .find()
                .where(where)
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate(populate)
                .select(select)
                .collation(collation);
            if (paginateKeys !== false) {

                let res: any = [];

                if (data) {

                    for (const [i, v] of data.entries()) {

                        if (v && v.virtual) {

                            let virtualID: string = ""
                            if (v.virtual && v.virtual._id) {
                                virtualID = new ObjectId(v.virtual._id).toString()
                            } else {
                                virtualID = new ObjectId(v.virtual).toString()
                            }

                            let select: any = ['type']
                            let where: any = { virtual: virtualID }

                            let getOtherAction = await this.service.getAllByVirtual(where, select)

                            getOtherAction['virtual'] = v.virtual
                            getOtherAction['_id'] = v._id
                            getOtherAction['type'] = v.type

                            if (v && v.customer) {
                                getOtherAction['customer'] = v.customer
                            }
                            res.push(getOtherAction)
                        } else {
                            res.push(v)
                        }
                    }
                }

                const total = await this.service.model.countDocuments(where);
                return {
                    [paginateKeys.total]: total,
                    [paginateKeys.data]: res,
                    [paginateKeys.lastPage]: Math.ceil(total / limit),
                    [paginateKeys.currentPage]: page
                };
            }
            return data;
        };
        return find();
    }
}