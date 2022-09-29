import {registerAs} from '@nestjs/config';
import {MongooseModuleOptions} from "@nestjs/mongoose";

function typeormModuleOptions(): MongooseModuleOptions {
    return {
        uri: process.env.MONGO_URI_USERS,
    };
}

export default registerAs('database', () => ({
    config: typeormModuleOptions(),
}));