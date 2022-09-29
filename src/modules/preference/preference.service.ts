import {Injectable} from '@nestjs/common';
import {Preference, PreferenceDocument} from "./schema/preference.schema";
import {ModelType} from "@typegoose/typegoose/lib/types";
import {InjectModel} from "@nestjs/mongoose";

@Injectable()
export class PreferenceService {
    constructor(@InjectModel(Preference.name) public model: ModelType<PreferenceDocument>) {
    }

    async all() {
       return  await this.model.find().limit(2).exec()
    }

    async alll() {
        return  await this.model.find()
     }
}
