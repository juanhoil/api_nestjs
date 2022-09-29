import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from './schema/user.schema';
import { DefaultTypeCoins, DefaultValueCoins } from './schema/coins-profile.user.schema';
import { UserService } from "./user.service";

@Injectable()
export class AddCoinsService {

    public constructor(
        @InjectModel(User.name) public model: ModelType<UserDocument, User>,
        //@Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) {}
    
    countInfo (user:any) {
        const fieldsAlreadyFilledOnRegister = [
          'orientation',
          'i_am',
          'status',
          'zodiac_sign',
          'height',
          'weight',
          'ethnicity',
          'eye_color',
          'living',
          'body_style',
          'drinking_habits',
          'hair_color',
          'religion',
          'body_art',
          'education',
          'in_search',
          'childrens',
          'smoking_habits',
        ];
    
        return fieldsAlreadyFilledOnRegister.filter(key => {
          const check = user.customer[key];
          const validate = check
          return validate
        }).length
    }

    async validationFreeCoins (userID:string) {
        const user = await this.model.findOne({_id:userID})
        if (!user) throw new NotFoundException('Customer not found');
        const { customer, addcoins } = user
        try {
            let gallery = user.gallery.filter((val) => val.verified.verified == true)

            if (user.hasDailyCoins) {
                let update = { hasDailyCoins : false };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.hasDailyCoins, DefaultTypeCoins.hasDailyCoins)
            }

            if (user.isNewCustomer) {
                let update = { isNewCustomer : false };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.isNewCustomer, DefaultTypeCoins.isNewCustomer)
            }

            if (customer.verified.verifiedAbout && addcoins.cAboutme == false) {
                let update = { 'addcoins.cAboutme' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cAboutme, DefaultTypeCoins.cAboutme)
            }

            if (customer.city && addcoins.cLocation == false) {
                let update = { 'addcoins.cLocation' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cLocation, DefaultTypeCoins.cLocation)
            }

            if (customer.verified.verifiedImg && addcoins.cProfilePicture == false) {
                let update = { 'addcoins.cProfilePicture' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cProfilePicture, DefaultTypeCoins.cProfilePicture)
            }

            if (user.email_checked && addcoins.cEmailVerification == false) {
                let update = { 'addcoins.cEmailVerification' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cEmailVerification, DefaultTypeCoins.cEmailVerification)
            }

            if ( this.countInfo(user) >= 5 && addcoins.cInfo == false) {
                let update = { 'addcoins.cInfo' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cInfo, DefaultTypeCoins.cInfo)
            }

            if (user.preferences.length >= 5 && addcoins.cInteresting == false) {
                let update = { 'addcoins.cInteresting' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cInteresting, DefaultTypeCoins.cInteresting)
            }

            if (customer.verified.verifiedImgGallery && gallery.length >= 5 && addcoins.cGallery == false) {
                let update = { 'addcoins.cGallery' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cGallery, DefaultTypeCoins.cGallery)
            }

            if (customer.verified.verified && !addcoins.cVerificationProfile ) {
                let update = { 'addcoins.cVerificationProfile' : true };
                return this.updateCustomer(userID, update,
                    DefaultValueCoins.cVerificationProfile, DefaultTypeCoins.cVerificationProfile)
            }

            return null

        } catch (e) {
            console.error(e);
        }
    }

    async updateCustomer( userID: string, update: any, params: { coins: number, label: string }, type: string ) {
        try {
            await this.userService.updateCoins({userID: userID, coins: params.coins})
            let user = await this.model.findOneAndUpdate({ _id: userID }, {$set : update}, { new: true, });

            return {
                user : user,
                type : type,
                ...params
            }
        } catch (error) {
            console.error("error to send more coins", error);
        }
      };

}