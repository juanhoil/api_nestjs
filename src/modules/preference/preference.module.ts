import {Module} from '@nestjs/common';
import {PreferenceController} from './preference.controller';
import {PreferenceService} from './preference.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Preference, PreferenceDocument, PreferenceSchema} from "./schema/preference.schema";

@Module({
    providers: [PreferenceService],
    imports: [
        MongooseModule.forFeature([{name: Preference.name, schema: PreferenceSchema}]),
    ],
    controllers: [PreferenceController],
})
export class PreferenceModule {}