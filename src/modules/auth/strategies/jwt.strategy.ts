import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { CONFIG_SERVER_JWT_SECRET } from "src/config/config.constants";

import { UserService } from "src/modules/user/user.service";
import { JwtPayload } from "../../../common/interfaces/jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService, private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            // passReqToCallback: true,
            secretOrKey: configService.get<string>(CONFIG_SERVER_JWT_SECRET),
        });
    }

    async validate(payload: JwtPayload) {
        return payload;
        // return this.userService.getOneById(payload.id)
    }
}