import { Controller, Get, Post, Put, Body, Res, Param, Bind, Logger, Delete, HttpStatus } from '@nestjs/common';
import { PaymentHistoryService } from './paymentHistory.service';
import { PaymentHistory, PaymentHistoryDocument } from './schema/paymentHistory.schema';
import { ModelType } from "@typegoose/typegoose/lib/types";
import { Crud, defaultPaginate } from "nestjs-mongoose-crud";
import { CrudQuery, ICrudQuery } from "nestjs-mongoose-crud/dist/crud-query.decorator";
import { PaginateKeys } from "nestjs-mongoose-crud/dist/crud.interface";
import { get, merge } from "lodash";
import { Response } from "express";
import { UserService } from '../user/user.service';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('hot/payment')
export class PaymentHistoryController {
    crudOptions = {}
    model: ModelType<PaymentHistoryDocument>;

    constructor(
        public service: PaymentHistoryService,
        public userService: UserService,
        ) { this.model = service.model }

    @Get()
    async find(@Res() res: Response, @CrudQuery("query") query: ICrudQuery = {}) {
        if (!query.where) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `missing params. where is required` })
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
        let result = await find()
        return res.status(HttpStatus.OK).json(result);
    }

    @Get('open-modal-unlimited/:id')
    async activeOffert(@Param('id') id: string) {
        
        return this.service.activeOffertValidation(id)
    }
}