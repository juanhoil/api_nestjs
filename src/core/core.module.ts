import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
//import { SchedulerModule } from './scheduler/scheduler.module';
import { MailerModule } from './mailer/mailer.module';
//import { GQLModule } from "./graphql/gql.module";
//import { BullConfigModule } from "./bull/bullConfig.module";
//import { PubSubModule } from './graphql/PubSubModule';

const CORE_MODULES = [
    ConfigModule,
    DatabaseModule,
    //BullConfigModule,
    //GQLModule,
    //PubSubModule,
    //SchedulerModule,
    MailerModule,
];

@Module({
    imports: CORE_MODULES,
    exports: CORE_MODULES,
})
export class CoreModule {
}
