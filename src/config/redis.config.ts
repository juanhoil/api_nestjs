import {registerAs} from '@nestjs/config';
import * as Redis from "ioredis";

function redisModuleOptions(): Redis.RedisOptions {
    return {
        host: process.env.REDIST_HOST,
        port: +process.env.REDIST_PORT,
        //maxRetriesPerRequest: 100,
        //lazyConnect: true,
    };
}

export default registerAs('redis', () => ({
    config: redisModuleOptions(),
}));