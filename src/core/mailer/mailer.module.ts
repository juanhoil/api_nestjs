import { MailerModule as MailerModulePackage } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_MAILER_CONFIG } from 'src/config/config.constants';
import { MailService } from "./mail.service";
@Global()

@Module({
  imports: [
    MailerModulePackage.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get(CONFIG_MAILER_CONFIG),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailerModule { }
