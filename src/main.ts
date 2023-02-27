import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { middleware as expressCtx } from 'express-ctx';
import { AppModule } from './app.module';
import { SeederModule } from './modules/seeders/seeder.module';
import { SeederService } from './modules/seeders/seeder.service';
import { SharedModule } from './shared/shared.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // enable cors
  app.enableCors();
  app.use(expressCtx);

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
    .setVersion('0.1')
    .addServer('/')
    .addServer(configService.get<string>('SWAGGER_PATH'))
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(3000);
}

bootstrap().then().catch();
