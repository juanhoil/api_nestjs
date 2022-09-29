import { Controller, Param, Body, Get, Post, Put, HttpStatus, Res, BadRequestException, NotFoundException, Req, UnauthorizedException, UseInterceptors, UploadedFile, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from './user.service';
import { Public } from "src/common/decorator/public.decorator";
import { Response, Request } from "express";
import { compareSync, hashSync } from "bcrypt";
import { UserDto } from './dto/updateUser.dto';
import { JwtService } from '@nestjs/jwt';
import { unlinkOne } from "src/common/utils/files/file";
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import imagekit, { imageFileFilter, deleteFile } from 'src/common/utils/imagekit';
import { v4 } from 'uuid';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MailService } from "src/core/mailer/mail.service";
import * as moment from "moment";
import { defaultPaginate } from 'nestjs-mongoose-crud';
import { get } from 'lodash';
import {
    CrudQuery,
    ICrudQuery
} from 'nestjs-mongoose-crud/dist/crud-query.decorator';
import { PaginateKeys } from 'nestjs-mongoose-crud/dist/crud.interface';
import { AddCoinsService } from "./addCoins.service";

@Controller('/customer')
export class UserController {
    model: any;
    crudOptions = {};
    
    public constructor(
        private readonly userService: UserService,
        private addCoinsService: AddCoinsService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) {
        this.model = userService.model
    }

    //------------------------GET
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
                /*for(const customer of data){
                    if(customer.email && customer.email != '' && customer.email != null){
                        let ContactSendinblue = {
                            email: customer.email,
                            nickname: customer.nick_name
                        }
                        console.log(ContactSendinblue)
                        ////sendinble.sendinbleService.saveContact()
                    }
                }*/
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

    @Public()
    @Get('auth/test-email/:email')
    async sendTestEmail(@Param('email') email: string) {
        await this.mailService.sendUserWelcomeTest(email);
        return { message: 'oK' };
    }

    @Get('completeItemList/:userID')
    async completeItem(@Param('userID') userID : string){
        await this.userService.completeOneItemOfListCons(userID)
    }

    @Get('user-coinds/:id')
    async getCoinsCustomer(@Param('id') id: string) {
        if (!id) throw new BadRequestException('id is required');
        const cus = await this.model.findById(id).select(['coins'])

        if (!cus) throw new NotFoundException('Customer not found');
        return cus;
    }

    @Get('user-subtract-coins/:id')
    async subtractCoinsCustomer(@Param('id') id: string) {
        if (!id) throw new BadRequestException('id is required');
        const cus = await this.userService.subtractCoins(id,40)
        if (!cus) throw new NotFoundException('Customer not found');

        return cus;
    }

    @Get('customer/:id')
    async getCustomer(@Param('id') id: string) {
        if (!id) throw new BadRequestException('id is required');
        const customer = await this.model.findOne({ _id: id })
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    @Get('add-coins-login/:id')
    async addCoinsLogin(@Res() res: Response, @Param('id') id: string) {
        if (!id) throw new BadRequestException('id is required');
        const user = await this.userService.model.findById(id).select(['coins', 'hasDailyCoins'])
        if (!user) throw new BadRequestException('user not fount');
        try {
            let result: any = null
            let update = {
                hasDailyCoins: false,
            }
            if (user.hasDailyCoins) {
                await this.userService.updateCoins({userID: user._id.toString(), coins: 10})
                result = await this.userService.model.findOneAndUpdate(
                    { _id: id },
                    { $set: update },
                    { new: true }
                );
            }
            res.status(HttpStatus.OK);
            res.json(result);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.json(e);
        }
    }

    @Get('reload-information/:id')
    async getReloadInformation(@Param('id') id: string) {
        if (!id) throw new BadRequestException('id is required');
        // -------------- axios
        /*this.pubSub.publish('reloadInformation', {
            reloadInformation: {
                customerId: id,
                type: "reload",
                reload: true
            }
        })*/
        return {message: 'ok'}
    }

    //------------------------PUT

    @Put(":id")
    @UsePipes(new ValidationPipe({ 
        whitelist: true,
        forbidUnknownValues: true,
        skipMissingProperties: false,
        transform: true,
     }))
    async update(@Param("id") id: string, @Body() payload: UserDto) {
        if(payload.customer){
            if(payload.customer.born_date){
                let start = moment(new Date());
                let years = start.diff(payload.customer.born_date, "years");
                let age = years ? Number(years) : 0;
                Object.assign(payload, { age: age });
            }  
        }
        return this.model.findOneAndUpdate({ _id: id }, {$set : payload}, {
            new: true,
        });
    }

    @Put('/preference/:id')
    async setPreferences(@Body() body: any, @Param('id') id: string, @Res() res: Response) {
        try {
            let { preferences } = body;
            if (!preferences || !Array.isArray(preferences)) return res.status(400).json({ message: `missing preferences parameter of type array` });
            let customer = await this.model.findOne({ _id: id });
            if (!customer) return res.status(400).json({ message: `user not found` });

            //delete existing data
            if (customer.preferences) {
                customer.preferences.forEach(async (values) => {
                    await this.model.findOneAndUpdate({ _id: id }, { $pull: { preferences: { name: values.name } } }, { new: true })
                })
            }
            //data unique
            let preference = {};
            let newsPreferences = preferences.filter(o => preference[o.name] ? false : preference[o.name] = true);

            //@ts-ignore
            customer = await this.model.findOneAndUpdate({ _id: id }, { $push: { preferences: newsPreferences } }, { new: true })

            return res.status(200).json({ message: `preferences were set successfully`, customer })

        } catch (error) {
            //@ts-ignore
            return res.status(400).json({ message: `error trying to set customer preferences`, error: error.message });
        }
    }

    @Put('settings-pswemail/:id')
    async changePswEmail(@Param('id') id: string,
        @Res() res: Response, @Body() body: { oldPassword, newPassword, repeatNewPassword, email }) {
        try {
            const { oldPassword, newPassword, repeatNewPassword, email } = body;

            let customer = await this.userService.model.findById(id, {})
            if (!customer) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `customer not found` });

            if (oldPassword) {

                if (!newPassword) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `New password is required` });
                if (!repeatNewPassword) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `The new password is required repeated` });
                if (newPassword != repeatNewPassword) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `Repeated passwords are not the same` });

                const isMatch = compareSync(oldPassword, customer.password);
                if (!isMatch) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `The password is not the same as the previous one` });

                let credentials = await hashSync(newPassword, 10);
                customer = await this.userService.model.findOneAndUpdate({ _id: id }, { password: credentials }, { new: true })

                return res.status(HttpStatus.OK).json({ message: `password was updated successfully`, customer })
            }
            customer = await this.userService.model.findOne({ email: email }, 'nick_name email')
            if (customer) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `The email already exists`, customer });

            customer = await this.userService.model.findOneAndUpdate({ _id: id }, { email: email, email_checked: false }, { new: true })

            return res.status(HttpStatus.OK).json({ message: `email was updated successfully`, customer })

        } catch (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `error trying update user`, error })
        }

    }

    //------------------------POST
    @Post('count-login/:id')
    async countLogin(@Param('id') id: string, @Res() res: Response) {
        try {
            const response = await this.userService.addCountLogin(id);
            res.status(HttpStatus.OK);
            res.json(response);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.json(e);
        }
    }

    @Post('active-email/:nick_name/:token')
    async activeEmail(@Param('nick_name') nick_name: string, @Param('token') token: string) {
        if (!nick_name) throw new BadRequestException('nick_name is required');
        if (!token) throw new BadRequestException('token is required');
        try {
            await this.jwtService.verifyAsync(token);
            await this.model.findOneAndUpdate({ nick_name: nick_name }, { email_checked: true });
            return {
                message: 'Email verified successfully'
            }
        } catch (err) {
            throw new UnauthorizedException('token is invalid');
        }
    }

    @Public()
    @Post('session/:key/:param')
    async verifySession(@Req() req: Request, @Res() res: Response) {
        try {
            let { param } = req.params;
            let key = req.params.key;

            if (!param) return res.status(400).json({ message: `Missing param. param customer required` });
            let matchKey = /id|nick/, condition;
            if (!matchKey.test(key)) return res.status(400).json({ message: `invalid key. id and nick are the only accepted keys` })

            if (key == "id") {
                condition = { _id: param };
            } else {
                condition = { nick_name: param };
            }
            let user = await this.model.findOne(condition);
            if (!user) return res.status(400).json({ message: `User no found` });
            let token = user.token;
            return res
                .status(201)
                .json({ message: `validated session successfully `, token });

        } catch (error) {
            return res.status(400).json({ message: `Error to validate session Talk-b`, error });
        }
    }

    @Post('save-page-tinder')
    async createOrUpdte(res, @Body() action: { customerID: string, page: number }) {

        const { customerID, page } = action

        let user = await this.model.findOneAndUpdate({ _id: customerID },
            {
                "customer.tinder_page": page
            }, { new: true });
        return user.customer.tinder_page
    }

    @Post('triggers/activate')
    async trigger(@Body() createCatDto: { customerId }) {
        const { customerId } = createCatDto
        const user = await this.userService.model.findOne({
            _id: customerId
        })
        const time = {
            last: new Date()
        }
        if (user.trigger_lapses && user.trigger_lapses.last_triggerOnline_executed) {
            time.last = new Date(user.trigger_lapses.last_triggerOnline_executed)
        } else {
            const lasts = new Date()
            lasts.setHours(lasts.getHours() - 13)
            const update = {
                trigger_lapses: {
                    last_triggerOnline_executed: lasts.toISOString(),
                    last_triggerNeighbors_executed: lasts.toISOString(),
                }
            }
            time.last = lasts
            await this.userService.model.updateOne({ _id: user._id }, {
                // @ts-ignore
                update
            }, { new: true })
        }

        const lastTime = time.last
        const now = new Date();

        const hours = 12 * 60 * 60 * 1000;
        const lastExecution = now.getTime() - lastTime.getTime()
        if (lastExecution > hours) {
            await this.userService.triggerOnlineAndNeighbors('online', user)
            // await this.service.triggerOnlineAndNeighbors('neighbor_city', user)

            const update = {
                trigger_lapses: {
                    last_triggerOnline_executed: new Date(),
                    last_triggerNeighbors_executed: new Date(),
                }
            }
            await this.userService.model.updateOne({ _id: user._id }, {
                // @ts-ignore
                update
            }, { new: true })
        }

        return {
            customerId
        }
    }
    
    @Post("coins-add")
    async updateCoins(@Body() payload: { userID: string }) {
        /*const { coins } = payload;
        if(coins > 100) throw new UnauthorizedException('coins is invalid');*/
        return this.addCoinsService.validationFreeCoins(payload.userID)
    }

    @Post('picture/:id/:isEmploye?')
    @UseInterceptors(FileInterceptor('picture', {

        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, './uploads/private');
            },
            filename: (req, file, cb) => {
                let ext = extname(file.originalname);
                cb(null, `${v4()}${ext}`);
            },
        }),
        fileFilter: imageFileFilter,
    }))
    async updatePicture(@UploadedFile() picture, @Req() req: Request, @Res() res: Response) {
        try {
            const file = picture
            let { id, isEmploye = false } = req.params;
            if (!id) return res.status(400).json({ message: `Missing id parameter` });

            if (!file) return res.status(400).json({ message: `Error parsing the file` });

            let customer = await this.model.findOne({ _id: id });
            if (!customer) {
                unlinkOne(file!.filename, false);
                return res.status(400).json({ message: `User not found` });
            }

            if (customer.picture && customer.picture.fileId) {
                const data = await deleteFile(customer.picture.fileId);
            }

            let isFolderEmploye = isEmploye ? 'profile-pictures/employees' : 'profile-pictures/customers'

            let imageLocation = await imagekit.upload({
                file: fs.readFileSync(file.path, { encoding: 'base64' }),
                fileName: file.filename,
                folder: isFolderEmploye
            });

            unlinkOne(file!.filename, false);

            customer = await this.model.findOneAndUpdate({ _id: id }, {
                picture: { ...imageLocation },
            }, { new: true });

            //await sendinble.sendinbleService.updateContact(customer.email,{ PROFILE_PICTURE: true })
            
            return res.status(200).json({ message: `customer was updated successfully`, customer });

        } catch (error) {
            console.error(error)
            return res.status(400).json({ message: `Error trying to update customer profile picture`, error });
        }
    }

    @Post('contact')
    async contac(@Body() payload: { name: string, email: string, comment: string, idCustomer: string, subject: string }) {
        this.mailService.sendContactUser(payload)
        return {
            send: 'OK'
        }
    }

    @Post('report')
    async report(@Body() payload: { name: string, email: string, comment: string, idCustomer: string, url: string }) {
        this.mailService.sendREport(payload)
        return {
            send: 'OK'
        }
    }

    @Post('report-profile-virtual')
    async reportPV(@Body() payload: { name: string, email: string, comment: string, idVirtual: string }) {
        this.mailService.sendREportVirtual(payload)

        return {
            send: 'OK'
        }
    }

    @Post('availability-user/:id')
    async UpdateAvailabilityUser(@Param('id') id: string, @Body('isOnline') isOnline: boolean) {
        if (!id) throw new BadRequestException('id is required');
        if (!isOnline) throw new BadRequestException('isOnline is required');
        await this.userService.model.findOneAndUpdate({ _id: id }, {
            online: isOnline,
            lastConnection: moment().format("YYYY-MM-DD HH:mm")
        });
    }

    @Post("geolocation-add-ip/")
    async addIPPublic(@Body() payload: { userid: string, ip: string}) {
        
        const user = await this.model.findOne({ _id : payload.userid, 'geolocation.ipPublic': payload.ip }).select(['geolocation'])

        if(!user){
            await this.model.updateOne({ _id: payload.userid }, { $push: { 'geolocation.ipPublic': payload.ip } })
        }
    }

    @Public()
    @Get('delete/:userID')
    async deleteUserAll(@Param('userID') userID : string){
        if (!userID) throw new BadRequestException('userID is required');
        return {message: 'ok'}//this.userService.deleteAllUser(userID)
    }
}