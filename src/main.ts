import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SeederService } from './database/seeders/seeder';
import { SeederModule } from './database/seeders/seeder.module';
import { ConfigService } from './shared/services/config.service';
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

  const configService = app.select(SharedModule).get(ConfigService);

  // create or update chain info
  const seederService = app.select(SeederModule).get(SeederService);
  seederService
    .seed()
    .then(() => {
      Logger.debug('Seed completed');
    })
    .catch((error) => {
      Logger.error(error);
      app.close().then(() => {
        process.exit(1);
      });
    });

  //setup swagger
  const config = new DocumentBuilder()
    .setTitle('Multisig Wallet API for Aura Network')
    .setVersion('0.1')
    .addServer('/')
    .addServer(configService.get('SWAGGER_PATH'))
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(3000);
}
bootstrap();
