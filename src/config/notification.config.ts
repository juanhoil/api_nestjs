import {registerAs} from '@nestjs/config';

export default registerAs('notification', () => ({
    url: process.env.URL_NOTIFICATIONS,
}));