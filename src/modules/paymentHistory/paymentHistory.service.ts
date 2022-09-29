import { Injectable, HttpStatus, Res, Request, Logger, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { PaymentHistory, PaymentHistoryDocument, PaymentHistorySchema } from './schema/paymentHistory.schema';
import { InjectModel } from "@nestjs/mongoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { UserService } from '../user/user.service';
import { coinsType } from '../coinsPack/schema/packCoins.schema';
import { PackCoinsService } from '../coinsPack/packCoins.service';


@Injectable()
export class PaymentHistoryService {
    private readonly logger = new Logger(PaymentHistoryService.name);
    public constructor(
        @InjectModel(PaymentHistory.name) public model: ModelType<PaymentHistoryDocument, PaymentHistory>,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        @Inject(forwardRef(() => PackCoinsService)) private readonly coinsService: PackCoinsService,
    ) {
    }

    async haveUnlimitedPackage(user, coins){
        await this.userService.model.findByIdAndUpdate( user._id, {
            $inc: { "coins.oldCoins": +coins }
        });
    }

    //mostrar paquete , validacion de usuarios que tienen varias cuentas y ya compraron un paquete

    async activeOffertValidation(userID: string){
        const ips = await this.userService.model.findOne({ _id : userID}).select(['geolocation'])

        if(!ips.geolocation) return false
        if(ips.geolocation.ipPublic.length === 0) return false
        const users = await this.userService.model.find({ 'geolocation.ipPublic': {$in: ips.geolocation.ipPublic } }).select(['_id'])
        const existPackageAndIsActived = await this.coinsService.model.findOne({typeCard: coinsType.UNLIMITED, isActive: true})
        //you have another account with an unlimited package

        let idUsers: any = []
        idUsers.push(userID)
        for( const u of users){
            idUsers.push(u._id.toString())
        }

        const hadUnlimitedPackage = await this.model.find({ paymentType: coinsType.UNLIMITED, user: {$in: idUsers }})

        return (existPackageAndIsActived && hadUnlimitedPackage.length === 0)
    }

}