import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'nick_name',
            passwordField: 'password',
        });
    }

    async validate(nickName: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(nickName, password);
        if (!user) {
            throw new UnauthorizedException('Login user or password does not match.');
        }
        return user;
    }
}