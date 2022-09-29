import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { compareSync } from "bcrypt";
import { JwtPayload, PayloadToken } from "../../common/interfaces/jwt";
import { PATTERN_VALID_EMAIL } from "../../config/config.constants";
import { JwtService } from "@nestjs/jwt";
import { LoginResponse } from "src/common/interfaces/responses/Login.interface";
import { UserService } from "../user/user.service";
import { User } from "../user/schema/user.schema";

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private readonly jwtService: JwtService) {
    }

    async validateUser(userData: string, password: string): Promise<User> {
        // Verify if userData is email or username
        const data: { nick_name?: string; email?: string } = {};
        !PATTERN_VALID_EMAIL.test(userData) ? (data.nick_name = userData) : (data.email = userData);

        const user = await this.userService.getByUser(data);
        if (!user) {
            throw new NotFoundException('Your account does not exist');
        }

        const isMatch = compareSync(password, user.password);
        if (!isMatch) {
            throw new BadRequestException('Invalid credentials');
        }
        delete user.password;
        return user;
    }

    async login(user: User): Promise<LoginResponse> {
        const payload: JwtPayload = { nick_name: user.nick_name, id: user._id };
        let expire:string = '5m'

        const accessToken = await this.signToken(payload, expire);
        
        await this.userService.model.findOneAndUpdate({ _id: user._id }, { token: accessToken })
       
        return {
            id: user._id,
            email: user.email,
            nick_name: user.nick_name,
            role: user.role,
            type: user.type,
            picture: user.picture,
            email_checked: user.email_checked,
            token: accessToken,
            coins: user.coins,
            account_activated: user.account_activated
        };
    }

    async signToken(payload: JwtPayload, expiration: string | number) {
        //console.log('---refresh-- ',expiration,' ---token--')
        return this.jwtService.sign(payload, { expiresIn: expiration });
    }

    async verifyToken(token) {
        return this.jwtService.verify(token);
    }

    async validateToken(token: string) {
        return this.jwtService.verifyAsync(token);
    }

    public async refreshToken(token: string) {
        const decode = this.jwtService.decode(token) as JwtPayload & PayloadToken;
        const payload = { id: decode?.id, nick_name: decode?.nick_name }
        const access_token = await this.signToken(payload, '5m');
        return {
            refresh_token: access_token,
            decode: this.jwtService.decode(access_token) as JwtPayload & PayloadToken
        }
    }
}