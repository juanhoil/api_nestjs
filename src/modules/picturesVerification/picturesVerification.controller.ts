import { Controller, HttpStatus, Param, Get, Post, NotFoundException, UploadedFile, UseInterceptors, Res } from "@nestjs/common";
import { PicturesVerificationService } from './picturesVerification.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import imagekit, { imageFileFilter, deleteFile } from 'src/common/utils/imagekit';
import * as fs from 'fs';
import { Response, Request } from "express";
import { PictureVerificationDocument } from "./schema/picturesVerification.schema";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { CrudQuery, ICrudQuery } from "nestjs-mongoose-crud/dist/crud-query.decorator";
import { get, merge } from "lodash";

@Controller('/pictures-verification')
export class PicturesVerificationController {
    crudOptions = {}
    model: ModelType<PictureVerificationDocument>;

    constructor(public service: PicturesVerificationService) {
        this.model = service.model
    }

    @Get()
    async find() {
        let page = 1
        let skip = 0
        let where = {url: { $exists: true }}
         
        //const projectSelect = select.reduce((a, v) => ({ ...a, [v]: 1 }), {});
        const total = await this.model.countDocuments(where);

        const data = await this.model.aggregate([
            {
                $match: where
            },
            { $skip: skip },
            {
                $sample: {
                    size: 3
                }
            },
        ]);
        return {
            total: total,
            data: data,
            lastPage: Math.ceil(total / 3),
            currentPage: page,
        }
    }

    @Post()
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
    async createVerification(
        @UploadedFile() file,
        @Res() res: Response) {
        try {
           
            let media: any = await imagekit.upload({
                file: fs.readFileSync(file.path, { encoding: 'base64' }),
                fileName: file.filename,
                folder: `picture/verification`
            });

            const gallery = {
                ...media,
            }
           
            //@ts-ignore
            setTimeout(() => {
                fs.unlinkSync(`./uploads/temp/${file.filename}`)
            }, 1000)

            const model = new this.model(gallery)
            await model.save()

            res.status(HttpStatus.OK);
            res.json({media: gallery});
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.json(e);
        }
    }


}