import {Module} from "@nestjs/common";
import {UserModule} from "src/modules/user/user.module";
import {AuthService} from "./auth.service";
import {IAuthModuleOptions, PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {CONFIG_SERVER_JWT, CONFIG_SERVER_PASSPORT} from "../../config/config.constants";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {LocalStrategy} from "./strategies/local.strategy";

@Module({
    imports: [
        UserModule,
        PassportModule.registerAsync({
            useFactory: async (configService: ConfigService) => configService.get<IAuthModuleOptions>(CONFIG_SERVER_PASSPORT),
            inject: [ConfigService],
        }),
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => configService.get(CONFIG_SERVER_JWT),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule {

}