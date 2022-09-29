import { registerAs } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { join, resolve } from "path";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

function mailerModuleOptions(): MailerOptions {  
  return {
    transport: {
      host: process.env.EMAIL_HOST,
      //port: Number(process.env.EMAIL_PORT),
      //secure: process.env.EMAIL_SECURE === 'true',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }, 
    },
    defaults: {
      from: `"${process.env.EMAIL_DEFAULT_FROM_NAME}" <${process.env.EMAIL_DEFAULT_FROM_EMAIL}>`,
    },        
    template: {
      dir: resolve(__dirname + '/../core/mailer/templates'),
      adapter: new HandlebarsAdapter(undefined,{
        inlineCssEnabled: true,
        inlineCssOptions: {
          url: ' ',
          preserveMediaQueries: true,
        },
      }),
      options: {
        strict: true,
      },
    }
  };
}

export default registerAs('mailer', () => ({
  config: mailerModuleOptions(),
}));
