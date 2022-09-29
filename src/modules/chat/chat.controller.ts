import { Controller, Request, Param, Body, Get, Post, Put, Delete, ParseUUIDPipe, Res, HttpStatus } from "@nestjs/common";
import { ChatService } from './chat.service';
import { Response } from "express";
import { get, merge } from "lodash";
import { CrudQuery, ICrudQuery } from "nestjs-mongoose-crud/dist/crud-query.decorator";
import { PaginateKeys } from "nestjs-mongoose-crud/dist/crud.interface";
import { defaultPaginate } from "nestjs-mongoose-crud";

@Controller('/chat')
export class ChatController {
    crudOptions = {}
    public constructor(private readonly chatService: ChatService) {
    }

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
            const data = await this.chatService.model
                .find()
                .where(where)
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate(populate)
                .select(select)
                .collation(collation);
            if (paginateKeys !== false) {
                const total = await this.chatService.model.countDocuments(where);
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

    @Get('newChat/:idCustomer/:idVirtual')
    async NewChat(@Param('idCustomer') idCustomer: string, @Param('idVirtual') idVirtual: string) {
        const { isNew, chat } = await this.chatService.createNewChat(idCustomer, idVirtual, false);

        return chat

    }

    @Get('send/notificacion/:idCustomer')
    async testNotification(@Param('idCustomer') idCustomer: string) {
        return await this.chatService.testNotificationS(idCustomer)        
    } 

    @Put('read-message/:idChat')
    async readMessages(@Res() res: Response, @Param('idChat') idChat: string, @Body() body: { isRead }) {
        try {
            const { isRead } = body;
            if (!idChat) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `missing params. id is required` })

            let result = await this.chatService.model.findOneAndUpdate(
                { _id: idChat },
                { readMessage: isRead },
                { new: true }
            );

            res.status(HttpStatus.OK).json({ message: `the message was read successfully` })
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);

        }
    }


}