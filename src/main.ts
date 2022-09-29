import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CONFIG_SERVER_PORT, NODE_ENV } from 'src/config/config.constants';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Swagger documentation
  // Swagger
  /*const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nest Starter Boilerplate')
    .setDescription('Nest collection of tools and authentication ready to use.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);*/

  //app.use(bodyParser({ limit: '50mb' }));

  // Environments
  const port = configService.get<number>(CONFIG_SERVER_PORT);
  const environment = configService.get<string>(NODE_ENV);
  //environment === 'development' ? SwaggerModule.setup('', app, document) : null;

  // Interceptors and validators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      transform: true,
    }),
  );

  app.use(helmet());
  app.enableCors();
  app.use(compression());

  await app.listen(port);
  logger.log(
    port,
    `Application is running in ${environment.toUpperCase()} on: ${await app.getUrl()}`,
  );
}
bootstrap();
