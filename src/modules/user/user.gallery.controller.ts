import {
    Body,
    Controller,
    Get,
    HttpStatus,
    NotFoundException,
    Delete,
    UploadedFile,
    UseInterceptors,
    Param,
    Post,
    Put,
    Res,
    Inject
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Response, Request } from "express";
import { CrudQuery, ICrudQuery } from 'nestjs-mongoose-crud/dist/crud-query.decorator';
import { UserService } from "./user.service";
import { get, merge } from "lodash";
import { GalleryUser } from './schema/gallery.user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import imagekit, { imageFileFilter, deleteFile } from "src/common/utils/imagekit";
import * as fs from 'fs';
import { notification } from 'src/common/service/notifications';

@Controller('customer/:id/gallery')
export class UserGalleryController {

    constructor(public service: UserService) {}

    @Get()
    async index(@Param('id') id, @CrudQuery("query") query: ICrudQuery = {}) {
        const crudOptions = {}
        let {
            where = get(crudOptions, "routes.find.where", {}),
            limit = get(crudOptions, "routes.find.limit", 10),
            select = get(crudOptions, "routes.find.select", undefined),
            page = 1,
            skip = 0,
        } = query;

        if (skip < 1) {
            skip = (page - 1) * limit;
        }
        const count = await this.service.model.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(id),
                    "gallery": { "$exists": true },
                }
            },
            { $project: { total: { $size: "$gallery" } } },
        ])
        const total = count.length > 0 ? count[0].total : 0
        const data = await this.service.model.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(id),
                }
            },
            {
                $project: {
                    _id: 0,
                    gallery: 1
                }

            },
            {
                $unwind: '$gallery'
            },
            {
                "$replaceRoot": {
                    "newRoot": {
                        "$mergeObjects": [
                            "$gallery",
                        ]
                    }
                }
            },
            { $sort: { 'gallery': -1 } },
            { $skip: skip },
            {
                $sample: {
                    size: limit
                }
            },

            { $limit: limit },
        ])

        return {
            total: total,
            data: data,
            lastPage: Math.ceil(total / limit),
            currentPage: page,
        }
    }

    @Post('verification')
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
        @Param('id') id,
        @Body() body: {compare:string,new?:string}, 
        @Res() res: Response) {
        try {
            const { compare } = body
            const user = await this.service.model.findOne({ _id: id });
            if (!user) throw new NotFoundException('User not found');

            let media: any = await imagekit.upload({
                file: fs.readFileSync(file.path, { encoding: 'base64' }),
                fileName: file.filename,
                folder: `customers/verification/${id}`
            });

            const gallery = {
                _id: new Types.ObjectId(),
                imgCompareurl : compare,
                ...media,
            }
            if(body.new) {
                
                if(user.profile_verification.length > 0 ){
                    user.profile_verification.map( async (data) => {
                        const deleteImageKit = await deleteFile(data.fileId);
                    })
                }
                await this.service.model.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { profile_verification: [] } },
                    { new: true }
                );
            }

            //@ts-ignore
            setTimeout(() => {
                fs.unlinkSync(`./uploads/temp/${file.filename}`)
            }, 1000)

            res.status(HttpStatus.OK);
            res.json({media: gallery});
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.json(e);
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
    async create(
        @UploadedFile() file,
        @Param('id') id, @Res() res: Response) {

        try {

            const user = await this.service.model.findOne({ _id: id });
            if (!user) throw new NotFoundException('User not found');

            let media: any = await imagekit.upload({
                file: fs.readFileSync(file.path, { encoding: 'base64' }),
                fileName: file.filename,
                folder: `customers/${id}/chatImages`
            });
            //@ts-ignore
            setTimeout(() => {
                fs.unlinkSync(`./uploads/temp/${file.filename}`)
            }, 2000)

            const gallery = {
                _id: new Types.ObjectId(),
                ...media,
            }
            const response = await this.service.model.findByIdAndUpdate({ _id: user._id }, {
                $push: {
                    gallery: gallery
                }
            }, {
                "fields": { "gallery": 1 },
                new: true
            });
            const data = response.toJSON()
            const allGallery = data.gallery as GalleryUser[]
            const newgallery = allGallery.find((g) => g._id.toString() === gallery._id.toString())

            
            let dataNotification = {
                customerId: user._id.toString(),
                type: "add",
                //gallery: newgallery
            }
            

            await notification.notificationService.sendNotificationGallery(dataNotification)

            res.status(HttpStatus.OK);
            res.json({ ...gallery, ...newgallery });
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.json(e);
        }
    }

    @Get(':galleryId')
    async show(@Res() res: Response,
        @Param('id') id,
        @Param('galleryId') galleryId: string,
        @Body() body: GalleryUser) {
        try {

            if (!galleryId) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `missing params. Gallery ID is required` })
            let result = await this.service.model.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(id),
                        "gallery": { "$exists": true },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        gallery: 1
                    }

                },
                {
                    $unwind: "$gallery"
                },
                {
                    $match: {
                        "gallery._id": new Types.ObjectId(galleryId),
                    }
                },
                {
                    "$replaceRoot": {
                        "newRoot": {
                            "$mergeObjects": [
                                "$gallery",
                            ]
                        }
                    }
                },

            ])
            const data = result.length > 0 ? result[0] : {
                _id: galleryId,
                status: 200,
                msj: "No find"
            }
            res.status(HttpStatus.OK).json(data);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
        }
    }

    @Put(':galleryId')
    async update(@Res() res: Response,
        @Param('id') id,
        @Param('galleryId') galleryId: string,
        @Body() body: GalleryUser) {
        try {

            if (!galleryId) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `missing params. Card ID is required` })

            let json: any = {}
            for (const [i, a] of Object.entries(body)) {
                json["gallery.$." + i] = a
            }
            delete json["gallery.$._id"];
            let result = await this.service.model.findOneAndUpdate(
                { _id: id, "gallery._id": galleryId },
                { $set: json },
                { new: true }
            )
            res.status(HttpStatus.OK).json({
                _id: galleryId,
                ...body
            });
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);

        }

    }

    @Put('put/:galleryId')
    async uppdate(@Res() res: Response,
        @Param('id') id,
        @Param('galleryId') galleryId: string,
        @Body() body: GalleryUser) {
        try {

            if (!galleryId) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `missing params. Card ID is required` })

            let json: any = {}
            for (const [i, a] of Object.entries(body)) {
                json["gallery.$." + i] = a
            }
            delete json["gallery.$._id"];
            let result = await this.service.model.findOneAndUpdate(
                { _id: id, "gallery._id": galleryId },
                { $set: json },
                { new: true }
            )
            res.status(HttpStatus.OK).json({
                _id: galleryId,
                ...body
            });
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);

        }

    }

    @Delete(':galleryId')
    async deleteNote(
        @Res() res: Response,
        @Param('id') id,
        @Param('galleryId') galleryId: string) {
        try {

            if (!galleryId) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `missing params. Card ID is required` })

            const response = await this.service.model.findById({ _id: id }).select(["gallery"]);
            const data = response.toJSON()
            const allGallery = data.gallery as GalleryUser[]
            const newgallery = allGallery.find((g) => g._id.toString() === galleryId)
            let imageOfGallery = await this.service.model.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(id),
                        "gallery": { "$exists": true },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        gallery: 1
                    }

                },
                {
                    $unwind: "$gallery"
                },
                {
                    $match: {
                        "gallery._id": new Types.ObjectId(galleryId),
                    }
                },
                {
                    "$replaceRoot": {
                        "newRoot": {
                            "$mergeObjects": [
                                "$gallery",
                            ]
                        }
                    }
                },

            ])
            if(imageOfGallery.length > 0 ){
                const deleteImageKit = await deleteFile(imageOfGallery[0].fileId);
            }

            await this.service.model.updateOne(
                { _id: id },
                { $pull: { "gallery": { _id: galleryId } } }, { new: true });

            let dataNotification = {
                customerId: id.toString(),
                type: "delete",
                //gallery: newgallery
            }

            await notification.notificationService.sendNotificationGallery(dataNotification)
            res.status(HttpStatus.OK).json(newgallery);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);

        }

    }
}