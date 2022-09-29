import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class QglAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context).getContext();
        const headers = ctx.req.headers
        if (!headers && !headers.Authorization) {
            return false;
        }
        ctx.user = await this.validateToken(headers.Authorization || headers.authorization);
        return true;
    }

    async validateToken(auth: string) {
        if (auth.split(' ')[0] !== 'Bearer') {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        const token = auth.split(' ')[1];

        try {
            const decoded = jwt.verify(token, 'mysecretjwt');
            return decoded;
        } catch (err) {
            const message = 'Token error: ' + (err.message || err.name);
            throw new HttpException(message, HttpStatus.UNAUTHORIZED);
        }
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            throw err || new UnauthorizedException();
        }

        if (!context.switchToHttp().getRequest().headers.authorization) {
            throw err || new UnauthorizedException();
        }
        const token = context.switchToHttp().getRequest().headers.authorization.replace('Bearer ', '');

        if (Date.now() >= user.exp * 1000) {
            throw err || new UnauthorizedException('Expired token');
        }

        return user;
    }
}
