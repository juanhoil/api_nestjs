import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OriginApp = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const app = {
            isDirty: false,
            isTalkb: false
        };

        if (request.headers && request.headers['origin-app']) {
            const talkb = 'talk-b.com';
            const dirty = 'dirtytalks.club';
            const origin = request.headers['origin-app'];
            if (origin === talkb) {
                app.isTalkb = true;
            } else if (origin === dirty) {
                app.isDirty = true;
            }
        }

        return app
    },
);