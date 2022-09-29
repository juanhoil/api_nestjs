import {Module} from '@nestjs/common';
import {TriggersService} from './triggers.service';
import {TriggersController} from './triggers.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Triggers, TriggersSchema} from "./schema/triggers.schema";

@Module({
    imports: [MongooseModule.forFeature([{name: Triggers.name, schema: TriggersSchema}])],
    providers: [TriggersService],
    controllers: [TriggersController]
})
export class TriggersModule {
}
