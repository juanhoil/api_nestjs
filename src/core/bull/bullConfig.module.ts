import {Module} from '@nestjs/common';
import {BullModule} from "@nestjs/bull";
import {ConfigService} from "@nestjs/config";
import {CONFIG_REDIS_CONFIG} from "../../config/config.constants";

@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => configService.get(CONFIG_REDIS_CONFIG),
            inject: [ConfigService],
        }),
    ],
    exports: []
})

export class BullConfigModule {
}
