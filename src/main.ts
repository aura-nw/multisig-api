import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { middleware as expressCtx } from 'express-ctx';
import bodyParser from 'body-parser';
import * as swaggerStats from 'swagger-stats';
import { AppModule } from './app.module';
import { SeederModule } from './modules/seeders/seeder.module';
import { SeederService } from './modules/seeders/seeder.service';
import { SharedModule } from './shared/shared.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
    }),
  );

  // enable cors
  app.enableCors();
  app.use(expressCtx);

  // increase limit
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  const configService = app.select(SharedModule).get(ConfigService);

  // create or update chain info
  const seederService = app.select(SeederModule).get(SeederService);
  try {
    await seederService.seed();
    Logger.debug('Seed completed');
  } catch (error) {
    Logger.error(error);
    await app.close();
  }

  // setup swagger
  const config = new DocumentBuilder()
    .setTitle('Multisig Wallet API for Aura Network')
    .setVersion('0.5')
    .addServer('/')
    .addServer(configService.get<string>('SWAGGER_PATH'))
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  app.use(swaggerStats.getMiddleware({ swaggerSpec: document }));
  SwaggerModule.setup('documentation', app, document);

  await app.listen(3000);
}
/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
