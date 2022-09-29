import {Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import { CONFIG_DB_CONFIG } from 'src/config/config.constants';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigService) => configService.get(CONFIG_DB_CONFIG),
            inject: [ConfigService],
        })
    ],
    exports: []
})

export class DatabaseModule {
}
