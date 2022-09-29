import { Module } from '@nestjs/common';
import { ConfigModule as ConfigModulePackage } from '@nestjs/config';

import serverConfig from 'src/config/server.config';
import databaseConfig from 'src/config/database.config';
import configSchema from 'src/config/config.schema';
import mailerConfig from 'src/config/mailer.config';
import redisConfig from 'src/config/redis.config';
import notificationConfig from 'src/config/notification.config';

@Module({
  imports: [
    ConfigModulePackage.forRoot({
      //ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: `environment/.env.${process.env.NODE_ENV || 'development'}`,
      load: [
        serverConfig,
        databaseConfig,
        redisConfig,
        mailerConfig,
        notificationConfig
      ],
      validationSchema: configSchema,
      isGlobal: true,
    }),
  ],
})
export class ConfigModule { }
