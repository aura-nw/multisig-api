import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors();
  
  const configService = app.select(SharedModule).get(ConfigService);
  
  //setup swagger
  const config = new DocumentBuilder()
    .setTitle('Multisig Wallet API for Aura Network')
    .setVersion('0.1')
    .addServer('/')
    .addServer(configService.get('SWAGGER_PATH'))
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(3000);
}
bootstrap();
