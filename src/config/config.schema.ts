import * as Joi from '@hapi/joi';

const Schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'pre-production', 'production').default('development'),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string(),
    JWT_EXPIRATION: Joi.string(),
    DATABASE_PORT: Joi.number(),
    EMAIL_HOST: Joi.string(),
    EMAIL_PORT: Joi.number(),
    EMAIL_SECURE: Joi.boolean(),
    EMAIL_USER: Joi.string(),
    EMAIL_PASS: Joi.string(),
    EMAIL_DEFAULT_FROM_NAME: Joi.string(),
    EMAIL_DEFAULT_FROM_EMAIL: Joi.string(),
    URL_NOTIFICATIONS: Joi.string(),
});

export default Schema;
