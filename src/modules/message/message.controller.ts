import { Controller, Res, Body, Get, Param, Post, Put, UploadedFile, UseInterceptors, Req, HttpStatus } from "@nestjs/common";
import { MessageService } from './message.service';
import { Messages, MessagesSchema, MessagesDocument } from "./schema/message.schema";
import { ModelType, DocumentType } from "@typegoose/typegoose/lib/types";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { get, merge } from "lodash";
import { CrudQuery, ICrudQuery } from "nestjs-mongoose-crud/dist/crud-query.decorator";
import { PaginateKeys } from "nestjs-mongoose-crud/dist/crud.interface";
import { Crud, defaultPaginate } from "nestjs-mongoose-crud";
import { Request, Response } from "express"
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { Public } from 'src/common/decorator/public.decorator';
import { diskStorage } from 'multer';
import imagekit, { imageFileFilter } from "src/common/utils/imagekit";
import * as moment from "moment";

@Controller('message')
export class MessageController {
    crudOptions = {}
    model: ModelType<MessagesDocument, Messages>;

    constructor(
        public service: MessageService
    ) {
        this.model = service.model
    }

    @Public()
    @Get("delete")
    async delete(){
      return 'ok' //await this.service.deleteBytime()
    }

    @Post('save-file')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
              cb(null, './uploads/temp');
            },
            filename: (req, file, cb) => {
              cb(null, Date.now() + '_' + file.originalname);
            },
        }),
        fileFilter: imageFileFilter,
    }))
    async newMessageFile(
      @UploadedFile() file,
      @Res() res: Response,
      @Req() req: Request,
      @Body() body: {customer:string}) {

      const { customer } = body

      if (file) {

        let media:any = await imagekit.upload({
          file: fs.readFileSync(file.path, { encoding: 'base64' }),
          fileName: file.filename,
          folder: `customers/${customer}/chatImages`
        });

        //@ts-ignore
        setTimeout(() => {
          fs.unlinkSync(`./uploads/temp/${file.filename}`)
        }, 2000)

        res.status(HttpStatus.OK).json(media);
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
    }

    @Get("logic-pack-unlimited/:chatID/:customerID")
    async initLogic( @Param('chatID') chatID: string, @Param('customerID') customerID: string ){
      return await this.service.countUnlimitedChat(chatID, customerID)
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

}